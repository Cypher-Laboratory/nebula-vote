import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { config } from './config';
import { data as infoCommand } from './commands/info';

const commands = [
  new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a new poll with multiple options')
    .addStringOption(option =>
      option
        .setName('question')
        .setDescription('The question you want to ask (e.g., "What\'s your favorite color?")')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('options')
        .setDescription('List your options, separated by commas (e.g., "Red, Blue, Green, Yellow")')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('duration')
        .setDescription('How long should the poll run? (1-43200 minutes, e.g., 60 for 1 hour)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(43200) // One month maximum
        .addChoices(
          { name: '5 minutes', value: 5 },
          { name: '15 minutes', value: 15 },
          { name: '30 minutes', value: 30 },
          { name: '1 hour', value: 60 },
          { name: '2 hours', value: 120 },
          { name: '6 hours', value: 360 },
          { name: '12 hours', value: 720 },
          { name: '1 day', value: 1440 },
          { name: '1 week', value: 10080 },
          { name: '1 month', value: 43200 },
        )
    ),
  infoCommand
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