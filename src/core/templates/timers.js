const DEFAULT_TIMERS = {
  drops: {
    interval: { min: 25000, max: 35000 },
    catchTimeout: 30000,
    inactivityPause: 300000,
    sessionDuration: 10800000
  },
  
  battles: {
    turnTimeout: 60000,
    matchmakingWait: 30000,
    cooldown: 30000,
    challengeExpiry: 120000
  },
  
  trades: {
    offerExpiry: 300000,
    confirmTimeout: 60000,
    cooldown: 10000
  },
  
  crates: {
    openCooldown: 500,
    bulkOpenDelay: 200,
    animationDuration: 2000
  },
  
  work: {
    cooldown: 900000,
    jobDuration: 0,
    toolRepairCooldown: 3600000
  },
  
  daily: {
    resetTime: '00:00',
    claimCooldown: 86400000,
    streakGracePeriod: 86400000
  },
  
  quests: {
    refreshInterval: 86400000,
    claimTimeout: 0
  },
  
  events: {
    minDuration: 3600000,
    maxDuration: 86400000,
    cooldownBetween: 7200000
  },
  
  market: {
    listingDuration: 604800000,
    purchaseCooldown: 1000,
    priceUpdateCooldown: 300000
  },
  
  auctions: {
    minDuration: 3600000,
    maxDuration: 604800000,
    extensionOnBid: 300000,
    bidCooldown: 5000
  },
  
  minigames: {
    coinDuel: 30000,
    diceClash: 30000,
    doorOfFate: 60000,
    rockPaperScissors: 30000,
    slotMachine: 10000,
    trivia: 30000
  },
  
  tasks: {
    checkInterval: 1800000,
    sendInterval: 7200000,
    expiryTime: 86400000,
    inactiveThreshold: 21600000,
    activeThreshold: 7200000
  },
  
  clans: {
    warDuration: 604800000,
    donationReset: 86400000,
    levelUpCooldown: 3600000
  },
  
  giveaways: {
    minDuration: 60000,
    maxDuration: 604800000,
    entryCooldown: 0
  },
  
  lotteries: {
    drawInterval: 86400000,
    ticketPurchaseCutoff: 3600000
  },
  
  cache: {
    configTTL: 60000,
    userDataTTL: 30000,
    leaderboardTTL: 300000
  },
  
  autoSave: {
    interval: 300000,
    onCriticalAction: true
  },
  
  rateLimits: {
    commands: { maxPerMinute: 30, cooldown: 2000 },
    api: { maxPerMinute: 60, cooldown: 1000 }
  }
};

module.exports = {
  DEFAULT_TIMERS
};
