import { 
  CommandInteraction, 
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js';
import { STARKNET_LOGO_URL } from '../constants';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Get help with bot commands')
  .addStringOption(option =>
    option
      .setName('command')
      .setDescription('Get detailed help for a specific command')
      .setRequired(false)
      .addChoices(
        { name: 'poll', value: 'poll' },
        { name: 'info', value: 'info' },
        { name: 'help', value: 'help' }
      )
  );

const commandHelp = {
  createpoll: {
    title: '📊 Create Poll Command Help',
    description: 'Create a private, on-chain poll with multiple options.',
    usage: '`/poll question:"Your question" options:"Option1,Option2,Option3" duration:1440`',
    fields: [
      {
        name: '📝 Parameters',
        value: '• `question`: The poll question (required)\n• `options`: Comma-separated list of options (required)\n• `duration`: Poll duration in minutes (required)'
      },
      {
        name: '🔒 Privacy Features',
        value: '• Uses Ring Signatures for private polling\n• Prevents double voting while maintaining privacy\n• Vote verification without identity disclosure'
      },
      {
        name: '⛓️ Blockchain Integration',
        value: '• All votes are recorded on Starknet\n• Results accessible via smart contracts\n• Enables private reward distribution'
      },
      {
        name: '⚠️ Limitations',
        value: '• Maximum 20 options per poll\n• Duration between 1 minute and 30 days\n• Rate limits apply to prevent spam'
      }
    ]
  },
  info: {
    title: 'ℹ️ Info Command Help',
    description: 'Display information about the Starknet Polling Bot.',
    usage: '`/info`',
    fields: [
      {
        name: '📋 Overview',
        value: 'Shows comprehensive information about:\n• Bot features and capabilities\n• Privacy and security features\n• On-chain functionality\n• Example use cases'
      }
    ]
  },
  help: {
    title: '❓ Help Command Help',
    description: 'Get help with bot commands.',
    usage: '`/help [command]`',
    fields: [
      {
        name: '📋 Usage Options',
        value: '• `/help` - Show all available commands\n• `/help command:poll` - Get detailed help for the poll command\n• `/help command:info` - Get help about the info command'
      }
    ]
  }
};

export const execute = async (interaction: CommandInteraction) => {
  try {
    const specificCommand = interaction.options.get('command')?.value as string | undefined;

    if (specificCommand) {
      // Show help for specific command
      const help = commandHelp[specificCommand as keyof typeof commandHelp];
      const embed = new EmbedBuilder()
        .setTitle(help.title)
        .setColor('#0099ff')
        .setDescription(help.description + '\n\n**Usage:**\n' + help.usage);

      help.fields.forEach(field => embed.addFields(field));

      embed.setFooter({
        text: 'Powered by Starknet',
        iconURL: STARKNET_LOGO_URL
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      // Show general help
      const embed = new EmbedBuilder()
        .setTitle('❓ Starknet Polling Bot Help')
        .setColor('#0099ff')
        .setDescription('Welcome to the Starknet Polling Bot! Here are the available commands:')
        .addFields(
          {
            name: '📊 /createpoll',
            value: 'Create a private, on-chain poll\nUsage: `/help command:poll` for details'
          },
          {
            name: 'ℹ️ /info',
            value: 'Learn about the bot and its features\nUsage: `/help command:info` for details'
          },
          {
            name: '❓ /help',
            value: 'Show this help message\nUsage: `/help command:help` for details'
          },
          {
            name: '🔗 Quick Links',
            value: '• [Alice\'s Ring Documentation](https://docs.alicesring.org/)\n• [Starknet Documentation](https://docs.starknet.io/)'
          }
        )
        .setFooter({
          text: 'Powered by Starknet',
          iconURL: STARKNET_LOGO_URL
        });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } catch (error) {
    console.error('Error in help command:', error);
    await interaction.reply({
      content: 'An error occurred while fetching help information.',
      ephemeral: true
    });
  }
};