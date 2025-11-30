const DEFAULT_CLANS = {
  enabled: true,
  
  creation: {
    cost: { coins: 10000, gems: 100 },
    nameMinLength: 3,
    nameMaxLength: 24,
    tagMinLength: 2,
    tagMaxLength: 6,
    descriptionMaxLength: 200
  },
  
  members: {
    maxMembers: 50,
    maxMembersPerLevel: {
      1: 20,
      2: 25,
      3: 30,
      4: 35,
      5: 40,
      6: 45,
      7: 50
    }
  },
  
  ranks: {
    leader: { name: 'Leader', emoji: '👑', permissions: ['all'] },
    coLeader: { name: 'Co-Leader', emoji: '⭐', permissions: ['kick', 'promote', 'demote', 'invite', 'editSettings'] },
    elder: { name: 'Elder', emoji: '🔹', permissions: ['kick', 'invite'] },
    member: { name: 'Member', emoji: '👤', permissions: [] }
  },
  
  donations: {
    dailyLimit: { coins: 10000, gems: 100 },
    cooldown: 0,
    minimumDonation: { coins: 100, gems: 1 },
    xpPerDonation: {
      coins: 0.01,
      gems: 1
    }
  },
  
  leveling: {
    maxLevel: 10,
    xpRequirements: [
      { level: 1, xp: 0 },
      { level: 2, xp: 5000 },
      { level: 3, xp: 15000 },
      { level: 4, xp: 35000 },
      { level: 5, xp: 70000 },
      { level: 6, xp: 125000 },
      { level: 7, xp: 200000 },
      { level: 8, xp: 300000 },
      { level: 9, xp: 450000 },
      { level: 10, xp: 650000 }
    ],
    levelBonuses: {
      2: { xpBoost: 1.05, coinBoost: 1.02 },
      3: { xpBoost: 1.08, coinBoost: 1.04, dropBoost: 1.02 },
      4: { xpBoost: 1.12, coinBoost: 1.06, dropBoost: 1.04 },
      5: { xpBoost: 1.15, coinBoost: 1.08, dropBoost: 1.06, extraCrateSlot: 1 },
      6: { xpBoost: 1.18, coinBoost: 1.10, dropBoost: 1.08 },
      7: { xpBoost: 1.22, coinBoost: 1.12, dropBoost: 1.10, extraCrateSlot: 2 },
      8: { xpBoost: 1.25, coinBoost: 1.15, dropBoost: 1.12 },
      9: { xpBoost: 1.30, coinBoost: 1.18, dropBoost: 1.15, extraCrateSlot: 3 },
      10: { xpBoost: 1.35, coinBoost: 1.20, dropBoost: 1.18, exclusiveRewards: true }
    }
  },
  
  wars: {
    enabled: true,
    duration: 604800000,
    matchingCriteria: 'trophies',
    minMembers: 5,
    rewards: {
      first: { coins: 50000, gems: 500, clanXp: 10000 },
      second: { coins: 25000, gems: 250, clanXp: 5000 },
      third: { coins: 10000, gems: 100, clanXp: 2500 },
      participation: { coins: 1000, gems: 25, clanXp: 500 }
    },
    scoring: {
      battleWin: 100,
      battleLose: 25,
      dropCatch: 10,
      crateOpen: 5,
      questComplete: 50
    }
  },
  
  perks: {
    clanShop: {
      enabled: true,
      items: [
        { id: 'xp_boost', name: 'Clan XP Boost', cost: { clanPoints: 1000 }, effect: { xpBoost: 1.1, duration: 3600000 } },
        { id: 'coin_boost', name: 'Clan Coin Boost', cost: { clanPoints: 800 }, effect: { coinBoost: 1.1, duration: 3600000 } },
        { id: 'drop_boost', name: 'Clan Drop Boost', cost: { clanPoints: 1200 }, effect: { dropBoost: 1.1, duration: 3600000 } },
        { id: 'clan_crate', name: 'Clan Crate', cost: { clanPoints: 500 }, effect: { crate: 'gold' } }
      ]
    },
    clanBanners: {
      enabled: true,
      unlockLevel: 3
    },
    clanEmblems: {
      enabled: true,
      unlockLevel: 5
    }
  },
  
  messages: {
    created: '🏰 Clan **{name}** [{tag}] has been created!',
    joined: '✅ Welcome to **{name}**!',
    left: '👋 You left **{name}**.',
    kicked: '👢 **{member}** was kicked from the clan.',
    promoted: '⬆️ **{member}** was promoted to **{rank}**!',
    demoted: '⬇️ **{member}** was demoted to **{rank}**.',
    donated: '💰 **{member}** donated {amount} to the clan!',
    levelUp: '🎉 **{name}** reached level **{level}**!',
    warStarted: '⚔️ Clan War has started! Fight for victory!',
    warEnded: '🏁 Clan War has ended! Final standings: {results}',
    warWon: '🏆 Congratulations! **{name}** won the Clan War!'
  },
  
  embedColor: '#9400D3'
};

module.exports = {
  DEFAULT_CLANS
};
