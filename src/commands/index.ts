import { Client, Events, Interaction, CommandInteraction } from 'discord.js';
import { createPollCommand, handlePollButton } from './createPoll';

export function registerCommands(client: Client): void {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    console.log('Interaction received:', interaction);
    try {
      // Handle slash commands
      if (interaction.isCommand()) {
        switch (interaction.commandName) {
          case 'createpoll':
            console.log('createpoll command');
            await createPollCommand(interaction as CommandInteraction);
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