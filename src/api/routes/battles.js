const express = require('express');
const router = express.Router();
const TenantService = require('../../services/TenantService');
const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');
const { requireAuth } = require('../middleware/auth');

router.get('/:serverId/config', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_BATTLES) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const config = await TenantService.getServerConfig(serverId);
    if (!config) {
      return res.status(404).json({ error: 'Server not configured' });
    }
    
    res.json(config.battles || {});
  } catch (error) {
    console.error('Error getting battles config:', error);
    res.status(500).json({ error: 'Failed to get battles config' });
  }
});

router.put('/:serverId/config', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const battlesConfig = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_BATTLES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage battles' });
    }
    
    const result = await TenantService.updateServerConfig(
      serverId,
      { battles: battlesConfig },
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error updating battles config:', error);
    res.status(500).json({ error: 'Failed to update battles config' });
  }
});

router.put('/:serverId/rewards', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { trophyRewards, coinRewards, xpRewards } = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_BATTLES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage battles' });
    }
    
    const config = await TenantService.getServerConfig(serverId);
    const currentBattles = config?.battles || {};
    
    const updates = { ...currentBattles };
    if (trophyRewards) updates.trophyRewards = trophyRewards;
    if (coinRewards) updates.coinRewards = coinRewards;
    if (xpRewards) updates.xpRewards = xpRewards;
    
    const result = await TenantService.updateServerConfig(
      serverId,
      { battles: updates },
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error updating battle rewards:', error);
    res.status(500).json({ error: 'Failed to update battle rewards' });
  }
});

router.put('/:serverId/ranks', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { rankTiers } = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_BATTLES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage battles' });
    }
    
    const config = await TenantService.getServerConfig(serverId);
    const currentBattles = config?.battles || {};
    
    const result = await TenantService.updateServerConfig(
      serverId,
      { battles: { ...currentBattles, rankTiers } },
      { id: userId, username: req.session.user.username }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error updating rank tiers:', error);
    res.status(500).json({ error: 'Failed to update rank tiers' });
  }
});

module.exports = router;
