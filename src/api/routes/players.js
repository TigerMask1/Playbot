const express = require('express');
const router = express.Router();
const { getCollection, COLLECTIONS } = require('../../core/database');
const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');
const { CurrencyService, CURRENCY_ACTIONS } = require('../../services/CurrencyService');
const { createAuditLog } = require('../../services/AuditService');
const { requireAuth } = require('../middleware/auth');

router.get('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { limit = 50, skip = 0, search } = req.query;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.VIEW_PLAYER_DATA) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const collection = await getCollection(COLLECTIONS.USER.PLAYER_DATA);
    
    const query = { serverId };
    if (search) {
      query.username = { $regex: search, $options: 'i' };
    }
    
    const players = await collection
      .find(query)
      .sort({ 'level.totalXp': -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .toArray();
    
    const total = await collection.countDocuments({ serverId });
    
    res.json({ players, total });
  } catch (error) {
    console.error('Error getting players:', error);
    res.status(500).json({ error: 'Failed to get players' });
  }
});

router.get('/:serverId/:playerId', requireAuth, async (req, res) => {
  try {
    const { serverId, playerId } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.VIEW_PLAYER_DATA) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const playerData = await getCollection(COLLECTIONS.USER.PLAYER_DATA);
    const player = await playerData.findOne({ serverId, odiscordId: playerId });
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    const playerChars = await getCollection(COLLECTIONS.USER.PLAYER_CHARACTERS);
    const characters = await playerChars.find({ serverId, odiscordId: playerId }).toArray();
    
    const playerInventory = await getCollection(COLLECTIONS.USER.PLAYER_INVENTORY);
    const inventory = await playerInventory.findOne({ serverId, odiscordId: playerId });
    
    res.json({
      ...player,
      characters,
      inventory: inventory?.items || []
    });
  } catch (error) {
    console.error('Error getting player:', error);
    res.status(500).json({ error: 'Failed to get player' });
  }
});

router.put('/:serverId/:playerId', requireAuth, async (req, res) => {
  try {
    const { serverId, playerId } = req.params;
    const updates = req.body;
    const userId = req.session.user.id;
    
    const canModify = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MODIFY_PLAYER_DATA);
    if (!canModify) {
      return res.status(403).json({ error: 'No permission to modify player data' });
    }
    
    const collection = await getCollection(COLLECTIONS.USER.PLAYER_DATA);
    
    const existing = await collection.findOne({ serverId, odiscordId: playerId });
    if (!existing) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    delete updates.serverId;
    delete updates.odiscordId;
    delete updates.createdAt;
    updates.updatedAt = new Date();
    
    await collection.updateOne(
      { serverId, odiscordId: playerId },
      { $set: updates }
    );
    
    await createAuditLog({
      action: 'PLAYER_MODIFIED',
      category: 'player',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: playerId,
      targetType: 'player',
      before: existing,
      after: updates
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

router.post('/:serverId/:playerId/grant', requireAuth, async (req, res) => {
  try {
    const { serverId, playerId } = req.params;
    const { amount, currencyType, reason } = req.body;
    const userId = req.session.user.id;
    
    const canGrant = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.GRANT_SERVER_CURRENCY);
    if (!canGrant) {
      return res.status(403).json({ error: 'No permission to grant currency' });
    }
    
    const playerData = await getCollection(COLLECTIONS.USER.PLAYER_DATA);
    const player = await playerData.findOne({ serverId, odiscordId: playerId });
    
    const result = await CurrencyService.modifyServerCurrency(
      playerId,
      serverId,
      player?.username || 'Unknown',
      amount,
      currencyType || 'coins',
      CURRENCY_ACTIONS.ADMIN,
      reason || 'Admin grant',
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error granting currency to player:', error);
    res.status(500).json({ error: 'Failed to grant currency' });
  }
});

router.get('/:serverId/stats/overview', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.VIEW_PLAYER_DATA) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const playerData = await getCollection(COLLECTIONS.USER.PLAYER_DATA);
    
    const now = new Date();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
    const [totalPlayers, activePlayers24h, activePlayersWeek, topPlayers] = await Promise.all([
      playerData.countDocuments({ serverId }),
      playerData.countDocuments({ serverId, lastActivity: { $gte: dayAgo } }),
      playerData.countDocuments({ serverId, lastActivity: { $gte: weekAgo } }),
      playerData.find({ serverId })
        .sort({ trophies: -1 })
        .limit(10)
        .toArray()
    ]);
    
    res.json({
      totalPlayers,
      activePlayers24h,
      activePlayersWeek,
      topPlayers: topPlayers.map(p => ({
        id: p.odiscordId,
        username: p.username,
        trophies: p.trophies,
        level: p.level?.current || 1
      }))
    });
  } catch (error) {
    console.error('Error getting player stats:', error);
    res.status(500).json({ error: 'Failed to get player stats' });
  }
});

router.delete('/:serverId/:playerId', requireAuth, async (req, res) => {
  try {
    const { serverId, playerId } = req.params;
    const userId = req.session.user.id;
    
    const canModify = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MODIFY_PLAYER_DATA);
    if (!canModify) {
      return res.status(403).json({ error: 'No permission to delete player data' });
    }
    
    const playerData = await getCollection(COLLECTIONS.USER.PLAYER_DATA);
    const playerChars = await getCollection(COLLECTIONS.USER.PLAYER_CHARACTERS);
    const playerInventory = await getCollection(COLLECTIONS.USER.PLAYER_INVENTORY);
    
    await Promise.all([
      playerData.deleteOne({ serverId, odiscordId: playerId }),
      playerChars.deleteMany({ serverId, odiscordId: playerId }),
      playerInventory.deleteOne({ serverId, odiscordId: playerId })
    ]);
    
    await createAuditLog({
      action: 'PLAYER_DELETED',
      category: 'player',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: playerId,
      targetType: 'player'
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

module.exports = router;
