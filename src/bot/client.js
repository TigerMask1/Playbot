const { Client, GatewayIntentBits, Collection } = require('discord.js');
const TenantService = require('../services/TenantService');
const { CurrencyService, CURRENCY_ACTIONS } = require('../services/CurrencyService');
const { PermissionService, PERMISSIONS } = require('../services/PermissionService');
const { createAuditLog, getAuditLogs } = require('../services/AuditService');

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
    
    // Services as static references, NOT instances
    this.services = {
      TenantService,
      CurrencyService,
      PermissionService,
      createAuditLog,
      getAuditLogs,
      CURRENCY_ACTIONS,
      PERMISSIONS
    };

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.on('ready', () => {
      console.log(`🤖 Discord Bot logged in as ${this.user.tag}`);
      console.log(`📡 Connected to ${this.guilds.cache.size} guilds`);
    });

    this.on('error', error => {
      console.error('🔴 Discord Bot error:', error);
    });

    this.on('warn', warning => {
      console.warn('⚠️ Discord Bot warning:', warning);
    });
  }

  async ensureTenantExists(guildId, guildName) {
    try {
      const config = await TenantService.getServerConfig(guildId);
      
      if (!config) {
        console.log(`📦 Setting up new server tenant: ${guildName} (${guildId})`);
        const result = await TenantService.createServerConfig(guildId, guildName, null, 'System');
        if (!result.success) {
          console.error(`Failed to create tenant: ${result.message}`);
          return null;
        }
        return result.config;
      }
      
      return config;
    } catch (error) {
      console.error(`❌ Failed to ensure tenant for ${guildId}:`, error);
      return null;
    }
  }

  registerCommand(name, command) {
    if (!command.execute || typeof command.execute !== 'function') {
      console.error(`❌ Command "${name}" missing execute function`);
      return false;
    }
    this.commands.set(name.toLowerCase(), { name, ...command });
    return true;
  }

  async executeCommand(commandName, context) {
    const command = this.commands.get(commandName.toLowerCase());
    if (!command) return false;

    try {
      await command.execute(context, this.services);
      return true;
    } catch (error) {
      console.error(`🔴 Error executing command "${commandName}":`, error);
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
