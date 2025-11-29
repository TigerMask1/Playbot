const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Show available commands',
  async execute(context, services) {
    const { message } = context;

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🎮 PlayBot Commands')
      .setDescription('Use `!command` to run a command')
      .addFields(
        { name: 'Profile', value: '`!profile` - View your profile', inline: false },
        { name: 'Dashboard', value: '`!dashboard` - Get dashboard link', inline: false },
        { name: 'About', value: '`!about` - About PlayBot', inline: false },
        { name: 'Settings', value: '`!settings` - Server settings', inline: false }
      )
      .setFooter({ text: 'Manage all features via the web dashboard' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
