import { initializeDatabase } from './database';
import { bot, startTimestamp } from './bot';

async function main() {
  try {
    // Initialize database
    console.log('Initializing database...');
    await initializeDatabase();

    // Test connection
    console.log('Testing bot connection...');
    const botInfo = await bot.telegram.getMe();
    console.log('Bot info:', botInfo.username);

    // Launch the bot
    console.log('Starting bot...');
    await bot.launch();
    console.log(`Bot is running! (Start time: ${new Date(startTimestamp * 1000).toISOString()})`);

    // Enable graceful stop
    process.once('SIGINT', () => {
      bot.stop('SIGINT');
    });
    process.once('SIGTERM', () => {
      bot.stop('SIGTERM');
    });

  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
}

// Run the bot
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
