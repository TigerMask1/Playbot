const { Client, GatewayIntentBits, Collection } = require('discord.js');
const TenantService = require('../services/TenantService');
const CurrencyService = require('../services/CurrencyService');
const PermissionService = require('../services/PermissionService');
const AuditService = require('../services/AuditService');

class BotClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
      ]
    });

    this.commands = new Collection();
    this.services = {
      tenantService: new TenantService(),
      currencyService: new CurrencyService(),
      permissionService: new PermissionService(),
      auditService: new AuditService()
    };

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.on('ready', () => {
      console.log(`🤖 Discord Bot logged in as ${this.user.tag}`);
    });

    this.on('error', error => {
      console.error('Discord Bot error:', error);
    });
  }

  async ensureTenantExists(guildId, guildName) {
    try {
      const tenant = await this.services.tenantService.getTenant(guildId);
      if (!tenant) {
        console.log(`📦 Setting up new tenant for guild: ${guildName}`);
        await this.services.tenantService.createTenant(guildId, guildName);
      }
      return await this.services.tenantService.getTenant(guildId);
    } catch (error) {
      console.error(`Failed to ensure tenant for ${guildId}:`, error);
      return null;
    }
  }

  registerCommand(name, execute) {
    this.commands.set(name.toLowerCase(), { name, execute });
  }

  async executeCommand(commandName, context) {
    const command = this.commands.get(commandName.toLowerCase());
    if (!command) return false;

    try {
      await command.execute(context, this.services);
      return true;
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      return false;
    }
  }

  getCommand(name) {
    return this.commands.get(name.toLowerCase());
  }

  getAllCommands() {
    return Array.from(this.commands.values());
  }
}

module.exports = BotClient;
