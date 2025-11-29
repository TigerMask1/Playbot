const express = require('express');
const router = express.Router();
const { getCollection, COLLECTIONS } = require('../../core/database');
const { CurrencyService, CURRENCY_ACTIONS } = require('../../services/CurrencyService');
const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');
const TenantService = require('../../services/TenantService');
const { createAuditLog } = require('../../services/AuditService');
const { requireAuth } = require('../middleware/auth');

async function requireSuperAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const isSuperAdmin = await PermissionService.isSuperAdmin(req.session.user.id);
  if (!isSuperAdmin) {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  
  next();
}

router.get('/stats', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const serverConfigs = await getCollection(COLLECTIONS.TENANT.SERVER_CONFIG);
    const globalUsers = await getCollection(COLLECTIONS.GLOBAL.USERS);
    const playerData = await getCollection(COLLECTIONS.USER.PLAYER_DATA);
    
    const [totalServers, totalGlobalUsers, totalPlayers] = await Promise.all([
      serverConfigs.countDocuments({}),
      globalUsers.countDocuments({}),
      playerData.countDocuments({})
    ]);
    
    res.json({
      totalServers,
      totalGlobalUsers,
      totalPlayers
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/servers', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const servers = await TenantService.getAllServers();
    res.json(servers);
  } catch (error) {
    console.error('Error getting all servers:', error);
    res.status(500).json({ error: 'Failed to get servers' });
  }
});

router.get('/super-admins', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const collection = await getCollection(COLLECTIONS.GLOBAL.SUPER_ADMINS);
    const admins = await collection.find({}).toArray();
    res.json(admins);
  } catch (error) {
    console.error('Error getting super admins:', error);
    res.status(500).json({ error: 'Failed to get super admins' });
  }
});

router.post('/super-admins', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { userId, username } = req.body;
    
    const result = await CurrencyService.addSuperAdmin(
      userId,
      username,
      { id: req.session.user.id, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error adding super admin:', error);
    res.status(500).json({ error: 'Failed to add super admin' });
  }
});

router.delete('/super-admins/:userId', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.session.user.id) {
      return res.status(400).json({ error: 'Cannot remove yourself' });
    }
    
    const collection = await getCollection(COLLECTIONS.GLOBAL.SUPER_ADMINS);
    await collection.deleteOne({ odiscordId: userId });
    
    await createAuditLog({
      action: 'SUPER_ADMIN_REMOVED',
      category: 'permission',
      userId: req.session.user.id,
      username: req.session.user.username,
      targetId: userId,
      targetType: 'user'
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing super admin:', error);
    res.status(500).json({ error: 'Failed to remove super admin' });
  }
});

router.post('/global-currency/grant', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { targetUserId, targetUsername, amount, currencyType, reason } = req.body;
    
    if (!targetUserId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    const result = await CurrencyService.modifyGlobalCurrency(
      targetUserId,
      targetUsername || 'Unknown',
      amount,
      currencyType || 'playCoins',
      CURRENCY_ACTIONS.ADMIN,
      reason || 'Super admin grant',
      { id: req.session.user.id, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error granting global currency:', error);
    res.status(500).json({ error: 'Failed to grant global currency' });
  }
});

router.post('/global-currency/deduct', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { targetUserId, targetUsername, amount, currencyType, reason } = req.body;
    
    if (!targetUserId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    const result = await CurrencyService.modifyGlobalCurrency(
      targetUserId,
      targetUsername || 'Unknown',
      -amount,
      currencyType || 'playCoins',
      CURRENCY_ACTIONS.ADMIN,
      reason || 'Super admin deduction',
      { id: req.session.user.id, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error deducting global currency:', error);
    res.status(500).json({ error: 'Failed to deduct global currency' });
  }
});

router.get('/global-currency/transactions', requireAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    const collection = await getCollection(COLLECTIONS.GLOBAL.CURRENCY_LEDGER);
    const transactions = await collection
      .find({ isGlobal: true })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json(transactions);
  } catch (error) {
    console.error('Error getting global transactions:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

router.post('/initialize-super-admin', async (req, res) => {
  try {
    const collection = await getCollection(COLLECTIONS.GLOBAL.SUPER_ADMINS);
    const existingAdmin = await collection.findOne({});
    
    if (existingAdmin) {
      return res.status(400).json({ error: 'Super admins already exist' });
    }
    
    const { userId, username, secretKey } = req.body;
    
    if (secretKey !== process.env.ADMIN_INIT_KEY) {
      return res.status(403).json({ error: 'Invalid secret key' });
    }
    
    await collection.insertOne({
      odiscordId: userId,
      username,
      addedBy: 'system',
      addedAt: new Date()
    });
    
    res.json({ success: true, message: 'First super admin created' });
  } catch (error) {
    console.error('Error initializing super admin:', error);
    res.status(500).json({ error: 'Failed to initialize super admin' });
  }
});

module.exports = router;
