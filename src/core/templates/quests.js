const DEFAULT_QUESTS = [
  { id: 1, name: "First Steps", description: "Start your journey", type: "starter", requirement: 1, trackField: "started", reward: { coins: 100, gems: 5 }, category: "beginner" },
  { id: 2, name: "Catch Your First Drop", description: "Catch 1 drop from the drop channel", type: "drops", requirement: 1, trackField: "dropsCaught", reward: { coins: 50, gems: 2 }, category: "drops" },
  { id: 3, name: "Drop Hunter I", description: "Catch 10 drops", type: "drops", requirement: 10, trackField: "dropsCaught", reward: { coins: 150, gems: 5 }, category: "drops" },
  { id: 4, name: "Drop Hunter II", description: "Catch 25 drops", type: "drops", requirement: 25, trackField: "dropsCaught", reward: { coins: 300, gems: 10, shards: 1 }, category: "drops" },
  { id: 5, name: "Drop Hunter III", description: "Catch 50 drops", type: "drops", requirement: 50, trackField: "dropsCaught", reward: { coins: 500, gems: 15, shards: 2 }, category: "drops" },
  { id: 6, name: "Drop Master", description: "Catch 100 drops", type: "drops", requirement: 100, trackField: "dropsCaught", reward: { coins: 1000, gems: 25, shards: 3 }, category: "drops" },
  
  { id: 7, name: "First Battle", description: "Win your first battle", type: "battles", requirement: 1, trackField: "battlesWon", reward: { coins: 200, gems: 8 }, category: "battles" },
  { id: 8, name: "Battle Novice", description: "Win 5 battles", type: "battles", requirement: 5, trackField: "battlesWon", reward: { coins: 400, gems: 15, shards: 1 }, category: "battles" },
  { id: 9, name: "Battle Apprentice", description: "Win 10 battles", type: "battles", requirement: 10, trackField: "battlesWon", reward: { coins: 700, gems: 20, shards: 2 }, category: "battles" },
  { id: 10, name: "Battle Expert", description: "Win 25 battles", type: "battles", requirement: 25, trackField: "battlesWon", reward: { coins: 1200, gems: 35, shards: 3 }, category: "battles" },
  { id: 11, name: "Battle Master", description: "Win 50 battles", type: "battles", requirement: 50, trackField: "battlesWon", reward: { coins: 2000, gems: 50, shards: 5 }, category: "battles" },
  { id: 12, name: "Legendary Warrior", description: "Win 100 battles", type: "battles", requirement: 100, trackField: "battlesWon", reward: { coins: 5000, gems: 100, shards: 10 }, category: "battles" },
  
  { id: 13, name: "Character Collector I", description: "Own 5 different characters", type: "collection", requirement: 5, trackField: "uniqueChars", reward: { coins: 300, gems: 10 }, category: "collection" },
  { id: 14, name: "Character Collector II", description: "Own 10 different characters", type: "collection", requirement: 10, trackField: "uniqueChars", reward: { coins: 600, gems: 20, shards: 2 }, category: "collection" },
  { id: 15, name: "Character Collector III", description: "Own 15 different characters", type: "collection", requirement: 15, trackField: "uniqueChars", reward: { coins: 1000, gems: 35, shards: 3 }, category: "collection" },
  { id: 16, name: "Character Enthusiast", description: "Own 20 different characters", type: "collection", requirement: 20, trackField: "uniqueChars", reward: { coins: 1500, gems: 50, shards: 5 }, category: "collection" },
  { id: 17, name: "Character Master", description: "Own 30 different characters", type: "collection", requirement: 30, trackField: "uniqueChars", reward: { coins: 3000, gems: 75, shards: 8 }, category: "collection" },
  { id: 18, name: "Complete Collection", description: "Own all 51 characters", type: "collection", requirement: 51, trackField: "uniqueChars", reward: { coins: 10000, gems: 200, shards: 20 }, category: "collection" },
  
  { id: 19, name: "Level Up!", description: "Level up any character to level 5", type: "leveling", requirement: 5, trackField: "maxLevel", reward: { coins: 200, gems: 8 }, category: "leveling" },
  { id: 20, name: "Power Training I", description: "Level up any character to level 10", type: "leveling", requirement: 10, trackField: "maxLevel", reward: { coins: 400, gems: 15, shards: 1 }, category: "leveling" },
  { id: 21, name: "Power Training II", description: "Level up any character to level 15", type: "leveling", requirement: 15, trackField: "maxLevel", reward: { coins: 700, gems: 25, shards: 2 }, category: "leveling" },
  { id: 22, name: "Power Training III", description: "Level up any character to level 20", type: "leveling", requirement: 20, trackField: "maxLevel", reward: { coins: 1200, gems: 40, shards: 4 }, category: "leveling" },
  { id: 23, name: "Elite Trainer", description: "Level up any character to level 30", type: "leveling", requirement: 30, trackField: "maxLevel", reward: { coins: 2500, gems: 75, shards: 8 }, category: "leveling" },
  { id: 24, name: "Legendary Trainer", description: "Level up any character to level 50", type: "leveling", requirement: 50, trackField: "maxLevel", reward: { coins: 5000, gems: 150, shards: 15 }, category: "leveling" },
  
  { id: 25, name: "First Crate", description: "Open your first crate", type: "crates", requirement: 1, trackField: "cratesOpened", reward: { coins: 100, gems: 5 }, category: "crates" },
  { id: 26, name: "Crate Opener I", description: "Open 5 crates", type: "crates", requirement: 5, trackField: "cratesOpened", reward: { coins: 300, gems: 12 }, category: "crates" },
  { id: 27, name: "Crate Opener II", description: "Open 10 crates", type: "crates", requirement: 10, trackField: "cratesOpened", reward: { coins: 600, gems: 20, shards: 1 }, category: "crates" },
  { id: 28, name: "Crate Enthusiast", description: "Open 25 crates", type: "crates", requirement: 25, trackField: "cratesOpened", reward: { coins: 1200, gems: 40, shards: 3 }, category: "crates" },
  { id: 29, name: "Crate Master", description: "Open 50 crates", type: "crates", requirement: 50, trackField: "cratesOpened", reward: { coins: 2500, gems: 80, shards: 6 }, category: "crates" },
  
  { id: 30, name: "First Trade", description: "Complete your first trade", type: "trading", requirement: 1, trackField: "tradesCompleted", reward: { coins: 150, gems: 6 }, category: "trading" },
  { id: 31, name: "Merchant I", description: "Complete 5 trades", type: "trading", requirement: 5, trackField: "tradesCompleted", reward: { coins: 400, gems: 15 }, category: "trading" },
  { id: 32, name: "Merchant II", description: "Complete 10 trades", type: "trading", requirement: 10, trackField: "tradesCompleted", reward: { coins: 750, gems: 25, shards: 2 }, category: "trading" },
  { id: 33, name: "Trade Expert", description: "Complete 25 trades", type: "trading", requirement: 25, trackField: "tradesCompleted", reward: { coins: 1500, gems: 50, shards: 4 }, category: "trading" },
  
  { id: 34, name: "Coin Saver I", description: "Accumulate 1000 coins", type: "currency", requirement: 1000, trackField: "coins", reward: { gems: 10 }, category: "economy" },
  { id: 35, name: "Coin Saver II", description: "Accumulate 5000 coins", type: "currency", requirement: 5000, trackField: "coins", reward: { gems: 25, shards: 1 }, category: "economy" },
  { id: 36, name: "Coin Hoarder", description: "Accumulate 10000 coins", type: "currency", requirement: 10000, trackField: "coins", reward: { gems: 50, shards: 3 }, category: "economy" },
  { id: 37, name: "Coin Tycoon", description: "Accumulate 25000 coins", type: "currency", requirement: 25000, trackField: "coins", reward: { gems: 100, shards: 6 }, category: "economy" },
  
  { id: 38, name: "Gem Collector I", description: "Accumulate 100 gems", type: "currency", requirement: 100, trackField: "gems", reward: { coins: 500 }, category: "economy" },
  { id: 39, name: "Gem Collector II", description: "Accumulate 250 gems", type: "currency", requirement: 250, trackField: "gems", reward: { coins: 1200, shards: 1 }, category: "economy" },
  { id: 40, name: "Gem Enthusiast", description: "Accumulate 500 gems", type: "currency", requirement: 500, trackField: "gems", reward: { coins: 2500, shards: 3 }, category: "economy" },
  { id: 41, name: "Gem Master", description: "Accumulate 1000 gems", type: "currency", requirement: 1000, trackField: "gems", reward: { coins: 5000, shards: 6 }, category: "economy" },
  
  { id: 42, name: "Perfectionist", description: "Own a character with 100% ST", type: "special", requirement: 1, trackField: "perfectST", reward: { coins: 2000, gems: 50, shards: 5 }, category: "special" },
  { id: 43, name: "Shard Seeker I", description: "Collect 5 shards", type: "shards", requirement: 5, trackField: "shards", reward: { coins: 500, gems: 15 }, category: "shards" },
  { id: 44, name: "Shard Seeker II", description: "Collect 10 shards", type: "shards", requirement: 10, trackField: "shards", reward: { coins: 1000, gems: 30 }, category: "shards" },
  { id: 45, name: "Shard Collector", description: "Collect 25 shards", type: "shards", requirement: 25, trackField: "shards", reward: { coins: 2500, gems: 60 }, category: "shards" },
  { id: 46, name: "Shard Master", description: "Collect 50 shards", type: "shards", requirement: 50, trackField: "shards", reward: { coins: 5000, gems: 125 }, category: "shards" },
  
  { id: 47, name: "First Boost", description: "Use your first ST Booster", type: "boosting", requirement: 1, trackField: "boostsUsed", reward: { coins: 500, gems: 20 }, category: "boosting" },
  { id: 48, name: "Booster Enthusiast", description: "Use 5 ST Boosters", type: "boosting", requirement: 5, trackField: "boostsUsed", reward: { coins: 1500, gems: 50, shards: 2 }, category: "boosting" },
  { id: 49, name: "Booster Master", description: "Use 10 ST Boosters", type: "boosting", requirement: 10, trackField: "boostsUsed", reward: { coins: 3000, gems: 100, shards: 5 }, category: "boosting" },
  
  { id: 50, name: "Win Streak I", description: "Win 3 battles in a row", type: "special", requirement: 3, trackField: "winStreak", reward: { coins: 400, gems: 15, shards: 1 }, category: "special" },
  { id: 51, name: "Win Streak II", description: "Win 5 battles in a row", type: "special", requirement: 5, trackField: "winStreak", reward: { coins: 800, gems: 30, shards: 3 }, category: "special" },
  { id: 52, name: "Win Streak III", description: "Win 10 battles in a row", type: "special", requirement: 10, trackField: "winStreak", reward: { coins: 2000, gems: 60, shards: 6 }, category: "special" },
  
  { id: 53, name: "Character Releaser", description: "Release a character", type: "special", requirement: 1, trackField: "charsReleased", reward: { coins: 300, gems: 10 }, category: "special" },
  { id: 54, name: "Tyrant Crate Owner", description: "Open a Tyrant Crate", type: "crates", requirement: 1, trackField: "tyrantCratesOpened", reward: { coins: 500, gems: 20, shards: 2 }, category: "crates" },
  
  { id: 55, name: "Team Builder I", description: "Have 3 characters at level 10+", type: "leveling", requirement: 3, trackField: "charsLevel10Plus", reward: { coins: 800, gems: 25, shards: 2 }, category: "leveling" },
  { id: 56, name: "Team Builder II", description: "Have 5 characters at level 10+", type: "leveling", requirement: 5, trackField: "charsLevel10Plus", reward: { coins: 1500, gems: 45, shards: 4 }, category: "leveling" },
  { id: 57, name: "Elite Team", description: "Have 3 characters at level 20+", type: "leveling", requirement: 3, trackField: "charsLevel20Plus", reward: { coins: 2500, gems: 75, shards: 6 }, category: "leveling" },
  
  { id: 58, name: "Battle Veteran", description: "Participate in 50 battles (wins or losses)", type: "battles", requirement: 50, trackField: "totalBattles", reward: { coins: 1500, gems: 40, shards: 4 }, category: "battles" },
  { id: 59, name: "Battle Legend", description: "Participate in 100 battles (wins or losses)", type: "battles", requirement: 100, trackField: "totalBattles", reward: { coins: 3500, gems: 85, shards: 8 }, category: "battles" },
  
  { id: 60, name: "Token Hoarder I", description: "Accumulate 500 total tokens across all characters", type: "special", requirement: 500, trackField: "totalTokens", reward: { coins: 800, gems: 25, shards: 2 }, category: "special" },
  { id: 61, name: "Token Hoarder II", description: "Accumulate 1000 total tokens across all characters", type: "special", requirement: 1000, trackField: "totalTokens", reward: { coins: 1800, gems: 50, shards: 4 }, category: "special" },
  { id: 62, name: "Token Master", description: "Accumulate 2500 total tokens across all characters", type: "special", requirement: 2500, trackField: "totalTokens", reward: { coins: 4000, gems: 100, shards: 8 }, category: "special" },
  
  { id: 63, name: "High Roller", description: "Own a character with 90%+ ST", type: "special", requirement: 1, trackField: "highSTChar", reward: { coins: 1200, gems: 35, shards: 3 }, category: "special" },
  { id: 64, name: "Lucky Streak", description: "Get a character from a crate 3 times", type: "crates", requirement: 3, trackField: "charsFromCrates", reward: { coins: 1500, gems: 45, shards: 4 }, category: "crates" },
  { id: 65, name: "Ultimate Champion", description: "Win a battle with a character at level 30+", type: "special", requirement: 1, trackField: "highLevelWin", reward: { coins: 3000, gems: 80, shards: 8 }, category: "special" }
];

const QUEST_TYPES = ['starter', 'drops', 'battles', 'collection', 'leveling', 'crates', 'trading', 'currency', 'shards', 'boosting', 'special'];
const QUEST_CATEGORIES = ['beginner', 'drops', 'battles', 'collection', 'leveling', 'crates', 'trading', 'economy', 'shards', 'boosting', 'special'];

module.exports = {
  DEFAULT_QUESTS,
  QUEST_TYPES,
  QUEST_CATEGORIES
};
