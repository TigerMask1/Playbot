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
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CRATES) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.CRATES);
    const crates = await collection.find({ serverId }).toArray();
    
    res.json(crates);
  } catch (error) {
    console.error('Error getting crates:', error);
    res.status(500).json({ error: 'Failed to get crates' });
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
    
    const crateId = crateData.crateId || `crate_${Date.now()}`;
    
    const crate = {
      serverId,
      crateId,
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
      isActive: crateData.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await collection.insertOne(crate);
    
    await createAuditLog({
      action: 'CRATE_CREATED',
      category: 'crate',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: crateId,
      targetType: 'crate',
      after: crate
    });
    
    res.json({ success: true, crate });
  } catch (error) {
    console.error('Error creating crate:', error);
    res.status(500).json({ error: 'Failed to create crate' });
  }
});

router.put('/:serverId/:crateId', requireAuth, async (req, res) => {
  try {
    const { serverId, crateId } = req.params;
    const updates = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CRATES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage crates' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.CRATES);
    
    const existing = await collection.findOne({ serverId, crateId });
    if (!existing) {
      return res.status(404).json({ error: 'Crate not found' });
    }
    
    delete updates.serverId;
    delete updates.crateId;
    delete updates.createdAt;
    updates.updatedAt = new Date();
    
    await collection.updateOne(
      { serverId, crateId },
      { $set: updates }
    );
    
    await createAuditLog({
      action: 'CRATE_UPDATED',
      category: 'crate',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: crateId,
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

router.delete('/:serverId/:crateId', requireAuth, async (req, res) => {
  try {
    const { serverId, crateId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CRATES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage crates' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.CRATES);
    await collection.deleteOne({ serverId, crateId });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting crate:', error);
    res.status(500).json({ error: 'Failed to delete crate' });
  }
});

module.exports = router;
