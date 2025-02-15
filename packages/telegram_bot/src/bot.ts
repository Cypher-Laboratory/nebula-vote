import { Telegraf, Context } from 'telegraf';
import { Message } from 'telegraf/typings/core/types/typegram';
import { getDb } from './database';
import { config } from './config';
import { createPoll, handleVote, getPollResults } from './pollManager';

const bot = new Telegraf(config.token);

// Command to create a new poll
bot.command('createpoll', async (ctx) => {
  const args = ctx.message.text.split('\n').slice(1);
  if (args.length < 3) {
    await ctx.reply(
      'Please use the following format:\n' +
      '/createpoll\n' +
      'Your question here\n' +
      'Option 1, Option 2, Option 3\n' +
      'Duration in minutes (optional)'
    );
    return;
  }

  const question = args[0];
  const options = args[1].split(',').map(opt => opt.trim());
  const duration = parseInt(args[2]) || config.polls.defaultDuration;

  try {
    const poll = await createPoll(ctx, question, options, duration);
    await sendPollMessage(ctx, poll);
  } catch (error) {
    await ctx.reply('An error occurred while creating the poll.');
    console.error('Error creating poll:', error);
  }
});

// Handler for vote buttons
bot.action(/vote_(\d+)_(\d+)/, async (ctx) => {
  const pollId = parseInt(ctx.match[1]);
  const optionIndex = parseInt(ctx.match[2]);

  try {
    await handleVote(ctx, pollId, optionIndex);
  } catch (error) {
    await ctx.answerCbQuery('An error occurred while processing your vote.');
    console.error('Error handling vote:', error);
  }
});

// Handler for viewing results
bot.action(/results_(\d+)/, async (ctx) => {
  const pollId = parseInt(ctx.match[1]);

  try {
    const results = await getPollResults(pollId);
    await ctx.reply(formatResults(Array.isArray(results) ? results : [results]), { parse_mode: 'HTML' });
    await ctx.answerCbQuery();
  } catch (error) {
    await ctx.answerCbQuery('An error occurred while fetching results.');
    console.error('Error fetching results:', error);
  }
});

// Helper function to format results
function formatResults(results: any[]): string {
  const totalVotes = results.reduce((sum, opt) => sum + opt.vote_count, 0);
  const resultLines = results.map(r => {
    const percentage = totalVotes ? ((r.vote_count / totalVotes) * 100).toFixed(1) : '0.0';
    const bar = '█'.repeat(Math.floor(Number(percentage) / 5)) + '░'.repeat(20 - Math.floor(Number(percentage) / 5));
    return `${r.option_text}\n${bar} ${percentage}% (${r.vote_count} votes)`;
  });
  
  return resultLines.join('\n\n');
}

// Helper function to send poll message
async function sendPollMessage(ctx: Context, poll: any) {
  const keyboard = {
    inline_keyboard: [
      ...poll.options.map((option: string, index: number) => [{
        text: option,
        callback_data: `vote_${poll.id}_${index}`
      }]),
      [{
        text: 'View Results',
        callback_data: `results_${poll.id}`
      }]
    ]
  };

  await ctx.reply(
    `📊 ${poll.question}\n\nClick to vote!`, 
    { reply_markup: keyboard }
  );
}

export { bot };