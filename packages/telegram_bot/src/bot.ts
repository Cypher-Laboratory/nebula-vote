// import { Telegraf } from 'telegraf';
// import { message } from 'telegraf/filters';
// import { config, POWERED_BY_STARKNET } from './config';
// import { createPoll } from './pollManager';

// interface PollOption {
//   text: string;
//   votes: number;
// }

// interface Poll {
//   question: string;
//   options: PollOption[];
//   voters: Set<number>;
//   expiresAt: number;
// }

// // In-memory store for active polls
// const activePolls = new Map<string, Poll>();

// const bot = new Telegraf(config.token);

// // Timestamp when the bot starts
// const startTimestamp = Date.now() / 1000;

// // Cleanup expired polls periodically
// setInterval(() => {
//   const now = Date.now();
//   for (const [pollId, poll] of activePolls.entries()) {
//     if (now >= poll.expiresAt) {
//       console.log(`Poll expired - Question: "${poll.question}", Total votes: ${poll.voters.size}`);
//       activePolls.delete(pollId);
//     }
//   }
// }, 60000); // Check every minute

// // Middleware to filter out old messages
// bot.use(async (ctx, next) => {
//   if (ctx.message?.date && ctx.message.date < startTimestamp) {
//     console.log('Skipping old message from:', new Date(ctx.message.date * 1000).toISOString());
//     return;
//   }
//   return next();
// });

// // Command handlers
// bot.command('ping', async (ctx) => {
//   console.log('Received ping command');
//   await ctx.reply('pong!');
// });

// bot.command('start', async (ctx) => {
//   console.log('Received start command');
//   await ctx.reply(
//     'Welcome to the Poll Bot! 📊\n\n' +
//     'Use /createpoll to create a new poll.\n' +
//     'Format:\n' +
//     '/createpoll\n' +
//     'Your question\n' +
//     'Option 1, Option 2, Option 3\n' +
//     'Duration in minutes (optional, defaults to 15)'
//   );
// });

// // Create poll command handler
// bot.command('createpoll', async (ctx) => {
//   if (ctx.chat.type !== 'private') {
//     try {
//       const member = await ctx.telegram.getChatMember(ctx.chat.id, ctx.botInfo.id);
//       console.log('Bot permissions in group:', member);
//     } catch (error) {
//       console.error('Error checking permissions:', error);
//       return ctx.reply('❌ Could not verify permissions in this group.');
//     }
//   }

//   // Log poll creation attempt
//   console.log(`Poll creation attempt - Chat: ${(ctx.chat as any).title || 'Private'} (${ctx.chat.id}), User: ${ctx.from.username || ctx.from.id}`);
//   const input = ctx.message.text.split('\n');
//   if (input.length < 3) {
//     return ctx.reply(
//       '❌ Please provide the question and options in the correct format:\n\n' +
//       '/createpoll\n' +
//       'Your question\n' +
//       'Option 1, Option 2, Option 3\n' +
//       'Duration in minutes (optional)'
//     );
//   }

//   const question = input[1].trim();
//   const optionsInput = input[2].split(',').map(opt => opt.trim());
  
//   // Parse duration (default to 15 minutes if not provided or invalid)
//   const durationMinutes = input.length > 3 ? parseInt(input[3]) || 15 : 15;
//   const expiresAt = Date.now() + (durationMinutes * 60 * 1000);

//   if (optionsInput.length < 2) {
//     return ctx.reply('❌ Please provide at least 2 options for the poll.');
//   }

//   const pollId = Date.now().toString();
//   const poll: Poll = {
//     question,
//     options: optionsInput.map(text => ({ text, votes: 0 })),
//     voters: new Set(),
//     expiresAt
//   };

//   activePolls.set(pollId, poll);

//   // Create inline keyboard buttons for voting
//   const keyboard = {
//     inline_keyboard: poll.options.map((option, index) => ([{
//       text: option.text,
//       callback_data: `vote:${pollId}:${index}`
//     }]))
//   };

//   // const poll_result = await createPoll(ctx, question, optionsInput, durationMinutes);

//   await ctx.reply(
//     formatPollMessage(poll, poll_result.tx_hash),
//     {
//       parse_mode: 'HTML',
//       reply_markup: keyboard
//     }
//   );
// });

// bot.command('help', async (ctx) => {
//   console.log('Received help command');
//   const args = ctx.message.text.split(' ').slice(1);
//   const command = args[0];

