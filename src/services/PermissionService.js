const { getCollection, COLLECTIONS } = require('../core/database');
const TenantService = require('./TenantService');

const PERMISSION_LEVELS = {
  SUPER_ADMIN: 100,
  SERVER_OWNER: 90,
  SERVER_ADMIN: 80,
  SERVER_MODERATOR: 50,
  PLAYER: 10,
  GUEST: 0
};

const PERMISSIONS = {
  MANAGE_GLOBAL_CURRENCY: 'manage_global_currency',
  MANAGE_SUPER_ADMINS: 'manage_super_admins',
  VIEW_ALL_SERVERS: 'view_all_servers',
  DELETE_ANY_SERVER: 'delete_any_server',
  VIEW_GLOBAL_AUDIT: 'view_global_audit',
  
  MANAGE_SERVER: 'manage_server',
  MANAGE_SERVER_ADMINS: 'manage_server_admins',
  MANAGE_SERVER_MODS: 'manage_server_mods',
  DELETE_SERVER: 'delete_server',
  
  MANAGE_CHARACTERS: 'manage_characters',
  MANAGE_MOVES: 'manage_moves',
  MANAGE_ITEMS: 'manage_items',
  MANAGE_CRATES: 'manage_crates',
  MANAGE_QUESTS: 'manage_quests',
  MANAGE_JOBS: 'manage_jobs',
  MANAGE_EVENTS: 'manage_events',
  MANAGE_SHOP: 'manage_shop',
  MANAGE_ECONOMY: 'manage_economy',
  MANAGE_DROPS: 'manage_drops',
  MANAGE_BATTLES: 'manage_battles',
  MANAGE_CLANS: 'manage_clans',
  MANAGE_MINIGAMES: 'manage_minigames',
  MANAGE_TRIVIA: 'manage_trivia',
  MANAGE_GIVEAWAYS: 'manage_giveaways',
  MANAGE_LOTTERIES: 'manage_lotteries',
  MANAGE_COSMETICS: 'manage_cosmetics',
  MANAGE_MARKET: 'manage_market',
  
  VIEW_SERVER_AUDIT: 'view_server_audit',
  VIEW_PLAYER_DATA: 'view_player_data',
  MODIFY_PLAYER_DATA: 'modify_player_data',
  GRANT_SERVER_CURRENCY: 'grant_server_currency',
  
  KICK_PLAYERS: 'kick_players',
  BAN_PLAYERS: 'ban_players',
  MUTE_PLAYERS: 'mute_players'
};

const ROLE_PERMISSIONS = {
  [PERMISSION_LEVELS.SUPER_ADMIN]: Object.values(PERMISSIONS),
  
  [PERMISSION_LEVELS.SERVER_OWNER]: [
    PERMISSIONS.MANAGE_SERVER,
    PERMISSIONS.MANAGE_SERVER_ADMINS,
    PERMISSIONS.MANAGE_SERVER_MODS,
    PERMISSIONS.DELETE_SERVER,
    PERMISSIONS.MANAGE_CHARACTERS,
    PERMISSIONS.MANAGE_MOVES,
    PERMISSIONS.MANAGE_ITEMS,
    PERMISSIONS.MANAGE_CRATES,
    PERMISSIONS.MANAGE_QUESTS,
    PERMISSIONS.MANAGE_JOBS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.MANAGE_SHOP,
    PERMISSIONS.MANAGE_ECONOMY,
    PERMISSIONS.MANAGE_DROPS,
    PERMISSIONS.MANAGE_BATTLES,
    PERMISSIONS.MANAGE_CLANS,
    PERMISSIONS.MANAGE_MINIGAMES,
    PERMISSIONS.MANAGE_TRIVIA,
    PERMISSIONS.MANAGE_GIVEAWAYS,
    PERMISSIONS.MANAGE_LOTTERIES,
    PERMISSIONS.MANAGE_COSMETICS,
    PERMISSIONS.MANAGE_MARKET,
    PERMISSIONS.VIEW_SERVER_AUDIT,
    PERMISSIONS.VIEW_PLAYER_DATA,
    PERMISSIONS.MODIFY_PLAYER_DATA,
    PERMISSIONS.GRANT_SERVER_CURRENCY,
    PERMISSIONS.KICK_PLAYERS,
    PERMISSIONS.BAN_PLAYERS,
    PERMISSIONS.MUTE_PLAYERS
  ],
  
  [PERMISSION_LEVELS.SERVER_ADMIN]: [
    PERMISSIONS.MANAGE_SERVER,
    PERMISSIONS.MANAGE_SERVER_MODS,
    PERMISSIONS.MANAGE_CHARACTERS,
    PERMISSIONS.MANAGE_MOVES,
    PERMISSIONS.MANAGE_ITEMS,
    PERMISSIONS.MANAGE_CRATES,
    PERMISSIONS.MANAGE_QUESTS,
    PERMISSIONS.MANAGE_JOBS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.MANAGE_SHOP,
    PERMISSIONS.MANAGE_DROPS,
    PERMISSIONS.MANAGE_BATTLES,
    PERMISSIONS.MANAGE_CLANS,
    PERMISSIONS.MANAGE_MINIGAMES,
    PERMISSIONS.MANAGE_TRIVIA,
    PERMISSIONS.MANAGE_GIVEAWAYS,
    PERMISSIONS.MANAGE_LOTTERIES,
    PERMISSIONS.MANAGE_COSMETICS,
    PERMISSIONS.MANAGE_MARKET,
    PERMISSIONS.VIEW_SERVER_AUDIT,
    PERMISSIONS.VIEW_PLAYER_DATA,
    PERMISSIONS.MODIFY_PLAYER_DATA,
    PERMISSIONS.GRANT_SERVER_CURRENCY,
    PERMISSIONS.KICK_PLAYERS,
    PERMISSIONS.BAN_PLAYERS,
    PERMISSIONS.MUTE_PLAYERS
  ],
  
  [PERMISSION_LEVELS.SERVER_MODERATOR]: [
    PERMISSIONS.VIEW_SERVER_AUDIT,
    PERMISSIONS.VIEW_PLAYER_DATA,
    PERMISSIONS.KICK_PLAYERS,
    PERMISSIONS.MUTE_PLAYERS,
    PERMISSIONS.MANAGE_GIVEAWAYS,
    PERMISSIONS.MANAGE_EVENTS
  ],
  
  [PERMISSION_LEVELS.PLAYER]: [],
  [PERMISSION_LEVELS.GUEST]: []
};

