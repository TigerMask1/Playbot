const express = require('express');
const router = express.Router();
const { getCollection, COLLECTIONS } = require('../../core/database');
const { CurrencyService, CURRENCY_ACTIONS } = require('../../services/CurrencyService');
const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');
const TenantService = require('../../services/TenantService');
const { createAuditLog } = require('../../services/AuditService');
const { requireAuth } = require('../middleware/auth');

router.get('/:serverId/config', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_ECONOMY) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const config = await TenantService.getServerConfig(serverId);
    if (!config) {
      return res.status(404).json({ error: 'Server not configured' });
    }
    
    res.json(config.economy || {});
  } catch (error) {
    console.error('Error getting economy config:', error);
    res.status(500).json({ error: 'Failed to get economy config' });
  }
});

router.put('/:serverId/config', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const economyConfig = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_ECONOMY);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage economy' });
    }
    
    const result = await TenantService.updateServerConfig(
      serverId,
      { economy: economyConfig },
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error updating economy config:', error);
    res.status(500).json({ error: 'Failed to update economy config' });
  }
});

router.post('/:serverId/grant', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { targetUserId, targetUsername, amount, currencyType, reason } = req.body;
    const userId = req.session.user.id;
    
    const canGrant = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.GRANT_SERVER_CURRENCY);
    if (!canGrant) {
      return res.status(403).json({ error: 'No permission to grant currency' });
    }
    
    if (!targetUserId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    const result = await CurrencyService.modifyServerCurrency(
      targetUserId,
      serverId,
      targetUsername || 'Unknown',
      amount,
      currencyType || 'coins',
      CURRENCY_ACTIONS.ADMIN,
      reason || 'Admin grant',
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error granting currency:', error);
    res.status(500).json({ error: 'Failed to grant currency' });
  }
});

router.post('/:serverId/deduct', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { targetUserId, targetUsername, amount, currencyType, reason } = req.body;
    const userId = req.session.user.id;
    
    const canGrant = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.GRANT_SERVER_CURRENCY);
    if (!canGrant) {
      return res.status(403).json({ error: 'No permission to deduct currency' });
    }
    
    if (!targetUserId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    const result = await CurrencyService.modifyServerCurrency(
      targetUserId,
      serverId,
      targetUsername || 'Unknown',
      -amount,
      currencyType || 'coins',
      CURRENCY_ACTIONS.ADMIN,
      reason || 'Admin deduction',
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error deducting currency:', error);
    res.status(500).json({ error: 'Failed to deduct currency' });
  }
});

router.get('/:serverId/transactions', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { limit = 50 } = req.query;
    const userId = req.session.user.id;
    
    const canView = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.VIEW_SERVER_AUDIT);
    if (!canView) {
      return res.status(403).json({ error: 'No permission to view transactions' });
    }
    
    const collection = await getCollection(COLLECTIONS.GLOBAL.CURRENCY_LEDGER);
    const transactions = await collection
      .find({ serverId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

router.get('/:serverId/stats', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_ECONOMY) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const playerData = await getCollection(COLLECTIONS.USER.PLAYER_DATA);
    
    const stats = await playerData.aggregate([
      { $match: { serverId } },
      {
        $group: {
          _id: null,
          totalPlayers: { $sum: 1 },
          totalCoins: { $sum: '$currency.coins' },
          totalGems: { $sum: '$currency.gems' },
          avgCoins: { $avg: '$currency.coins' },
          avgGems: { $avg: '$currency.gems' },
          maxCoins: { $max: '$currency.coins' },
          maxGems: { $max: '$currency.gems' }
        }
      }
    ]).toArray();
    
    res.json(stats[0] || {
      totalPlayers: 0,
      totalCoins: 0,
      totalGems: 0,
      avgCoins: 0,
      avgGems: 0,
      maxCoins: 0,
      maxGems: 0
    });
  } catch (error) {
    console.error('Error getting economy stats:', error);
    res.status(500).json({ error: 'Failed to get economy stats' });
  }
});

module.exports = router;
