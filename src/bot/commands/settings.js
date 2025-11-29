const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'settings',
  description: 'View server settings',
  async execute(context, services) {
    const { message, guildId } = context;
    const { TenantService, PermissionService, PERMISSIONS } = services;

    try {
      // Check if user is admin
      const hasPermission = await PermissionService.hasPermission(
        message.author.id,
        guildId,
        PERMISSIONS.MANAGE_SERVER
      );

      if (!hasPermission && !message.member?.permissions.has('ADMINISTRATOR')) {
        return message.reply('❌ You need admin permissions to view settings.');
      }

      // Get server config
      const config = await TenantService.getServerConfig(guildId);
      if (!config) {
        return message.reply('❌ Server not configured. Please use the dashboard to set up.');
      }

      const embed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle(`⚙️ Server Settings - ${config.serverName}`)
        .addFields(
          { name: 'Server ID', value: guildId, inline: true },
          { name: 'Owner', value: config.ownerName || 'Unknown', inline: true },
          { name: 'Status', value: '✅ Configured', inline: true },
          { name: 'Currency Name', value: config.economy?.currencyName || 'Coins', inline: true },
          { name: 'Gem Name', value: config.economy?.gemName || 'Gems', inline: true },
          { name: 'Drop Channel', value: config.settings?.dropChannel || 'Not set', inline: true },
          { name: 'Members', value: String(message.guild.memberCount), inline: true },
          { name: 'Last Updated', value: new Date(config.updatedAt).toLocaleString(), inline: true },
          { name: '⚠️ Important', value: 'To modify settings, visit the web dashboard and authenticate with Discord OAuth', inline: false }
        )
        .setThumbnail(message.guild.iconURL())
        .setFooter({ text: 'Use !dashboard for full management' })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Settings command error:', error);
      return message.reply('❌ Failed to load settings. Try again later.');
    }
  }
};
