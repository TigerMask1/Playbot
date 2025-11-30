const DEFAULT_DROPS = {
  enabled: true,
  interval: { min: 25000, max: 35000 },
  channelId: null,
  
  duration: 10800000,
  cost: 100,
  costType: 'gems',
  
  catchTimeout: 30000,
  maxDropsPerHour: 120,
  
  inactivityTimeout: 300000,
  autoResumeOnActivity: true,
  
  dropCodes: ['tyrant', 'zooba', 'zoo', 'catch', 'grab', 'quick', 'fast', 'win', 'get', 'take'],
  
  rarityChances: {
    common: 60,
    uncommon: 25,
    rare: 10,
    epic: 4,
    legendary: 1
  },
  
  bonusDropChance: 0,
  doubleDropChance: 5,
  
  rewards: {
    coins: { min: 10, max: 50 },
    gems: { min: 0, max: 2 },
    xp: { min: 5, max: 15 },
    tokens: { min: 5, max: 20 }
  },
  
  streakBonuses: {
    enabled: true,
    thresholds: [
      { catches: 5, bonus: { coins: 50, xp: 10 } },
      { catches: 10, bonus: { coins: 100, gems: 1, xp: 25 } },
      { catches: 25, bonus: { coins: 250, gems: 3, xp: 50 } },
      { catches: 50, bonus: { coins: 500, gems: 5, xp: 100, crate: 'bronze' } }
    ]
  },
  
  messages: {
    spawn: '🎁 A wild **{character}** {emoji} appeared! Type `{code}` to catch it!',
    caught: '🎉 {user} caught **{character}** {emoji}! ST: {st}%',
    missed: '💨 The **{character}** got away... Too slow!',
    alreadyCaught: '❌ You already caught this one!',
    wrongCode: '❌ Wrong code! Try again!',
    dropsActivated: '✅ Drops activated for {duration}!',
    dropsExpired: '⏰ Drops have expired! Use `{command}` to reactivate.',
    dropsInactive: '❌ Drops are not active in this server.',
    streakBonus: '🔥 **Streak Bonus!** {catches} catches in a row! +{bonus}'
  },
  
  embedSettings: {
    color: '#00FF00',
    showRarity: true,
    showEmoji: true,
    showTimer: true,
    thumbnailSize: 'medium'
  },
  
  mainServerFree: true,
  mainServerId: '1430516117851340893'
};

module.exports = {
  DEFAULT_DROPS
};
