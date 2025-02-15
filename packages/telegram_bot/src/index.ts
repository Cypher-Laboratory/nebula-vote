import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { config } from './config';
import { initializeDatabase } from './database';

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  question: string;
  options: PollOption[];
  voters: Set<number>;
}

// In-memory store for active polls
const activePolls = new Map<string, Poll>();

const bot = new Telegraf(config.token);

// Timestamp when the bot starts
const startTimestamp = Date.now() / 1000;

// Middleware to filter out old messages
bot.use(async (ctx, next) => {
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

// Create poll command handler
bot.command('createpoll', async (ctx) => {
  // Check if bot has permission to send polls in groups
  if (ctx.chat.type !== 'private') {
    try {
      const member = await ctx.telegram.getChatMember(ctx.chat.id, ctx.botInfo.id);
      console.log('Bot permissions in group:', member);
      
      // A regular member can send messages by default
      // Only restricted members cannot send messages
      if (member.status === 'restricted' && !member.can_send_messages) {
        return ctx.reply('❌ I need permission to send messages in this group.');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      return ctx.reply('❌ Could not verify permissions in this group.');
    }
  }

  // Log poll creation attempt
  console.log(`Poll creation attempt - Chat: ${(ctx.chat as any).title || 'Private'} (${ctx.chat.id}), User: ${ctx.from.username || ctx.from.id}`);
  const input = ctx.message.text.split('\n');
  if (input.length < 3) {
    return ctx.reply(
      '❌ Please provide the question and options in the correct format:\n\n' +
      '/createpoll\n' +
      'Your question\n' +
      'Option 1, Option 2, Option 3'
    );
  }

  const question = input[1].trim();
  const optionsInput = input[2].split(',').map(opt => opt.trim());

  if (optionsInput.length < 2) {
    return ctx.reply('❌ Please provide at least 2 options for the poll.');
  }

  const pollId = Date.now().toString();
  const poll: Poll = {
    question,
    options: optionsInput.map(text => ({ text, votes: 0 })),
    voters: new Set()
  };

  activePolls.set(pollId, poll);

  // Create inline keyboard buttons for voting
  const keyboard = {
    inline_keyboard: poll.options.map((option, index) => ([{
      text: option.text,
      callback_data: `vote:${pollId}:${index}`
    }]))
  };

  await ctx.reply(
    formatPollMessage(poll),
    {
      parse_mode: 'HTML',
      reply_markup: keyboard
    }
  );
});

// Handle vote callbacks
bot.on('callback_query', async (ctx) => {
  const callbackData = (ctx.callbackQuery as any).data;
  if (!callbackData?.startsWith('vote:')) return;

  const [, pollId, optionIndex] = callbackData.split(':');
  const userId = ctx.callbackQuery.from.id;
  const poll = activePolls.get(pollId);

  if (!poll) {
    return ctx.answerCbQuery('This poll has expired.');
  }

  if (poll.voters.has(userId)) {
    return ctx.answerCbQuery('You have already voted in this poll!');
  }

  // Record the vote
  const optionIdx = parseInt(optionIndex);
  const selectedOption = poll.options[optionIdx];
  selectedOption.votes++;
  poll.voters.add(userId);
  
  console.log(`Vote recorded - Poll: "${poll.question}", Option: "${selectedOption.text}", User: ${userId}, Total votes for option: ${selectedOption.votes}`);

  // Update the message with new results
  const keyboard = {
    inline_keyboard: poll.options.map((option, index) => ([{
      text: option.text,
      callback_data: `vote:${pollId}:${index}`
    }]))
  };

  await ctx.editMessageText(
    formatPollMessage(poll),
    {
      parse_mode: 'HTML',
      reply_markup: keyboard
    }
  );

  await ctx.answerCbQuery('Your vote has been recorded!');
});

// Helper function to format poll message
function formatPollMessage(poll: Poll): string {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  let message = `📊 <b>${poll.question}</b>\n\n`;

  poll.options.forEach(option => {
    const percentage = totalVotes ? ((option.votes / totalVotes) * 100).toFixed(1) : '0.0';
    const bar = '█'.repeat(Math.floor(Number(percentage) / 5)) + '░'.repeat(20 - Math.floor(Number(percentage) / 5));
    message += `${option.text}\n${bar} ${percentage}% (${option.votes} votes)\n\n`;
  });

  message += `Total votes: ${totalVotes}`;
  return message;
}

// Debug handler
bot.on(message('text'), async (ctx) => {
  const chatType = ctx.chat.type;
  const chatName = chatType === 'private' ? 'Private Chat' : ctx.chat.title;
  const userName = ctx.from.username || ctx.from.id;
  
  console.log(`Received message in ${chatType} (${chatName}) from ${userName}: ${ctx.message.text}`);
  
  // In groups, only respond to commands to avoid spam
  if (chatType !== 'private' && !ctx.message.text.startsWith('/')) {
    return;
  }
});

// Error handler
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('An error occurred, please try again.');
});

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