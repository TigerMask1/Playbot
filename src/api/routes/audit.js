const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditStats } = require('../../services/AuditService');
const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');
const { requireAuth } = require('../middleware/auth');

router.get('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { limit = 100, skip = 0, action, category, startDate, endDate } = req.query;
    const userId = req.session.user.id;
    
    const canView = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.VIEW_SERVER_AUDIT);
    if (!canView) {
      return res.status(403).json({ error: 'No permission to view audit logs' });
    }
    
    const logs = await getAuditLogs({
      serverId,
      limit: parseInt(limit),
      skip: parseInt(skip),
      action,
      category,
      startDate,
      endDate
    });
    
    res.json(logs);
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
});

router.get('/:serverId/stats', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const canView = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.VIEW_SERVER_AUDIT);
    if (!canView) {
      return res.status(403).json({ error: 'No permission to view audit stats' });
    }
    
    const stats = await getAuditStats(serverId);
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting audit stats:', error);
    res.status(500).json({ error: 'Failed to get audit stats' });
  }
});

router.get('/global', requireAuth, async (req, res) => {
  try {
    const { limit = 100, skip = 0, action, category } = req.query;
    const userId = req.session.user.id;
    
    const isSuperAdmin = await PermissionService.isSuperAdmin(userId);
    if (!isSuperAdmin) {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    
    const logs = await getAuditLogs({
      limit: parseInt(limit),
      skip: parseInt(skip),
      action,
      category
    });
    
    res.json(logs);
  } catch (error) {
    console.error('Error getting global audit logs:', error);
    res.status(500).json({ error: 'Failed to get global audit logs' });
  }
});

router.get('/global/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    
    const isSuperAdmin = await PermissionService.isSuperAdmin(userId);
    if (!isSuperAdmin) {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    
    const stats = await getAuditStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting global audit stats:', error);
    res.status(500).json({ error: 'Failed to get global audit stats' });
  }
});

module.exports = router;
