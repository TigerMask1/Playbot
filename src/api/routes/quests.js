const express = require('express');
const router = express.Router();
const { getCollection, COLLECTIONS } = require('../../core/database');
const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');
const { createAuditLog } = require('../../services/AuditService');
const { requireAuth } = require('../middleware/auth');

router.get('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { type } = req.query;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_QUESTS) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.QUESTS);
    const query = { serverId };
    if (type) query.type = type;
    
    const quests = await collection.find(query).toArray();
    
    res.json(quests);
  } catch (error) {
    console.error('Error getting quests:', error);
    res.status(500).json({ error: 'Failed to get quests' });
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
    
    const collection = await getCollection(COLLECTIONS.TENANT.QUESTS);
    
    const questId = questData.questId || `quest_${Date.now()}`;
    
    const quest = {
      serverId,
      questId,
      name: questData.name,
      description: questData.description || '',
      type: questData.type || 'daily',
      requirement: questData.requirement || { action: 'catch', count: 1 },
      rewards: questData.rewards || { coins: 100, gems: 5, xp: 25 },
      isActive: questData.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await collection.insertOne(quest);
    
    await createAuditLog({
      action: 'QUEST_CREATED',
      category: 'quest',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: questId,
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
    
    delete updates.serverId;
    delete updates.questId;
    delete updates.createdAt;
    updates.updatedAt = new Date();
    
    await collection.updateOne(
      { serverId, questId },
      { $set: updates }
    );
    
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
    await collection.deleteOne({ serverId, questId });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting quest:', error);
    res.status(500).json({ error: 'Failed to delete quest' });
  }
});

module.exports = router;
