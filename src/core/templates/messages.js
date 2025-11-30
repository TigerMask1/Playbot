const DEFAULT_MESSAGES = {
  general: {
    prefix: '!',
    botName: 'PlayBot',
    footer: 'Powered by PlayBot',
    errorGeneric: '❌ An error occurred. Please try again.',
    noPermission: '❌ You don\'t have permission to use this command.',
    cooldown: '⏳ Please wait {time} before using this command again.',
    notFound: '❌ {item} not found.',
    invalidArgs: '❌ Invalid arguments. Usage: `{usage}`',
    success: '✅ {action} completed successfully!',
    cancelled: '❌ Action cancelled.'
  },
  
  drops: {
    spawn: '🎁 A wild **{character}** {emoji} appeared! Type `{code}` to catch it!',
    caught: '🎉 {user} caught **{character}** {emoji}! ST: {st}%',
    missed: '💨 The **{character}** got away... Too slow!',
    alreadyCaught: '❌ You already caught this one!',
    wrongCode: '❌ Wrong code! Try again!',
    activated: '✅ Drops activated for {duration}!',
    expired: '⏰ Drops have expired! Use `!paydrops` to reactivate.',
    inactive: '❌ Drops are not active. Use `!paydrops` to activate.',
    paused: '⏸️ Drops paused due to inactivity.',
    resumed: '▶️ Drops resumed!',
    streak: '🔥 **Streak Bonus!** {catches} catches! +{bonus}'
  },
  
  battles: {
    start: '⚔️ Battle between **{player1}** and **{player2}** begins!',
    turnStart: '🎯 **{player}\'s** turn! Choose your move:',
    attack: '💥 **{attacker}** used **{move}** on **{defender}** for **{damage}** damage!',
    heal: '💚 **{player}** used **{move}** and restored **{amount}** HP!',
    miss: '💨 **{attacker}** missed with **{move}**!',
    critical: '⚡ **CRITICAL HIT!** {attacker} dealt **{damage}** damage!',
    win: '🏆 **{winner}** wins the battle!',
    lose: '😔 **{loser}** lost the battle.',
    draw: '🤝 The battle ended in a **draw**!',
    timeout: '⏰ **{player}** ran out of time!',
    forfeit: '🏳️ **{player}** forfeited the battle.',
    noCharacter: '❌ You need to select a character first! Use `!select`',
    alreadyInBattle: '❌ You\'re already in a battle!',
    challengeSent: '⚔️ Challenge sent to **{opponent}**!',
    challengeReceived: '⚔️ **{challenger}** has challenged you to a battle!'
  },
  
  crates: {
    opening: '📦 Opening {crate} crate...',
    gotCharacter: '🎉 You got **{character}** {emoji}! ST: {st}%',
    gotRewards: '🎁 Rewards: {coins} coins, {gems} gems, {tokens} tokens',
    noCrates: '❌ You don\'t have any {crate} crates!',
    purchased: '✅ Purchased {amount}x {crate} crate for {cost} gems!',
    notEnoughGems: '❌ Not enough gems! Need {required}, have {current}.'
  },
  
  quests: {
    completed: '🎉 Quest Completed: **{quest}**!',
    claimed: '✅ Claimed rewards: {rewards}',
    progress: '📊 Quest Progress: {current}/{required}',
    available: '📜 Available Quests: {count}',
    allClaimed: '✅ All quest rewards claimed!',
    noneAvailable: '❌ No quests available right now.'
  },
  
  work: {
    started: '{emoji} Starting work as **{job}**...',
    completed: '✅ Work completed! Earned: {rewards}',
    onCooldown: '⏳ You\'re still tired! Wait {time} before working again.',
    toolBroken: '🔧 Your {tool} broke! Repair it before continuing.',
    levelRequired: '❌ You need to be level {level} to do this job.'
  },
  
  economy: {
    dailyClaimed: '🎁 Daily reward claimed! +{coins} coins, +{gems} gems',
    dailyStreak: '🔥 Streak: {streak} days! Bonus: +{bonus}',
    dailyAlreadyClaimed: '❌ Already claimed today! Come back in {time}.',
    transferred: '💸 Sent {amount} {currency} to **{recipient}**!',
    received: '💰 Received {amount} {currency} from **{sender}**!',
    notEnough: '❌ Not enough {currency}! Need {required}, have {current}.',
    balance: '💰 Balance: {coins} coins, {gems} gems'
  },
  
  trades: {
    initiated: '🤝 Trade initiated with **{partner}**!',
    offerSent: '📤 Trade offer sent!',
    accepted: '✅ Trade completed successfully!',
    declined: '❌ Trade declined.',
    expired: '⏰ Trade offer expired.',
    cancelled: '❌ Trade cancelled.'
  },
  
  leveling: {
    levelUp: '🎉 **LEVEL UP!** {player} reached level **{level}**!',
    milestone: '🏆 **MILESTONE!** Level {level} rewards: {rewards}',
    maxLevel: '⭐ **MAX LEVEL REACHED!** Congratulations!',
    xpGained: '+{xp} XP'
  },
  
  characters: {
    selected: '✅ Selected **{character}** {emoji} as your active character!',
    notOwned: '❌ You don\'t own **{character}**!',
    released: '👋 Released **{character}** {emoji}. Gained: {rewards}',
    boosted: '⬆️ Boosted **{character}**! New ST: {st}%',
    maxBoosts: '❌ **{character}** has reached max boosts ({max}).'
  },
  
  clans: {
    created: '🏰 Clan **{name}** created!',
    joined: '✅ Joined clan **{name}**!',
    left: '👋 Left clan **{name}**.',
    donated: '💰 Donated {amount} to **{clan}**!',
    promoted: '⬆️ **{member}** promoted to {rank}!',
    demoted: '⬇️ **{member}** demoted to {rank}.',
    kicked: '👢 **{member}** was kicked from the clan.'
  },
  
  events: {
    started: '🎉 Event **{event}** has started!',
    ended: '🏁 Event **{event}** has ended!',
    participating: '✅ You\'re now participating in **{event}**!',
    won: '🏆 Congratulations! You won **{event}**!',
    rewards: '🎁 Event rewards: {rewards}'
  },
  
  minigames: {
    won: '🎉 You won! +{amount} {currency}',
    lost: '😔 You lost! -{amount} {currency}',
    draw: '🤝 It\'s a draw!',
    invalidBet: '❌ Invalid bet amount. Min: {min}, Max: {max}'
  },
  
  embeds: {
    color: '#00D9FF',
    profileTitle: '{username}\'s Profile',
    inventoryTitle: '{username}\'s Inventory',
    leaderboardTitle: '🏆 Leaderboard',
    shopTitle: '🛒 Shop',
    questsTitle: '📜 Quests',
    helpTitle: '📚 Help'
  }
};

module.exports = {
  DEFAULT_MESSAGES
};
