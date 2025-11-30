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
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_JOBS) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    if (includeInactive === 'true') {
      const collection = await getCollection(COLLECTIONS.TENANT.JOBS);
      const jobs = await collection.find({ serverId }).toArray();
      return res.json(jobs);
    }
    
    const jobsMap = await ConfigService.getJobs(serverId);
    res.json(Object.values(jobsMap));
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
});

router.get('/:serverId/:jobType', requireAuth, async (req, res) => {
  try {
    const { serverId, jobType } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_JOBS) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const jobsMap = await ConfigService.getJobs(serverId);
    const job = jobsMap[jobType];
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ error: 'Failed to get job' });
  }
});

router.post('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const jobData = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_JOBS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage jobs' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.JOBS);
    
    const jobType = jobData.type || `custom_${Date.now()}`;
    
    const existing = await collection.findOne({ serverId, type: jobType });
    if (existing) {
      return res.status(400).json({ error: 'Job type already exists' });
    }
    
    const job = {
      serverId,
      type: jobType,
      name: jobData.name,
      emoji: jobData.emoji || '💼',
      description: jobData.description || '',
      duration: jobData.duration || 3600000,
      rewards: jobData.rewards || {
        coins: { min: 100, max: 500 },
        gems: { min: 0, max: 5 },
        xp: { min: 10, max: 50 }
      },
      requirements: jobData.requirements || { level: 0 },
      cooldown: jobData.cooldown || 7200000,
      isActive: true,
      isCustom: true,
      templateVersion: ConfigService.getCurrentTemplateVersion(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await collection.insertOne(job);
    ConfigService.clearServerCache(serverId);
    
    await createAuditLog({
      action: 'JOB_CREATED',
      category: 'job',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: jobType,
      targetType: 'job',
      after: job
    });
    
    res.json({ success: true, job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

router.put('/:serverId/:jobType', requireAuth, async (req, res) => {
  try {
    const { serverId, jobType } = req.params;
    const updates = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_JOBS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage jobs' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.JOBS);
    
    const existing = await collection.findOne({ 
      serverId, 
      $or: [{ type: jobType }, { jobId: jobType }]
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    delete updates.serverId;
    delete updates.type;
    delete updates.jobId;
    delete updates.createdAt;
    delete updates.templateVersion;
    
    const success = await ConfigService.updateJob(serverId, existing.type || jobType, updates);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update job' });
    }
    
    await createAuditLog({
      action: 'JOB_UPDATED',
      category: 'job',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: jobType,
      targetType: 'job',
      before: existing,
      after: updates
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

router.delete('/:serverId/:jobType', requireAuth, async (req, res) => {
  try {
    const { serverId, jobType } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_JOBS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage jobs' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.JOBS);
    
    const existing = await collection.findOne({ 
      serverId, 
      $or: [{ type: jobType }, { jobId: jobType }]
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    await collection.updateOne(
      { serverId, type: existing.type || jobType },
      { $set: { isActive: false, deletedAt: new Date() } }
    );
    
    ConfigService.clearServerCache(serverId);
    
    await createAuditLog({
      action: 'JOB_DELETED',
      category: 'job',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: jobType,
      targetType: 'job',
      before: existing
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

router.post('/:serverId/seed-defaults', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_JOBS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage jobs' });
    }
    
    const jobsMap = await ConfigService.getJobs(serverId);
    
    await createAuditLog({
      action: 'JOBS_SEEDED',
      category: 'job',
      userId,
      username: req.session.user.username,
      serverId,
      metadata: { count: Object.keys(jobsMap).length }
    });
    
    res.json({ success: true, count: Object.keys(jobsMap).length });
  } catch (error) {
    console.error('Error seeding jobs:', error);
    res.status(500).json({ error: 'Failed to seed jobs' });
  }
});

router.post('/:serverId/reset-to-defaults', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_JOBS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage jobs' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.JOBS);
    await collection.deleteMany({ serverId, isCustom: { $ne: true } });
    
    ConfigService.clearServerCache(serverId);
    const jobsMap = await ConfigService.getJobs(serverId);
    
    await createAuditLog({
      action: 'JOBS_RESET',
      category: 'job',
      userId,
      username: req.session.user.username,
      serverId,
      metadata: { count: Object.keys(jobsMap).length }
    });
    
    res.json({ success: true, count: Object.keys(jobsMap).length });
  } catch (error) {
    console.error('Error resetting jobs:', error);
    res.status(500).json({ error: 'Failed to reset jobs' });
  }
});

module.exports = router;