//   if (command === 'createpoll') {
//     await ctx.reply(
//       '📊 <b>Create Poll Help</b>\n\n' +
//       'To create a new poll, send a message in this format:\n\n' +
//       '/createpoll\n' +
//       'Your question\n' +
//       'Option 1, Option 2, Option 3\n' +
//       'Duration in minutes (optional, defaults to 15)\n\n' +
//       '<b>Example:</b>\n' +
//       '/createpoll\n' +
//       'What\'s your favorite color?\n' +
//       'Red, Blue, Green, Yellow\n' +
//       '30\n\n' +
//       '<i>Note: Separate each option with commas</i>\n\n' +
//       POWERED_BY_STARKNET,
//       { parse_mode: 'HTML' }
//     );
//   } else {
//     await ctx.reply(
//       '🤖 <b>Poll Bot Commands</b>\n\n' +
//       '/start - Start the bot\n' +
//       '/createpoll - Create a new poll\n' +
//       '/help - Show this help message\n' +
//       '/help createpoll - Show detailed help for creating polls\n' +
//       '/ping - Check if bot is running\n\n' +
//       'For more detailed help, type /help followed by the command name\n' +
//       'Example: /help createpoll\n\n' +
//       POWERED_BY_STARKNET,
//       { parse_mode: 'HTML' }
//     );
//   }
// });

// // Handle vote callbacks
// bot.on('callback_query', async (ctx) => {
//   const callbackData = (ctx.callbackQuery as any).data;
//   if (!callbackData?.startsWith('vote:')) return;

//   const [, pollId, optionIndex] = callbackData.split(':');
//   const userId = ctx.callbackQuery.from.id;
//   const poll = activePolls.get(pollId);

//   if (!poll) {
//     return ctx.answerCbQuery('This poll has expired.');
//   }

//   // Check if poll has expired
//   if (Date.now() >= poll.expiresAt) {
//     activePolls.delete(pollId);
//     return ctx.answerCbQuery('This poll has expired.');
//   }

//   if (poll.voters.has(userId)) {
//     return ctx.answerCbQuery('You have already voted in this poll!');
//   }

//   // Record the vote
//   const optionIdx = parseInt(optionIndex);
//   const selectedOption = poll.options[optionIdx];
//   selectedOption.votes++;
//   poll.voters.add(userId);

//   console.log(`Vote recorded - Poll: "${poll.question}", Option: "${selectedOption.text}", User: ${userId}, Total votes for option: ${selectedOption.votes}`);

//   // Update the message with new results
//   const keyboard = {
//     inline_keyboard: poll.options.map((option, index) => ([{
//       text: option.text,
//       callback_data: `vote:${pollId}:${index}`
//     }]))
//   };

//   await ctx.editMessageText(
//     formatPollMessage(poll),
//     {
//       parse_mode: 'HTML',
//       reply_markup: keyboard
//     }
//   );

//   await ctx.answerCbQuery('Your vote has been recorded!');
// });

// function formatPollMessage(poll: Poll, tx_hash?: string): string {
//   const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
//   let message = `📊 <b>${poll.question}</b>\n\n`;

//   poll.options.forEach(option => {
//     const percentage = totalVotes ? ((option.votes / totalVotes) * 100).toFixed(1) : '0.0';
//     const bar = '█'.repeat(Math.floor(Number(percentage) / 5)) + '░'.repeat(20 - Math.floor(Number(percentage) / 5));
//     message += `${option.text}\n${bar} ${percentage}% (${option.votes} votes)\n\n`;
//   });

//   // Add time remaining
//   const timeRemaining = Math.max(0, Math.ceil((poll.expiresAt - Date.now()) / 60000));
//   message += `Total votes: ${totalVotes}\n`;
//   message += `Ends at: ${new Date(poll.expiresAt).toUTCString()}\n\n`;
//   message += POWERED_BY_STARKNET;

//   return message;
// }

// // Debug handler
// bot.on(message('text'), async (ctx) => {
//   const chatType = ctx.chat.type;
//   const chatName = chatType === 'private' ? 'Private Chat' : ctx.chat.title;
//   const userName = ctx.from.username || ctx.from.id;

//   console.log(`Received message in ${chatType} (${chatName}) from ${userName}: ${ctx.message.text}`);

//   // In groups, only respond to commands to avoid spam
//   if (chatType !== 'private' && !ctx.message.text.startsWith('/')) {
//     return;
//   }
// });

// // Error handler
// bot.catch((err, ctx) => {
//   console.error('Bot error:', err);
//   ctx.reply('An error occurred, please try again.');
// });

