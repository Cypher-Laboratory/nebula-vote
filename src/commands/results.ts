import { CommandInteraction } from 'discord.js';
import { getDb } from '../database';

export const resultsCommand = async (interaction: CommandInteraction) => {
  const pollId = interaction.options.get('poll_id')?.value as number;

  const db = getDb();

  db.all(
    `SELECT 
      po.option_text,
      COUNT(v.id) as vote_count
    FROM poll_options po
    LEFT JOIN votes v ON po.id = v.option_id
    WHERE po.poll_id = ?
    GROUP BY po.id, po.option_text`,
    [pollId],
    async (err, results: any[]) => {
      if (err) {
        console.error('Error fetching results:', err);
        await interaction.reply({
          content: 'Error fetching poll results.',
          ephemeral: true,
        });
        return;
      }

      const resultText = results
        .map(r => `${r.option_text}: ${r.vote_count} votes`)
        .join('\n');

      await interaction.reply({
        content: `Poll Results:\n${resultText}`,
        ephemeral: false,
      });
    }
  );
};