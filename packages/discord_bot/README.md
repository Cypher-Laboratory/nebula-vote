# 🗳️ NebulaVote Discord Bot Documentation

This document provides comprehensive information about the NebulaVote Discord polling bot, a privacy-focused, on-chain polling solution built on Starknet.

## 📚 Table of Contents

### User Guide
- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Adding the Bot to Your Server](#adding-the-bot-to-your-server)
  - [Basic Commands](#basic-commands)
- [Creating Polls](#creating-polls)
  - [Poll Parameters](#poll-parameters)
  - [Duration Presets](#duration-presets)
- [Voting in Polls](#voting-in-polls)
- [Viewing Results](#viewing-results)
- [Advanced Privacy Features](#advanced-privacy-features)

### Developer Guide
- [🗳️ NebulaVote Discord Bot Documentation](#️-nebulavote-discord-bot-documentation)
  - [📚 Table of Contents](#-table-of-contents)
    - [User Guide](#user-guide)
    - [Developer Guide](#developer-guide)
- [User Guide](#user-guide-1)
  - [Introduction](#introduction)
  - [Features](#features)
    - [Privacy \& Security](#privacy--security)
    - [User Experience](#user-experience)
  - [Getting Started](#getting-started)
    - [Adding the Bot to Your Server](#adding-the-bot-to-your-server)
    - [Basic Commands](#basic-commands)
  - [Creating Polls](#creating-polls)
    - [Poll Parameters](#poll-parameters)
    - [Duration Presets](#duration-presets)
  - [Voting in Polls](#voting-in-polls)
  - [Viewing Results](#viewing-results)
  - [Advanced Privacy Features](#advanced-privacy-features)
    - [Ring Signatures](#ring-signatures)
    - [Smart Contract Integration](#smart-contract-integration)
- [Developer Guide](#developer-guide-1)
  - [Technical Architecture](#technical-architecture)
  - [Installation \& Setup](#installation--setup)
    - [Prerequisites](#prerequisites)
    - [Environment Configuration](#environment-configuration)
    - [Database Setup](#database-setup)
  - [Core Components](#core-components)
    - [Command Structure](#command-structure)
    - [Database Schema](#database-schema)
    - [Poll Management](#poll-management)
    - [Rate Limiting](#rate-limiting)
  - [Customization Guide](#customization-guide)
    - [Adding New Commands](#adding-new-commands)
    - [Modifying Poll Behavior](#modifying-poll-behavior)
    - [Changing UI Elements](#changing-ui-elements)
    - [Advanced Configuration](#advanced-configuration)
  - [Security Considerations](#security-considerations)
  - [Support \& Contribution](#support--contribution)
  - [License](#license)

---

# User Guide

## Introduction

NebulaVote is a privacy-first Discord polling bot that enables communities to conduct secure, anonymous voting through Starknet blockchain technology and Ring Signatures. The bot allows you to create interactive polls where:

- 🔒 Votes remain completely private
- ✅ Results are cryptographically verifiable
- 🔗 All data is stored securely on the Starknet blockchain
- 🛡️ Double-voting is prevented while maintaining anonymity

Perfect for DAOs, community governance, and any group decision-making where privacy and verifiability are important.

## Features

### Privacy & Security
- **Ring Signature Technology**: Uses Alice's Ring cryptographic library for true voter privacy
- **Anonymous Voting**: No one can see who voted for what, not even the poll creator
- **Double-Vote Prevention**: Each user can only vote once per poll, without compromising anonymity
- **On-Chain Verification**: All votes are securely recorded on Starknet blockchain

### User Experience
- **Interactive Interface**: Easy-to-use Discord slash commands
- **Real-Time Results**: View poll results as they happen
- **Visual Displays**: Progress bars show vote distributions clearly
- **Custom Durations**: Set polls to run for minutes, hours, days, or weeks
- **Multiple Options**: Support for up to 20 different voting options per poll

## Getting Started

### Adding the Bot to Your Server

**To use the official NebulaVote bot:**

1. Visit the following link to invite the bot to your server:
```
https://discord.com/oauth2/authorize?client_id=1332644824029069322&permissions=76800&scope=bot%20applications.commands
```

2. Select your server from the dropdown menu
3. Review and authorize the requested permissions
4. Once added, the bot will be available in your server

> **Note**: You need "Manage Server" permissions to add the bot to a Discord server.

### Basic Commands

NebulaVote uses Discord's slash commands for all interactions. Here are the main commands:

- `/poll` - Create a new poll
- `/info` - View information about the bot
- `/help` - Get help with using commands

Type `/` in any channel where the bot has access to see these commands in Discord's command interface.

## Creating Polls

To create a new poll, use the `/poll` command with the following syntax:

```
/poll question:"What should we build next?" options:"DeFi,GameFi,Infrastructure" duration:1440
```

### Poll Parameters

| Parameter | Description | Required | Limits |
|-----------|-------------|----------|--------|
| `question` | The main question for your poll | Yes | Text |
| `options` | Comma-separated list of voting options | Yes | 2-20 options |
| `duration` | How long the poll will run (in minutes) | Yes | 1-43200 minutes |

### Duration Presets

When creating a poll, you can choose from these convenient duration presets:

- 5 minutes
- 15 minutes
- 30 minutes
- 1 hour (60 minutes)
- 2 hours (120 minutes)
- 6 hours (360 minutes)
- 12 hours (720 minutes)
- 1 day (1440 minutes)
- 1 week (10080 minutes)
- 1 month (43200 minutes)

You can also enter a custom duration in minutes, up to the maximum of 43200 minutes (30 days).

## Voting in Polls

To vote in an active poll:

1. Find the poll message in your Discord channel
2. Click on the button corresponding to your preferred option
3. You'll receive a private confirmation that your vote was recorded
4. Your current vote will be displayed to you (only you can see it)

You can change your vote at any time while the poll is active by clicking a different option.

## Viewing Results

There are two ways to view poll results:

1. **View Results Button**: Click the "View Results" button below any active poll
2. **Poll Completion**: When a poll ends, the final results are displayed to everyone

Results show:
- Each option with its vote count
- Percentage of total votes for each option
- Visual progress bars for easy comparison

> **Privacy Note**: While you can see which option you voted for, you cannot see how others voted. Only the aggregate results are visible.

## Advanced Privacy Features

NebulaVote's privacy protections are powered by:

### Ring Signatures
The bot uses Alice's Ring library for cryptographic privacy. Each vote is:
- Anonymous but verifiable
- Protected against double-voting
- Mathematically proven to be private
- On-chain verifiable

### Smart Contract Integration
- All poll data is recorded on Starknet
- Results can be accessed by other smart contracts
- Enables privacy-preserving reward distribution
- Maintains voter anonymity while ensuring vote integrity

---

# Developer Guide

This section is for developers who want to set up, customize, or modify their own instance of the NebulaVote bot.

## Technical Architecture

NebulaVote is built with:
- **Node.js** - Runtime environment
- **TypeScript** - Primary programming language
- **Discord.js** - Framework for interacting with Discord API
- **SQLite** - Local database for storing poll information
- **Starknet.js** - For blockchain interactions
- **Alice's Ring** - Zero-knowledge cryptography library

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
git clone https://github.com/yourusername/nebulavote
cd nebulavote
```

2. Install dependencies:
```bash
yarn install
```

3. Create and configure the environment variables:
```bash
cp .env.example .env
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
```

4. Deploy Discord commands:
```bash
ts-node deploy-commands.ts
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

### Database Schema

The database consists of three main tables:

**Polls Table**
```sql
CREATE TABLE polls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  question TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME,
  is_active BOOLEAN DEFAULT 1
);
```

**Poll Options Table**
```sql
CREATE TABLE poll_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id INTEGER NOT NULL,
  option_text TEXT NOT NULL,
  FOREIGN KEY (poll_id) REFERENCES polls (id)
);
```

**Votes Table**
```sql
CREATE TABLE votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  poll_id INTEGER NOT NULL,
  option_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (poll_id) REFERENCES polls (id),
  FOREIGN KEY (option_id) REFERENCES poll_options (id),
  UNIQUE(poll_id, user_id)
);
```

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

By following these guidelines, you can customize the NebulaVote bot while maintaining its security, privacy, and performance characteristics.

---

## Support & Contribution

For questions, support, or to contribute to the development of NebulaVote, please:

- Join our [Discord community](https://discord.gg/nebulavote)
- Visit our [GitHub repository](https://github.com/yourusername/nebulavote)
- Contact us at [contact@cypherlab.org](mailto:contact@cypherlab.org)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.