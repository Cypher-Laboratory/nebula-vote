import { Client, Events, Interaction, CommandInteraction } from 'discord.js';
import { createPollCommand, handlePollButton } from './pollManager';
import { execute as executeInfoCommand } from './info';
import { execute as executeHelpCommand } from './help';

export function registerCommands(client: Client): void {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    try {
      // Handle slash commands
      if (interaction.isCommand()) {
        switch (interaction.commandName) {
          case 'poll':
            await createPollCommand(interaction as CommandInteraction);
            break;
          case 'info':
            await executeInfoCommand(interaction as CommandInteraction);
            break;
          case 'help':
            await executeHelpCommand(interaction as CommandInteraction);
            break;
        }
      }
      // Handle button interactions for polls
      else if (interaction.isButton()) {
        const customId = interaction.customId;
        if (customId.startsWith('vote_') || customId.startsWith('results_')) {
          await handlePollButton(interaction);
        }
      }
    } catch (error) {
      console.error('Error handling interaction:', error);

      // Only reply if we haven't already
      if (!interaction.isAutocomplete() && !interaction.replied && !interaction.deferred) {
        const reply = {
          content: 'There was an error processing your interaction.',
          ephemeral: true,
        };

        if (interaction.isRepliable()) {
          await interaction.reply(reply);
        }
      }
    }
  });
}