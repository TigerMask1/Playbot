const DEFAULT_JOBS = {
  miner: {
    name: 'Miner',
    emoji: '⛏️',
    description: 'Mine for valuable ores deep underground',
    tool: 'drill',
    cooldown: 900000,
    duration: 0,
    rewards: {
      coins: { min: 50, max: 150 },
      xp: { min: 10, max: 25 },
      ores: {
        aurelite: { chance: 40, amount: { min: 1, max: 3 } },
        kryonite: { chance: 30, amount: { min: 1, max: 2 } },
        zyronite: { chance: 20, amount: { min: 1, max: 2 } },
        rubinite: { chance: 8, amount: { min: 1, max: 1 } },
        voidinite: { chance: 2, amount: { min: 1, max: 1 } }
      }
    },
    requirements: { level: 0 },
    messages: {
      start: '⛏️ You head into the mines...',
      success: '💎 You mined some valuable ores!',
      failure: '😓 The rocks were too tough today.'
    },
    isActive: true
  },
  caretaker: {
    name: 'Caretaker',
    emoji: '🏠',
    description: 'Take care of animals at the shelter',
    tool: null,
    cooldown: 900000,
    duration: 0,
    rewards: {
      coins: { min: 30, max: 100 },
      xp: { min: 15, max: 30 },
      gems: { chance: 10, amount: { min: 1, max: 2 } },
      animalPoints: { min: 1, max: 3 }
    },
    requirements: { level: 0 },
    messages: {
      start: '🏠 You start taking care of the animals...',
      success: '🐾 The animals love you! Great work!',
      failure: '😔 The animals were a bit grumpy today.'
    },
    isActive: true
  },
  farmer: {
    name: 'Farmer',
    emoji: '🌾',
    description: 'Work the land and harvest crops',
    tool: 'axe',
    cooldown: 900000,
    duration: 0,
    rewards: {
      coins: { min: 40, max: 120 },
      xp: { min: 12, max: 28 },
      wood: {
        oak: { chance: 50, amount: { min: 2, max: 5 } },
        maple: { chance: 30, amount: { min: 1, max: 3 } },
        ebony: { chance: 15, amount: { min: 1, max: 2 } },
        celestial: { chance: 5, amount: { min: 1, max: 1 } }
      }
    },
    requirements: { level: 0 },
    messages: {
      start: '🌾 You head out to the fields...',
      success: '🌽 Great harvest today!',
      failure: '🌧️ The weather wasn\'t cooperating.'
    },
    isActive: true
  },
  zookeeper: {
    name: 'Zookeeper',
    emoji: '🦁',
    description: 'Help manage the zoo and its animals',
    tool: 'whistle',
    cooldown: 900000,
    duration: 0,
    rewards: {
      coins: { min: 60, max: 180 },
      xp: { min: 18, max: 35 },
      tokens: { min: 5, max: 15 },
      characterChance: 1
    },
    requirements: { level: 5 },
    messages: {
      start: '🦁 You clock in at the zoo...',
      success: '🎉 The visitors loved your work!',
      failure: '😰 The animals were restless today.'
    },
    isActive: true
  },
  ranger: {
    name: 'Ranger',
    emoji: '🔭',
    description: 'Patrol the wilderness and protect wildlife',
    tool: 'binoculars',
    cooldown: 900000,
    duration: 0,
    rewards: {
      coins: { min: 70, max: 200 },
      xp: { min: 20, max: 40 },
      gems: { chance: 15, amount: { min: 1, max: 3 } },
      shards: { chance: 5, amount: { min: 1, max: 1 } }
    },
    requirements: { level: 10 },
    messages: {
      start: '🔭 You set out on patrol...',
      success: '🌲 Another successful patrol!',
      failure: '🌫️ Visibility was too poor today.'
    },
    isActive: true
  }
};

const ORES = {
  aurelite: { name: 'Aurelite', emoji: '🟡', rarity: 'common', sellPrice: 10 },
  kryonite: { name: 'Kryonite', emoji: '🔵', rarity: 'uncommon', sellPrice: 25 },
  zyronite: { name: 'Zyronite', emoji: '🟢', rarity: 'rare', sellPrice: 50 },
  rubinite: { name: 'Rubinite', emoji: '🔴', rarity: 'epic', sellPrice: 100 },
  voidinite: { name: 'Voidinite', emoji: '⚫', rarity: 'legendary', sellPrice: 250 }
};

const WOOD_TYPES = {
  oak: { name: 'Oak Wood', emoji: '🪵', rarity: 'common', sellPrice: 5 },
  maple: { name: 'Maple Wood', emoji: '🍁', rarity: 'uncommon', sellPrice: 15 },
  ebony: { name: 'Ebony Wood', emoji: '🪨', rarity: 'rare', sellPrice: 35 },
  celestial: { name: 'Celestial Wood', emoji: '✨', rarity: 'legendary', sellPrice: 150 }
};

const TOOLS = {
  drill: {
    name: 'Mining Drill',
    emoji: '⛏️',
    maxLevel: 10,
    baseEfficiency: 1,
    efficiencyPerLevel: 0.15,
    baseDurability: 20,
    durabilityPerLevel: 10,
    craftCost: { coins: 500, aurelite: 10 },
    upgradeCost: { coins: 200, kryonite: 5 }
  },
  axe: {
    name: 'Woodcutting Axe',
    emoji: '🪓',
    maxLevel: 10,
    baseEfficiency: 1,
    efficiencyPerLevel: 0.15,
    baseDurability: 20,
    durabilityPerLevel: 10,
    craftCost: { coins: 400, oak: 15 },
    upgradeCost: { coins: 150, maple: 8 }
  },
  whistle: {
    name: 'Animal Whistle',
    emoji: '📯',
    maxLevel: 10,
    baseEfficiency: 1,
    efficiencyPerLevel: 0.12,
    baseDurability: 25,
    durabilityPerLevel: 8,
    craftCost: { coins: 600 },
    upgradeCost: { coins: 250 }
  },
  binoculars: {
    name: 'Ranger Binoculars',
    emoji: '🔭',
    maxLevel: 10,
    baseEfficiency: 1,
    efficiencyPerLevel: 0.18,
    baseDurability: 30,
    durabilityPerLevel: 12,
    craftCost: { coins: 800 },
    upgradeCost: { coins: 350 }
  }
};

const WORK_SETTINGS = {
  cooldown: 900000,
  firstJobBonus: true,
  starterTools: ['drill', 'axe', 'whistle', 'binoculars'],
  starterToolLevel: 1,
  starterToolDurability: 20
};

module.exports = {
  DEFAULT_JOBS,
  ORES,
  WOOD_TYPES,
  TOOLS,
  WORK_SETTINGS
};
