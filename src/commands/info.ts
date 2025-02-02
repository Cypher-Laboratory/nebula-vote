import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js';
import { STARKNET_LOGO_URL } from '../constants';

export const data = new SlashCommandBuilder()
  .setName('info')
  .setDescription('Learn about the Starknet Polling Bot and how to use it');

export const execute = async (interaction: CommandInteraction) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle('📊 Starknet Polling Bot')
      .setColor('#0099ff')
      .setDescription('A powerful on-chain polling bot that lets you create and manage private, verifiable polls in your Discord server!')
      .addFields(
        {
          name: '🤔 What can this bot do?',
          value: '• Create private, on-chain polls with multiple options\n• Vote anonymously using ring signatures\n• View real-time poll results without compromising voter privacy\n• Set custom durations for polls\n• See your current vote on active polls'
        },
        {
          name: '🔒 Privacy & Security',
          value: '• Complete voter privacy using Ring Signatures\n• Votes are anonymous but verifiable\n• Prevents double-voting while maintaining anonymity\n• Built on [Alice\'s Ring cryptographic library](https://docs.alicesring.com/)'
        },
        {
          name: '⛓️ On-Chain Features',
          value: '• All polls and votes are recorded on Starknet\n• Complete traceability and transparency\n• Results accessible via smart contracts\n• Enables anonymous reward distribution to voters\n• Perfect for DAOs and community governance'
        },
        {
          name: '📝 Basic Usage',
          value: '`/poll question:"What should we build next?" options:"DeFi,GameFi,Infrastructure" duration:1440`'
        },
        {
          name: '📚 More about the commands',
          value: 'Type `/help` to see a list of available commands'
        },
        {
          name: '🔗 Links',
          value: '[GitHub]() | [Documentation]() | [Starknet]() | [Alice\'s Ring](https://docs.alicesring.com/)'
        }        
      )
      .setFooter({
        text: 'Powered by Starknet & Alice\'s Ring',
        iconURL: STARKNET_LOGO_URL
      });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error('Error in info command:', error);
    await interaction.reply({
      content: 'An error occurred while fetching bot information.',
      ephemeral: true
    });
  }
};


