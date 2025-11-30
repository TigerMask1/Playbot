const { MongoClient, ObjectId } = require('mongodb');

let client = null;
let db = null;
let connected = false;

const COLLECTIONS = {
  GLOBAL: {
    USERS: 'global_users',
    CURRENCY_LEDGER: 'global_currency_ledger',
    SUPER_ADMINS: 'global_super_admins',
    PLATFORM_CONFIG: 'global_platform_config',
    AUDIT_LOG: 'global_audit_log',
    DEFAULT_TEMPLATES: 'global_default_templates'
  },
  TENANT: {
    SERVER_CONFIG: 'server_configs',
    CHARACTERS: 'server_characters',
    MOVES: 'server_moves',
    ITEMS: 'server_items',
    CRATES: 'server_crates',
    QUESTS: 'server_quests',
    JOBS: 'server_jobs',
    EVENTS: 'server_events',
    SHOPS: 'server_shops',
    COSMETICS: 'server_cosmetics',
    MARKET: 'server_market',
    AUCTIONS: 'server_auctions',
    DROPS: 'server_drops',
    BATTLE_CONFIG: 'server_battle_config',
    CLANS: 'server_clans',
    TRIVIA: 'server_trivia',
    MINIGAMES: 'server_minigames',
    NEWS: 'server_news',
    MAIL_TEMPLATES: 'server_mail_templates',
    GIVEAWAYS: 'server_giveaways',
    LOTTERIES: 'server_lotteries',
    CUSTOM_EMOJIS: 'server_custom_emojis',
    SKINS: 'server_skins'
  },
  USER: {
    PLAYER_DATA: 'player_data',
    PLAYER_INVENTORY: 'player_inventory',
    PLAYER_CHARACTERS: 'player_characters',
    PLAYER_PROGRESS: 'player_progress',
    PLAYER_TRADES: 'player_trades',
    PLAYER_BATTLES: 'player_battles'
  }
};

async function connect() {
  if (connected && client) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    client = new MongoClient(uri, {
      maxPoolSize: 100,
      minPoolSize: 10,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      compressors: ['zlib']
    });
    await client.connect();
    db = client.db('playbot');
    connected = true;
    console.log('✅ Connected to PlayBot MongoDB');
    
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    connected = false;
    client = null;
    throw error;
  }
}

async function createIndexes() {
  try {
    const globalUsers = db.collection(COLLECTIONS.GLOBAL.USERS);
    await globalUsers.createIndex({ odiscordId: 1 }, { unique: true, sparse: true });
    await globalUsers.createIndex({ email: 1 }, { sparse: true });
    
    const currencyLedger = db.collection(COLLECTIONS.GLOBAL.CURRENCY_LEDGER);
    await currencyLedger.createIndex({ odiscordId: 1 });
    await currencyLedger.createIndex({ timestamp: -1 });
    await currencyLedger.createIndex({ type: 1, timestamp: -1 });
    
    const auditLog = db.collection(COLLECTIONS.GLOBAL.AUDIT_LOG);
    await auditLog.createIndex({ timestamp: -1 });
    await auditLog.createIndex({ action: 1, timestamp: -1 });
    await auditLog.createIndex({ userId: 1, timestamp: -1 });
    await auditLog.createIndex({ serverId: 1, timestamp: -1 });
    
    const serverConfigs = db.collection(COLLECTIONS.TENANT.SERVER_CONFIG);
    await serverConfigs.createIndex({ serverId: 1 }, { unique: true });
    await serverConfigs.createIndex({ ownerId: 1 });
    
    const playerData = db.collection(COLLECTIONS.USER.PLAYER_DATA);
    await playerData.createIndex({ odiscordId: 1, serverId: 1 }, { unique: true });
    await playerData.createIndex({ serverId: 1 });
    
    const characters = db.collection(COLLECTIONS.TENANT.CHARACTERS);
    await characters.createIndex({ serverId: 1 });
    await characters.createIndex({ serverId: 1, id: 1 }, { unique: true });
    await characters.createIndex({ serverId: 1, isActive: 1 });
    
    const moves = db.collection(COLLECTIONS.TENANT.MOVES);
    await moves.createIndex({ serverId: 1 });
    await moves.createIndex({ serverId: 1, tier: 1 });
    await moves.createIndex({ serverId: 1, characterName: 1 });
    
    const crates = db.collection(COLLECTIONS.TENANT.CRATES);
    await crates.createIndex({ serverId: 1 });
    await crates.createIndex({ serverId: 1, type: 1 }, { unique: true });
    
    const quests = db.collection(COLLECTIONS.TENANT.QUESTS);
    await quests.createIndex({ serverId: 1 });
    await quests.createIndex({ serverId: 1, id: 1 }, { unique: true });
    await quests.createIndex({ serverId: 1, type: 1 });
    
    const jobs = db.collection(COLLECTIONS.TENANT.JOBS);
    await jobs.createIndex({ serverId: 1 });
    await jobs.createIndex({ serverId: 1, type: 1 }, { unique: true });
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

async function disconnect() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    connected = false;
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function getCollection(collectionName) {
  if (!connected) {
    await connect();
  }
  return db.collection(collectionName);
}

async function getDb() {
  if (!connected) {
    await connect();
  }
  return db;
}

function toObjectId(id) {
  if (id instanceof ObjectId) return id;
  if (typeof id === 'string' && ObjectId.isValid(id)) {
    return new ObjectId(id);
  }
  return null;
}

module.exports = {
  connect,
  disconnect,
  getCollection,
  getDb,
  toObjectId,
  COLLECTIONS,
  ObjectId
};
