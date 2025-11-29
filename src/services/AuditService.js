const { getCollection, COLLECTIONS } = require('../core/database');

async function createAuditLog(logData) {
  try {
    const collection = await getCollection(COLLECTIONS.GLOBAL.AUDIT_LOG);
    
    const auditEntry = {
      timestamp: new Date(),
      action: logData.action,
      category: logData.category || 'general',
      userId: logData.userId || null,
      username: logData.username || null,
      serverId: logData.serverId || null,
      serverName: logData.serverName || null,
      targetId: logData.targetId || null,
      targetType: logData.targetType || null,
      before: logData.before || null,
      after: logData.after || null,
      metadata: logData.metadata || {},
      ip: logData.ip || null
    };
    
    await collection.insertOne(auditEntry);
    return true;
  } catch (error) {
    console.error('Error creating audit log:', error);
    return false;
  }
}

async function getAuditLogs(options = {}) {
  try {
    const collection = await getCollection(COLLECTIONS.GLOBAL.AUDIT_LOG);
    
    const query = {};
    
    if (options.userId) query.userId = options.userId;
    if (options.serverId) query.serverId = options.serverId;
    if (options.action) query.action = options.action;
    if (options.category) query.category = options.category;
    if (options.startDate || options.endDate) {
      query.timestamp = {};
      if (options.startDate) query.timestamp.$gte = new Date(options.startDate);
      if (options.endDate) query.timestamp.$lte = new Date(options.endDate);
    }
    
    const limit = options.limit || 100;
    const skip = options.skip || 0;
    
    const logs = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return logs;
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
}

async function getAuditLogsByAction(action, limit = 50) {
  return getAuditLogs({ action, limit });
}

async function getAuditLogsByUser(userId, limit = 50) {
  return getAuditLogs({ userId, limit });
}

async function getAuditLogsByServer(serverId, limit = 50) {
  return getAuditLogs({ serverId, limit });
}

async function getAuditStats(serverId = null) {
  try {
    const collection = await getCollection(COLLECTIONS.GLOBAL.AUDIT_LOG);
    
    const matchStage = serverId ? { $match: { serverId } } : { $match: {} };
    
    const stats = await collection.aggregate([
      matchStage,
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          lastOccurred: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    return stats;
  } catch (error) {
    console.error('Error getting audit stats:', error);
    return [];
  }
}

module.exports = {
  createAuditLog,
  getAuditLogs,
  getAuditLogsByAction,
  getAuditLogsByUser,
  getAuditLogsByServer,
  getAuditStats
};
