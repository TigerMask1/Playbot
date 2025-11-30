const express = require('express');
const router = express.Router();
const { ConfigService } = require('../../services/ConfigService');
const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');
const { createAuditLog } = require('../../services/AuditService');
const { requireAuth } = require('../middleware/auth');

router.get('/:serverId/config', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_DROPS) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const dropConfig = await ConfigService.getDropConfig(serverId);
    if (!dropConfig) {
      return res.status(404).json({ error: 'Server not configured' });
    }
    
    res.json(dropConfig);
  } catch (error) {
    console.error('Error getting drops config:', error);
    res.status(500).json({ error: 'Failed to get drops config' });
  }
});

router.put('/:serverId/config', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const dropsConfig = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_DROPS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage drops' });
    }
    
    const result = await ConfigService.updateServerConfig(serverId, { drops: dropsConfig });
    
    await createAuditLog({
      action: 'DROPS_CONFIG_UPDATED',
      category: 'drops',
      userId,
      username: req.session.user.username,
      serverId,
      after: dropsConfig
    });
    
    res.json({ success: result });
  } catch (error) {
    console.error('Error updating drops config:', error);
    res.status(500).json({ error: 'Failed to update drops config' });
  }
});

router.put('/:serverId/toggle', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { enabled } = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_DROPS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage drops' });
    }
    
    const config = await ConfigService.getServerConfig(serverId);
    const currentDrops = config?.drops || {};
    
    const result = await ConfigService.updateServerConfig(serverId, { 
      drops: { ...currentDrops, enabled: !!enabled } 
    });
    
    await createAuditLog({
      action: 'DROPS_TOGGLED',
      category: 'drops',
      userId,
      username: req.session.user.username,
      serverId,
      metadata: { enabled: !!enabled }
    });
    
    res.json({ success: result, enabled: !!enabled });
  } catch (error) {
    console.error('Error toggling drops:', error);
    res.status(500).json({ error: 'Failed to toggle drops' });
  }
});

router.put('/:serverId/rates', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { dropRates } = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_DROPS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage drops' });
    }
    
    const config = await ConfigService.getServerConfig(serverId);
    const currentDrops = config?.drops || {};
    
    const result = await ConfigService.updateServerConfig(serverId, { 
      drops: { ...currentDrops, dropRates } 
    });
    
    await createAuditLog({
      action: 'DROP_RATES_UPDATED',
      category: 'drops',
      userId,
      username: req.session.user.username,
      serverId,
      after: dropRates
    });
    
    res.json({ success: result });
  } catch (error) {
    console.error('Error updating drop rates:', error);
    res.status(500).json({ error: 'Failed to update drop rates' });
  }
});

router.put('/:serverId/messages', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { customMessages } = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_DROPS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage drops' });
    }
    
    const config = await ConfigService.getServerConfig(serverId);
    const currentDrops = config?.drops || {};
    
    const result = await ConfigService.updateServerConfig(serverId, { 
      drops: { ...currentDrops, customMessages } 
    });
    
    await createAuditLog({
      action: 'DROP_MESSAGES_UPDATED',
      category: 'drops',
      userId,
      username: req.session.user.username,
      serverId,
      after: customMessages
    });
    
    res.json({ success: result });
  } catch (error) {
    console.error('Error updating drop messages:', error);
    res.status(500).json({ error: 'Failed to update drop messages' });
  }
});

router.post('/:serverId/reset-to-defaults', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_DROPS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage drops' });
    }
    
    const result = await ConfigService.updateServerConfig(serverId, { drops: {} });
    ConfigService.clearServerCache(serverId);
    
    const dropConfig = await ConfigService.getDropConfig(serverId);
    
    await createAuditLog({
      action: 'DROPS_RESET',
      category: 'drops',
      userId,
      username: req.session.user.username,
      serverId
    });
    
    res.json({ success: result, config: dropConfig });
  } catch (error) {
    console.error('Error resetting drops config:', error);
    res.status(500).json({ error: 'Failed to reset drops config' });
  }
});

module.exports = router;
