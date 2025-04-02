---
title: Discord Bot Developer Guide
sidebar_label: Discord
slug: /docs/developer-guide/discord
---
This section is for developers who want to set up, customize, or modify their own instance of the Nebula Vote Discord bot.

## Technical Architecture

Nebula Vote is built with:
- **Node.js** - Runtime environment
- **TypeScript** - Primary programming language
- **Discord.js** - Framework for interacting with Discord API
- **Starknet.js** - For blockchain interactions
- **Alice's Ring** - Cryptography library

The application follows a modular architecture with separate components for:
- Command handling
- Poll management
- Database operations
- Rate limiting
- Blockchain interactions

## Installation & Setup

### Prerequisites

- Node.js 20.x or higher
- Yarn package manager
- Discord bot token and application ID
- Starknet development environment
- Basic familiarity with TypeScript and Discord bot development

### Environment Configuration

1. Clone the repository:
```bash
git clone https://github.com/Cypher-Laboratory/nebula-vote.git
cd nebula-vote
```

2. Install dependencies:
```bash
yarn install
```

3. Create and configure the environment variables:
```bash
cd packages/discord_bot && cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id

# Database Configuration
DB_FILENAME=polls.db

# Poll Settings
MAX_POLL_OPTIONS=20
MAX_POLL_DURATION=43200
MIN_POLL_DURATION=1
DEFAULT_POLL_DURATION=1440

# Rate Limiting
TIME_PERIOD=30
GLOBAL_POLLS_LIMIT=60
GLOBAL_VOTES_LIMIT=20000
USER_VOTES_LIMIT=6

# Starknet params
NEBULA_SALT=your_nebula_salt_here # must be unique and secret
RING_SIZE=16 # number of addresses in the ring signature (group of users the voter is hidden in), default is 16
CONTRACT_ADDRESS=
ACCOUNT_PRIVATE_KEY=
ACCOUNT_ADDRESS=
STARKNET_NODE_URL=
```

4. Deploy Discord commands:
```bash
yarn build && yarn deploy-commands
```

5. Start the bot:
```bash
# Development mode
yarn dev

# Production mode
yarn build
yarn start
```

### Database Setup

The bot automatically creates the necessary database tables on startup. The database schema is defined in `database.ts`.

