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
    const { includeInactive } = req.query;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CRATES) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    if (includeInactive === 'true') {
      const collection = await getCollection(COLLECTIONS.TENANT.CRATES);
      const crates = await collection.find({ serverId }).toArray();
      return res.json(crates);
    }
    
    const cratesMap = await ConfigService.getCrates(serverId);
    res.json(Object.values(cratesMap));
  } catch (error) {
    console.error('Error getting crates:', error);
    res.status(500).json({ error: 'Failed to get crates' });
  }
});

router.get('/:serverId/:crateType', requireAuth, async (req, res) => {
  try {
    const { serverId, crateType } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CRATES) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const cratesMap = await ConfigService.getCrates(serverId);
    const crate = cratesMap[crateType];
    
    if (!crate) {
      return res.status(404).json({ error: 'Crate not found' });
    }
    
    res.json(crate);
  } catch (error) {
    console.error('Error getting crate:', error);
    res.status(500).json({ error: 'Failed to get crate' });
  }
});

router.post('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const crateData = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CRATES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage crates' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.CRATES);
    
    const crateType = crateData.type || `custom_${Date.now()}`;
    
    const existing = await collection.findOne({ serverId, type: crateType });
    if (existing) {
      return res.status(400).json({ error: 'Crate type already exists' });
    }
    
    const crate = {
      serverId,
      type: crateType,
      name: crateData.name,
      emoji: crateData.emoji || '📦',
      description: crateData.description || '',
      price: crateData.price || { coins: 0, gems: 0 },
      dropRates: crateData.dropRates || {
        common: 70,
        uncommon: 20,
        rare: 8,
        epic: 1.5,
        legendary: 0.5
      },
      guaranteedRewards: crateData.guaranteedRewards || [],
      bonusRewards: crateData.bonusRewards || [],
      isActive: true,
      isCustom: true,
      templateVersion: ConfigService.getCurrentTemplateVersion(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await collection.insertOne(crate);
    ConfigService.clearServerCache(serverId);
    
    await createAuditLog({
      action: 'CRATE_CREATED',
      category: 'crate',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: crateType,
      targetType: 'crate',
      after: crate
    });
    
    res.json({ success: true, crate });
  } catch (error) {
    console.error('Error creating crate:', error);
    res.status(500).json({ error: 'Failed to create crate' });
  }
});

router.put('/:serverId/:crateType', requireAuth, async (req, res) => {
  try {
    const { serverId, crateType } = req.params;
    const updates = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CRATES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage crates' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.CRATES);
    
    const existing = await collection.findOne({ 
      serverId, 
      $or: [{ type: crateType }, { crateId: crateType }]
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Crate not found' });
    }
    
    delete updates.serverId;
    delete updates.type;
    delete updates.crateId;
    delete updates.createdAt;
    delete updates.templateVersion;
    
    const success = await ConfigService.updateCrate(serverId, existing.type || crateType, updates);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update crate' });
    }
    
    await createAuditLog({
      action: 'CRATE_UPDATED',
      category: 'crate',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: crateType,
      targetType: 'crate',
      before: existing,
      after: updates
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating crate:', error);
    res.status(500).json({ error: 'Failed to update crate' });
  }
});

router.delete('/:serverId/:crateType', requireAuth, async (req, res) => {
  try {
    const { serverId, crateType } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CRATES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage crates' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.CRATES);
    
    const existing = await collection.findOne({ 
      serverId, 
      $or: [{ type: crateType }, { crateId: crateType }]
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Crate not found' });
    }
    
    await collection.updateOne(
      { serverId, type: existing.type || crateType },
      { $set: { isActive: false, deletedAt: new Date() } }
    );
    
    ConfigService.clearServerCache(serverId);
    
    await createAuditLog({
      action: 'CRATE_DELETED',
      category: 'crate',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: crateType,
      targetType: 'crate',
      before: existing
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting crate:', error);
    res.status(500).json({ error: 'Failed to delete crate' });
  }
});

router.post('/:serverId/seed-defaults', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CRATES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage crates' });
    }
    
    const cratesMap = await ConfigService.getCrates(serverId);
    
    await createAuditLog({
      action: 'CRATES_SEEDED',
      category: 'crate',
      userId,
      username: req.session.user.username,
      serverId,
      metadata: { count: Object.keys(cratesMap).length }
    });
    
    res.json({ success: true, count: Object.keys(cratesMap).length });
  } catch (error) {
    console.error('Error seeding crates:', error);
    res.status(500).json({ error: 'Failed to seed crates' });
  }
});

router.post('/:serverId/reset-to-defaults', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CRATES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage crates' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.CRATES);
    await collection.deleteMany({ serverId, isCustom: { $ne: true } });
    
    ConfigService.clearServerCache(serverId);
    const cratesMap = await ConfigService.getCrates(serverId);
    
    await createAuditLog({
      action: 'CRATES_RESET',
      category: 'crate',
      userId,
      username: req.session.user.username,
      serverId,
      metadata: { count: Object.keys(cratesMap).length }
    });
    
    res.json({ success: true, count: Object.keys(cratesMap).length });
  } catch (error) {
    console.error('Error resetting crates:', error);
    res.status(500).json({ error: 'Failed to reset crates' });
  }
});

module.exports = router;
