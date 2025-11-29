const { PermissionService, PERMISSIONS } = require('../../services/PermissionService');

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function requireServerAccess(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const serverId = req.params.serverId || req.body.serverId || req.query.serverId;
  if (!serverId) {
    return res.status(400).json({ error: 'Server ID required' });
  }
  
  req.serverId = serverId;
  next();
}

function requirePermission(permission) {
  return async (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const serverId = req.params.serverId || req.body.serverId || req.query.serverId;
    const userId = req.session.user.id;

    try {
      const hasPermission = await PermissionService.hasPermission(userId, serverId, permission);
      if (!hasPermission) {
        return res.status(403).json({ error: 'Permission denied', required: permission });
      }
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

function requireSuperAdmin(req, res, next) {
  return requirePermission(PERMISSIONS.MANAGE_GLOBAL_CURRENCY)(req, res, next);
}

async function attachUserPermissions(req, res, next) {
  if (req.session && req.session.user) {
    const serverId = req.params.serverId || req.body.serverId || req.query.serverId;
    if (serverId) {
      try {
        req.userPermissions = await PermissionService.getUserPermissions(req.session.user.id, serverId);
        req.permissionLevel = await PermissionService.getUserPermissionLevel(req.session.user.id, serverId);
      } catch (error) {
        console.error('Error attaching permissions:', error);
        req.userPermissions = [];
        req.permissionLevel = 0;
      }
    }
  }
  next();
}

module.exports = {
  requireAuth,
  requireServerAccess,
  requirePermission,
  requireSuperAdmin,
  attachUserPermissions
};
