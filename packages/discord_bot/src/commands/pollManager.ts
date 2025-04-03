import {
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  EmbedBuilder
} from 'discord.js';
import { getDb } from '../database';
import { STARKNET_LOGO_URL } from '../constants';
import { checkPollRateLimit, checkVoteRateLimit, getRemainingLimits } from '../rateLimiter';
import { createPoll, vote } from 'sc-wrapper';
import { getRing, getUserPrivateKey } from '../utils';
import { Curve, CurveName, Point } from '@cypher-laboratory/ring-sig-utils';

export const createPollCommand = async (interaction: CommandInteraction) => {
  try {
    await interaction.deferReply();

    const canCreatePoll = await checkPollRateLimit();
    if (!canCreatePoll) {
      const { globalPolls } = getRemainingLimits(interaction.user.id);
      await interaction.editReply({
        content: `Rate limit exceeded for poll creation. Please try again later. ${globalPolls} polls remaining in this window.`,
      });
      return;
    }

    const question = interaction.options.get('question')?.value as string;
    const options = interaction.options.get('options')?.value as string;
    const duration = interaction.options.get('duration')?.value as number;

    const optionsArray = options.split(',').map(opt => opt.trim());

    if (optionsArray.length < 2) {
      await interaction.editReply({
        content: 'Please provide at least 2 options for the poll.',
      });
      return;
    }

    if (optionsArray.length > (Number(process.env.MAX_POLL_OPTIONS) || 20)) {
      await interaction.editReply({
        content: 'You can provide a maximum of 20 options for the poll.',
      });
      return;
    }

    const db = getDb();
    let pollId: number;

    let pollUrl = `https://${process.env.TESTNET == 'true' ? 'sepolia.' : ''}starkscan.co/`;

    // Create poll in database
    try {
      // create th poll on starknet
      const poll_creation_result = await createPoll(question, duration, optionsArray);

      pollUrl = `https://${process.env.TESTNET == 'true' ? 'sepolia.' : ''}starkscan.co/tx/${poll_creation_result}`;

      console.log('poll_creation_result on starknet: ', poll_creation_result);
      const result = await new Promise<number>((resolve, reject) => {
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');

          db.run(
            `INSERT INTO polls (guild_id, channel_id, creator_id, question, end_time) 
         VALUES (?, ?, ?, ?, datetime('now', '+' || ? || ' minutes'))`,
            [
              interaction.guildId,
              interaction.channelId,
              interaction.user.id,
              question,
              duration.toString()
            ],
            function (err) {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
                return;
              }

              const pollId = this.lastID;
              console.log('Created poll with ID:', pollId);

              let insertPromises = optionsArray.map((option) => {
                return new Promise<void>((resolveOption, rejectOption) => {
                  db.run(
                    'INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)',
                    [pollId, option],
                    (err) => {
                      if (err) {
                        // console.error('Error inserting option:', option, err);
                        rejectOption(err);
                      } else {
                        // console.log('Successfully inserted option:', option);
                        resolveOption();
                      }
                    }
                  );
                });
              });

              Promise.all(insertPromises)
                .then(() => {
                  // Verify all options were inserted correctly
                  db.all(
                    `SELECT id, option_text
                 FROM poll_options
                 WHERE poll_id = ?
                 ORDER BY id ASC`,
                    [pollId],
                    (err, results) => {
                      if (err) {
                        console.error('Error verifying options:', err);
                        db.run('ROLLBACK');
                        reject(err);
                      } else {
                        // console.log('All inserted options:', results);
                        if (results.length === optionsArray.length) {
                          db.run('COMMIT', (err) => {
                            if (err) {
                              console.error('Error committing transaction:', err);
                              db.run('ROLLBACK');
                              reject(err);
                            } else {
                              resolve(pollId);
                            }
                          });
                        } else {
                          console.error('Not all options were inserted:', {
                            expected: optionsArray.length,
                            actual: results.length
                          });
                          db.run('ROLLBACK');
                          reject(new Error('Not all options were inserted'));
                        }
                      }
                    }
                  );
                })
                .catch((err) => {
                  console.error('Error in promise.all:', err);
                  db.run('ROLLBACK');
                  reject(err);
                });
            }
          );
        });
      });

      pollId = result;
    } catch (error) {
      console.error('Database error:', error);
      await interaction.editReply({
        content: 'An error occurred while creating the poll in the Blockchain.',
      });
      return;
    }

    // Create embed for the poll
    const pollEmbed = await createPollEmbed(question, pollId, duration * 60, interaction.user.id, pollUrl, true);

    // Create button rows (max 5 buttons per row)
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    let currentRow = new ActionRowBuilder<ButtonBuilder>();

    optionsArray.forEach((option, index) => {
      const button = new ButtonBuilder()
        .setCustomId(`vote_${pollId}_${index}`)
        .setLabel(option)
        .setStyle(ButtonStyle.Primary);

      currentRow.addComponents(button);

      // Create new row after 5 buttons or if it's the last option
      if (currentRow.components.length === 5 || index === optionsArray.length - 1) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder<ButtonBuilder>();
      }
    });

    // Add "View Results" button in a new row
    const resultsRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`results_${pollId}`)
          .setLabel('View Results')
          .setStyle(ButtonStyle.Secondary)
      );
    rows.push(resultsRow);

    // Send the poll message
    await interaction.editReply({
      embeds: [pollEmbed],
      components: rows
    });

    // Set up timer to end the poll
    setTimeout(async () => {
      try {
        const db = getDb();
        db.run('UPDATE polls SET is_active = 0 WHERE id = ?', [pollId]);

        // Get final results
        const results = await getPollResults(pollId);

        // Update embed with final results
        const finalEmbed = new EmbedBuilder()
          .setTitle(`${question} (Ended)`)
          .setDescription(formatResults(results as any[]))
          .setColor('#ff0000')
          .setFooter({
            text: `Poll ID: ${pollId} • Poll has ended • Powered by Starknet`,
            iconURL: STARKNET_LOGO_URL
          });

        await interaction.editReply({
          embeds: [finalEmbed],
          components: [] // Remove all buttons when poll ends
        });
      } catch (error) {
        console.error('Error ending poll:', error);
      }
    }, duration * 60 * 1000);

  } catch (error) {
    console.error('Error in createPollCommand:', error);
    if (!interaction.deferred) {
      await interaction.deferReply();
    }
    await interaction.editReply({
      content: 'An error occurred while creating the poll. Please try again.',
    });
  }
};

