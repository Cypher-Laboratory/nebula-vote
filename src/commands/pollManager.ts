import {
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  EmbedBuilder
} from 'discord.js';
import { getDb } from '../database';

export const createPollCommand = async (interaction: CommandInteraction) => {
  try {
    await interaction.deferReply();

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

    const db = getDb();
    let pollId: number;

    // Create poll in database
    try {
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
              let insertPromises = optionsArray.map((option) => {
                return new Promise<void>((resolveOption, rejectOption) => {
                  db.run(
                    'INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)',
                    [pollId, option],
                    (err) => {
                      if (err) {
                        rejectOption(err);
                      } else {
                        resolveOption();
                      }
                    }
                  );
                });
              });

              Promise.all(insertPromises)
                .then(() => {
                  db.run('COMMIT', (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      reject(err);
                    } else {
                      resolve(pollId);
                    }
                  });
                })
                .catch((err) => {
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
        content: 'An error occurred while creating the poll in the database.',
      });
      return;
    }

    // Create embed for the poll
    const pollEmbed = new EmbedBuilder()
      .setTitle(question)
      .setDescription('Click a button below to vote!')
      .setColor('#00ff00')
      .setFooter({ text: `Poll ID: ${pollId} • Ends in ${duration} minutes` });

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
          .setFooter({ text: `Poll ID: ${pollId} • Poll has ended` });

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
  console.log('Getting results for poll:', pollId);
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

  console.log('Results:', await result);
  return result;
}

export const handlePollButton = async (interaction: ButtonInteraction) => {
  try {
    const [action, pollId, optionIndex] = interaction.customId.split('_');
    const db = getDb();

    // Check if poll is still active
    const poll = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM polls WHERE id = ? AND is_active = 1 AND datetime("now") < end_time',
        [pollId],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    if (!poll) {
      await interaction.reply({
        content: 'This poll has ended.',
        ephemeral: true
      });
      return;
    }

    if (action === 'vote') {
      console.log('Vote action:', pollId, optionIndex);
      console.log("interaction: ", interaction);

      // Get option ID
      const option = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id FROM poll_options WHERE poll_id = ? AND rowid = ?',
          [pollId, Number(optionIndex) + 1],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });

      if (!option) {
        await interaction.reply({
          content: 'Invalid option selected.',
          ephemeral: true
        });
        return;
      }

      // Record vote
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

      await interaction.reply({
        content: 'Your vote has been recorded!',
        ephemeral: true
      });

    } else if (action === 'results') {
      const results = await getPollResults(Number(pollId));

      const resultsEmbed = new EmbedBuilder()
        .setTitle('Current Results')
        .setDescription(formatResults(results as any[]))
        .setColor('#0099ff')
        .setFooter({ text: `Poll ID: ${pollId}` });

      await interaction.reply({
        embeds: [resultsEmbed],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Error handling poll interaction:', error);
    await interaction.reply({
      content: 'An error occurred while processing your request.',
      ephemeral: true
    });
  }
};