const express = require('express');
const router = express.Router();
const { getCollection, COLLECTIONS } = require('../../core/database');
const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');
const { createAuditLog } = require('../../services/AuditService');
const { requireAuth } = require('../middleware/auth');

router.get('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CHARACTERS) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.CHARACTERS);
    const characters = await collection.find({ serverId }).toArray();
    
    res.json(characters);
  } catch (error) {
    console.error('Error getting characters:', error);
    res.status(500).json({ error: 'Failed to get characters' });
  }
});

router.post('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const characterData = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CHARACTERS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage characters' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.CHARACTERS);
    
    const existing = await collection.findOne({ 
      serverId, 
      name: { $regex: new RegExp(`^${characterData.name}$`, 'i') }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Character with this name already exists' });
    }
    
    const characterId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const character = {
      serverId,
      characterId,
      name: characterData.name,
      emoji: characterData.emoji || '⭕',
      customEmojiId: characterData.customEmojiId || null,
      obtainable: characterData.obtainable || 'crate',
      rarity: characterData.rarity || 'common',
      description: characterData.description || '',
      baseStats: characterData.baseStats || {
        hp: 100,
        attack: 10,
        defense: 10,
        speed: 10
      },
      abilities: characterData.abilities || [],
      isActive: characterData.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await collection.insertOne(character);
    
    await createAuditLog({
      action: 'CHARACTER_CREATED',
      category: 'character',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: characterId,
      targetType: 'character',
      after: character
    });
    
    res.json({ success: true, character });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

router.put('/:serverId/:characterId', requireAuth, async (req, res) => {
  try {
    const { serverId, characterId } = req.params;
    const updates = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CHARACTERS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage characters' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.CHARACTERS);
    
    const existing = await collection.findOne({ serverId, characterId });
    if (!existing) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    delete updates.serverId;
    delete updates.characterId;
    delete updates.createdAt;
    updates.updatedAt = new Date();
    
    await collection.updateOne(
      { serverId, characterId },
      { $set: updates }
    );
    
    await createAuditLog({
      action: 'CHARACTER_UPDATED',
      category: 'character',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: characterId,
      targetType: 'character',
      before: existing,
      after: updates
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
});

router.delete('/:serverId/:characterId', requireAuth, async (req, res) => {
  try {
    const { serverId, characterId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CHARACTERS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage characters' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.CHARACTERS);
    
    const existing = await collection.findOne({ serverId, characterId });
    if (!existing) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    await collection.deleteOne({ serverId, characterId });
    
    await createAuditLog({
      action: 'CHARACTER_DELETED',
      category: 'character',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: characterId,
      targetType: 'character',
      before: existing
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

router.post('/:serverId/import', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { characters } = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CHARACTERS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage characters' });
    }
    
    if (!Array.isArray(characters) || characters.length === 0) {
      return res.status(400).json({ error: 'No characters to import' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.CHARACTERS);
    
    const importedCharacters = characters.map((char, index) => ({
      serverId,
      characterId: `char_${Date.now()}_${index}`,
      name: char.name,
      emoji: char.emoji || '⭕',
      customEmojiId: char.customEmojiId || null,
      obtainable: char.obtainable || 'crate',
      rarity: char.rarity || 'common',
      description: char.description || '',
      baseStats: char.baseStats || { hp: 100, attack: 10, defense: 10, speed: 10 },
      abilities: char.abilities || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    await collection.insertMany(importedCharacters);
    
    await createAuditLog({
      action: 'CHARACTERS_IMPORTED',
      category: 'character',
      userId,
      username: req.session.user.username,
      serverId,
      metadata: { count: importedCharacters.length }
    });
    
    res.json({ success: true, count: importedCharacters.length });
  } catch (error) {
    console.error('Error importing characters:', error);
    res.status(500).json({ error: 'Failed to import characters' });
  }
});

router.put('/:serverId/:characterId/toggle', requireAuth, async (req, res) => {
  try {
    const { serverId, characterId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CHARACTERS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage characters' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.CHARACTERS);
    
    const existing = await collection.findOne({ serverId, characterId });
    if (!existing) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    const newStatus = !existing.isActive;
    
    await collection.updateOne(
      { serverId, characterId },
      { $set: { isActive: newStatus, updatedAt: new Date() } }
    );
    
    res.json({ success: true, isActive: newStatus });
  } catch (error) {
    console.error('Error toggling character:', error);
    res.status(500).json({ error: 'Failed to toggle character' });
  }
});

module.exports = router;