### Authentication & Permissions
To use your bot in a Discord server, you need to:
1. Create a new Discord application and bot in the [Discord Developer Portal](https://discord.com/developers/applications)
2. Grant the bot the necessary permissions (`applications.commands`, `message content`, etc.)
3. Copy the bot token and client ID to the `.env` file
4. Save the Discord invite link for your bot

## Core Components

### Command Structure

The bot's command structure follows Discord.js slash command patterns:

1. **Command Registration** (`deploy-commands.ts`):
   - Defines the command structure for Discord
   - Registers commands with Discord API

2. **Command Handlers** (`commands/` directory):
   - Each command has its own handler file
   - Exports a `data` object defining the command
   - Exports an `execute` function that runs when the command is invoked

3. **Command Routing** (`registerCommands.ts`):
   - Routes incoming interactions to appropriate handlers
   - Handles errors and provides feedback

### Poll Management

The poll lifecycle is managed by `createPollCommand` and `handlePollButton` functions in `pollManager.ts`:

1. **Poll Creation**:
   - Validates input parameters
   - Creates database entries
   - Generates interactive message with buttons
   - Sets up timer for poll expiration

2. **Vote Handling**:
   - Records votes in database
   - Updates user's vote if changed
   - Updates poll embed with confirmation

3. **Results Display**:
   - Formats results with percentages and visual bars
   - Shows individual's own vote privately
   - Updates final results when poll ends

### Rate Limiting

The bot implements rate limiting to prevent abuse:

- **Global Poll Limit**: Maximum number of polls created per time window
- **Global Vote Limit**: Maximum number of votes across all polls per time window
- **User Vote Limit**: Maximum number of votes per user per time window

Rate limits are configured in the `.env` file and managed by the `rateLimiter.ts` module.

## Customization Guide

### Adding New Commands

To add a new command:

1. Create a new file in the `commands/` directory
2. Define the command structure using `SlashCommandBuilder`
3. Implement the `execute` function
4. Add the command to `deploy-commands.ts`
5. Register the command handler in `registerCommands.ts`

Example of a new command:

```typescript
// commands/mycommand.ts
import {
  CommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('mycommand')
  .setDescription('Description of my new command')
  .addStringOption(option =>
    option
      .setName('parameter')
      .setDescription('A parameter for my command')
      .setRequired(true)
  );

export const execute = async (interaction: CommandInteraction) => {
  const parameter = interaction.options.get('parameter')?.value as string;
  await interaction.reply({
    content: `You entered: ${parameter}`,
    ephemeral: true
  });
};
```

### Modifying Poll Behavior

To customize how polls work:

1. **Change Poll Creation Logic**:
   - Modify `createPollCommand` in `pollManager.ts`
   - Adjust validation rules, defaults, or behavior

2. **Modify Poll UI**:
   - Update the `createPollEmbed` function to change poll appearance
   - Modify button configurations in the ActionRow components

3. **Alter Results Display**:
   - Change the `formatResults` function to display results differently
   - Add additional statistics or visualizations

### Changing UI Elements

The bot uses Discord.js `EmbedBuilder` and `ButtonBuilder` for UI elements:

1. **Embeds**: Modify the `EmbedBuilder` instances to change colors, titles, and formatting
   ```typescript
   const embed = new EmbedBuilder()
     .setTitle('Custom Title')
     .setColor('#FF5733')  // Custom color
     .setDescription('Custom description');
   ```

2. **Buttons**: Customize button appearance and behavior
   ```typescript
   const button = new ButtonBuilder()
     .setCustomId('custom_id')
     .setLabel('Custom Label')
     .setStyle(ButtonStyle.Success);  // Different style
   ```

3. **Results Format**: Change the visual representation of results
   ```typescript
   // Example: Change progress bar characters
   const bar = '■'.repeat(Math.floor(Number(percentage) / 5)) + 
               '□'.repeat(20 - Math.floor(Number(percentage) / 5));
   ```

### Advanced Configuration

For more significant customizations:

1. **Blockchain Integration**:
   - Modify the Ring Signature implementation
   - Change how votes are recorded on-chain
   - Add additional verification steps

2. **Database Structure**:
   - Alter the database schema in `database.ts`
   - Add new tables for additional features
   - Modify relationships between entities

3. **Rate Limiting**:
   - Change how rate limits are applied in `rateLimiter.ts`
   - Add different types of limits for various actions
   - Implement more sophisticated anti-abuse mechanisms

## Security Considerations

When customizing the bot, keep these security best practices in mind:

1. **Input Validation**:
   - Always validate and sanitize user input
   - Use parameterized queries for database operations
   - Implement proper error handling

2. **Rate Limiting**:
   - Don't remove rate limiting functionality
   - Consider the impact of changes on server load
   - Test thoroughly under high volume conditions

3. **Privacy Protection**:
   - Preserve the Ring Signature implementation
   - Don't store data that could compromise voter anonymity
   - Maintain separation between vote content and voter identity

4. **Environment Variables**:
   - Never hardcode sensitive information
   - Use environment variables for all secrets
   - Don't commit `.env` files to version control

5. **Discord Permissions**:
   - Request only the permissions the bot actually needs
   - Follow the principle of least privilege

By following these guidelines, you can customize the Nebula Vote bot while maintaining its security, privacy, and performance characteristics.

---

## Support & Contribution

For questions, support, or to contribute to the development of Nebula Vote, please:

- Join our [Discord community](https://discord.gg/YpYquYTXsf)
- Visit our [GitHub repository](https://github.com/yourusername/nebulavote)
- Contact us at [contact@cypherlab.org](mailto:contact@cypherlab.org)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.