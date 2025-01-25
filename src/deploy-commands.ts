import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from './config';

const commands = [
  new SlashCommandBuilder()
    .setName('createpoll')
    .setDescription('Create a new poll')
    .addStringOption(option =>
      option
        .setName('question')
        .setDescription('The poll question')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('options')
        .setDescription('Comma-separated list of options')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('duration')
        .setDescription('Poll duration in minutes')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10080) // One week maximum
    ),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();