// export { bot, startTimestamp };


import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { Message } from 'telegraf/typings/core/types/typegram';
import { getDb } from './database';
import { config, POWERED_BY_STARKNET } from './config';
import { getRing, getUserPrivateKey } from './utils';
import { Curve, CurveName } from '@cypher-laboratory/ring-sig-utils';
import { vote, createPoll as createStarknetPoll } from 'sc-wrapper';

interface PollData {
  id: number;
  question: string;
  options: string[];
  end_time: string;
  created_at: string;
  is_active: boolean;
  tx_hash: string;
}

interface PollOption {
  id: number;
  option_text: string;
  vote_count: number;
}

interface PollResults {
  question: string;
  options: PollOption[];
  total_votes: number;
  is_active: boolean;
  end_time: string;
  tx_hash: string;
}

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

// Create a new poll
async function createPoll(
  ctx: Context,
  question: string,
  options: string[],
  duration: number
): Promise<PollData> {
  const db = getDb();

  // Validate input
  if (!question.trim()) {
    throw new Error('Question cannot be empty');
  }

  if (options.length < 2) {
    throw new Error('Please provide at least 2 options for the poll');
  }

  if (options.length > config.polls.maxOptions) {
    throw new Error(`Maximum ${config.polls.maxOptions} options allowed`);
  }

  if (duration < config.polls.minDuration) {
    throw new Error(`Minimum duration is ${config.polls.minDuration} minutes`);
  }

  if (duration > config.polls.maxDuration) {
    throw new Error(`Maximum duration is ${config.polls.maxDuration} minutes`);
  }

  // create the poll on starknet
  const tx_hash: string = await createStarknetPoll(question, Date.now() + 1000 * 60 * duration, options);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Insert the poll with tx_hash
      db.run(
        `INSERT INTO polls (
          guild_id,
          channel_id,
          creator_id,
          question,
          end_time,
          is_active
        ) VALUES (?, ?, ?, ?, datetime('now', '+' || ? || ' minutes'), 1)`,
        [
          ctx.chat?.id.toString(), // Using chat ID as guild_id too for simplicity
          ctx.chat?.id.toString(),
          ctx.from?.id.toString(),
          question,
          duration.toString(),
          tx_hash // Store the transaction hash
        ],
        function (err) {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }

          const pollId = this.lastID;

          // Insert all options
          const insertPromises = options.map((option) => {
            return new Promise<void>((resolveOption, rejectOption) => {
              db.run(
                'INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)',
                [pollId, option.trim()],
                (err) => {
                  if (err) rejectOption(err);
                  else resolveOption();
                }
              );
            });
          });

          // Wait for all options to be inserted
          Promise.all(insertPromises)
            .then(() => {
              // Get the created poll data
              db.get(
                `SELECT 
                  id,
                  question,
                  datetime(end_time) as end_time,
                  datetime(created_at) as created_at,
                  is_active
                FROM polls WHERE id = ?`,
                [pollId],
                (err, poll) => {
                  if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }

                  // Commit transaction and return poll data
                  db.run('COMMIT', (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      reject(err);
                    } else {
                      resolve({
                        ...poll as PollData,
                        options
                      });
                    }
                  });
                }
              );
            })
            .catch((err) => {
              db.run('ROLLBACK');
              reject(err);
            });
        }
      );
    });
  });
}

