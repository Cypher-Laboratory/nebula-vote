
import { CommandInteraction } from 'discord.js';
import { getDb } from '../database';

export const voteCommand = async (interaction: CommandInteraction) => {
  const pollId = interaction.options.get('poll_id')?.value as number;
  const optionId = interaction.options.get('option_id')?.value as number;

  const db = getDb();

  db.get(
    'SELECT * FROM polls WHERE id = ? AND is_active = 1 AND datetime("now") < end_time',
    [pollId],
    (err, poll) => {
      if (err || !poll) {
        interaction.reply({
          content: 'Poll not found or has ended.',
          ephemeral: true,
        });
        return;
      }

      db.run(
        'INSERT OR REPLACE INTO votes (poll_id, option_id, user_id) VALUES (?, ?, ?)',
        [pollId, optionId, interaction.user.id],
        (err) => {
          if (err) {
            console.error('Error recording vote:', err);
            interaction.reply({
              content: 'Error recording your vote.',
              ephemeral: true,
            });
            return;
          }

          interaction.reply({
            content: 'Your vote has been recorded!',
            ephemeral: true,
          });
        }
      );
    }
  );
};