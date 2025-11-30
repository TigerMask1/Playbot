const DEFAULT_MINIGAMES = {
  enabled: true,
  
  coinDuel: {
    enabled: true,
    name: 'Coin Duel',
    emoji: '🪙',
    description: 'Flip a coin against another player!',
    minBet: 10,
    maxBet: 10000,
    cooldown: 30000,
    winMultiplier: 2,
    houseEdge: 0,
    messages: {
      start: '🪙 **Coin Duel!** {player1} vs {player2} for {bet} coins!',
      flip: '🪙 The coin is flipping...',
      win: '🎉 **{winner}** wins {amount} coins!',
      draw: '🤝 It\'s a tie! Coins returned.'
    }
  },
  
  diceClash: {
    enabled: true,
    name: 'Dice Clash',
    emoji: '🎲',
    description: 'Roll dice against another player!',
    minBet: 10,
    maxBet: 5000,
    cooldown: 30000,
    winMultiplier: 2,
    diceCount: 2,
    diceSides: 6,
    messages: {
      start: '🎲 **Dice Clash!** {player1} vs {player2} for {bet} coins!',
      roll: '🎲 Rolling dice...',
      result: '{player} rolled {roll}!',
      win: '🎉 **{winner}** wins with {roll}! Won {amount} coins!',
      draw: '🤝 It\'s a tie ({roll})! Coins returned.'
    }
  },
  
  doorOfFate: {
    enabled: true,
    name: 'Door of Fate',
    emoji: '🚪',
    description: 'Choose a door for a chance at prizes!',
    cost: 50,
    costType: 'coins',
    cooldown: 60000,
    doors: 3,
    prizes: [
      { type: 'coins', amount: { min: 10, max: 50 }, chance: 40 },
      { type: 'coins', amount: { min: 100, max: 200 }, chance: 25 },
      { type: 'gems', amount: { min: 1, max: 5 }, chance: 20 },
      { type: 'crate', crateType: 'bronze', chance: 10 },
      { type: 'nothing', chance: 5 }
    ],
    messages: {
      start: '🚪 **Door of Fate!** Choose a door (1-{doors})...',
      choosing: '🚪 Opening door {door}...',
      won: '🎉 Behind door {door}: {prize}!',
      lost: '😔 Door {door} was empty... Better luck next time!'
    }
  },
  
  rockPaperScissors: {
    enabled: true,
    name: 'Rock Paper Scissors',
    emoji: '✊',
    description: 'Classic RPS game!',
    minBet: 10,
    maxBet: 5000,
    cooldown: 30000,
    winMultiplier: 2,
    choices: ['rock', 'paper', 'scissors'],
    choiceEmojis: { rock: '🪨', paper: '📄', scissors: '✂️' },
    messages: {
      start: '✊ **Rock Paper Scissors!** {player1} vs {player2} for {bet} coins!',
      choose: 'Make your choice!',
      reveal: '{player1} chose {choice1}, {player2} chose {choice2}!',
      win: '🎉 **{winner}** wins! {winChoice} beats {loseChoice}!',
      draw: '🤝 Both chose {choice}! It\'s a draw!'
    }
  },
  
  slotMachine: {
    enabled: true,
    name: 'Slot Machine',
    emoji: '🎰',
    description: 'Spin the slots for big wins!',
    minBet: 10,
    maxBet: 1000,
    cooldown: 10000,
    symbols: ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'],
    payouts: {
      '🍒🍒🍒': 3,
      '🍋🍋🍋': 5,
      '🍊🍊🍊': 8,
      '🍇🍇🍇': 10,
      '💎💎💎': 25,
      '7️⃣7️⃣7️⃣': 100,
      'two_match': 1.5
    },
    messages: {
      spin: '🎰 Spinning...',
      result: '🎰 | {slot1} | {slot2} | {slot3} |',
      jackpot: '🎉 **JACKPOT!** You won {amount} coins!',
      win: '✨ You won {amount} coins!',
      lose: '😔 No match. Better luck next time!'
    }
  },
  
  trivia: {
    enabled: true,
    name: 'Trivia',
    emoji: '🧠',
    description: 'Answer questions for rewards!',
    answerTime: 30000,
    cooldown: 60000,
    rewards: {
      easy: { coins: { min: 20, max: 50 }, xp: { min: 5, max: 10 } },
      medium: { coins: { min: 50, max: 100 }, xp: { min: 10, max: 20 } },
      hard: { coins: { min: 100, max: 200 }, xp: { min: 20, max: 40 } }
    },
    streakBonus: {
      enabled: true,
      multiplier: 0.1,
      maxStreak: 10
    },
    messages: {
      question: '🧠 **Trivia!** {question}',
      correct: '✅ Correct! +{coins} coins, +{xp} XP',
      wrong: '❌ Wrong! The answer was: {answer}',
      timeout: '⏰ Time\'s up! The answer was: {answer}',
      streak: '🔥 Streak: {streak}! Bonus: +{bonus}%'
    }
  },
  
  wheelOfFortune: {
    enabled: true,
    name: 'Wheel of Fortune',
    emoji: '🎡',
    description: 'Spin the wheel for prizes!',
    cost: 100,
    costType: 'coins',
    cooldown: 300000,
    segments: [
      { prize: 'coins', amount: 50, color: '#FF0000', chance: 20 },
      { prize: 'coins', amount: 100, color: '#00FF00', chance: 18 },
      { prize: 'coins', amount: 200, color: '#0000FF', chance: 15 },
      { prize: 'coins', amount: 500, color: '#FFFF00', chance: 12 },
      { prize: 'gems', amount: 5, color: '#FF00FF', chance: 12 },
      { prize: 'gems', amount: 10, color: '#00FFFF', chance: 8 },
      { prize: 'gems', amount: 25, color: '#FFA500', chance: 5 },
      { prize: 'crate', crateType: 'bronze', color: '#8B4513', chance: 5 },
      { prize: 'crate', crateType: 'silver', color: '#C0C0C0', chance: 3 },
      { prize: 'jackpot', amount: 1000, color: '#FFD700', chance: 2 }
    ],
    messages: {
      spin: '🎡 Spinning the wheel...',
      result: '🎡 The wheel landed on: {prize}!',
      jackpot: '🎉 **JACKPOT!** You won {amount} coins!'
    }
  }
};

module.exports = {
  DEFAULT_MINIGAMES
};
