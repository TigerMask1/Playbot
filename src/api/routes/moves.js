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
    const { tier, includeInactive } = req.query;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_MOVES) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    if (includeInactive === 'true') {
      const collection = await getCollection(COLLECTIONS.TENANT.MOVES);
      const query = { serverId };
      if (tier) query.tier = tier;
      const moves = await collection.find(query).sort({ id: 1 }).toArray();
      return res.json(moves);
    }
    
    const movesOrganized = await ConfigService.getMoves(serverId);
    
    if (tier) {
      if (tier === 'special') {
        return res.json(Object.values(movesOrganized.special || {}));
      }
      return res.json(movesOrganized[tier] || []);
    }
    
    const allMoves = [
      ...movesOrganized.low,
      ...movesOrganized.mid,
      ...movesOrganized.high,
      ...Object.values(movesOrganized.special || {})
    ];
    
    res.json(allMoves);
  } catch (error) {
    console.error('Error getting moves:', error);
    res.status(500).json({ error: 'Failed to get moves' });
  }
});

router.get('/:serverId/:moveId', requireAuth, async (req, res) => {
  try {
    const { serverId, moveId } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_MOVES) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.MOVES);
    const move = await collection.findOne({ 
      serverId, 
      $or: [
        { id: parseInt(moveId) },
        { moveId: moveId }
      ]
    });
    
    if (!move) {
      return res.status(404).json({ error: 'Move not found' });
    }
    
    res.json(move);
  } catch (error) {
    console.error('Error getting move:', error);
    res.status(500).json({ error: 'Failed to get move' });
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
    
    const move = await ConfigService.createMove(serverId, {
      name: moveData.name,
      damage: moveData.damage || 0,
      type: moveData.type || 'normal',
      tier: moveData.tier || 'low',
      description: moveData.description || '',
      effects: moveData.effects || [],
      energyCost: moveData.energyCost || 0,
      cooldown: moveData.cooldown || 0,
      characterName: moveData.characterName || null
    });
    
    if (!move) {
      return res.status(500).json({ error: 'Failed to create move' });
    }
    
    await createAuditLog({
      action: 'MOVE_CREATED',
      category: 'move',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: move.id,
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
    
    const existing = await collection.findOne({ 
      serverId, 
      $or: [
        { id: parseInt(moveId) },
        { moveId: moveId }
      ]
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Move not found' });
    }
    
    delete updates.serverId;
    delete updates.id;
    delete updates.moveId;
    delete updates.createdAt;
    delete updates.templateVersion;
    
    const id = existing.id || parseInt(moveId);
    const success = await ConfigService.updateMove(serverId, id, updates);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update move' });
    }
    
    await createAuditLog({
      action: 'MOVE_UPDATED',
      category: 'move',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: id,
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
    
    const existing = await collection.findOne({ 
      serverId, 
      $or: [
        { id: parseInt(moveId) },
        { moveId: moveId }
      ]
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Move not found' });
    }
    
    const id = existing.id || parseInt(moveId);
    
    await collection.updateOne(
      { serverId, id },
      { $set: { isActive: false, deletedAt: new Date() } }
    );
    
    ConfigService.clearServerCache(serverId);
    
    await createAuditLog({
      action: 'MOVE_DELETED',
      category: 'move',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: id,
      targetType: 'move',
      before: existing
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting move:', error);
    res.status(500).json({ error: 'Failed to delete move' });
  }
});

router.get('/:serverId/tiers', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    
    const movesOrganized = await ConfigService.getMoves(serverId);
    
    const tiers = [
      { _id: 'low', count: movesOrganized.low?.length || 0 },
      { _id: 'mid', count: movesOrganized.mid?.length || 0 },
      { _id: 'high', count: movesOrganized.high?.length || 0 },
      { _id: 'special', count: Object.keys(movesOrganized.special || {}).length }
    ];
    
    res.json(tiers);
  } catch (error) {
    console.error('Error getting move tiers:', error);
    res.status(500).json({ error: 'Failed to get move tiers' });
  }
});

router.post('/:serverId/seed-defaults', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_MOVES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage moves' });
    }
    
    const moves = await ConfigService.getMoves(serverId);
    const totalCount = (moves.low?.length || 0) + (moves.mid?.length || 0) + 
                       (moves.high?.length || 0) + Object.keys(moves.special || {}).length;
    
    await createAuditLog({
      action: 'MOVES_SEEDED',
      category: 'move',
      userId,
      username: req.session.user.username,
      serverId,
      metadata: { count: totalCount }
    });
    
    res.json({ success: true, count: totalCount });
  } catch (error) {
    console.error('Error seeding moves:', error);
    res.status(500).json({ error: 'Failed to seed moves' });
  }
});

router.post('/:serverId/reset-to-defaults', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_MOVES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage moves' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.MOVES);
    await collection.deleteMany({ serverId, isCustom: { $ne: true } });
    
    ConfigService.clearServerCache(serverId);
    const moves = await ConfigService.getMoves(serverId);
    const totalCount = (moves.low?.length || 0) + (moves.mid?.length || 0) + 
                       (moves.high?.length || 0) + Object.keys(moves.special || {}).length;
    
    await createAuditLog({
      action: 'MOVES_RESET',
      category: 'move',
      userId,
      username: req.session.user.username,
      serverId,
      metadata: { count: totalCount }
    });
    
    res.json({ success: true, count: totalCount });
  } catch (error) {
    console.error('Error resetting moves:', error);
    res.status(500).json({ error: 'Failed to reset moves' });
  }
});

module.exports = router;
