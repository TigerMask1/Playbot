const DEFAULT_EVENTS = {
  enabled: true,
  autoStart: false,
  channelId: null,
  
  types: {
    catchRace: {
      name: 'Catch Race',
      emoji: '🏃',
      description: 'Race to catch the most drops!',
      duration: 3600000,
      minParticipants: 2,
      maxParticipants: 100,
      rewards: {
        first: { coins: 5000, gems: 100, crates: { type: 'legendary', amount: 1 } },
        second: { coins: 3000, gems: 50, crates: { type: 'emerald', amount: 1 } },
        third: { coins: 1000, gems: 25, crates: { type: 'gold', amount: 1 } },
        participation: { coins: 100, gems: 5 }
      },
      rules: 'Catch the most drops within the time limit!',
      scoring: 'drops_caught'
    },
    
    battleRoyale: {
      name: 'Battle Royale',
      emoji: '⚔️',
      description: 'Fight your way to the top!',
      duration: 7200000,
      minParticipants: 4,
      maxParticipants: 32,
      rewards: {
        first: { coins: 10000, gems: 200, crates: { type: 'tyrant', amount: 1 } },
        second: { coins: 5000, gems: 100, crates: { type: 'legendary', amount: 1 } },
        third: { coins: 2500, gems: 50, crates: { type: 'emerald', amount: 1 } },
        participation: { coins: 200, gems: 10, trophies: 10 }
      },
      rules: 'Win battles to advance! Last one standing wins!',
      scoring: 'eliminations'
    },
    
    treasureHunt: {
      name: 'Treasure Hunt',
      emoji: '🗺️',
      description: 'Find hidden treasures!',
      duration: 1800000,
      minParticipants: 1,
      maxParticipants: 50,
      rewards: {
        first: { coins: 3000, gems: 75, shards: 5 },
        second: { coins: 1500, gems: 40, shards: 3 },
        third: { coins: 750, gems: 20, shards: 1 },
        participation: { coins: 50, gems: 2 }
      },
      treasures: [
        { type: 'coins', amount: { min: 50, max: 200 }, rarity: 'common' },
        { type: 'gems', amount: { min: 5, max: 20 }, rarity: 'uncommon' },
        { type: 'crate', crateType: 'gold', rarity: 'rare' },
        { type: 'shards', amount: { min: 1, max: 3 }, rarity: 'epic' }
      ],
      rules: 'Find the most treasures to win!',
      scoring: 'treasures_found'
    },
    
    bossRaid: {
      name: 'Boss Raid',
      emoji: '👹',
      description: 'Team up to defeat the boss!',
      duration: 3600000,
      minParticipants: 5,
      maxParticipants: 20,
      rewards: {
        completion: { coins: 2000, gems: 50 },
        mvp: { coins: 5000, gems: 100, crates: { type: 'legendary', amount: 1 } },
        participation: { coins: 500, gems: 15 }
      },
      boss: {
        name: 'Ancient Dragon',
        hp: 100000,
        damage: 50,
        defense: 30
      },
      rules: 'Work together to defeat the boss!',
      scoring: 'damage_dealt'
    },
    
    doubleXP: {
      name: 'Double XP Weekend',
      emoji: '⚡',
      description: 'Earn double XP from all activities!',
      duration: 172800000,
      minParticipants: 0,
      maxParticipants: 0,
      rewards: {
        participation: { xpMultiplier: 2 }
      },
      rules: 'All XP gains are doubled!',
      passive: true
    },
    
    doubleDrop: {
      name: 'Double Drop Rates',
      emoji: '🍀',
      description: 'Double the chance for rare drops!',
      duration: 86400000,
      minParticipants: 0,
      maxParticipants: 0,
      rewards: {
        participation: { dropRateMultiplier: 2 }
      },
      rules: 'Rare character chances are doubled!',
      passive: true
    },
    
    tournament: {
      name: 'Weekly Tournament',
      emoji: '🏆',
      description: 'Compete for the weekly championship!',
      duration: 604800000,
      minParticipants: 8,
      maxParticipants: 64,
      rewards: {
        first: { coins: 25000, gems: 500, crates: { type: 'tyrant', amount: 3 }, title: 'Champion' },
        second: { coins: 15000, gems: 300, crates: { type: 'legendary', amount: 2 } },
        third: { coins: 8000, gems: 150, crates: { type: 'emerald', amount: 2 } },
        quarterFinalist: { coins: 3000, gems: 50, crates: { type: 'gold', amount: 1 } },
        participation: { coins: 500, gems: 20 }
      },
      rules: 'Win matches to advance through brackets!',
      scoring: 'bracket_position'
    }
  },
  
  schedule: {
    enabled: false,
    events: [
      { type: 'doubleXP', day: 'saturday', time: '00:00' },
      { type: 'catchRace', day: 'sunday', time: '14:00' },
      { type: 'tournament', day: 'monday', time: '00:00' }
    ]
  },
  
  messages: {
    started: '🎉 **{event}** has started! {description}',
    ending: '⏰ **{event}** ends in {time}!',
    ended: '🏁 **{event}** has ended!',
    winner: '🏆 Congratulations to **{winner}** for winning **{event}**!',
    leaderboard: '📊 **{event}** Leaderboard:\n{leaderboard}',
    joined: '✅ You\'ve joined **{event}**!',
    rewards: '🎁 Event rewards: {rewards}'
  },
  
  embedColor: '#FFD700'
};

module.exports = {
  DEFAULT_EVENTS
};
