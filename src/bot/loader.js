const fs = require('fs');
const path = require('path');

async function loadBotCommands(botClient) {
  const commandsDir = path.join(__dirname, 'commands');
  
  if (!fs.existsSync(commandsDir)) {
    console.warn('⚠️ Commands directory not found');
    return 0;
  }

  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
  let loadedCount = 0;

  for (const file of files) {
    try {
      const command = require(path.join(commandsDir, file));
      if (command.name && command.execute) {
        botClient.registerCommand(command.name, command.execute);
        loadedCount++;
        console.log(`✅ Loaded command: ${command.name}`);
      }
    } catch (error) {
      console.error(`Failed to load command ${file}:`, error);
    }
  }

  console.log(`📝 Loaded ${loadedCount} bot commands`);
  return loadedCount;
}

module.exports = { loadBotCommands };
