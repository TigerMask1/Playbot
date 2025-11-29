const fs = require('fs');
const path = require('path');

/**
 * Dynamically loads all bot commands from the commands directory
 * @param {BotClient} botClient - The bot client instance
 * @returns {Promise<number>} Number of commands loaded
 */
async function loadBotCommands(botClient) {
  const commandsDir = path.join(__dirname, 'commands');
  
  if (!fs.existsSync(commandsDir)) {
    console.warn('⚠️ Commands directory not found at', commandsDir);
    return 0;
  }

  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
  let loadedCount = 0;
  let failedCount = 0;

  console.log(`\n📂 Loading bot commands from ${commandsDir}...`);

  for (const file of files) {
    try {
      const commandPath = path.join(commandsDir, file);
      const command = require(commandPath);
      
      if (!command.name) {
        console.error(`❌ Command "${file}" missing name property`);
        failedCount++;
        continue;
      }

      if (!command.execute || typeof command.execute !== 'function') {
        console.error(`❌ Command "${command.name}" missing execute function`);
        failedCount++;
        continue;
      }

      const registered = botClient.registerCommand(command.name, command);
      if (registered) {
        loadedCount++;
        console.log(`   ✅ Loaded: ${command.name} - ${command.description || 'No description'}`);
      } else {
        failedCount++;
      }
    } catch (error) {
      console.error(`❌ Failed to load command from ${file}:`, error.message);
      failedCount++;
    }
  }

  console.log(`\n📊 Command Loading Summary:`);
  console.log(`   ✅ Loaded: ${loadedCount}`);
  if (failedCount > 0) console.log(`   ❌ Failed: ${failedCount}`);
  console.log(`   📝 Total: ${loadedCount} commands ready\n`);
  
  return loadedCount;
}

module.exports = { loadBotCommands };
