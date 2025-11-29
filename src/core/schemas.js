const DEFAULT_CHARACTER_TEMPLATE = {
  name: '',
  emoji: '⭕',
  customEmojiId: null,
  obtainable: 'crate',
  rarity: 'common',
  description: '',
  baseStats: {
    hp: 100,
    attack: 10,
    defense: 10,
    speed: 10
  },
  abilities: [],
  isActive: true,
  createdAt: null,
  updatedAt: null
};

const DEFAULT_MOVE_TEMPLATE = {
  name: '',
  damage: 0,
  type: 'normal',
  tier: 'low',
  description: '',
  effects: [],
  energyCost: 0,
  cooldown: 0,
  isActive: true
};

const DEFAULT_CRATE_TEMPLATE = {
  name: '',
  emoji: '📦',
  price: { coins: 0, gems: 0 },
  dropRates: {
    common: 70,
    uncommon: 20,
    rare: 8,
    epic: 1.5,
    legendary: 0.5
  },
  guaranteedRewards: [],
  bonusRewards: [],
  isActive: true
};

const DEFAULT_QUEST_TEMPLATE = {
  id: '',
  name: '',
  description: '',
  type: 'daily',
  requirement: {
    action: '',
    count: 1
  },
  rewards: {
    coins: 0,
    gems: 0,
    xp: 0,
    items: []
  },
  isActive: true
};

const DEFAULT_JOB_TEMPLATE = {
  id: '',
  name: '',
  emoji: '💼',
  description: '',
  duration: 3600000,
  rewards: {
    coins: { min: 100, max: 500 },
    gems: { min: 0, max: 5 },
    xp: { min: 10, max: 50 },
    items: []
  },
  requirements: {
    level: 0,
    items: []
  },
  cooldown: 7200000,
  isActive: true
};

const DEFAULT_ITEM_TEMPLATE = {
  id: '',
  name: '',
  emoji: '📦',
  description: '',
  category: 'misc',
  rarity: 'common',
  stackable: true,
  maxStack: 999,
  usable: false,
  tradeable: true,
  sellPrice: { coins: 0 },
  buyPrice: { coins: 0 },
  effects: [],
  isActive: true
};

const DEFAULT_DROP_CONFIG = {
  enabled: true,
  interval: 30000,
  channelId: null,
  dropRates: {
    common: 60,
    uncommon: 25,
    rare: 10,
    epic: 4,
    legendary: 1
  },
  catchTimeout: 30000,
  maxDropsPerHour: 120,
  bonusDropChance: 0,
  customMessages: {
    spawn: 'A wild {character} appeared! Quick, catch it!',
    caught: '{user} caught {character}!',
    missed: 'The {character} got away...'
  }
};

const DEFAULT_BATTLE_CONFIG = {
  enabled: true,
  channelId: null,
  turnTimeout: 60000,
  maxRounds: 20,
  trophyRewards: {
    win: 30,
    lose: -15,
    draw: 5
  },
  coinRewards: {
    win: { min: 50, max: 200 },
    lose: { min: 10, max: 50 }
  },
  xpRewards: {
    win: { min: 20, max: 50 },
    lose: { min: 5, max: 15 }
  },
  rankTiers: [
    { name: 'Bronze', minTrophies: 0, emoji: '🥉' },
    { name: 'Silver', minTrophies: 500, emoji: '🥈' },
    { name: 'Gold', minTrophies: 1000, emoji: '🥇' },
    { name: 'Platinum', minTrophies: 2000, emoji: '💎' },
    { name: 'Diamond', minTrophies: 3500, emoji: '💠' },
    { name: 'Master', minTrophies: 5000, emoji: '👑' }
  ]
};

const DEFAULT_ECONOMY_CONFIG = {
  serverCurrency: {
    name: 'Coins',
    emoji: '💰',
    symbol: '🪙'
  },
  serverGems: {
    name: 'Gems',
    emoji: '💎',
    symbol: '💎'
  },
  globalToServerRate: {
    playCoins: 1,
    playGems: 1
  },
  dailyReward: {
    coins: 100,
    gems: 5,
    streakBonus: {
      enabled: true,
      multiplier: 0.1,
      maxDays: 7
    }
  },
  messageRewards: {
    enabled: true,
    coins: { min: 1, max: 5 },
    cooldown: 60000
  }
};

const DEFAULT_SHOP_CONFIG = {
  enabled: true,
  items: [],
  refreshInterval: 86400000,
  maxItems: 20
};

const DEFAULT_MINIGAME_CONFIG = {
  enabled: true,
  games: {
    coinDuel: { enabled: true, minBet: 10, maxBet: 10000 },
    diceClash: { enabled: true, minBet: 10, maxBet: 5000 },
    doorOfFate: { enabled: true, cost: 50 },
    rockPaperScissors: { enabled: true, minBet: 10, maxBet: 5000 }
  },
  cooldowns: {
    coinDuel: 30000,
    diceClash: 30000,
    doorOfFate: 60000,
    rockPaperScissors: 30000
  }
};

