const express = require('express');
const router = express.Router();
const { getCollection, COLLECTIONS } = require('../../core/database');
const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');
const { createAuditLog } = require('../../services/AuditService');
const { requireAuth } = require('../middleware/auth');

router.get('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { tier } = req.query;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_MOVES) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.MOVES);
    const query = { serverId };
    if (tier) query.tier = tier;
    
    const moves = await collection.find(query).toArray();
    
    res.json(moves);
  } catch (error) {
    console.error('Error getting moves:', error);
    res.status(500).json({ error: 'Failed to get moves' });
  }
});

router.post('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const moveData = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_MOVES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage moves' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.MOVES);
    
    const moveId = `move_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const move = {
      serverId,
      moveId,
      name: moveData.name,
      damage: moveData.damage || 0,
      type: moveData.type || 'normal',
      tier: moveData.tier || 'low',
      description: moveData.description || '',
      effects: moveData.effects || [],
      energyCost: moveData.energyCost || 0,
      cooldown: moveData.cooldown || 0,
      characterName: moveData.characterName || null,
      isActive: moveData.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await collection.insertOne(move);
    
    await createAuditLog({
      action: 'MOVE_CREATED',
      category: 'move',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: moveId,
      targetType: 'move',
      after: move
    });
    
    res.json({ success: true, move });
  } catch (error) {
    console.error('Error creating move:', error);
    res.status(500).json({ error: 'Failed to create move' });
  }
});

router.put('/:serverId/:moveId', requireAuth, async (req, res) => {
  try {
    const { serverId, moveId } = req.params;
    const updates = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_MOVES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage moves' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.MOVES);
    
    const existing = await collection.findOne({ serverId, moveId });
    if (!existing) {
      return res.status(404).json({ error: 'Move not found' });
    }
    
    delete updates.serverId;
    delete updates.moveId;
    delete updates.createdAt;
    updates.updatedAt = new Date();
    
    await collection.updateOne(
      { serverId, moveId },
      { $set: updates }
    );
    
    await createAuditLog({
      action: 'MOVE_UPDATED',
      category: 'move',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: moveId,
      targetType: 'move',
      before: existing,
      after: updates
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating move:', error);
    res.status(500).json({ error: 'Failed to update move' });
  }
});

router.delete('/:serverId/:moveId', requireAuth, async (req, res) => {
  try {
    const { serverId, moveId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_MOVES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage moves' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.MOVES);
    
    await collection.deleteOne({ serverId, moveId });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting move:', error);
    res.status(500).json({ error: 'Failed to delete move' });
  }
});

router.get('/:serverId/tiers', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    
    const collection = await getCollection(COLLECTIONS.TENANT.MOVES);
    
    const tiers = await collection.aggregate([
      { $match: { serverId } },
      { $group: { _id: '$tier', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    res.json(tiers);
  } catch (error) {
    console.error('Error getting move tiers:', error);
    res.status(500).json({ error: 'Failed to get move tiers' });
  }
});

module.exports = router;
