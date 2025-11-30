const DEFAULT_LEVELING = {
  maxLevel: 100,
  xpFormula: 'exponential',
  baseXP: 100,
  xpMultiplier: 1.15,
  
  levelRequirements: [
    { level: 1, xp: 0 },
    { level: 2, xp: 100 },
    { level: 3, xp: 215 },
    { level: 4, xp: 347 },
    { level: 5, xp: 499 },
    { level: 6, xp: 674 },
    { level: 7, xp: 875 },
    { level: 8, xp: 1106 },
    { level: 9, xp: 1372 },
    { level: 10, xp: 1678 },
    { level: 15, xp: 4045 },
    { level: 20, xp: 8311 },
    { level: 25, xp: 15284 },
    { level: 30, xp: 26227 },
    { level: 40, xp: 66939 },
    { level: 50, xp: 155547 },
    { level: 60, xp: 336168 },
    { level: 70, xp: 695721 },
    { level: 80, xp: 1399099 },
    { level: 90, xp: 2753856 },
    { level: 100, xp: 5335725 }
  ],
  
  xpSources: {
    message: { min: 1, max: 3, cooldown: 60000 },
    battle_win: { min: 20, max: 50 },
    battle_lose: { min: 5, max: 15 },
    drop_catch: { min: 5, max: 15 },
    crate_open: { min: 10, max: 25 },
    quest_complete: { min: 50, max: 200 },
    work_complete: { min: 10, max: 40 },
    daily_claim: { min: 25, max: 50 }
  },
  
  levelUpRewards: {
    enabled: true,
    everyLevel: { coins: 50 },
    milestones: {
      5: { coins: 200, gems: 5 },
      10: { coins: 500, gems: 10, crate: 'bronze' },
      15: { coins: 800, gems: 15 },
      20: { coins: 1200, gems: 25, crate: 'silver' },
      25: { coins: 1800, gems: 35 },
      30: { coins: 2500, gems: 50, crate: 'gold' },
      40: { coins: 4000, gems: 75, crate: 'emerald' },
      50: { coins: 6000, gems: 100, crate: 'legendary', shards: 5 },
      60: { coins: 8000, gems: 150, shards: 8 },
      70: { coins: 10000, gems: 200, shards: 12 },
      80: { coins: 15000, gems: 300, shards: 18 },
      90: { coins: 20000, gems: 400, shards: 25 },
      100: { coins: 50000, gems: 1000, crate: 'tyrant', shards: 50 }
    }
  },
  
  characterLeveling: {
    maxLevel: 50,
    tokensPerLevel: 10,
    xpPerToken: 10,
    statsPerLevel: {
      hp: 5,
      attack: 1,
      defense: 1,
      speed: 0.5
    }
  },
  
  prestigeSystem: {
    enabled: false,
    maxPrestige: 10,
    resetLevel: true,
    bonusPerPrestige: 0.05,
    requirements: {
      level: 100,
      coins: 100000
    },
    rewards: {
      title: true,
      cosmetic: true,
      statBoost: true
    }
  },
  
  messages: {
    levelUp: '🎉 **LEVEL UP!** {player} reached level {level}!',
    milestone: '🏆 **MILESTONE!** {player} reached level {level} and earned special rewards!',
    maxLevel: '⭐ **MAX LEVEL!** {player} has reached the maximum level!',
    prestige: '✨ **PRESTIGE!** {player} has achieved Prestige {prestige}!'
  }
};

const ACCOUNT_LEVEL_SETTINGS = {
  enabled: true,
  maxLevel: 50,
  xpPerCommand: { min: 1, max: 5 },
  commandCooldown: 30000,
  rewards: {
    5: { coins: 500 },
    10: { coins: 1000, gems: 20 },
    15: { coins: 2000, gems: 40 },
    20: { coins: 3000, gems: 60, crate: 'gold' },
    25: { coins: 5000, gems: 100 },
    30: { coins: 8000, gems: 150, crate: 'emerald' },
    40: { coins: 15000, gems: 300, crate: 'legendary' },
    50: { coins: 30000, gems: 500, crate: 'tyrant', shards: 20 }
  }
};

module.exports = {
  DEFAULT_LEVELING,
  ACCOUNT_LEVEL_SETTINGS
};
