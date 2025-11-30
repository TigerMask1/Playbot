const DEFAULT_ECONOMY = {
  serverCurrency: {
    name: 'Coins',
    namePlural: 'Coins',
    emoji: '💰',
    symbol: '🪙'
  },
  
  serverGems: {
    name: 'Gem',
    namePlural: 'Gems',
    emoji: '💎',
    symbol: '💎'
  },
  
  serverShards: {
    name: 'Shard',
    namePlural: 'Shards',
    emoji: '🔮',
    symbol: '🔮'
  },
  
  serverTokens: {
    name: 'Token',
    namePlural: 'Tokens',
    emoji: '🎟️',
    symbol: '🎟️'
  },
  
  globalToServerRate: {
    playCoins: 1,
    playGems: 1
  },
  
  startingBalance: {
    coins: 100,
    gems: 5,
    shards: 0,
    tokens: 0
  },
  
  dailyReward: {
    enabled: true,
    coins: 100,
    gems: 5,
    resetTime: '00:00',
    streakBonus: {
      enabled: true,
      multiplier: 0.1,
      maxDays: 7,
      bonusOnMaxStreak: { coins: 200, gems: 10 }
    }
  },
  
  messageRewards: {
    enabled: true,
    coins: { min: 1, max: 5 },
    xp: { min: 1, max: 3 },
    cooldown: 60000,
    crateChance: {
      enabled: true,
      chance: 2,
      crateType: 'bronze'
    }
  },
  
  transferSettings: {
    enabled: true,
    minAmount: 10,
    maxAmount: 100000,
    fee: 0,
    feeType: 'percentage',
    cooldown: 0
  },
  
  shopSettings: {
    enabled: true,
    refreshInterval: 86400000,
    maxItems: 20,
    discountEvents: true
  },
  
  inflationControl: {
    enabled: false,
    maxCoinsPerDay: 1000000,
    maxGemsPerDay: 10000
  }
};

const CURRENCY_SOURCES = {
  daily: 'Daily Reward',
  message: 'Message Reward',
  quest: 'Quest Completion',
  battle: 'Battle Reward',
  drop: 'Drop Catch',
  crate: 'Crate Opening',
  work: 'Work Job',
  trade: 'Trading',
  event: 'Event Reward',
  gift: 'Admin Gift',
  shop: 'Shop Sale',
  market: 'Market Sale',
  auction: 'Auction Sale',
  minigame: 'Minigame Win'
};

module.exports = {
  DEFAULT_ECONOMY,
  CURRENCY_SOURCES
};
