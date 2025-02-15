import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { Update } from 'telegraf/typings/core/types/typegram';
import { config } from './config';
import { initializeDatabase } from './database';

const bot = new Telegraf(config.token);

// Command handlers
bot.command('ping', async (ctx) => {
  console.log('Received ping command');
  await ctx.reply('pong!');
});

bot.command('start', async (ctx) => {
  console.log('Received start command');
  await ctx.reply(
    'Welcome to the Poll Bot! 📊\n\n' +
    'Use /createpoll to create a new poll.\n' +
    'Format:\n' +
    '/createpoll\n' +
    'Your question\n' +
    'Option 1, Option 2, Option 3\n' +
    'Duration in minutes (optional)'
  );
});

// Debug handler
bot.on(message('text'), async (ctx) => {
  console.log('Received message:', ctx.message.text);
});

// Error handler
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('An error occurred, please try again.');
});

let isRunning = false;
let offset = 0;
const processedUpdates = new Set<number>();

async function processUpdate(update: Update) {
  // Check if we've already processed this update
  if (processedUpdates.has(update.update_id)) {
    return;
  }

  try {
    await bot.handleUpdate(update);
    // Add to processed set and maintain its size
    processedUpdates.add(update.update_id);
    if (processedUpdates.size > 100) {
      const firstItem = processedUpdates.values().next().value;
      if (firstItem !== undefined) {
        processedUpdates.delete(firstItem);
      }
    }
  } catch (error) {
    console.error('Error processing update:', error);
  }
}

async function getUpdates() {
  if (!isRunning) return;

  try {
    const updates = await bot.telegram.getUpdates(offset, 100, 30, undefined);
    
    if (updates.length > 0) {
      // Process updates and update offset
      for (const update of updates) {
        await processUpdate(update);
        offset = update.update_id + 1;
      }
    }

    // Continue polling
    setTimeout(getUpdates, 1000);
  } catch (error) {
    console.error('Error getting updates:', error);
    if (isRunning) {
      setTimeout(getUpdates, 5000); // Retry after 5 seconds on error
    }
  }
}

// Helper function to format poll results
function formatPollResults(results: any[]): string {
  if (!results.length) return 'No results available.';

  const question = results[0].question;
  const totalVotes = results.reduce((sum, opt) => sum + opt.vote_count, 0);
  let output = `📊 <b>${question}</b>\n\n`;

  results.forEach(opt => {
    const percentage = totalVotes ? ((opt.vote_count / totalVotes) * 100).toFixed(1) : '0.0';
    const bar = '█'.repeat(Math.floor(Number(percentage) / 5)) + '░'.repeat(20 - Math.floor(Number(percentage) / 5));
    output += `${opt.option_text}\n${bar} ${percentage}% (${opt.vote_count} votes)\n\n`;
  });

  output += `Total votes: ${totalVotes}`;
  return output;
}

async function main() {
  try {
    // Initialize database
    console.log('Initializing database...');
    initializeDatabase();
    
    // Test connection
    console.log('Testing bot connection...');
    const botInfo = await bot.telegram.getMe();
    console.log('Bot info:', botInfo.username);

    // Clear any pending updates before starting
    const updates = await bot.telegram.getUpdates(0, 1, 0, undefined);
    if (updates.length > 0) {
      offset = updates[updates.length - 1].update_id + 1;
    }

    // Start polling
    console.log('Starting bot polling...');
    isRunning = true;
    getUpdates();
    
    console.log('Bot is running!');

    // Enable graceful stop
    process.once('SIGINT', () => {
      console.log('SIGINT received');
      isRunning = false;
      process.exit(0);
    });
    process.once('SIGTERM', () => {
      console.log('SIGTERM received');
      isRunning = false;
      process.exit(0);
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