// Handle a vote on a poll
async function handleVote(
  ctx: Context,
  pollId: number,
  optionIndex: number
): Promise<{ success: boolean; message: string; tx_hash?: string }> {
  const db = getDb();

  // Check if poll exists and is active
  const poll = await new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM polls 
       WHERE id = ? AND is_active = 1 
       AND datetime('now') < datetime(end_time)`,
      [pollId],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });

  if (!poll) {
    return { success: false, message: 'This poll might not exist or has ended' };
  }

  // Get the selected option
  const option = await new Promise((resolve, reject) => {
    db.get(
      `SELECT id, option_text 
       FROM poll_options 
       WHERE poll_id = ? 
       ORDER BY id ASC 
       LIMIT 1 OFFSET ?`,
      [pollId, optionIndex],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });

  if (!option) {
    return { success: false, message: 'Invalid option selected' };
  }

  // Check if user has already voted
  const existingVote = await new Promise((resolve, reject) => {
    db.get(
      `SELECT option_id FROM votes 
       WHERE poll_id = ? AND user_id = ?`,
      [pollId, ctx.from?.id],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });

  // Record the vote on starknet
  const signerPriv = getUserPrivateKey(ctx);
  const signerPubKey = (new Curve(CurveName.SECP256K1)).GtoPoint().mult(signerPriv);
  const vote_result = await vote(
    Number(pollId) - 1 /* starknet polls id start at 0 and sqlite makes the poll ids start at 1 */,
    Number(optionIndex),
    signerPriv,
    await getRing(
      Number(ctx.from?.id || 0),
      signerPubKey)
  );
  console.log('vote_result on starknet: ', vote_result);

  if (!vote_result) {
    return { success: false, message: 'Failed to record vote on Starknet' };
  }
  
  // Extract the transaction hash from the vote result
  const tx_hash = vote_result.transaction_hash;

  if (!tx_hash) {
    console.error('No transaction hash found in vote result');
    return { success: false, message: 'Failed to get transaction hash' };
  }

  // Record or update the vote
  return new Promise((resolve, reject) => {
    const query = existingVote 
      ? `UPDATE votes SET option_id = ? WHERE poll_id = ? AND user_id = ?`
      : `INSERT INTO votes (poll_id, option_id, user_id) VALUES (?, ?, ?)`;
    
    const params = existingVote
      ? [(option as any).id, pollId, ctx.from?.id]
      : [pollId, (option as any).id, ctx.from?.id];
    
    db.run(query, params, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          success: true,
          message: existingVote ? 'Your vote has been updated!' : 'Your vote has been recorded!',
          tx_hash: tx_hash
        });
      }
    });
  });
}

// Get poll results
async function getPollResults(pollId: number): Promise<PollResults> {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Get poll information
      db.get(
        `SELECT 
          question,
          datetime(end_time) as end_time,
          is_active
        FROM polls 
        WHERE id = ?`,
        [pollId],
        (err, poll) => {
          if (err) {
            reject(err);
            return;
          }

          if (!poll) {
            reject(new Error('Poll not found'));
            return;
          }

          // Get options and vote counts
          db.all(
            `SELECT 
              po.id,
              po.option_text,
              COUNT(v.id) as vote_count
            FROM poll_options po
            LEFT JOIN votes v ON po.id = v.option_id
            WHERE po.poll_id = ?
            GROUP BY po.id, po.option_text
            ORDER BY po.id ASC`,
            [pollId],
            (err, options) => {
              if (err) {
                reject(err);
                return;
              }

              const totalVotes = options.reduce(
                (sum, opt) => sum + (opt as any).vote_count,
                0
              );

              resolve({
                question: (poll as any).question,
                options: options as PollOption[],
                total_votes: totalVotes as number,
                is_active: (poll as any).is_active === 1,
                end_time: (poll as any).end_time,
                tx_hash: (poll as any).tx_hash
              });
            }
          );
        }
      );
    });
  });
}

// Format poll results for display
function formatPollResults(results: PollResults): string {
  const { question, options, total_votes, is_active, end_time, tx_hash } = results;

  let output = `📊 ${question}\n\n`;

  options.forEach(opt => {
    const percentage = total_votes ? ((opt.vote_count / total_votes) * 100).toFixed(1) : '0.0';
    const bar = '█'.repeat(Math.floor(Number(percentage) / 5)) +
      '░'.repeat(20 - Math.floor(Number(percentage) / 5));
    output += `${opt.option_text}\n${bar} ${percentage}% (${opt.vote_count} votes)\n\n`;
  });

  output += `Total votes: ${total_votes}\n`;

  if (!is_active) {
    output += '❌ This poll has ended';
  } else {
    const endDate = new Date(end_time);
    output += `⏰ Ends at: ${endDate.toLocaleString()}`;
  }

  // Add block explorer link if tx_hash is available
  if (tx_hash) {
    output += `\n\n🔍 View on StarkScan: https://${process.env.TESTNET === 'true' ? 'sepolia.' : ''}starkscan.co/tx/${tx_hash}`;
  }

  return output;
}

// End a poll
async function endPoll(pollId: number): Promise<boolean> {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE polls SET is_active = 0 WHERE id = ?',
      [pollId],
      (err) => {
        if (err) reject(err);
        else resolve(true);
      }
    );
  });
}