// Helper function to format results
function formatResults(results: any[]): string {
  const totalVotes = results.reduce((sum, opt) => sum + opt.vote_count, 0);
  return results
    .map(r => {
      const percentage = totalVotes ? ((r.vote_count / totalVotes) * 100).toFixed(1) : '0.0';
      const bar = '█'.repeat(Math.floor(Number(percentage) / 5)) + '░'.repeat(20 - Math.floor(Number(percentage) / 5));
      return `${r.option_text}\n${bar} ${percentage}% (${r.vote_count} votes)`;
    })
    .join('\n\n');
}

// Helper function to get poll results
async function getPollResults(pollId: number) {
  let result = new Promise((resolve, reject) => {
    const db = getDb();
    db.all(
      `SELECT 
        po.id,
        po.option_text,
        COUNT(v.id) as vote_count
      FROM poll_options po
      LEFT JOIN votes v ON po.id = v.option_id
      WHERE po.poll_id = ?
      GROUP BY po.id, po.option_text`,
      [pollId],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });

  return result;
}

// Add this helper function to get user's current vote
async function getUserVote(pollId: number, userId: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get(
      `SELECT po.option_text
       FROM votes v
       JOIN poll_options po ON v.option_id = po.id
       WHERE v.poll_id = ? AND v.user_id = ?`,
      [pollId, userId],
      (err, result) => {
        if (err) reject(err);
        else resolve(result ? (result as any).option_text : null);
      }
    );
  });
}

// Helper function to create poll embed with user vote
async function createPollEmbed(
  question: string,
  pollId: number,
  duration: number, // seconds
  userId: string,
  pollUrl: string,
  isActive: boolean = true
): Promise<EmbedBuilder> {
  const userVote = await getUserVote(pollId, userId);

  const embed = new EmbedBuilder()
    .setTitle(question)
    .setDescription(
      `Click a button below to vote! \n[View on StarkScan](${pollUrl})`
    )
    .setColor(isActive ? '#E175B1' : '#EC796B');

  if (isActive) {
    embed.setFooter({
      text: `Poll ID: ${pollId} • Ends in ${formatDurationLeft(duration)} • Powered by Starknet`,
      iconURL: STARKNET_LOGO_URL
    });
  } else {
    embed.setFooter({
      text: `Poll ID: ${pollId} • Poll has ended • Powered by Starknet`,
      iconURL: STARKNET_LOGO_URL
    });
  }

  return embed;
}

/**
 * convert a duration in seconds to a human-readable format
 * 
 * @param duration - duration in seconds
 * @returns - formatted duration string
 */
