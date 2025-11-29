const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'settings',
  description: 'View server settings',
  async execute(context, services) {
    const { message, guildId, tenant } = context;
    const { permissionService } = services;

    try {
      // Check if user is admin
      const isAdmin = await permissionService.hasPermission(
        message.author.id,
        guildId,
        'MANAGE_SERVER'
      );

      if (!isAdmin) {
        return message.reply('❌ You need admin permissions to view settings.');
      }

      const embed = new EmbedBuilder()
        .setColor('#ffaa00')
        .setTitle('⚙️ Server Settings')
        .addFields(
          { name: 'Server Name', value: tenant.name || 'Not set', inline: false },
          { name: 'Currency Name', value: tenant.settings.currencyName || 'Coins', inline: true },
          { name: 'Gem Name', value: tenant.settings.gemName || 'Gems', inline: true },
          { name: 'Members', value: String(tenant.settings.memberCount || 0), inline: true },
          { name: 'Last Updated', value: new Date(tenant.updatedAt).toLocaleString(), inline: false },
          { name: 'Customize', value: '🔗 Use `/dashboard` to manage all settings', inline: false }
        )
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Settings command error:', error);
      return message.reply('❌ Failed to load settings.');
    }
  }
};
