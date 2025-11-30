const DEFAULT_BATTLE_CONFIG = {
  enabled: true,
  channelId: null,
  
  turnTimeout: 60000,
  maxRounds: 20,
  minLevel: 1,
  
  matchmaking: {
    enabled: true,
    trophyRange: 200,
    waitTime: 30000
  },
  
  trophyRewards: {
    win: 30,
    lose: -15,
    draw: 5,
    minTrophies: 0
  },
  
  coinRewards: {
    win: { min: 50, max: 200 },
    lose: { min: 10, max: 50 },
    draw: { min: 20, max: 80 }
  },
  
  xpRewards: {
    win: { min: 20, max: 50 },
    lose: { min: 5, max: 15 },
    draw: { min: 10, max: 25 }
  },
  
  tokenRewards: {
    win: { min: 10, max: 30 },
    lose: { min: 2, max: 8 },
    draw: { min: 5, max: 15 }
  },
  
  rankTiers: [
    { name: 'Bronze I', minTrophies: 0, emoji: '🥉', color: '#CD7F32' },
    { name: 'Bronze II', minTrophies: 100, emoji: '🥉', color: '#CD7F32' },
    { name: 'Bronze III', minTrophies: 200, emoji: '🥉', color: '#CD7F32' },
    { name: 'Silver I', minTrophies: 300, emoji: '🥈', color: '#C0C0C0' },
    { name: 'Silver II', minTrophies: 500, emoji: '🥈', color: '#C0C0C0' },
    { name: 'Silver III', minTrophies: 700, emoji: '🥈', color: '#C0C0C0' },
    { name: 'Gold I', minTrophies: 1000, emoji: '🥇', color: '#FFD700' },
    { name: 'Gold II', minTrophies: 1300, emoji: '🥇', color: '#FFD700' },
    { name: 'Gold III', minTrophies: 1600, emoji: '🥇', color: '#FFD700' },
    { name: 'Platinum I', minTrophies: 2000, emoji: '💎', color: '#E5E4E2' },
    { name: 'Platinum II', minTrophies: 2500, emoji: '💎', color: '#E5E4E2' },
    { name: 'Platinum III', minTrophies: 3000, emoji: '💎', color: '#E5E4E2' },
    { name: 'Diamond I', minTrophies: 3500, emoji: '💠', color: '#B9F2FF' },
    { name: 'Diamond II', minTrophies: 4000, emoji: '💠', color: '#B9F2FF' },
    { name: 'Diamond III', minTrophies: 4500, emoji: '💠', color: '#B9F2FF' },
    { name: 'Master', minTrophies: 5000, emoji: '👑', color: '#FF4500' },
    { name: 'Grandmaster', minTrophies: 6000, emoji: '🏆', color: '#9400D3' },
    { name: 'Legend', minTrophies: 7500, emoji: '⭐', color: '#FFD700' }
  ],
  
  mechanics: {
    criticalHitChance: 5,
    criticalHitMultiplier: 1.5,
    missChance: 5,
    energyRegenPerTurn: 10,
    maxEnergy: 100,
    startingEnergy: 50
  },
  
  stScaling: {
    enabled: true,
    damageMultiplier: 0.01,
    defenseMultiplier: 0.005,
    hpMultiplier: 0.01
  },
  
  levelScaling: {
    enabled: true,
    hpPerLevel: 5,
    damagePerLevel: 1,
    defensePerLevel: 0.5
  },
  
  messages: {
    battleStart: '⚔️ Battle between {player1} and {player2} begins!',
    turnStart: '🎯 {player}\'s turn! Choose your move:',
    attack: '{attacker} used **{move}** on {defender} for {damage} damage!',
    heal: '{player} used **{move}** and restored {amount} HP!',
    miss: '{attacker} missed with **{move}**!',
    critical: '💥 Critical hit! {attacker} dealt {damage} damage with **{move}**!',
    battleEnd: '🏆 {winner} wins the battle!',
    draw: '🤝 The battle ended in a draw!',
    timeout: '⏰ {player} ran out of time!',
    forfeit: '🏳️ {player} forfeited the battle!'
  },
  
  embedSettings: {
    color: '#FF6600',
    showHpBars: true,
    showEnergy: true,
    showMoveEffects: true,
    animatedMessages: true
  },
  
  cooldown: 30000,
  maxBattlesPerHour: 20
};

const BATTLE_EFFECTS = {
  burn: { name: 'Burn', emoji: '🔥', damagePerTurn: 5, duration: 3, stackable: false },
  freeze: { name: 'Freeze', emoji: '❄️', skipTurnChance: 30, duration: 2, stackable: false },
  paralyze: { name: 'Paralysis', emoji: '⚡', skipTurnChance: 25, speedReduction: 50, duration: 3, stackable: false },
  poison: { name: 'Poison', emoji: '☠️', damagePerTurn: 3, duration: 5, stackable: true, maxStacks: 3 },
  stun: { name: 'Stun', emoji: '💫', skipTurnChance: 100, duration: 1, stackable: false },
  confuse: { name: 'Confusion', emoji: '😵', selfHitChance: 30, duration: 3, stackable: false },
  blind: { name: 'Blind', emoji: '🌑', missChanceIncrease: 40, duration: 2, stackable: false },
  slow: { name: 'Slow', emoji: '🐌', speedReduction: 40, duration: 3, stackable: false },
  bleed: { name: 'Bleed', emoji: '🩸', damagePerTurn: 4, duration: 4, stackable: true, maxStacks: 5 }
};

module.exports = {
  DEFAULT_BATTLE_CONFIG,
  BATTLE_EFFECTS
};