const formatDurationLeft = (duration: number): string => {
  const days = Math.floor(duration / (3600 * 24));
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;

  return `${duration}s`;
};
export const handlePollButton = async (interaction: ButtonInteraction) => {
  try {
    const [action, pollId, optionIndex] = interaction.customId.split('_');

    // Acknowledge the interaction immediately to prevent timeout
    // This gives you up to 15 minutes to process and edit the response
    await interaction.deferReply({ ephemeral: true });

    const db = getDb();

    // Check if poll is still active
    const poll = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM polls WHERE id = ?',
        [pollId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    if (action === 'vote') {
      // ensure user didn't vote already
      const userVoted = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM votes WHERE poll_id = ? AND user_id = ?',
          [pollId, interaction.user.id],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });

      if (userVoted) {
        await interaction.editReply({
          content: 'You already voted for this poll.'
        });
        return;
      };

      // Rate limit check
      const canVote = await checkVoteRateLimit(interaction.user.id);
      if (!canVote) {
        const { userVotes } = getRemainingLimits(interaction.user.id);
        const errorMessage = userVotes === 0
          ? `⚠️ You exceeded your rate limit, please wait a few minutes`
          : `⚠️ Bot is under heavy load. Please try again in a few minutes.`;
        await interaction.editReply({
          content: errorMessage
        });
        return;
      }

      // Get the option and record vote
      const option = await new Promise((resolve, reject) => {
        db.get(
          `SELECT id, option_text 
           FROM poll_options 
           WHERE poll_id = ? 
           ORDER BY id ASC
           LIMIT 1 OFFSET ?`,
          [pollId, Number(optionIndex)],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });

      if (!option) {
        await interaction.editReply({
          content: 'Invalid option selected.'
        });
        return;
      }

      // Let the user know we're processing their vote
      await interaction.editReply({
        content: '⏳ Processing your vote on Starknet (this may take a few moments)...'
      });

      // Save on Starknet
      try {
        const signerPriv = getUserPrivateKey(interaction);
        const signerPubKey = (new Curve(CurveName.SECP256K1)).GtoPoint().mult(signerPriv);
        const vote_result = await vote(Number(pollId) - 1 /* starknet polls id start at 0 and sqlite makes the poll ids start at 1 */, Number(optionIndex), signerPriv, await getRing(Number(interaction.user.id), signerPubKey));
        console.log('vote_result on starknet: ', vote_result);

        if (!vote_result) {
          await interaction.editReply({
            content: 'Failed to vote on Starknet.'
          });
          return;
        }

        // Record vote in local database
        await new Promise<void>((resolve, reject) => {
          db.run(
            'INSERT OR REPLACE INTO votes (poll_id, option_id, user_id) VALUES (?, ?, ?)',
            [pollId, (option as any).id, interaction.user.id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        console.log('Vote recorded locally for user:', interaction.user.id);

        // Get time left for the poll
        const timeLeft = await new Promise((resolve, reject) => {
          db.get(
            `SELECT strftime('%s', end_time) - strftime('%s', 'now') as time_left
             FROM polls
             WHERE id = ?`,
            [pollId],
            (err, result) => {
              if (err) reject(err);
              else resolve(result ? (result as any).time_left : 0);
            }
          );
        }) as number;

        // Update the poll embed with the new vote
        const updatedEmbed = await createPollEmbed(
          (poll as any).question,
          Number(pollId),
          timeLeft,
          interaction.user.id,
          `https://${process.env.TESTNET == 'true' ? 'sepolia.' : ''}starkscan.co/tx/${vote_result.transaction_hash}`
        );

        try {
          // First, fetch the channel if needed
          const channel = await interaction.client.channels.fetch(interaction.channelId);
          if (!channel?.isTextBased()) {
            throw new Error('Channel is not text-based');
          }

          // Then fetch the message
          const message = await channel.messages.fetch(interaction.message.id);

          // Update the message
          await message.edit({
            embeds: [updatedEmbed],
            components: message.components
          });

          await interaction.editReply({
            content: `🗳️ Your vote has been recorded! [View on StarkScan](https://${process.env.TESTNET == 'true' ? 'sepolia.' : ''}starkscan.co/tx/${vote_result.transaction_hash})`
          });
        } catch (error) {
          console.error('Error updating message:', error);
          await interaction.editReply({
            content: `🗳️ Your vote has been recorded, but the display couldn't be updated. The results are still accurate! [View on StarkScan](https://${process.env.TESTNET == 'true' ? 'sepolia.' : ''}starkscan.co/tx/${vote_result.transaction_hash})`
          });
        }
      } catch (error) {
        console.error('Error processing vote on Starknet:', error);
        await interaction.editReply({
          content: 'An error occurred while processing your vote on Starknet. Please try again.'
        });
      }
    } else if (action === 'results') {
      const results = await getPollResults(Number(pollId));
      const userVote = await getUserVote(Number(pollId), interaction.user.id);

      const resultsEmbed = new EmbedBuilder()
        .setTitle('Current Results')
        .setDescription(
          formatResults(results as any[])
        )
        .setColor('#E175B1')
        .setFooter({
          text: `Poll ID: ${pollId} • Powered by Starknet`,
          iconURL: STARKNET_LOGO_URL
        });

      await interaction.editReply({
        embeds: [resultsEmbed]
      });
    }
  } catch (error) {
    console.error('Error handling poll interaction:', error);

    // Try to respond if we haven't already
    try {
      if (interaction.deferred) {
        await interaction.editReply({
          content: 'An error occurred while processing your request. Your vote may still have been recorded.'
        });
      } else {
        await interaction.reply({
          content: 'An error occurred while processing your request. Your vote may still have been recorded.',
          ephemeral: true
        });
      }
    } catch (replyError) {
      console.error('Error sending error response:', replyError);
    }
  }
};