class PermissionService {
  static async getUserPermissionLevel(userId, serverId = null) {
    try {
      const isSuperAdmin = await this.isSuperAdmin(userId);
      if (isSuperAdmin) {
        return PERMISSION_LEVELS.SUPER_ADMIN;
      }

      if (!serverId) {
        return PERMISSION_LEVELS.GUEST;
      }

      const serverConfig = await TenantService.getServerConfig(serverId);
      if (!serverConfig) {
        return PERMISSION_LEVELS.GUEST;
      }

      if (serverConfig.ownerId === userId) {
        return PERMISSION_LEVELS.SERVER_OWNER;
      }

      if (serverConfig.admins && serverConfig.admins.includes(userId)) {
        return PERMISSION_LEVELS.SERVER_ADMIN;
      }

      if (serverConfig.moderators && serverConfig.moderators.includes(userId)) {
        return PERMISSION_LEVELS.SERVER_MODERATOR;
      }

      const playerData = await getCollection(COLLECTIONS.USER.PLAYER_DATA);
      const player = await playerData.findOne({ odiscordId: userId, serverId });
      if (player) {
        return PERMISSION_LEVELS.PLAYER;
      }

      return PERMISSION_LEVELS.GUEST;
    } catch (error) {
      console.error('Error getting user permission level:', error);
      return PERMISSION_LEVELS.GUEST;
    }
  }

  static async hasPermission(userId, serverId, permission) {
    try {
      const level = await this.getUserPermissionLevel(userId, serverId);
      const permissions = ROLE_PERMISSIONS[level] || [];
      return permissions.includes(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  static async getUserPermissions(userId, serverId) {
    try {
      const level = await this.getUserPermissionLevel(userId, serverId);
      return ROLE_PERMISSIONS[level] || [];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  static async isSuperAdmin(userId) {
    try {
      const collection = await getCollection(COLLECTIONS.GLOBAL.SUPER_ADMINS);
      const admin = await collection.findOne({ odiscordId: userId });
      return !!admin;
    } catch (error) {
      console.error('Error checking super admin:', error);
      return false;
    }
  }

  static async canManageServer(userId, serverId) {
    return this.hasPermission(userId, serverId, PERMISSIONS.MANAGE_SERVER);
  }

  static async canManageCharacters(userId, serverId) {
    return this.hasPermission(userId, serverId, PERMISSIONS.MANAGE_CHARACTERS);
  }

  static async canManageEconomy(userId, serverId) {
    return this.hasPermission(userId, serverId, PERMISSIONS.MANAGE_ECONOMY);
  }

  static async canViewAuditLog(userId, serverId) {
    const isSuperAdmin = await this.isSuperAdmin(userId);
    if (isSuperAdmin) return true;
    return this.hasPermission(userId, serverId, PERMISSIONS.VIEW_SERVER_AUDIT);
  }

  static async requirePermission(userId, serverId, permission) {
    const hasPermission = await this.hasPermission(userId, serverId, permission);
    if (!hasPermission) {
      throw new Error(`Permission denied: ${permission}`);
    }
    return true;
  }

  static async addModerator(serverId, userId, addedBy) {
    try {
      const canManage = await this.hasPermission(addedBy, serverId, PERMISSIONS.MANAGE_SERVER_MODS);
      if (!canManage) {
        return { success: false, message: 'No permission to add moderators' };
      }

      const collection = await getCollection(COLLECTIONS.TENANT.SERVER_CONFIG);
      await collection.updateOne(
        { serverId },
        { 
          $addToSet: { moderators: userId },
          $set: { updatedAt: new Date() }
        }
      );

      return { success: true, message: 'Moderator added successfully' };
    } catch (error) {
      console.error('Error adding moderator:', error);
      return { success: false, message: 'Failed to add moderator' };
    }
  }

  static async removeModerator(serverId, userId, removedBy) {
    try {
      const canManage = await this.hasPermission(removedBy, serverId, PERMISSIONS.MANAGE_SERVER_MODS);
      if (!canManage) {
        return { success: false, message: 'No permission to remove moderators' };
      }

      const collection = await getCollection(COLLECTIONS.TENANT.SERVER_CONFIG);
      await collection.updateOne(
        { serverId },
        { 
          $pull: { moderators: userId },
          $set: { updatedAt: new Date() }
        }
      );

      return { success: true, message: 'Moderator removed successfully' };
    } catch (error) {
      console.error('Error removing moderator:', error);
      return { success: false, message: 'Failed to remove moderator' };
    }
  }
}

module.exports = { PermissionService, PERMISSION_LEVELS, PERMISSIONS };
