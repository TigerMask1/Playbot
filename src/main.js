require('dotenv').config();

const { startServer } = require('./api/server');
const { connect, disconnect } = require('./core/database');
const BotHandler = require('./bot/handler');
const { loadBotCommands } = require('./bot/loader');

console.log('\n🎮 Starting PlayBot Platform v2.0...');
console.log('═══════════════════════════════════════');

let botHandler = null;

async function main() {
  try {
    // 1. Connect to database
    console.log('\n📊 Connecting to MongoDB...');
    await connect();
    console.log('✅ Database connected successfully');
    
    // 2. Start API Dashboard on port 5000
    console.log('\n🌐 Starting API Dashboard Server...');
    await startServer();
    console.log('✅ Dashboard API started on port 5000');
    
    // 3. Start Discord Bot (Optional - graceful fallback if no token)
    if (process.env.DISCORD_BOT_TOKEN) {
      try {
        console.log('\n🤖 Starting Discord Bot...');
        botHandler = new BotHandler();
        await botHandler.start();
        
        // Load commands
        console.log('\n📝 Loading bot commands...');
        await loadBotCommands(botHandler.getClient());
        
        console.log('✅ Discord Bot ready for commands');
      } catch (botError) {
        console.warn('\n⚠️ Discord Bot failed to start:', botError.message);
        console.log('ℹ️ Dashboard will continue running in API-only mode');
        console.log('ℹ️ To enable bot: Set DISCORD_BOT_TOKEN in secrets and restart');
      }
    } else {
      console.warn('\n⚠️ DISCORD_BOT_TOKEN not set - bot disabled');
      console.log('ℹ️ Dashboard API running in web-only mode');
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('🚀 PlayBot Platform is running!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Dashboard: http://localhost:${process.env.PORT || 5000}`);
    console.log(`🔗 Production: https://playbot-tajy.onrender.com`);
    if (botHandler) {
      console.log(`🤖 Discord Bot: Connected & Listening for commands`);
      console.log(`   Commands: !help, !profile, !dashboard, !about, !settings`);
    }
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Failed to start PlayBot Platform:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down PlayBot Platform...');
  
  try {
    if (botHandler) {
      await botHandler.stop();
    }
    await disconnect();
    console.log('✅ PlayBot shut down gracefully');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('unhandledRejection', (error) => {
  console.error('🔴 Unhandled Promise Rejection:', error);
});

// Start the platform
main();
