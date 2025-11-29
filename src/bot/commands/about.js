const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'about',
  description: 'About PlayBot',
  async execute(context, services) {
    const { message } = context;

    const embed = new EmbedBuilder()
      .setColor('#9900ff')
      .setTitle('🎮 About PlayBot')
      .setDescription('The Ultimate Customizable Discord Bot Platform')
      .addFields(
        { name: 'Version', value: '2.0.0 - Multi-Tenant Platform', inline: true },
        { name: 'Status', value: '✅ Active', inline: true },
        { name: 'Architecture', value: 'Web Dashboard + Discord Bot + MongoDB', inline: false },
        { name: 'Features', value: '✨ 50+ Characters\n⚡ Battle System\n💰 Economy\n🎁 Drops & Crates\n⚔️ Pvp & Trading', inline: false },
        { name: 'Dashboard', value: 'https://playbot-tajy.onrender.com', inline: false }
      )
      .setFooter({ text: 'Created with discord.js & Node.js' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
