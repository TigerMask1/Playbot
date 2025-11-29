const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'profile',
  description: 'View your player profile',
  async execute(context, services) {
    const { message, userId, guildId } = context;
    const { TenantService, CurrencyService } = services;

    try {
      // Get server config
      const config = await TenantService.getServerConfig(guildId);
      if (!config) {
        return message.reply('❌ Server not configured. Admin must run `/setup` via dashboard.');
      }

      // Get currency balance using static method
      const balance = await CurrencyService.getServerBalance(userId, guildId);

      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`📊 Player Profile`)
        .setThumbnail(message.author.displayAvatarURL())
        .addFields(
          { name: 'Discord User', value: `${message.author.username}#${message.author.discriminator || '0'}`, inline: false },
          { name: 'User ID', value: userId, inline: true },
          { name: 'Server', value: config.serverName || 'Unknown', inline: true },
          { name: config.economy?.currencyName || 'Coins', value: String(balance.coins || 0), inline: true },
          { name: config.economy?.gemName || 'Gems', value: String(balance.gems || 0), inline: true }
        )
        .setFooter({ text: 'Use /dashboard to view full profile' })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Profile command error:', error);
      return message.reply('❌ Failed to load profile. Try again later.');
    }
  }
};
