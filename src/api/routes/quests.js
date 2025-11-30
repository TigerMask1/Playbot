const express = require('express');
const router = express.Router();
const { getCollection, COLLECTIONS } = require('../../core/database');
const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');
const { ConfigService } = require('../../services/ConfigService');
const { createAuditLog } = require('../../services/AuditService');
const { requireAuth } = require('../middleware/auth');

router.get('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { type, includeInactive } = req.query;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_QUESTS) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    if (includeInactive === 'true') {
      const collection = await getCollection(COLLECTIONS.TENANT.QUESTS);
      const query = { serverId };
      if (type) query.type = type;
      const quests = await collection.find(query).sort({ id: 1 }).toArray();
      return res.json(quests);
    }
    
    let quests = await ConfigService.getQuests(serverId);
    
    if (type) {
      quests = quests.filter(q => q.type === type);
    }
    
    res.json(quests);
  } catch (error) {
    console.error('Error getting quests:', error);
    res.status(500).json({ error: 'Failed to get quests' });
  }
});

router.get('/:serverId/:questId', requireAuth, async (req, res) => {
  try {
    const { serverId, questId } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_QUESTS) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.QUESTS);
    const quest = await collection.findOne({ 
      serverId, 
      $or: [
        { id: parseInt(questId) },
        { questId: questId }
      ]
    });
    
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    
    res.json(quest);
  } catch (error) {
    console.error('Error getting quest:', error);
    res.status(500).json({ error: 'Failed to get quest' });
  }
});

router.post('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const questData = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_QUESTS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage quests' });
    }
    
    const quest = await ConfigService.createQuest(serverId, {
      name: questData.name,
      description: questData.description || '',
      type: questData.type || 'daily',
      requirement: questData.requirement || { action: 'catch', count: 1 },
      rewards: questData.rewards || { coins: 100, gems: 5, xp: 25 }
    });
    
    if (!quest) {
      return res.status(500).json({ error: 'Failed to create quest' });
    }
    
    await createAuditLog({
      action: 'QUEST_CREATED',
      category: 'quest',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: quest.id,
      targetType: 'quest',
      after: quest
    });
    
    res.json({ success: true, quest });
  } catch (error) {
    console.error('Error creating quest:', error);
    res.status(500).json({ error: 'Failed to create quest' });
  }
});

router.put('/:serverId/:questId', requireAuth, async (req, res) => {
  try {
    const { serverId, questId } = req.params;
    const updates = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_QUESTS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage quests' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.QUESTS);
    
    const existing = await collection.findOne({ 
      serverId, 
      $or: [
        { id: parseInt(questId) },
        { questId: questId }
      ]
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    
    delete updates.serverId;
    delete updates.id;
    delete updates.questId;
    delete updates.createdAt;
    delete updates.templateVersion;
    
    const id = existing.id || parseInt(questId);
    const success = await ConfigService.updateQuest(serverId, id, updates);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update quest' });
    }
    
    await createAuditLog({
      action: 'QUEST_UPDATED',
      category: 'quest',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: id,
      targetType: 'quest',
      before: existing,
      after: updates
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating quest:', error);
    res.status(500).json({ error: 'Failed to update quest' });
  }
});

router.delete('/:serverId/:questId', requireAuth, async (req, res) => {
  try {
    const { serverId, questId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_QUESTS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage quests' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.QUESTS);
    
    const existing = await collection.findOne({ 
      serverId, 
      $or: [
        { id: parseInt(questId) },
        { questId: questId }
      ]
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Quest not found' });
    }
    
    const id = existing.id || parseInt(questId);
    
    await collection.updateOne(
      { serverId, id },
      { $set: { isActive: false, deletedAt: new Date() } }
    );
    
    ConfigService.clearServerCache(serverId);
    
    await createAuditLog({
      action: 'QUEST_DELETED',
      category: 'quest',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: id,
      targetType: 'quest',
      before: existing
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting quest:', error);
    res.status(500).json({ error: 'Failed to delete quest' });
  }
});

router.post('/:serverId/seed-defaults', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_QUESTS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage quests' });
    }
    
    const quests = await ConfigService.getQuests(serverId);
    
    await createAuditLog({
      action: 'QUESTS_SEEDED',
      category: 'quest',
      userId,
      username: req.session.user.username,
      serverId,
      metadata: { count: quests.length }
    });
    
    res.json({ success: true, count: quests.length });
  } catch (error) {
    console.error('Error seeding quests:', error);
    res.status(500).json({ error: 'Failed to seed quests' });
  }
});

router.post('/:serverId/reset-to-defaults', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_QUESTS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage quests' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.QUESTS);
    await collection.deleteMany({ serverId, isCustom: { $ne: true } });
    
    ConfigService.clearServerCache(serverId);
    const quests = await ConfigService.getQuests(serverId);
    
    await createAuditLog({
      action: 'QUESTS_RESET',
      category: 'quest',
      userId,
      username: req.session.user.username,
      serverId,
      metadata: { count: quests.length }
    });
    
    res.json({ success: true, count: quests.length });
  } catch (error) {
    console.error('Error resetting quests:', error);
    res.status(500).json({ error: 'Failed to reset quests' });
  }
});

module.exports = router;