// Check if a poll exists and is active
async function isPollActive(pollId: number): Promise<boolean> {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 1 FROM polls 
       WHERE id = ? AND is_active = 1 
       AND datetime('now') < datetime(end_time)`,
      [pollId],
      (err, result) => {
        if (err) reject(err);
        else resolve(!!result);
      }
    );
  });
}

// Get all active polls for a chat
async function getActivePollsForChat(chatId: string): Promise<PollData[]> {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        p.id,
        p.question,
        p.end_time,
        p.created_at,
        p.is_active
      GROUP_CONCAT(po.option_text) as options
      FROM polls p
      JOIN poll_options po ON p.id = po.poll_id
      WHERE p.channel_id = ? 
      AND p.is_active = 1 
      AND datetime('now') < datetime(p.end_time)
      GROUP BY p.id`,
      [chatId],
      (err, polls) => {
        if (err) {
          reject(err);
        } else {
          resolve(polls.map(poll => ({
            ...(poll as any),
            options: (poll as any).options.split(',')
          })));
        }
      }
    );
  });
}

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

  if (optionsInput.length < 2) {
    return ctx.reply('❌ Please provide at least 2 options for the poll.');
  }

  try {
    const poll_result = await createPoll(ctx, question, optionsInput, durationMinutes);

    // Create inline keyboard buttons for voting
    const keyboard = {
      inline_keyboard: optionsInput.map((option, index) => ([{
        text: option,
        callback_data: `vote:${poll_result.id}:${index}`
      }]))
    };

    const pollResults = await getPollResults(poll_result.id);
    await ctx.reply(
      formatPollResults(pollResults),
      {
        parse_mode: 'HTML',
        reply_markup: keyboard
      }
    );
  } catch (error) {
    console.error('Error creating poll:', error);
    await ctx.reply(`❌ Error creating poll: ${(error as any).message}`);
  }
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

// Add a command to view active polls
bot.command('polls', async (ctx) => {
  try {
    const chatId = ctx.chat.id.toString();
    const activePolls = await getActivePollsForChat(chatId);
    
    if (activePolls.length === 0) {
      return ctx.reply('No active polls in this chat.');
    }
    
    let message = '📊 <b>Active Polls</b>\n\n';
    for (const poll of activePolls) {
      const endDate = new Date(poll.end_time);
      message += `ID: ${poll.id}\n`;
      message += `Question: ${poll.question}\n`;
      message += `Ends at: ${endDate.toLocaleString()}\n\n`;
    }
    
    await ctx.reply(message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error fetching active polls:', error);
    await ctx.reply('An error occurred while fetching active polls.');
  }
});

// Handle vote callbacks
bot.on('callback_query', async (ctx) => {
  const callbackData = (ctx.callbackQuery as any).data;
  if (!callbackData?.startsWith('vote:')) return;

  const [, pollId, optionIndex] = callbackData.split(':');
  const userId = ctx.callbackQuery.from.id;
  
  try {
    // Check if poll is active
    const isActive = await isPollActive(Number(pollId));
    if (!isActive) {
      return ctx.answerCbQuery('This poll has expired or is no longer active.');
    }
    
    // Handle the vote
    const voteResult = await handleVote(ctx, Number(pollId), Number(optionIndex));
    
    if (!voteResult.success) {
      return ctx.answerCbQuery(voteResult.message);
    }

    // Get updated poll results
    const pollResults = await getPollResults(Number(pollId));
    
    // Get all poll options for the keyboard
    const pollOptions = pollResults.options.map(opt => opt.option_text);
    
    // Create updated inline keyboard
    const keyboard = {
      inline_keyboard: pollOptions.map((option, index) => ([{
        text: option,
        callback_data: `vote:${pollId}:${index}`
      }]))
    };

    // Update the message with new results
    await ctx.editMessageText(
      formatPollResults(pollResults),
      {
        parse_mode: 'HTML',
        reply_markup: keyboard
      }
    );

    // Build message with transaction hash
    let message = voteResult.message;
    if (voteResult.tx_hash) {
      message += `\nView transaction: https://${process.env.TESTNET === 'true' ? 'sepolia.' : ''}starkscan.co/tx/${voteResult.tx_hash}`;
    }
    
    await ctx.answerCbQuery(message);
    
  } catch (error) {
    console.error('Error handling vote:', error);
    await ctx.answerCbQuery('An error occurred while processing your vote.');
  }
});

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

// Add a function to clean up expired polls (can be run periodically with a cron job)
export async function cleanupExpiredPolls(): Promise<number> {
  const db = getDb();
  
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE polls 
      SET is_active = 0 
      WHERE is_active = 1 
      AND datetime('now') > datetime(end_time)`,
      function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      }
    );
  });
}

export { bot, startTimestamp };