require('dotenv').config();

const { startServer } = require('./api/server');
const { connect } = require('./core/database');
const BotHandler = require('./bot/handler');
const { loadBotCommands } = require('./bot/loader');

console.log('🎮 Starting PlayBot Platform...');
console.log('================================');

async function main() {
  try {
    // Connect to database
    await connect();
    console.log('✅ Database connection established');
    
    // Start API Dashboard on port 5000
    await startServer();
    console.log('✅ Dashboard API started');
    
    // Start Discord Bot
    if (process.env.DISCORD_BOT_TOKEN) {
      try {
        const botHandler = new BotHandler();
        await botHandler.start();
        
        // Load commands
        await loadBotCommands(botHandler.getClient());
        
        console.log('✅ Discord Bot connected and ready');
      } catch (botError) {
        console.warn('⚠️ Bot failed to start (optional):', botError.message);
        console.log('ℹ️ Dashboard will still run without bot');
      }
    } else {
      console.warn('⚠️ DISCORD_BOT_TOKEN not set - bot disabled');
      console.log('ℹ️ Dashboard running in API-only mode');
    }
    
    console.log('================================');
    console.log('🚀 PlayBot Platform is running!');
    console.log(`📊 Dashboard: http://localhost:${process.env.PORT || 5000}`);
    console.log('================================');
    
  } catch (error) {
    console.error('❌ Failed to start PlayBot:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  const { disconnect } = require('./core/database');
  await disconnect();
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

main();