const DEFAULT_EVENT_CONFIG = {
  enabled: true,
  autoStart: false,
  channelId: null,
  types: ['catchRace', 'battleRoyale', 'treasureHunt', 'bossRaid'],
  rewards: {
    first: { coins: 5000, gems: 100, crates: 3 },
    second: { coins: 3000, gems: 50, crates: 2 },
    third: { coins: 1000, gems: 25, crates: 1 },
    participation: { coins: 100, gems: 5 }
  }
};

const DEFAULT_CLAN_CONFIG = {
  enabled: true,
  maxMembers: 50,
  creationCost: { coins: 10000, gems: 100 },
  donationLimits: {
    daily: { coins: 10000, gems: 100 }
  },
  wars: {
    enabled: true,
    duration: 604800000,
    rewards: {
      first: { coins: 50000, gems: 500 },
      second: { coins: 25000, gems: 250 },
      third: { coins: 10000, gems: 100 }
    }
  }
};

const SERVER_CONFIG_SCHEMA = {
  serverId: '',
  serverName: '',
  ownerId: '',
  ownerName: '',
  botName: 'PlayBot',
  prefix: '!',
  setupComplete: false,
  setupDate: null,
  
  channels: {
    drops: null,
    events: null,
    updates: null,
    battles: null,
    market: null,
    logs: null
  },
  
  admins: [],
  moderators: [],
  
  features: {
    drops: true,
    battles: true,
    trading: true,
    market: true,
    auctions: true,
    events: true,
    clans: true,
    quests: true,
    work: true,
    minigames: true,
    trivia: true,
    giveaways: true,
    lotteries: true
  },
  
  economy: DEFAULT_ECONOMY_CONFIG,
  drops: DEFAULT_DROP_CONFIG,
  battles: DEFAULT_BATTLE_CONFIG,
  shop: DEFAULT_SHOP_CONFIG,
  minigames: DEFAULT_MINIGAME_CONFIG,
  events: DEFAULT_EVENT_CONFIG,
  clans: DEFAULT_CLAN_CONFIG,
  
  branding: {
    embedColor: '#00D9FF',
    footerText: 'Powered by PlayBot',
    thumbnailUrl: null
  },
  
  createdAt: null,
  updatedAt: null
};

const GLOBAL_USER_SCHEMA = {
  odiscordId: '',
  username: '',
  discriminator: '',
  avatar: '',
  email: null,
  
  globalCurrency: {
    playCoins: 0,
    playGems: 0
  },
  
  servers: [],
  
  permissions: {
    isSuperAdmin: false,
    managedServers: []
  },
  
  preferences: {
    notifications: true,
    dmAlerts: true,
    language: 'en'
  },
  
  stats: {
    totalServers: 0,
    accountCreated: null,
    lastActive: null
  },
  
  createdAt: null,
  updatedAt: null
};

const PLAYER_DATA_SCHEMA = {
  odiscordId: '',
  serverId: '',
  username: '',
  
  currency: {
    coins: 0,
    gems: 0
  },
  
  level: {
    current: 1,
    xp: 0,
    totalXp: 0
  },
  
  trophies: 200,
  
  stats: {
    battlesWon: 0,
    battlesLost: 0,
    battlesDraw: 0,
    charactersCaught: 0,
    cratesOpened: 0,
    tradesCompleted: 0,
    questsCompleted: 0,
    eventsWon: 0
  },
  
  selectedCharacter: null,
  profileDisplayCharacter: null,
  
  dailyReward: {
    lastClaim: null,
    streak: 0
  },
  
  lastActivity: null,
  joinedServer: null,
  createdAt: null,
  updatedAt: null
};

const AUDIT_LOG_SCHEMA = {
  timestamp: null,
  action: '',
  category: '',
  userId: '',
  username: '',
  serverId: null,
  serverName: null,
  targetId: null,
  targetType: null,
  before: null,
  after: null,
  metadata: {},
  ip: null
};

module.exports = {
  DEFAULT_CHARACTER_TEMPLATE,
  DEFAULT_MOVE_TEMPLATE,
  DEFAULT_CRATE_TEMPLATE,
  DEFAULT_QUEST_TEMPLATE,
  DEFAULT_JOB_TEMPLATE,
  DEFAULT_ITEM_TEMPLATE,
  DEFAULT_DROP_CONFIG,
  DEFAULT_BATTLE_CONFIG,
  DEFAULT_ECONOMY_CONFIG,
  DEFAULT_SHOP_CONFIG,
  DEFAULT_MINIGAME_CONFIG,
  DEFAULT_EVENT_CONFIG,
  DEFAULT_CLAN_CONFIG,
  SERVER_CONFIG_SCHEMA,
  GLOBAL_USER_SCHEMA,
  PLAYER_DATA_SCHEMA,
  AUDIT_LOG_SCHEMA
};
