const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'profile',
  description: 'View your player profile',
  async execute(context, services) {
    const { message, userId, tenant, guildId } = context;
    const { tenantService, currencyService } = services;

    try {
      // Get player data
      const playerKey = `player_${guildId}_${userId}`;
      const playerData = await tenantService.getPlayerData(guildId, userId);

      if (!playerData) {
        return message.reply('❌ No player profile found. Use `!create` to start!');
      }

      // Get currency balance
      const balance = await currencyService.getServerBalance(guildId, userId);

      // Create embed
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`📊 ${playerData.username}'s Profile`)
        .addFields(
          { name: 'Level', value: String(playerData.level || 1), inline: true },
          { name: 'XP', value: String(playerData.xp || 0), inline: true },
          { name: 'Characters', value: String(playerData.characters?.length || 0), inline: true },
          { name: tenant.settings.currencyName || 'Coins', value: String(balance.coins || 0), inline: true },
          { name: tenant.settings.gemName || 'Gems', value: String(balance.gems || 0), inline: true },
          { name: 'Join Date', value: new Date(playerData.createdAt).toLocaleDateString(), inline: true }
        )
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Profile command error:', error);
      return message.reply('❌ Failed to load profile.');
    }
  }
};
