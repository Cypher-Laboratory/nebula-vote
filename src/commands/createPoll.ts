import {
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ButtonInteraction
} from 'discord.js';
import { getDb } from '../database';

export const createPollCommand = async (interaction: CommandInteraction) => {
  const question = interaction.options.get('question')?.value as string;
  const options = interaction.options.get('options')?.value as string;
  const duration = interaction.options.get('duration')?.value as number;

  const optionsArray = options.split(',').map(opt => opt.trim());
  
  if (optionsArray.length < 2) {
    await interaction.reply({
      content: 'Please provide at least 2 options for the poll.',
      ephemeral: true,
    });
    return;
  }

  const db = getDb();
  
  try {
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(
          'INSERT INTO polls (guild_id, channel_id, creator_id, question, end_time) VALUES (?, ?, ?, ?, datetime(CURRENT_TIMESTAMP, ?));',
          [
            interaction.guildId, 
            interaction.channelId, 
            interaction.user.id, 
            question, 
            `+${duration} minutes`
          ],
          function(err) {
            if (err) {
              console.error('Error creating poll:', err);
              reject(err);
              return;
            }

            const pollId = this.lastID;
            console.log('Created poll with ID:', pollId);
            
            let completed = 0;
            optionsArray.forEach((option, index) => {
              db.run(
                'INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)',
                [pollId, option],
                (err) => {
                  if (err) {
                    console.error(`Error creating option ${option}:`, err);
                    reject(err);
                    return;
                  }
                  completed++;
                  if (completed === optionsArray.length) {
                    resolve(pollId);
                  }
                }
              );
            });
          }
        );
      });
    });

    // Get the options to display them in the response
    const options = await new Promise((resolve, reject) => {
      db.all(
        'SELECT id, option_text FROM poll_options WHERE poll_id = (SELECT MAX(id) FROM polls)',
        [],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows as any);
        }
      );
    }) as { id: number, option_text: string }[];

    const optionsList = options.map(opt => `${opt.id}. ${opt.option_text}`).join('\n');
    
    await interaction.reply({
      content: `Poll created!\n\nQuestion: ${question}\n\nOptions:\n${optionsList}\n\nUse /vote poll_id:<poll_id> option_id:<option_id> to vote!`,
      ephemeral: false
    });
  } catch (error) {
    console.error('Error in createPoll:', error);
    await interaction.reply({
      content: 'There was an error creating your poll. Please try again.',
      ephemeral: true
    });
  }

  await interaction.reply({
    content: `Poll created: ${question}\nOptions: ${optionsArray.join(', ')}\nDuration: ${duration} minutes`,
    ephemeral: false,
  });
};

// Add the exported button handler
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
      // Get current results
      const results = await new Promise((resolve, reject) => {
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
  return new Promise((resolve, reject) => {
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
}