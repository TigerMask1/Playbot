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
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_JOBS) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.JOBS);
    const jobs = await collection.find({ serverId }).toArray();
    
    res.json(jobs);
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
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
    
    const jobId = jobData.jobId || `job_${Date.now()}`;
    
    const job = {
      serverId,
      jobId,
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
      isActive: jobData.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await collection.insertOne(job);
    
    await createAuditLog({
      action: 'JOB_CREATED',
      category: 'job',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: jobId,
      targetType: 'job',
      after: job
    });
    
    res.json({ success: true, job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

router.put('/:serverId/:jobId', requireAuth, async (req, res) => {
  try {
    const { serverId, jobId } = req.params;
    const updates = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_JOBS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage jobs' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.JOBS);
    
    delete updates.serverId;
    delete updates.jobId;
    delete updates.createdAt;
    updates.updatedAt = new Date();
    
    await collection.updateOne(
      { serverId, jobId },
      { $set: updates }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

router.delete('/:serverId/:jobId', requireAuth, async (req, res) => {
  try {
    const { serverId, jobId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_JOBS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage jobs' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.JOBS);
    await collection.deleteOne({ serverId, jobId });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;
