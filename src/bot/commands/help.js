const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Show available commands',
  async execute(context, services) {
    const { message } = context;

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🎮 PlayBot Commands')
      .setDescription('All available Discord bot commands')
      .addFields(
        { 
          name: '📊 Profile', 
          value: '`!profile` - View your player profile\nShows balance, user info, and server details', 
          inline: false 
        },
        { 
          name: '🎮 Dashboard', 
          value: '`!dashboard` - Get web dashboard link\nAccess full management interface (admins only)', 
          inline: false 
        },
        { 
          name: 'ℹ️ About', 
          value: '`!about` - Learn about PlayBot\nVersion, features, and status info', 
          inline: false 
        },
        { 
          name: '⚙️ Settings', 
          value: '`!settings` - View server settings\nRequires admin permissions', 
          inline: false 
        },
        { 
          name: '❓ Help', 
          value: '`!help` - Show this message\nList all commands and descriptions', 
          inline: false 
        }
      )
      .addFields(
        { 
          name: '💡 Pro Tips', 
          value: '• Use `/dashboard` in Discord for one-click access\n• Admins can customize everything via the web interface\n• All game systems work across the same platform', 
          inline: false 
        }
      )
      .setFooter({ text: 'PlayBot v2.0 - Multi-Tenant Discord Bot Platform' })
      .setTimestamp();

    return message.reply({ embeds: [embed] });
  }
};
