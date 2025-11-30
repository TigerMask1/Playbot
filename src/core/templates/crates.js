const DEFAULT_CRATES = {
  bronze: {
    name: 'Bronze Crate',
    emoji: '🟫',
    cost: 0,
    costType: 'free',
    charChance: 2,
    rewards: {
      tokens: { min: 10, max: 20 },
      coins: { min: 50, max: 150 },
      gems: { min: 0, max: 1 }
    },
    points: 1,
    description: 'A basic crate earned from messages',
    earnedFrom: 'Message rewards',
    canBuy: false,
    isActive: true
  },
  silver: {
    name: 'Silver Crate',
    emoji: '⚪',
    cost: 0,
    costType: 'free',
    charChance: 100,
    rewards: {
      tokens: { min: 20, max: 40 },
      coins: { min: 150, max: 350 },
      gems: { min: 1, max: 3 }
    },
    points: 2,
    description: 'A better crate with guaranteed character',
    earnedFrom: 'Special events and rewards',
    canBuy: false,
    isActive: true
  },
  gold: {
    name: 'Gold Crate',
    emoji: '<:emoji_2:1439429824862093445>',
    cost: 100,
    costType: 'gems',
    charChance: 100,
    rewards: {
      tokens: { min: 35, max: 65 },
      coins: { min: 300, max: 700 },
      gems: { min: 2, max: 5 }
    },
    points: 3,
    description: 'Premium crate with better rewards',
    earnedFrom: 'Purchase with gems',
    canBuy: true,
    isActive: true
  },
  emerald: {
    name: 'Emerald Crate',
    emoji: '🟢',
    cost: 250,
    costType: 'gems',
    charChance: 100,
    rewards: {
      tokens: { min: 100, max: 160 },
      coins: { min: 1200, max: 2400 },
      gems: { min: 5, max: 10 },
      shards: { min: 0, max: 1 }
    },
    points: 5,
    description: 'High-tier crate with excellent rewards',
    earnedFrom: 'Purchase with gems',
    canBuy: true,
    isActive: true
  },
  legendary: {
    name: 'Legendary Crate',
    emoji: '🟣',
    cost: 500,
    costType: 'gems',
    charChance: 100,
    rewards: {
      tokens: { min: 150, max: 250 },
      coins: { min: 2000, max: 3000 },
      gems: { min: 10, max: 20 },
      shards: { min: 1, max: 2 }
    },
    points: 8,
    description: 'Legendary crate with amazing rewards',
    earnedFrom: 'Purchase with gems',
    canBuy: true,
    rarityBoost: { rare: 1.5, epic: 2, legendary: 3 },
    isActive: true
  },
  tyrant: {
    name: 'Tyrant Crate',
    emoji: '🔴',
    cost: 750,
    costType: 'gems',
    charChance: 100,
    rewards: {
      tokens: { min: 250, max: 350 },
      coins: { min: 3000, max: 4000 },
      gems: { min: 15, max: 30 },
      shards: { min: 2, max: 4 }
    },
    points: 12,
    description: 'Ultimate crate with the best rewards',
    earnedFrom: 'Purchase with gems',
    canBuy: true,
    rarityBoost: { rare: 2, epic: 3, legendary: 5 },
    isActive: true
  }
};

const CRATE_SETTINGS = {
  bulkOpenLimit: 10,
  animationDuration: 2000,
  cooldownBetweenOpens: 500,
  showRarityAnimation: true,
  autoOpenEnabled: false
};

module.exports = {
  DEFAULT_CRATES,
  CRATE_SETTINGS
};
