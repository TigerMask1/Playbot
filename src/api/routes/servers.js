const express = require('express');
const router = express.Router();
const TenantService = require('../../services/TenantService');
const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');
const { requireAuth, requirePermission } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const adminGuilds = req.session.user.adminGuilds || [];
    
    const configuredServers = [];
    const unconfiguredServers = [];
    
    for (const guild of adminGuilds) {
      const config = await TenantService.getServerConfig(guild.id);
      if (config) {
        configuredServers.push({
          ...guild,
          config,
          setupComplete: config.setupComplete
        });
      } else {
        unconfiguredServers.push(guild);
      }
    }
    
    res.json({
      configured: configuredServers,
      unconfigured: unconfiguredServers,
      total: adminGuilds.length
    });
  } catch (error) {
    console.error('Error getting servers:', error);
    res.status(500).json({ error: 'Failed to get servers' });
  }
});

router.post('/setup', requireAuth, async (req, res) => {
  try {
    const { serverId, serverName } = req.body;
    const userId = req.session.user.id;
    const username = req.session.user.username;
    
    const hasAccess = req.session.user.adminGuilds.some(g => g.id === serverId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access to this server' });
    }
    
    const result = await TenantService.createServerConfig(
      serverId,
      serverName,
      userId,
      username
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error setting up server:', error);
    res.status(500).json({ error: 'Failed to setup server' });
  }
});

router.get('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = req.session.user.adminGuilds.some(g => g.id === serverId) ||
                      await PermissionService.isSuperAdmin(userId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access to this server' });
    }
    
    const config = await TenantService.getServerConfig(serverId);
    if (!config) {
      return res.status(404).json({ error: 'Server not configured' });
    }
    
    const permissions = await PermissionService.getUserPermissions(userId, serverId);
    const permissionLevel = await PermissionService.getUserPermissionLevel(userId, serverId);
    
    res.json({
      config,
      permissions,
      permissionLevel
    });
  } catch (error) {
    console.error('Error getting server:', error);
    res.status(500).json({ error: 'Failed to get server' });
  }
});

router.put('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const updates = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_SERVER);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage server' });
    }
    
    delete updates.serverId;
    delete updates.ownerId;
    delete updates.createdAt;
    
    const result = await TenantService.updateServerConfig(
      serverId,
      updates,
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error updating server:', error);
    res.status(500).json({ error: 'Failed to update server' });
  }
});

router.put('/:serverId/channels', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { channels } = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_SERVER);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage server' });
    }
    
    const result = await TenantService.updateServerConfig(
      serverId,
      { channels },
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error updating channels:', error);
    res.status(500).json({ error: 'Failed to update channels' });
  }
});

router.put('/:serverId/features', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { features } = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_SERVER);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage server' });
    }
    
    const result = await TenantService.updateServerConfig(
      serverId,
      { features },
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error updating features:', error);
    res.status(500).json({ error: 'Failed to update features' });
  }
});

router.put('/:serverId/branding', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { branding } = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_SERVER);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage server' });
    }
    
    const result = await TenantService.updateServerConfig(
      serverId,
      { branding },
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error updating branding:', error);
    res.status(500).json({ error: 'Failed to update branding' });
  }
});

router.post('/:serverId/admins', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { userId: targetUserId } = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_SERVER_ADMINS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage admins' });
    }
    
    const result = await TenantService.addServerAdmin(
      serverId,
      targetUserId,
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error adding admin:', error);
    res.status(500).json({ error: 'Failed to add admin' });
  }
});

router.delete('/:serverId/admins/:targetUserId', requireAuth, async (req, res) => {
  try {
    const { serverId, targetUserId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_SERVER_ADMINS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage admins' });
    }
    
    const result = await TenantService.removeServerAdmin(
      serverId,
      targetUserId,
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error removing admin:', error);
    res.status(500).json({ error: 'Failed to remove admin' });
  }
});

router.delete('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const canDelete = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.DELETE_SERVER);
    if (!canDelete) {
      return res.status(403).json({ error: 'No permission to delete server' });
    }
    
    const result = await TenantService.deleteServer(
      serverId,
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting server:', error);
    res.status(500).json({ error: 'Failed to delete server' });
  }
});

module.exports = router;
