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
        { name: '📦 Version', value: '2.0.0 - Multi-Tenant Platform', inline: true },
        { name: '✅ Status', value: 'Active & Maintained', inline: true },
        { name: '🏗️ Architecture', value: 'Web Dashboard + Discord Bot + MongoDB', inline: false },
        { 
          name: '⭐ Key Features', 
          value: '✨ **50+ Characters** - Pre-loaded character system\n⚡ **Battle System** - Configure mechanics and rewards\n💰 **Economy** - Global and server-specific currency\n🎁 **Drops & Crates** - Configurable drop rates\n📜 **Quests** - Create custom questlines\n🎯 **Jobs** - Work system with daily rewards\n🎉 **Events** - Schedule and manage special events\n👥 **Trading** - Player-to-player exchanges\n⚔️ **PvP** - Battle and dueling system', 
          inline: false 
        },
        { 
          name: '🔗 Links', 
          value: '[Production Dashboard](https://playbot-tajy.onrender.com)\n[GitHub](https://github.com)\n[Support](https://discord.gg)', 
          inline: false 
        },
        { 
          name: '🛠️ Technology', 
          value: 'Built with discord.js, Node.js, and MongoDB', 
          inline: true 
        },
        { 
          name: '👥 Multi-Tenant', 
          value: 'Each Discord server gets isolated customization', 
          inline: true 
        }
      )
      .setFooter({ text: 'PlayBot - Making Discord bots customizable for everyone' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
