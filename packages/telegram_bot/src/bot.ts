import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { config, POWERED_BY_STARKNET } from './config';

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  question: string;
  options: PollOption[];
  voters: Set<number>;
  expiresAt: number; // Timestamp when the poll expires
}

// In-memory store for active polls
const activePolls = new Map<string, Poll>();

const bot = new Telegraf(config.token);

// Timestamp when the bot starts
const startTimestamp = Date.now() / 1000;

// Cleanup expired polls periodically
setInterval(() => {
  const now = Date.now();
  for (const [pollId, poll] of activePolls.entries()) {
    if (now >= poll.expiresAt) {
      console.log(`Poll expired - Question: "${poll.question}", Total votes: ${poll.voters.size}`);
      activePolls.delete(pollId);
    }
  }
}, 60000); // Check every minute

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
    'Duration in minutes (optional, defaults to 15)'
  );
});

// Create poll command handler
bot.command('createpoll', async (ctx) => {
  if (ctx.chat.type !== 'private') {
    try {
      const member = await ctx.telegram.getChatMember(ctx.chat.id, ctx.botInfo.id);
      console.log('Bot permissions in group:', member);
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
      'Option 1, Option 2, Option 3\n' +
      'Duration in minutes (optional)'
    );
  }

  const question = input[1].trim();
  const optionsInput = input[2].split(',').map(opt => opt.trim());
  
  // Parse duration (default to 15 minutes if not provided or invalid)
  const durationMinutes = input.length > 3 ? parseInt(input[3]) || 15 : 15;
  const expiresAt = Date.now() + (durationMinutes * 60 * 1000);

  if (optionsInput.length < 2) {
    return ctx.reply('❌ Please provide at least 2 options for the poll.');
  }

  const pollId = Date.now().toString();
  const poll: Poll = {
    question,
    options: optionsInput.map(text => ({ text, votes: 0 })),
    voters: new Set(),
    expiresAt
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

bot.command('help', async (ctx) => {
  console.log('Received help command');
  const args = ctx.message.text.split(' ').slice(1);
  const command = args[0];

  if (command === 'createpoll') {
    await ctx.reply(
      '📊 <b>Create Poll Help</b>\n\n' +
      'To create a new poll, send a message in this format:\n\n' +
      '/createpoll\n' +
      'Your question\n' +
      'Option 1, Option 2, Option 3\n' +
      'Duration in minutes (optional, defaults to 15)\n\n' +
      '<b>Example:</b>\n' +
      '/createpoll\n' +
      'What\'s your favorite color?\n' +
      'Red, Blue, Green, Yellow\n' +
      '30\n\n' +
      '<i>Note: Separate each option with commas</i>\n\n' +
      POWERED_BY_STARKNET,
      { parse_mode: 'HTML' }
    );
  } else {
    await ctx.reply(
      '🤖 <b>Poll Bot Commands</b>\n\n' +
      '/start - Start the bot\n' +
      '/createpoll - Create a new poll\n' +
      '/help - Show this help message\n' +
      '/help createpoll - Show detailed help for creating polls\n' +
      '/ping - Check if bot is running\n\n' +
      'For more detailed help, type /help followed by the command name\n' +
      'Example: /help createpoll\n\n' +
      POWERED_BY_STARKNET,
      { parse_mode: 'HTML' }
    );
  }
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

  // Check if poll has expired
  if (Date.now() >= poll.expiresAt) {
    activePolls.delete(pollId);
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

function formatPollMessage(poll: Poll): string {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  let message = `📊 <b>${poll.question}</b>\n\n`;

  poll.options.forEach(option => {
    const percentage = totalVotes ? ((option.votes / totalVotes) * 100).toFixed(1) : '0.0';
    const bar = '█'.repeat(Math.floor(Number(percentage) / 5)) + '░'.repeat(20 - Math.floor(Number(percentage) / 5));
    message += `${option.text}\n${bar} ${percentage}% (${option.votes} votes)\n\n`;
  });

  // Add time remaining
  const timeRemaining = Math.max(0, Math.ceil((poll.expiresAt - Date.now()) / 60000));
  message += `Total votes: ${totalVotes}\n`;
  message += `Ends at: ${new Date(poll.expiresAt).toUTCString()}\n\n`;
  message += POWERED_BY_STARKNET;

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

export { bot, startTimestamp };