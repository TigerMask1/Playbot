require('dotenv').config();

const { startServer } = require('./api/server');
const { connect } = require('./core/database');

console.log('🎮 Starting PlayBot Platform...');
console.log('================================');

async function main() {
  try {
    await connect();
    console.log('✅ Database connection established');
    
    await startServer();
    
    console.log('================================');
    console.log('🚀 PlayBot Platform is running!');
    console.log(`📊 Dashboard: http://localhost:${process.env.PORT || 5000}`);
    
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
