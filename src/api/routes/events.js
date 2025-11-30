const express = require('express');
const router = express.Router();
const { getCollection, COLLECTIONS } = require('../../core/database');
const { ConfigService } = require('../../services/ConfigService');
const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');
const { createAuditLog } = require('../../services/AuditService');
const { requireAuth } = require('../middleware/auth');

router.get('/:serverId/config', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_EVENTS) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const eventsConfig = await ConfigService.getEventsConfig(serverId);
    if (!eventsConfig) {
      return res.status(404).json({ error: 'Server not configured' });
    }
    
    res.json(eventsConfig);
  } catch (error) {
    console.error('Error getting events config:', error);
    res.status(500).json({ error: 'Failed to get events config' });
  }
});

router.put('/:serverId/config', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const eventsConfig = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_EVENTS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage events' });
    }
    
    const result = await ConfigService.updateServerConfig(serverId, { events: eventsConfig });
    
    await createAuditLog({
      action: 'EVENTS_CONFIG_UPDATED',
      category: 'events',
      userId,
      username: req.session.user.username,
      serverId,
      after: eventsConfig
    });
    
    res.json({ success: result });
  } catch (error) {
    console.error('Error updating events config:', error);
    res.status(500).json({ error: 'Failed to update events config' });
  }
});

router.get('/:serverId/list', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { status } = req.query;
    const userId = req.session.user.id;
    
    const hasAccess = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_EVENTS) ||
                      req.session.user.adminGuilds.some(g => g.id === serverId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.EVENTS);
    const query = { serverId };
    if (status) query.status = status;
    
    const events = await collection
      .find(query)
      .sort({ startAt: -1 })
      .limit(50)
      .toArray();
    
    res.json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

router.post('/:serverId', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const eventData = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_EVENTS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage events' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.EVENTS);
    
    const event = {
      serverId,
      eventId: `event_${Date.now()}`,
      name: eventData.name,
      type: eventData.type || 'catchRace',
      description: eventData.description || '',
      status: 'scheduled',
      startAt: new Date(eventData.startAt),
      endAt: new Date(eventData.endAt),
      rewards: eventData.rewards || {},
      participants: [],
      createdBy: userId,
      createdAt: new Date()
    };
    
    await collection.insertOne(event);
    
    await createAuditLog({
      action: 'EVENT_CREATED',
      category: 'event',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: event.eventId,
      targetType: 'event',
      after: event
    });
    
    res.json({ success: true, event });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.put('/:serverId/:eventId', requireAuth, async (req, res) => {
  try {
    const { serverId, eventId } = req.params;
    const updates = req.body;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_EVENTS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage events' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.EVENTS);
    
    const existing = await collection.findOne({ serverId, eventId });
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    delete updates.serverId;
    delete updates.eventId;
    delete updates.createdAt;
    updates.updatedAt = new Date();
    
    await collection.updateOne(
      { serverId, eventId },
      { $set: updates }
    );
    
    await createAuditLog({
      action: 'EVENT_UPDATED',
      category: 'event',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: eventId,
      targetType: 'event',
      before: existing,
      after: updates
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.delete('/:serverId/:eventId', requireAuth, async (req, res) => {
  try {
    const { serverId, eventId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_EVENTS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage events' });
    }
    
    const collection = await getCollection(COLLECTIONS.TENANT.EVENTS);
    
    const existing = await collection.findOne({ serverId, eventId });
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    await collection.deleteOne({ serverId, eventId });
    
    await createAuditLog({
      action: 'EVENT_DELETED',
      category: 'event',
      userId,
      username: req.session.user.username,
      serverId,
      targetId: eventId,
      targetType: 'event',
      before: existing
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

router.post('/:serverId/reset-to-defaults', requireAuth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.session.user.id;
    
    const canManage = await PermissionService.hasPermission(userId, serverId, PERMISSIONS.MANAGE_EVENTS);
    if (!canManage) {
      return res.status(403).json({ error: 'No permission to manage events' });
    }
    
    const result = await ConfigService.updateServerConfig(serverId, { events: {} });
    ConfigService.clearServerCache(serverId);
    
    const eventsConfig = await ConfigService.getEventsConfig(serverId);
    
    await createAuditLog({
      action: 'EVENTS_RESET',
      category: 'events',
      userId,
      username: req.session.user.username,
      serverId
    });
    
    res.json({ success: result, config: eventsConfig });
  } catch (error) {
    console.error('Error resetting events config:', error);
    res.status(500).json({ error: 'Failed to reset events config' });
  }
});

module.exports = router;
