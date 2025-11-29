const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'dashboard',
  description: 'Get the web dashboard link',
  async execute(context, services) {
    const { message } = context;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🎮 PlayBot Dashboard')
      .setDescription('The complete server management interface')
      .addFields(
        { 
          name: '🌐 Production Dashboard', 
          value: '[https://playbot-tajy.onrender.com](https://playbot-tajy.onrender.com)', 
          inline: false 
        },
        { 
          name: '💻 Local Dashboard (Dev)', 
          value: 'http://localhost:5000', 
          inline: false 
        },
        { 
          name: '📋 Accessible Features', 
          value: '✨ Character Management\n⚡ Battle Configuration\n💰 Economy Settings\n🎁 Drop & Crate Setup\n📜 Quest Creation\n🎯 Job Management\n🎉 Event Scheduling\n👥 Player Management\n📊 Audit Logs\n⚙️ Server Settings', 
          inline: false 
        },
        { 
          name: '🔐 Access Level', 
          value: 'Server Admins and Owners can customize everything', 
          inline: false 
        }
      )
      .setFooter({ text: 'Login with Discord OAuth to access dashboard' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
