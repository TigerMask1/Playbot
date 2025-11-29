const BotClient = require('./client');

/**
 * BotHandler - Manages Discord bot lifecycle and message routing
 * Handles: Authentication, message listening, command routing, tenant setup
 */
class BotHandler {
  constructor() {
    this.client = new BotClient();
    this.setupMessageHandlers();
  }

  /**
   * Setup all Discord event listeners
   */
  setupMessageHandlers() {
    // Message Create - Route commands
    this.client.on('messageCreate', async (message) => {
      // Ignore bot messages and non-command messages
      if (message.author.bot) return;
      if (!message.content.startsWith('!')) return;

      try {
        // Parse command
        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Ensure server is configured as a tenant
        const tenant = await this.client.ensureTenantExists(
          message.guildId,
          message.guild?.name || 'Unknown Guild'
        );

        if (!tenant) {
          return message.reply(
            '❌ Failed to set up server. Please use the web dashboard to configure.\n' +
            '🌐 Visit: https://playbot-tajy.onrender.com'
          );
        }

        // Create execution context with full data
        const context = {
          message,
          guild: message.guild,
          member: message.member,
          author: message.author,
          args,
          tenant,
          guildId: message.guildId,
          userId: message.author.id,
          isAdmin: message.member?.permissions.has('ADMINISTRATOR') || false
        };

        // Execute command
        const success = await this.client.executeCommand(commandName, context);
        
        if (!success) {
          return message.reply(
            `❌ Unknown command: \`!${commandName}\`\n` +
            `Use \`!help\` to see available commands.`
          );
        }
      } catch (error) {
        console.error('Error handling message:', error);
        return message.reply('❌ Error processing command. Try again later.').catch(() => {});
      }
    });

    // Guild Create - New server joined
    this.client.on('guildCreate', async (guild) => {
      console.log(`\n✨ Bot joined guild: ${guild.name} (${guild.id})`);
      console.log(`   👥 Members: ${guild.memberCount}`);
      
      try {
        const tenant = await this.client.ensureTenantExists(guild.id, guild.name);
        if (tenant) {
          console.log(`   ✅ Tenant configured automatically`);
        }
      } catch (error) {
        console.error(`Failed to setup tenant for ${guild.id}:`, error);
      }
    });

    // Guild Delete - Bot removed from server
    this.client.on('guildDelete', (guild) => {
      console.log(`\n👋 Bot removed from guild: ${guild.name} (${guild.id})`);
    });

    // Error handler
    this.client.on('error', error => {
      console.error('🔴 Discord Client Error:', error);
    });
  }

  /**
   * Start the Discord bot
   * @returns {Promise<BotClient>} The connected bot client
   */
  async start() {
    try {
      if (!process.env.DISCORD_BOT_TOKEN) {
        throw new Error('DISCORD_BOT_TOKEN environment variable not set');
      }

      console.log('\n🤖 Starting Discord Bot...');
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
      
      // Wait for ready event
      await new Promise(resolve => {
        const handler = () => {
          this.client.removeListener('ready', handler);
          resolve();
        };
        this.client.on('ready', handler);
      });

      console.log('✅ Discord Bot started successfully');
      return this.client;
    } catch (error) {
      console.error('🔴 Failed to start Discord Bot:', error.message);
      throw error;
    }
  }

  /**
   * Get the bot client instance
   * @returns {BotClient} The bot client
   */
  getClient() {
    return this.client;
  }

  /**
   * Stop the bot gracefully
   */
  async stop() {
    try {
      console.log('\n🛑 Stopping Discord Bot...');
      await this.client.destroy();
      console.log('✅ Discord Bot stopped');
    } catch (error) {
      console.error('Error stopping bot:', error);
    }
  }
}

module.exports = BotHandler;
