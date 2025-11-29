const BotClient = require('./client');

class BotHandler {
  constructor() {
    this.client = new BotClient();
    this.setupMessageHandlers();
  }

  setupMessageHandlers() {
    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      if (!message.content.startsWith('!')) return;

      const args = message.content.slice(1).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      // Ensure tenant exists
      const tenant = await this.client.ensureTenantExists(
        message.guildId,
        message.guild?.name || 'Unknown Guild'
      );

      if (!tenant) {
        return message.reply('❌ Failed to set up server. Please try again.');
      }

      // Create execution context
      const context = {
        message,
        guild: message.guild,
        author: message.author,
        args,
        tenant,
        guildId: message.guildId,
        userId: message.author.id
      };

      // Execute command
      const success = await this.client.executeCommand(commandName, context);
      
      if (!success) {
        return message.reply(`❌ Unknown command: \`!${commandName}\`. Try \`!help\` for available commands.`);
      }
    });

    this.client.on('guildCreate', async (guild) => {
      console.log(`✨ Bot joined guild: ${guild.name} (${guild.id})`);
      await this.client.ensureTenantExists(guild.id, guild.name);
    });
  }

  async start() {
    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
      console.log('✅ Discord Bot connected');
      return this.client;
    } catch (error) {
      console.error('Failed to start Discord Bot:', error);
      throw error;
    }
  }

  getClient() {
    return this.client;
  }
}

module.exports = BotHandler;
