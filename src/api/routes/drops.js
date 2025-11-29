const express = require('express');
const router = express.Router();
const TenantService = require('../../services/TenantService');
const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');
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
    
    const config = await TenantService.getServerConfig(serverId);
    if (!config) {
      return res.status(404).json({ error: 'Server not configured' });
    }
    
    res.json(config.drops || {});
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
    
    const result = await TenantService.updateServerConfig(
      serverId,
      { drops: dropsConfig },
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
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
    
    const config = await TenantService.getServerConfig(serverId);
    const currentDrops = config?.drops || {};
    
    const result = await TenantService.updateServerConfig(
      serverId,
      { drops: { ...currentDrops, enabled: !!enabled } },
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
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
    
    const config = await TenantService.getServerConfig(serverId);
    const currentDrops = config?.drops || {};
    
    const result = await TenantService.updateServerConfig(
      serverId,
      { drops: { ...currentDrops, dropRates } },
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
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
    
    const config = await TenantService.getServerConfig(serverId);
    const currentDrops = config?.drops || {};
    
    const result = await TenantService.updateServerConfig(
      serverId,
      { drops: { ...currentDrops, customMessages } },
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error updating drop messages:', error);
    res.status(500).json({ error: 'Failed to update drop messages' });
  }
});

module.exports = router;
