const DEFAULT_CHARACTERS = [
  { id: 1, name: 'Bali', emoji: '<:bali:1429988685943799888>', customEmojiId: '1429988685943799888', obtainable: 'crate', rarity: 'common', baseStats: { hp: 100, attack: 10, defense: 10, speed: 10 }, description: 'A fierce feline hunter', isActive: true },
  { id: 2, name: 'Betsy', emoji: '🦫', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 110, attack: 8, defense: 12, speed: 8 }, description: 'A hardworking beaver', isActive: true },
  { id: 3, name: 'Bruce', emoji: '🦍', customEmojiId: null, obtainable: 'starter', rarity: 'common', baseStats: { hp: 130, attack: 12, defense: 14, speed: 6 }, description: 'A powerful gorilla', isActive: true },
  { id: 4, name: 'Buck', emoji: '🐂', customEmojiId: null, obtainable: 'starter', rarity: 'common', baseStats: { hp: 120, attack: 14, defense: 10, speed: 8 }, description: 'A stubborn bull', isActive: true },
  { id: 5, name: 'Buddy', emoji: '🦟', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 80, attack: 6, defense: 6, speed: 16 }, description: 'A tiny but quick mosquito', isActive: true },
  { id: 6, name: 'Caly', emoji: '🐨', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 100, attack: 8, defense: 12, speed: 8 }, description: 'A sleepy koala', isActive: true },
  { id: 7, name: 'Dillo', emoji: '⭕', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 90, attack: 8, defense: 16, speed: 6 }, description: 'An armored armadillo', isActive: true },
  { id: 8, name: 'Donna', emoji: '🐊', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 110, attack: 14, defense: 10, speed: 8 }, description: 'A fearsome crocodile', isActive: true },
  { id: 9, name: 'Duke', emoji: '🦁', customEmojiId: null, obtainable: 'crate', rarity: 'rare', baseStats: { hp: 120, attack: 14, defense: 12, speed: 10 }, description: 'The king of the jungle', isActive: true },
  { id: 10, name: 'Earl', emoji: '🦀', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 85, attack: 12, defense: 14, speed: 6 }, description: 'A snappy crab', isActive: true },
  { id: 11, name: 'Edna', emoji: '🦔', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 90, attack: 8, defense: 14, speed: 8 }, description: 'A spiky hedgehog', isActive: true },
  { id: 12, name: 'Elaine', emoji: '🐆', customEmojiId: null, obtainable: 'crate', rarity: 'rare', baseStats: { hp: 100, attack: 14, defense: 8, speed: 14 }, description: 'A swift leopard', isActive: true },
  { id: 13, name: 'Faye', emoji: '🐙', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 95, attack: 12, defense: 10, speed: 10 }, description: 'A clever octopus', isActive: true },
  { id: 14, name: 'Finn', emoji: '🦈', customEmojiId: null, obtainable: 'crate', rarity: 'rare', baseStats: { hp: 110, attack: 16, defense: 8, speed: 12 }, description: 'A deadly shark', isActive: true },
  { id: 15, name: 'Frank', emoji: '🐘', customEmojiId: null, obtainable: 'crate', rarity: 'rare', baseStats: { hp: 150, attack: 14, defense: 16, speed: 4 }, description: 'A mighty elephant', isActive: true },
  { id: 16, name: 'Fuzzy', emoji: '🐧', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 90, attack: 8, defense: 10, speed: 10 }, description: 'A cute penguin', isActive: true },
  { id: 17, name: 'Henry', emoji: '🦇', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 85, attack: 10, defense: 8, speed: 14 }, description: 'A mysterious bat', isActive: true },
  { id: 18, name: 'Iris', emoji: '🐍', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 90, attack: 12, defense: 8, speed: 12 }, description: 'A venomous snake', isActive: true },
  { id: 19, name: 'Jack', emoji: '🐺', customEmojiId: null, obtainable: 'crate', rarity: 'rare', baseStats: { hp: 105, attack: 14, defense: 10, speed: 12 }, description: 'A cunning wolf', isActive: true },
  { id: 20, name: 'Jade', emoji: '🐅', customEmojiId: null, obtainable: 'crate', rarity: 'epic', baseStats: { hp: 115, attack: 16, defense: 10, speed: 12 }, description: 'A majestic tiger', isActive: true },
  { id: 21, name: 'Joy', emoji: '🐒', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 85, attack: 10, defense: 8, speed: 14 }, description: 'A playful monkey', isActive: true },
  { id: 22, name: 'Larry', emoji: '🦎', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 80, attack: 8, defense: 10, speed: 12 }, description: 'A colorful lizard', isActive: true },
  { id: 23, name: 'Lennon', emoji: '⭕', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 95, attack: 10, defense: 12, speed: 10 }, description: 'A musical creature', isActive: true },
  { id: 24, name: 'Lizzy', emoji: '⭕', customEmojiId: null, obtainable: 'crate', rarity: 'rare', baseStats: { hp: 100, attack: 14, defense: 10, speed: 12 }, description: 'A fire-breathing dragon', isActive: true },
  { id: 25, name: 'Louie', emoji: '🐀', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 75, attack: 8, defense: 6, speed: 16 }, description: 'A sneaky rat', isActive: true },
  { id: 26, name: 'Max', emoji: '🦝', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 95, attack: 10, defense: 10, speed: 12 }, description: 'A clever raccoon', isActive: true },
  { id: 27, name: 'Milo', emoji: '🦩', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 90, attack: 8, defense: 8, speed: 14 }, description: 'An elegant flamingo', isActive: true },
  { id: 28, name: 'Molly', emoji: '🦘', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 100, attack: 12, defense: 8, speed: 14 }, description: 'A bouncy kangaroo', isActive: true },
  { id: 29, name: 'Nico', emoji: '🐲', customEmojiId: null, obtainable: 'crate', rarity: 'legendary', baseStats: { hp: 130, attack: 18, defense: 14, speed: 10 }, description: 'A powerful dragon', isActive: true },
  { id: 30, name: 'Nina', emoji: '⭕', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 90, attack: 10, defense: 10, speed: 12 }, description: 'A graceful dancer', isActive: true },
  { id: 31, name: 'Nix', emoji: '🦊', customEmojiId: null, obtainable: 'starter', rarity: 'common', baseStats: { hp: 95, attack: 10, defense: 8, speed: 14 }, description: 'A sly fox', isActive: true },
  { id: 32, name: 'Ollie', emoji: '🐼', customEmojiId: null, obtainable: 'crate', rarity: 'rare', baseStats: { hp: 120, attack: 10, defense: 14, speed: 8 }, description: 'A cuddly panda', isActive: true },
  { id: 33, name: 'Paco', emoji: '🐎', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 110, attack: 12, defense: 10, speed: 14 }, description: 'A swift horse', isActive: true },
  { id: 34, name: 'Paolo', emoji: '🦓', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 105, attack: 10, defense: 12, speed: 12 }, description: 'A striped zebra', isActive: true },
  { id: 35, name: 'Pepper', emoji: '🦒', customEmojiId: null, obtainable: 'crate', rarity: 'rare', baseStats: { hp: 115, attack: 10, defense: 12, speed: 10 }, description: 'A tall giraffe', isActive: true },
  { id: 36, name: 'Phil', emoji: '🦉', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 90, attack: 10, defense: 10, speed: 12 }, description: 'A wise owl', isActive: true },
  { id: 37, name: 'Poe', emoji: '⭕', customEmojiId: null, obtainable: 'crate', rarity: 'rare', baseStats: { hp: 95, attack: 14, defense: 8, speed: 14 }, description: 'A mysterious creature', isActive: true },
  { id: 38, name: 'Quinn', emoji: '⭕', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 90, attack: 12, defense: 10, speed: 14 }, description: 'A quick fighter', isActive: true },
  { id: 39, name: 'Ravi', emoji: '🦚', customEmojiId: null, obtainable: 'crate', rarity: 'rare', baseStats: { hp: 95, attack: 12, defense: 10, speed: 12 }, description: 'A beautiful peacock', isActive: true },
  { id: 40, name: 'Rocky', emoji: '🦂', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 85, attack: 14, defense: 12, speed: 10 }, description: 'A stinging scorpion', isActive: true },
  { id: 41, name: 'Romeo', emoji: '🐸', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 85, attack: 8, defense: 8, speed: 14 }, description: 'A leaping frog', isActive: true },
  { id: 42, name: 'Rubie', emoji: '🦌', customEmojiId: null, obtainable: 'crate', rarity: 'rare', baseStats: { hp: 100, attack: 10, defense: 10, speed: 14 }, description: 'A graceful deer', isActive: true },
  { id: 43, name: 'Shelly', emoji: '🐢', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 100, attack: 6, defense: 18, speed: 4 }, description: 'A slow but sturdy turtle', isActive: true },
  { id: 44, name: 'Skippy', emoji: '🐇', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 80, attack: 8, defense: 6, speed: 16 }, description: 'A quick rabbit', isActive: true },
  { id: 45, name: 'Steve', emoji: '🦅', customEmojiId: null, obtainable: 'crate', rarity: 'rare', baseStats: { hp: 100, attack: 14, defense: 8, speed: 14 }, description: 'A soaring eagle', isActive: true },
  { id: 46, name: 'Suzy', emoji: '🐝', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 75, attack: 10, defense: 6, speed: 16 }, description: 'A buzzing bee', isActive: true },
  { id: 47, name: 'Tony', emoji: '🦛', customEmojiId: null, obtainable: 'crate', rarity: 'uncommon', baseStats: { hp: 140, attack: 12, defense: 14, speed: 4 }, description: 'A massive hippo', isActive: true },
  { id: 48, name: 'Ursula', emoji: '🐻‍❄️', customEmojiId: null, obtainable: 'crate', rarity: 'rare', baseStats: { hp: 130, attack: 14, defense: 14, speed: 6 }, description: 'A powerful polar bear', isActive: true },
  { id: 49, name: 'Wanda', emoji: '🐋', customEmojiId: null, obtainable: 'crate', rarity: 'epic', baseStats: { hp: 160, attack: 14, defense: 16, speed: 4 }, description: 'A majestic whale', isActive: true },
  { id: 50, name: 'Yara', emoji: '🐦', customEmojiId: null, obtainable: 'crate', rarity: 'common', baseStats: { hp: 80, attack: 8, defense: 6, speed: 16 }, description: 'A swift bird', isActive: true },
  { id: 51, name: 'Zac', emoji: '🦏', customEmojiId: null, obtainable: 'crate', rarity: 'epic', baseStats: { hp: 150, attack: 16, defense: 18, speed: 4 }, description: 'A mighty rhino', isActive: true }
];

const CHARACTER_RARITIES = {
  common: { weight: 60, color: '#808080', stBonus: 0 },
  uncommon: { weight: 25, color: '#00FF00', stBonus: 5 },
  rare: { weight: 10, color: '#0066FF', stBonus: 10 },
  epic: { weight: 4, color: '#9900FF', stBonus: 15 },
  legendary: { weight: 1, color: '#FFD700', stBonus: 25 }
};

const OBTAINABLE_TYPES = ['crate', 'starter', 'drop', 'event', 'quest', 'shop', 'special'];

module.exports = {
  DEFAULT_CHARACTERS,
  CHARACTER_RARITIES,
  OBTAINABLE_TYPES
};
