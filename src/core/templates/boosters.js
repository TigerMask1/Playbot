const DEFAULT_BOOSTERS = {
  stBooster: {
    enabled: true,
    maxBoostsPerCharacter: 5,
    craftCost: { shards: 3 },
    boostAmount: { min: 1, max: 10 },
    guaranteedMin: 1,
    cooldown: 0,
    messages: {
      crafted: '🔧 Crafted 1 ST Booster!',
      used: '⬆️ Used ST Booster on **{character}**! ST: {oldST}% → {newST}%',
      maxBoosts: '❌ **{character}** has reached the maximum number of boosts ({max}).',
      notEnoughShards: '❌ Not enough shards! Need {required}, have {current}.'
    }
  },
  
  xpBooster: {
    enabled: true,
    types: {
      small: { multiplier: 1.5, duration: 3600000, cost: { gems: 25 } },
      medium: { multiplier: 2.0, duration: 3600000, cost: { gems: 50 } },
      large: { multiplier: 3.0, duration: 3600000, cost: { gems: 100 } }
    },
    stackable: false,
    messages: {
      activated: '🚀 {type} XP Booster activated! {multiplier}x XP for {duration}!',
      expired: '⏰ Your XP Booster has expired.',
      alreadyActive: '❌ You already have an XP Booster active!'
    }
  },
  
  coinBooster: {
    enabled: true,
    types: {
      small: { multiplier: 1.5, duration: 3600000, cost: { gems: 20 } },
      medium: { multiplier: 2.0, duration: 3600000, cost: { gems: 40 } },
      large: { multiplier: 3.0, duration: 3600000, cost: { gems: 80 } }
    },
    stackable: false,
    messages: {
      activated: '💰 {type} Coin Booster activated! {multiplier}x coins for {duration}!',
      expired: '⏰ Your Coin Booster has expired.',
      alreadyActive: '❌ You already have a Coin Booster active!'
    }
  },
  
  dropBooster: {
    enabled: true,
    types: {
      lucky: { rarityBoost: 2, duration: 1800000, cost: { gems: 50 } },
      superLucky: { rarityBoost: 5, duration: 1800000, cost: { gems: 100 } }
    },
    stackable: false,
    messages: {
      activated: '🍀 {type} Drop Booster activated! Better drop rates for {duration}!',
      expired: '⏰ Your Drop Booster has expired.',
      alreadyActive: '❌ You already have a Drop Booster active!'
    }
  },
  
  battleBooster: {
    enabled: true,
    types: {
      power: { damageBoost: 1.2, duration: 3600000, cost: { gems: 30 } },
      defense: { defenseBoost: 1.3, duration: 3600000, cost: { gems: 30 } },
      speed: { speedBoost: 1.25, duration: 3600000, cost: { gems: 30 } }
    },
    stackable: true,
    maxStacks: 3,
    messages: {
      activated: '⚔️ {type} Battle Booster activated for {duration}!',
      expired: '⏰ Your Battle Booster has expired.',
      maxStacks: '❌ You\'ve reached the maximum number of Battle Boosters!'
    }
  }
};

module.exports = {
  DEFAULT_BOOSTERS
};
