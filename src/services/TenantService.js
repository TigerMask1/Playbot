const { getCollection, COLLECTIONS } = require('../core/database');
const { SERVER_CONFIG_SCHEMA, DEFAULT_DROP_CONFIG, DEFAULT_BATTLE_CONFIG } = require('../core/schemas');
const { createAuditLog } = require('./AuditService');

class TenantService {
  static async getServerConfig(serverId) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.SERVER_CONFIG);
      const config = await collection.findOne({ serverId });
      return config;
    } catch (error) {
      console.error('Error getting server config:', error);
      return null;
    }
  }

  static async createServerConfig(serverId, serverName, ownerId, ownerName) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.SERVER_CONFIG);
      
      const existingConfig = await collection.findOne({ serverId });
      if (existingConfig) {
        return { success: false, message: 'Server already configured', config: existingConfig };
      }

      const config = {
        ...JSON.parse(JSON.stringify(SERVER_CONFIG_SCHEMA)),
        serverId,
        serverName,
        ownerId,
        ownerName,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await collection.insertOne(config);

      await this.initializeDefaultData(serverId);

      await createAuditLog({
        action: 'SERVER_CREATED',
        category: 'server',
        userId: ownerId,
        username: ownerName,
        serverId,
        serverName,
        metadata: { config }
      });

      return { success: true, message: 'Server configured successfully', config };
    } catch (error) {
      console.error('Error creating server config:', error);
      return { success: false, message: 'Failed to create server config' };
    }
  }

  static async updateServerConfig(serverId, updates, updatedBy) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.SERVER_CONFIG);
      
      const currentConfig = await collection.findOne({ serverId });
      if (!currentConfig) {
        return { success: false, message: 'Server not found' };
      }

      updates.updatedAt = new Date();
      
      await collection.updateOne(
        { serverId },
        { $set: updates }
      );

      await createAuditLog({
        action: 'SERVER_UPDATED',
        category: 'server',
        userId: updatedBy.id,
        username: updatedBy.username,
        serverId,
        before: currentConfig,
        after: updates
      });

      return { success: true, message: 'Server config updated' };
    } catch (error) {
      console.error('Error updating server config:', error);
      return { success: false, message: 'Failed to update server config' };
    }
  }

  static async initializeDefaultData(serverId) {
    try {
      const charactersCol = await getCollection(COLLECTIONS.TENANT.CHARACTERS);
      const existingChars = await charactersCol.findOne({ serverId });
      
      if (!existingChars) {
        const defaultCharacters = require('../../characters.js');
        const characters = defaultCharacters.map((char, index) => ({
          serverId,
          characterId: `char_${index + 1}`,
          ...char,
          rarity: this.determineRarity(char.obtainable),
          baseStats: {
            hp: 100,
            attack: 10 + Math.floor(Math.random() * 10),
            defense: 10 + Math.floor(Math.random() * 10),
            speed: 10 + Math.floor(Math.random() * 10)
          },
          isActive: true,
          createdAt: new Date()
        }));
        
        if (characters.length > 0) {
          await charactersCol.insertMany(characters);
        }
      }

      const movesCol = await getCollection(COLLECTIONS.TENANT.MOVES);
      const existingMoves = await movesCol.findOne({ serverId });
      
      if (!existingMoves) {
        const { LOW_ST_MOVES, MID_ST_MOVES, HIGH_ST_MOVES, SPECIAL_MOVES } = require('../../moves.js');
        
        const moves = [
          ...LOW_ST_MOVES.map((m, i) => ({ serverId, moveId: `low_${i}`, ...m, tier: 'low', isActive: true, createdAt: new Date() })),
          ...MID_ST_MOVES.map((m, i) => ({ serverId, moveId: `mid_${i}`, ...m, tier: 'mid', isActive: true, createdAt: new Date() })),
          ...HIGH_ST_MOVES.map((m, i) => ({ serverId, moveId: `high_${i}`, ...m, tier: 'high', isActive: true, createdAt: new Date() }))
        ];
        
        Object.entries(SPECIAL_MOVES).forEach(([charName, move]) => {
          moves.push({
            serverId,
            moveId: `special_${charName.toLowerCase()}`,
            ...move,
            tier: 'special',
            characterName: charName,
            isActive: true,
            createdAt: new Date()
          });
        });
        
        if (moves.length > 0) {
          await movesCol.insertMany(moves);
        }
      }

      const cratesCol = await getCollection(COLLECTIONS.TENANT.CRATES);
      const existingCrates = await cratesCol.findOne({ serverId });
      
      if (!existingCrates) {
        const defaultCrates = [
          { serverId, crateId: 'bronze', name: 'Bronze Crate', emoji: '🟫', price: { coins: 500, gems: 0 }, dropRates: { common: 80, uncommon: 15, rare: 4, epic: 0.9, legendary: 0.1 }, isActive: true, createdAt: new Date() },
          { serverId, crateId: 'silver', name: 'Silver Crate', emoji: '⬜', price: { coins: 1500, gems: 0 }, dropRates: { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 }, isActive: true, createdAt: new Date() },
          { serverId, crateId: 'gold', name: 'Gold Crate', emoji: '🟨', price: { coins: 5000, gems: 0 }, dropRates: { common: 40, uncommon: 30, rare: 20, epic: 8, legendary: 2 }, isActive: true, createdAt: new Date() },
          { serverId, crateId: 'emerald', name: 'Emerald Crate', emoji: '🟩', price: { coins: 0, gems: 50 }, dropRates: { common: 20, uncommon: 35, rare: 30, epic: 12, legendary: 3 }, isActive: true, createdAt: new Date() },
          { serverId, crateId: 'legendary', name: 'Legendary Crate', emoji: '🟪', price: { coins: 0, gems: 150 }, dropRates: { common: 5, uncommon: 15, rare: 40, epic: 30, legendary: 10 }, isActive: true, createdAt: new Date() },
          { serverId, crateId: 'tyrant', name: 'Tyrant Crate', emoji: '👑', price: { coins: 0, gems: 500 }, dropRates: { common: 0, uncommon: 5, rare: 25, epic: 45, legendary: 25 }, isActive: true, createdAt: new Date() }
        ];
        
        await cratesCol.insertMany(defaultCrates);
      }

      const questsCol = await getCollection(COLLECTIONS.TENANT.QUESTS);
      const existingQuests = await questsCol.findOne({ serverId });
      
      if (!existingQuests) {
        const defaultQuests = [
          { serverId, questId: 'catch_5', name: 'Catch 5 Characters', type: 'daily', requirement: { action: 'catch', count: 5 }, rewards: { coins: 200, gems: 5, xp: 50 }, isActive: true, createdAt: new Date() },
          { serverId, questId: 'battle_3', name: 'Win 3 Battles', type: 'daily', requirement: { action: 'battle_win', count: 3 }, rewards: { coins: 300, gems: 10, xp: 75 }, isActive: true, createdAt: new Date() },
          { serverId, questId: 'open_crate', name: 'Open 1 Crate', type: 'daily', requirement: { action: 'open_crate', count: 1 }, rewards: { coins: 100, gems: 2, xp: 25 }, isActive: true, createdAt: new Date() },
          { serverId, questId: 'trade_1', name: 'Complete 1 Trade', type: 'daily', requirement: { action: 'trade', count: 1 }, rewards: { coins: 150, gems: 5, xp: 40 }, isActive: true, createdAt: new Date() },
          { serverId, questId: 'work_2', name: 'Complete 2 Jobs', type: 'daily', requirement: { action: 'work', count: 2 }, rewards: { coins: 250, gems: 8, xp: 60 }, isActive: true, createdAt: new Date() }
        ];
        
        await questsCol.insertMany(defaultQuests);
      }

      const jobsCol = await getCollection(COLLECTIONS.TENANT.JOBS);
      const existingJobs = await jobsCol.findOne({ serverId });
      
      if (!existingJobs) {
        const defaultJobs = [
          { serverId, jobId: 'miner', name: 'Miner', emoji: '⛏️', description: 'Mine for valuable ores', duration: 1800000, rewards: { coins: { min: 100, max: 300 }, xp: { min: 20, max: 50 } }, cooldown: 3600000, isActive: true, createdAt: new Date() },
          { serverId, jobId: 'farmer', name: 'Farmer', emoji: '🌾', description: 'Tend to crops and harvest', duration: 2400000, rewards: { coins: { min: 150, max: 400 }, xp: { min: 25, max: 60 } }, cooldown: 4800000, isActive: true, createdAt: new Date() },
          { serverId, jobId: 'zookeeper', name: 'Zookeeper', emoji: '🦁', description: 'Care for the animals', duration: 3600000, rewards: { coins: { min: 200, max: 500 }, xp: { min: 30, max: 75 } }, cooldown: 7200000, isActive: true, createdAt: new Date() },
          { serverId, jobId: 'ranger', name: 'Ranger', emoji: '🌲', description: 'Patrol and protect the wilderness', duration: 5400000, rewards: { coins: { min: 300, max: 700 }, xp: { min: 40, max: 100 } }, cooldown: 10800000, isActive: true, createdAt: new Date() },
          { serverId, jobId: 'caretaker', name: 'Caretaker', emoji: '🏠', description: 'Maintain the facilities', duration: 7200000, rewards: { coins: { min: 400, max: 900 }, xp: { min: 50, max: 125 } }, cooldown: 14400000, isActive: true, createdAt: new Date() }
        ];
        
        await jobsCol.insertMany(defaultJobs);
      }

      console.log(`✅ Initialized default data for server ${serverId}`);
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  static determineRarity(obtainable) {
    switch (obtainable) {
      case 'starter': return 'common';
      case 'crate': return 'uncommon';
      case 'event': return 'rare';
      case 'legendary': return 'legendary';
      default: return 'common';
    }
  }

  static async getAllServers(userId = null) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.SERVER_CONFIG);
      const query = userId ? { $or: [{ ownerId: userId }, { admins: userId }] } : {};
      const servers = await collection.find(query).toArray();
      return servers;
    } catch (error) {
      console.error('Error getting all servers:', error);
      return [];
    }
  }

  static async isServerAdmin(serverId, userId) {
    try {
      const config = await this.getServerConfig(serverId);
      if (!config) return false;
      
      return config.ownerId === userId || 
             (config.admins && config.admins.includes(userId));
    } catch (error) {
      console.error('Error checking server admin:', error);
      return false;
    }
  }

  static async addServerAdmin(serverId, userId, addedBy) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.SERVER_CONFIG);
      
      await collection.updateOne(
        { serverId },
        { 
          $addToSet: { admins: userId },
          $set: { updatedAt: new Date() }
        }
      );

      await createAuditLog({
        action: 'ADMIN_ADDED',
        category: 'permission',
        userId: addedBy.id,
        username: addedBy.username,
        serverId,
        targetId: userId,
        targetType: 'user'
      });

      return { success: true, message: 'Admin added successfully' };
    } catch (error) {
      console.error('Error adding server admin:', error);
      return { success: false, message: 'Failed to add admin' };
    }
  }

  static async removeServerAdmin(serverId, userId, removedBy) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.SERVER_CONFIG);
      
      await collection.updateOne(
        { serverId },
        { 
          $pull: { admins: userId },
          $set: { updatedAt: new Date() }
        }
      );

      await createAuditLog({
        action: 'ADMIN_REMOVED',
        category: 'permission',
        userId: removedBy.id,
        username: removedBy.username,
        serverId,
        targetId: userId,
        targetType: 'user'
      });

      return { success: true, message: 'Admin removed successfully' };
    } catch (error) {
      console.error('Error removing server admin:', error);
      return { success: false, message: 'Failed to remove admin' };
    }
  }

  static async deleteServer(serverId, deletedBy) {
    try {
      const collections = Object.values(COLLECTIONS.TENANT);
      
      for (const collName of collections) {
        const coll = await getCollection(collName);
        await coll.deleteMany({ serverId });
      }

      const playerData = await getCollection(COLLECTIONS.USER.PLAYER_DATA);
      await playerData.deleteMany({ serverId });

      await createAuditLog({
        action: 'SERVER_DELETED',
        category: 'server',
        userId: deletedBy.id,
        username: deletedBy.username,
        serverId
      });

      return { success: true, message: 'Server deleted successfully' };
    } catch (error) {
      console.error('Error deleting server:', error);
      return { success: false, message: 'Failed to delete server' };
    }
  }
}

module.exports = TenantService;
