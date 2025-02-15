import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { config } from './config';
import { initializeDatabase } from './database';

const bot = new Telegraf(config.token);

// Timestamp when the bot starts
const startTimestamp = Date.now() / 1000;

// Middleware to filter out old messages
bot.use(async (ctx, next) => {
  // Check if the update has a message and its timestamp
  if (ctx.message?.date && ctx.message.date < startTimestamp) {
    console.log('Skipping old message from:', new Date(ctx.message.date * 1000).toISOString());
    return;
  }
  return next();
});

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