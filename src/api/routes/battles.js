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
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_BATTLES) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const battleConfig = await ConfigService.getBattleConfig(serverId);
    if (!battleConfig) {
      return res.status(404).json({ error: 'Server not configured' });
    }
    
    res.json(battleConfig);
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
    
    const result = await ConfigService.updateServerConfig(serverId, { battles: battlesConfig });
    
    await createAuditLog({
      action: 'BATTLES_CONFIG_UPDATED',
      category: 'battles',
      userId,
      username: req.session.user.username,
      serverId,
      after: battlesConfig
    });
    
    res.json({ success: result });
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
    
    const config = await ConfigService.getServerConfig(serverId);
    const currentBattles = config?.battles || {};
    
    const updates = { ...currentBattles };
    if (trophyRewards) updates.trophyRewards = trophyRewards;
    if (coinRewards) updates.coinRewards = coinRewards;
    if (xpRewards) updates.xpRewards = xpRewards;
    
    const result = await ConfigService.updateServerConfig(serverId, { battles: updates });
    
    await createAuditLog({
      action: 'BATTLE_REWARDS_UPDATED',
      category: 'battles',
      userId,
      username: req.session.user.username,
      serverId,
      after: { trophyRewards, coinRewards, xpRewards }
    });
    
    res.json({ success: result });
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
    
    const config = await ConfigService.getServerConfig(serverId);
    const currentBattles = config?.battles || {};
    
    const result = await ConfigService.updateServerConfig(serverId, { 
      battles: { ...currentBattles, rankTiers } 
    });
    
    await createAuditLog({
      action: 'BATTLE_RANKS_UPDATED',
      category: 'battles',
      userId,
      username: req.session.user.username,
      serverId,
      after: { rankTiers }
    });
    
    res.json({ success: result });
  } catch (error) {
    console.error('Error updating rank tiers:', error);
    res.status(500).json({ error: 'Failed to update rank tiers' });
  }
});

router.get('/:serverId/leveling', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_BATTLES) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const levelingConfig = await ConfigService.getLevelingConfig(serverId);
    res.json(levelingConfig);
  } catch (error) {
    console.error('Error getting leveling config:', error);
    res.status(500).json({ error: 'Failed to get leveling config' });
  }
});

router.put('/:serverId/leveling', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const levelingConfig = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_BATTLES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage leveling' });
    }
    
    const result = await ConfigService.updateServerConfig(serverId, { leveling: levelingConfig });
    
    await createAuditLog({
      action: 'LEVELING_CONFIG_UPDATED',
      category: 'battles',
      userId,
      username: req.session.user.username,
      serverId,
      after: levelingConfig
    });
    
    res.json({ success: result });
  } catch (error) {
    console.error('Error updating leveling config:', error);
    res.status(500).json({ error: 'Failed to update leveling config' });
  }
});

router.post('/:serverId/reset-to-defaults', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_BATTLES);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage battles' });
    }
    
    const result = await ConfigService.updateServerConfig(serverId, { 
      battles: {},
      leveling: {}
    });
    ConfigService.clearServerCache(serverId);
    
    const battleConfig = await ConfigService.getBattleConfig(serverId);
    const levelingConfig = await ConfigService.getLevelingConfig(serverId);
    
    await createAuditLog({
      action: 'BATTLES_LEVELING_RESET',
      category: 'battles',
      userId,
      username: req.session.user.username,
      serverId
    });
    
    res.json({ success: result, battles: battleConfig, leveling: levelingConfig });
  } catch (error) {
    console.error('Error resetting battles config:', error);
    res.status(500).json({ error: 'Failed to reset battles config' });
  }
});

module.exports = router;
