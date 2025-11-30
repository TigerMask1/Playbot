const { getCollection, COLLECTIONS } = require('../core/database');

const configCache = new Map();
const CACHE_TTL = 60000;
const TEMPLATE_VERSION = '1.0.0';

class ConfigService {
  static async getServerConfig(serverId) {
    const cacheKey = `config:${serverId}`;
    const cached = configCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const collection = await getCollection(COLLECTIONS.TENANT.SERVER_CONFIG);
      let config = await collection.findOne({ serverId });
      
      if (!config) {
        config = await this.createDefaultServerConfig(serverId);
      } else if (this.needsTemplateUpdate(config.templateVersion)) {
        await this.migrateServerTemplates(serverId, config.templateVersion);
        config = await collection.findOne({ serverId });
      }

      configCache.set(cacheKey, { data: config, timestamp: Date.now() });
      return config;
    } catch (error) {
      console.error('Error getting server config:', error);
      return null;
    }
  }

  static needsTemplateUpdate(currentVersion) {
    if (!currentVersion) return true;
    const current = currentVersion.split('.').map(Number);
    const target = TEMPLATE_VERSION.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if (target[i] > (current[i] || 0)) return true;
      if (target[i] < (current[i] || 0)) return false;
    }
    return false;
  }

  static async createDefaultServerConfig(serverId) {
    const { SERVER_CONFIG_SCHEMA } = require('../core/schemas');
    const config = {
      ...SERVER_CONFIG_SCHEMA,
      serverId,
      templateVersion: TEMPLATE_VERSION,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const collection = await getCollection(COLLECTIONS.TENANT.SERVER_CONFIG);
      await collection.updateOne(
        { serverId },
        { $setOnInsert: config },
        { upsert: true }
      );
      return config;
    } catch (error) {
      console.error('Error creating default config:', error);
      return config;
    }
  }

  static async updateServerConfig(serverId, updates) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.SERVER_CONFIG);
      await collection.updateOne(
        { serverId },
        { $set: { ...updates, updatedAt: new Date() } },
        { upsert: true }
      );
      
      this.clearServerCache(serverId);
      return true;
    } catch (error) {
      console.error('Error updating server config:', error);
      return false;
    }
  }

  static async migrateServerTemplates(serverId, fromVersion) {
    console.log(`Migrating templates for server ${serverId} from ${fromVersion} to ${TEMPLATE_VERSION}`);
    
    try {
      await Promise.all([
        this.updateCharactersToLatest(serverId),
        this.updateMovesToLatest(serverId),
        this.updateCratesToLatest(serverId),
        this.updateQuestsToLatest(serverId),
        this.updateJobsToLatest(serverId)
      ]);

      const collection = await getCollection(COLLECTIONS.TENANT.SERVER_CONFIG);
      await collection.updateOne(
        { serverId },
        { $set: { templateVersion: TEMPLATE_VERSION, updatedAt: new Date() } }
      );
      
      this.clearServerCache(serverId);
      console.log(`Migration complete for server ${serverId}`);
      return true;
    } catch (error) {
      console.error('Error migrating templates:', error);
      return false;
    }
  }

  static async updateCharactersToLatest(serverId) {
    const { DEFAULT_CHARACTERS } = require('../core/templates/characters');
    const collection = await getCollection(COLLECTIONS.TENANT.CHARACTERS);
    
    const operations = DEFAULT_CHARACTERS.map(char => ({
      updateOne: {
        filter: { serverId, id: char.id, isCustom: { $ne: true } },
        update: {
          $set: {
            ...char,
            serverId,
            templateVersion: TEMPLATE_VERSION,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    }));

    try {
      await collection.bulkWrite(operations, { ordered: false });
    } catch (error) {
      console.error('Error updating characters to latest:', error);
    }
  }

  static async updateMovesToLatest(serverId) {
    const { DEFAULT_MOVES } = require('../core/templates/moves');
    const collection = await getCollection(COLLECTIONS.TENANT.MOVES);
    
    const operations = DEFAULT_MOVES.map(move => ({
      updateOne: {
        filter: { serverId, id: move.id, isCustom: { $ne: true } },
        update: {
          $set: {
            ...move,
            serverId,
            templateVersion: TEMPLATE_VERSION,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    }));

    try {
      await collection.bulkWrite(operations, { ordered: false });
    } catch (error) {
      console.error('Error updating moves to latest:', error);
    }
  }

  static async updateCratesToLatest(serverId) {
    const { DEFAULT_CRATES } = require('../core/templates/crates');
    const collection = await getCollection(COLLECTIONS.TENANT.CRATES);
    
    const operations = Object.entries(DEFAULT_CRATES).map(([type, data]) => ({
      updateOne: {
        filter: { serverId, type, isCustom: { $ne: true } },
        update: {
          $set: {
            ...data,
            type,
            serverId,
            templateVersion: TEMPLATE_VERSION,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    }));

    try {
      await collection.bulkWrite(operations, { ordered: false });
    } catch (error) {
      console.error('Error updating crates to latest:', error);
    }
  }

  static async updateQuestsToLatest(serverId) {
    const { DEFAULT_QUESTS } = require('../core/templates/quests');
    const collection = await getCollection(COLLECTIONS.TENANT.QUESTS);
    
    const operations = DEFAULT_QUESTS.map(quest => ({
      updateOne: {
        filter: { serverId, id: quest.id, isCustom: { $ne: true } },
        update: {
          $set: {
            ...quest,
            serverId,
            isActive: true,
            templateVersion: TEMPLATE_VERSION,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    }));

    try {
      await collection.bulkWrite(operations, { ordered: false });
    } catch (error) {
      console.error('Error updating quests to latest:', error);
    }
  }

  static async updateJobsToLatest(serverId) {
    const { DEFAULT_JOBS } = require('../core/templates/jobs');
    const collection = await getCollection(COLLECTIONS.TENANT.JOBS);
    
    const operations = Object.entries(DEFAULT_JOBS).map(([type, data]) => ({
      updateOne: {
        filter: { serverId, type, isCustom: { $ne: true } },
        update: {
          $set: {
            ...data,
            type,
            serverId,
            isActive: true,
            templateVersion: TEMPLATE_VERSION,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    }));

    try {
      await collection.bulkWrite(operations, { ordered: false });
    } catch (error) {
      console.error('Error updating jobs to latest:', error);
    }
  }

  static async getCharacters(serverId) {
    const cacheKey = `chars:${serverId}`;
    const cached = configCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const collection = await getCollection(COLLECTIONS.TENANT.CHARACTERS);
      let characters = await collection.find({ serverId, isActive: true }).toArray();
      
      if (!characters || characters.length === 0) {
        await this.seedDefaultCharacters(serverId);
        characters = await collection.find({ serverId, isActive: true }).toArray();
      }

      configCache.set(cacheKey, { data: characters, timestamp: Date.now() });
      return characters;
    } catch (error) {
      console.error('Error getting characters:', error);
      return [];
    }
  }

  static async seedDefaultCharacters(serverId) {
    const { DEFAULT_CHARACTERS } = require('../core/templates/characters');
    const collection = await getCollection(COLLECTIONS.TENANT.CHARACTERS);
    
    const operations = DEFAULT_CHARACTERS.map(char => ({
      updateOne: {
        filter: { serverId, id: char.id },
        update: {
          $set: {
            ...char,
            serverId,
            templateVersion: TEMPLATE_VERSION,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    }));

    try {
      await collection.bulkWrite(operations, { ordered: false });
    } catch (error) {
      console.error('Error seeding characters:', error);
    }
  }

  static async getMoves(serverId) {
    const cacheKey = `moves:${serverId}`;
    const cached = configCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const collection = await getCollection(COLLECTIONS.TENANT.MOVES);
      let moves = await collection.find({ serverId, isActive: true }).toArray();
      
      if (!moves || moves.length === 0) {
        await this.seedDefaultMoves(serverId);
        moves = await collection.find({ serverId, isActive: true }).toArray();
      }

      const organized = {
        low: moves.filter(m => m.tier === 'low'),
        mid: moves.filter(m => m.tier === 'mid'),
        high: moves.filter(m => m.tier === 'high'),
        special: moves.filter(m => m.tier === 'special').reduce((acc, m) => {
          acc[m.characterName] = m;
          return acc;
        }, {})
      };

      configCache.set(cacheKey, { data: organized, timestamp: Date.now() });
      return organized;
    } catch (error) {
      console.error('Error getting moves:', error);
      return { low: [], mid: [], high: [], special: {} };
    }
  }

  static async seedDefaultMoves(serverId) {
    const { DEFAULT_MOVES } = require('../core/templates/moves');
    const collection = await getCollection(COLLECTIONS.TENANT.MOVES);
    
    const operations = DEFAULT_MOVES.map(move => ({
      updateOne: {
        filter: { serverId, id: move.id },
        update: {
          $set: {
            ...move,
            serverId,
            templateVersion: TEMPLATE_VERSION,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    }));

    try {
      await collection.bulkWrite(operations, { ordered: false });
    } catch (error) {
      console.error('Error seeding moves:', error);
    }
  }

  static async getCrates(serverId) {
    const cacheKey = `crates:${serverId}`;
    const cached = configCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const collection = await getCollection(COLLECTIONS.TENANT.CRATES);
      let crates = await collection.find({ serverId, isActive: true }).toArray();
      
      if (!crates || crates.length === 0) {
        await this.seedDefaultCrates(serverId);
        crates = await collection.find({ serverId, isActive: true }).toArray();
      }

      const crateMap = crates.reduce((acc, crate) => {
        acc[crate.type] = crate;
        return acc;
      }, {});

      configCache.set(cacheKey, { data: crateMap, timestamp: Date.now() });
      return crateMap;
    } catch (error) {
      console.error('Error getting crates:', error);
      return {};
    }
  }

  static async seedDefaultCrates(serverId) {
    const { DEFAULT_CRATES } = require('../core/templates/crates');
    const collection = await getCollection(COLLECTIONS.TENANT.CRATES);
    
    const operations = Object.entries(DEFAULT_CRATES).map(([type, data]) => ({
      updateOne: {
        filter: { serverId, type },
        update: {
          $set: {
            ...data,
            type,
            serverId,
            templateVersion: TEMPLATE_VERSION,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    }));

    try {
      await collection.bulkWrite(operations, { ordered: false });
    } catch (error) {
      console.error('Error seeding crates:', error);
    }
  }

  static async getQuests(serverId) {
    const cacheKey = `quests:${serverId}`;
    const cached = configCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const collection = await getCollection(COLLECTIONS.TENANT.QUESTS);
      let quests = await collection.find({ serverId, isActive: true }).toArray();
      
      if (!quests || quests.length === 0) {
        await this.seedDefaultQuests(serverId);
        quests = await collection.find({ serverId, isActive: true }).toArray();
      }

      configCache.set(cacheKey, { data: quests, timestamp: Date.now() });
      return quests;
    } catch (error) {
      console.error('Error getting quests:', error);
      return [];
    }
  }

  static async seedDefaultQuests(serverId) {
    const { DEFAULT_QUESTS } = require('../core/templates/quests');
    const collection = await getCollection(COLLECTIONS.TENANT.QUESTS);
    
    const operations = DEFAULT_QUESTS.map(quest => ({
      updateOne: {
        filter: { serverId, id: quest.id },
        update: {
          $set: {
            ...quest,
            serverId,
            isActive: true,
            templateVersion: TEMPLATE_VERSION,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    }));

    try {
      await collection.bulkWrite(operations, { ordered: false });
    } catch (error) {
      console.error('Error seeding quests:', error);
    }
  }

  static async getJobs(serverId) {
    const cacheKey = `jobs:${serverId}`;
    const cached = configCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      const collection = await getCollection(COLLECTIONS.TENANT.JOBS);
      let jobs = await collection.find({ serverId, isActive: true }).toArray();
      
      if (!jobs || jobs.length === 0) {
        await this.seedDefaultJobs(serverId);
        jobs = await collection.find({ serverId, isActive: true }).toArray();
      }

      const jobMap = jobs.reduce((acc, job) => {
        acc[job.type] = job;
        return acc;
      }, {});

      configCache.set(cacheKey, { data: jobMap, timestamp: Date.now() });
      return jobMap;
    } catch (error) {
      console.error('Error getting jobs:', error);
      return {};
    }
  }

  static async seedDefaultJobs(serverId) {
    const { DEFAULT_JOBS } = require('../core/templates/jobs');
    const collection = await getCollection(COLLECTIONS.TENANT.JOBS);
    
    const operations = Object.entries(DEFAULT_JOBS).map(([type, data]) => ({
      updateOne: {
        filter: { serverId, type },
        update: {
          $set: {
            ...data,
            type,
            serverId,
            isActive: true,
            templateVersion: TEMPLATE_VERSION,
            updatedAt: new Date()
          },
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true
      }
    }));

    try {
      await collection.bulkWrite(operations, { ordered: false });
    } catch (error) {
      console.error('Error seeding jobs:', error);
    }
  }

  static async getDropConfig(serverId) {
    const config = await this.getServerConfig(serverId);
    if (!config) return null;

    const { DEFAULT_DROPS } = require('../core/templates/drops');
    return this.deepMerge(DEFAULT_DROPS, config.drops || {});
  }

  static async getBattleConfig(serverId) {
    const config = await this.getServerConfig(serverId);
    if (!config) return null;

    const { DEFAULT_BATTLE_CONFIG } = require('../core/templates/battles');
    return this.deepMerge(DEFAULT_BATTLE_CONFIG, config.battles || {});
  }

  static async getEconomyConfig(serverId) {
    const config = await this.getServerConfig(serverId);
    if (!config) return null;

    const { DEFAULT_ECONOMY } = require('../core/templates/economy');
    return this.deepMerge(DEFAULT_ECONOMY, config.economy || {});
  }

  static async getLevelingConfig(serverId) {
    const config = await this.getServerConfig(serverId);
    if (!config) return null;

    const { DEFAULT_LEVELING } = require('../core/templates/leveling');
    return this.deepMerge(DEFAULT_LEVELING, config.leveling || {});
  }

  static async getTimersConfig(serverId) {
    const config = await this.getServerConfig(serverId);
    if (!config) return null;

    const { DEFAULT_TIMERS } = require('../core/templates/timers');
    return this.deepMerge(DEFAULT_TIMERS, config.timers || {});
  }

  static async getMessagesConfig(serverId) {
    const config = await this.getServerConfig(serverId);
    if (!config) return null;

    const { DEFAULT_MESSAGES } = require('../core/templates/messages');
    return this.deepMerge(DEFAULT_MESSAGES, config.messages || {});
  }

  static async getBoostersConfig(serverId) {
    const config = await this.getServerConfig(serverId);
    if (!config) return null;

    const { DEFAULT_BOOSTERS } = require('../core/templates/boosters');
    return this.deepMerge(DEFAULT_BOOSTERS, config.boosters || {});
  }

  static async getMinigamesConfig(serverId) {
    const config = await this.getServerConfig(serverId);
    if (!config) return null;

    const { DEFAULT_MINIGAMES } = require('../core/templates/minigames');
    return this.deepMerge(DEFAULT_MINIGAMES, config.minigames || {});
  }

  static async getEventsConfig(serverId) {
    const config = await this.getServerConfig(serverId);
    if (!config) return null;

    const { DEFAULT_EVENTS } = require('../core/templates/events');
    return this.deepMerge(DEFAULT_EVENTS, config.events || {});
  }

  static async getClansConfig(serverId) {
    const config = await this.getServerConfig(serverId);
    if (!config) return null;

    const { DEFAULT_CLANS } = require('../core/templates/clans');
    return this.deepMerge(DEFAULT_CLANS, config.clans || {});
  }

  static deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  static clearServerCache(serverId) {
    const keysToDelete = [];
    for (const key of configCache.keys()) {
      if (key.endsWith(`:${serverId}`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => configCache.delete(key));
  }

  static clearAllCache() {
    configCache.clear();
  }

  static async updateCharacter(serverId, characterId, updates) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.CHARACTERS);
      await collection.updateOne(
        { serverId, id: characterId },
        { $set: { ...updates, isCustom: true, updatedAt: new Date() } }
      );
      this.clearServerCache(serverId);
      return true;
    } catch (error) {
      console.error('Error updating character:', error);
      return false;
    }
  }

  static async createCharacter(serverId, characterData) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.CHARACTERS);
      const existingChars = await collection.find({ serverId }).sort({ id: -1 }).limit(1).toArray();
      const maxId = existingChars.length > 0 ? (existingChars[0].id || 0) : 0;
      
      const newChar = {
        ...characterData,
        id: maxId + 1,
        serverId,
        isActive: true,
        isCustom: true,
        templateVersion: TEMPLATE_VERSION,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await collection.insertOne(newChar);
      this.clearServerCache(serverId);
      return newChar;
    } catch (error) {
      console.error('Error creating character:', error);
      return null;
    }
  }

  static async deleteCharacter(serverId, characterId) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.CHARACTERS);
      await collection.updateOne(
        { serverId, id: characterId },
        { $set: { isActive: false, deletedAt: new Date() } }
      );
      this.clearServerCache(serverId);
      return true;
    } catch (error) {
      console.error('Error deleting character:', error);
      return false;
    }
  }

  static async updateMove(serverId, moveId, updates) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.MOVES);
      await collection.updateOne(
        { serverId, id: moveId },
        { $set: { ...updates, isCustom: true, updatedAt: new Date() } }
      );
      this.clearServerCache(serverId);
      return true;
    } catch (error) {
      console.error('Error updating move:', error);
      return false;
    }
  }

  static async createMove(serverId, moveData) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.MOVES);
      const existingMoves = await collection.find({ serverId }).sort({ id: -1 }).limit(1).toArray();
      const maxId = existingMoves.length > 0 ? (existingMoves[0].id || 0) : 0;
      
      const newMove = {
        ...moveData,
        id: maxId + 1,
        serverId,
        isActive: true,
        isCustom: true,
        templateVersion: TEMPLATE_VERSION,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await collection.insertOne(newMove);
      this.clearServerCache(serverId);
      return newMove;
    } catch (error) {
      console.error('Error creating move:', error);
      return null;
    }
  }

  static async updateCrate(serverId, crateType, updates) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.CRATES);
      await collection.updateOne(
        { serverId, type: crateType },
        { $set: { ...updates, isCustom: true, updatedAt: new Date() } }
      );
      this.clearServerCache(serverId);
      return true;
    } catch (error) {
      console.error('Error updating crate:', error);
      return false;
    }
  }

  static async updateQuest(serverId, questId, updates) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.QUESTS);
      await collection.updateOne(
        { serverId, id: questId },
        { $set: { ...updates, isCustom: true, updatedAt: new Date() } }
      );
      this.clearServerCache(serverId);
      return true;
    } catch (error) {
      console.error('Error updating quest:', error);
      return false;
    }
  }

  static async createQuest(serverId, questData) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.QUESTS);
      const existingQuests = await collection.find({ serverId }).sort({ id: -1 }).limit(1).toArray();
      const maxId = existingQuests.length > 0 ? (existingQuests[0].id || 0) : 0;
      
      const newQuest = {
        ...questData,
        id: maxId + 1,
        serverId,
        isActive: true,
        isCustom: true,
        templateVersion: TEMPLATE_VERSION,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await collection.insertOne(newQuest);
      this.clearServerCache(serverId);
      return newQuest;
    } catch (error) {
      console.error('Error creating quest:', error);
      return null;
    }
  }

  static async updateJob(serverId, jobType, updates) {
    try {
      const collection = await getCollection(COLLECTIONS.TENANT.JOBS);
      await collection.updateOne(
        { serverId, type: jobType },
        { $set: { ...updates, isCustom: true, updatedAt: new Date() } }
      );
      this.clearServerCache(serverId);
      return true;
    } catch (error) {
      console.error('Error updating job:', error);
      return false;
    }
  }

  static async getTemplateVersion(serverId) {
    const config = await this.getServerConfig(serverId);
    return config?.templateVersion || '1.0.0';
  }

  static getCurrentTemplateVersion() {
    return TEMPLATE_VERSION;
  }
}

module.exports = { ConfigService };
