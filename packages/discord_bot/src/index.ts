import { Client, GatewayIntentBits, Partials, Events } from 'discord.js';
import { initializeDatabase } from './database';
import { registerCommands } from './commands';
import { config as botConfig } from './config';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once(Events.ClientReady, () => {
  console.log('Bot is ready!');
  initializeDatabase();
  registerCommands(client);
});

client.login(botConfig.token);
