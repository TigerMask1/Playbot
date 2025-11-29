const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'dashboard',
  description: 'Get the web dashboard link',
  async execute(context, services) {
    const { message } = context;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🎮 PlayBot Dashboard')
      .setDescription('Access the complete PlayBot management interface')
      .addFields(
        { name: 'Production', value: 'https://playbot-tajy.onrender.com', inline: false },
        { name: 'Development', value: 'http://localhost:5000', inline: false },
        { name: 'Features', value: 'Characters • Economy • Battles • Quests • Events • and more!', inline: false }
      )
      .setFooter({ text: 'Your server admin can customize everything via the dashboard' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
