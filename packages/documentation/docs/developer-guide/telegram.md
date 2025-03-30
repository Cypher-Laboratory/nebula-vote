---
title: Telegram Bot Developer Guide
sidebar_label: Telegram
slug: /docs/developer-guide/telegram
---

This section is for developers who want to set up, customize, or modify their own instance of the Nebula Vote Telegram bot.

## Technical Architecture

Nebula Vote Telegram bot is built with:
- **Node.js** - Runtime environment
- **TypeScript** - Primary programming language
- **Telegraf** - Framework for interacting with Telegram Bot API
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
- Telegram Bot Token (from @BotFather)
- Starknet development environment
- Basic familiarity with TypeScript and Telegram bot development

### Environment Configuration

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nebulavote-telegram
cd nebulavote-telegram
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
# Telegram Configuration
TELEGRAM_TOKEN=your_telegram_bot_token

# Database Configuration
DB_FILENAME=polls.db

# Poll Settings
MAX_POLL_OPTIONS=20
MAX_POLL_DURATION=10080
MIN_POLL_DURATION=1
DEFAULT_POLL_DURATION=15

# Rate Limiting
TIME_PERIOD=30
GLOBAL_POLLS_LIMIT=60
GLOBAL_VOTES_LIMIT=20000
USER_VOTES_LIMIT=6
```

4. Test the bot connection:
```bash
yarn test-connection
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

The bot automatically creates the necessary database tables on startup. The database schema is defined in `database.ts`:

## Core Components

### Bot Structure

The bot's structure is organized around the Telegraf framework:

1. **Main Bot Setup** (`bot.ts`):
   - Initializes the Telegraf bot
   - Sets up middleware
   - Registers command handlers
   - Configures callback query handling

2. **Command Handlers**:
   - `/start` - Introduction and help message
   - `/createpoll` - Poll creation logic
   - `/help` - Provides general or command-specific help
   - `/ping` - Simple connectivity test

3. **Poll Management** (`pollManager.ts`):
   - Functions for creating, managing and ending polls
   - Vote handling
   - Result formatting
   - User vote tracking

### Database Schema

The database consists of three main tables:

**Polls Table**
```sql
CREATE TABLE polls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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

The poll lifecycle is managed by several functions in `pollManager.ts`:

1. **Poll Creation**:
   - Validates input parameters
   - Creates database entries
   - Generates inline keyboard for voting
   - Sets up poll expiration

2. **Vote Handling**:
   - Records votes in database
   - Prevents double voting
   - Updates poll message with new results

3. **Results Display**:
   - Formats results with percentages and visual bars
   - Shows total vote count
   - Indicates time remaining

### Rate Limiting

The bot implements rate limiting to prevent abuse:

- **Global Poll Limit**: Maximum number of polls created per time window
- **Global Vote Limit**: Maximum number of votes across all polls per time window
- **User Vote Limit**: Maximum number of votes per user per time window

Rate limits are configured in the `.env` file and managed by the `rateLimiter.ts` module.

## Customization Guide

### Adding New Commands

To add a new command:

1. Open `bot.ts`
2. Add a new command handler:

```typescript
bot.command('yourcommand', async (ctx) => {
  console.log('Received yourcommand command');
  // Your command logic here
  await ctx.reply('Your command response');
});
```

For more complex commands, you may want to create a separate function or file to handle the logic.

### Modifying Poll Behavior

To customize how polls work:

1. **Change Poll Creation Logic**:
   - Modify the `createPoll` function in `pollManager.ts`
   - Adjust validation rules, defaults, or behavior

2. **Modify Poll UI**:
   - Update the `formatPollResults` function to change poll appearance
   - Modify the keyboard generation in the bot's callback handlers

3. **Alter Poll Duration**:
   - Change the default duration in the config
   - Adjust the minimum and maximum allowed durations

### Changing UI Elements

The bot uses HTML formatting for messages and inline keyboards for interaction:

1. **Message Formatting**: Customize how polls are displayed
   ```typescript
   // Example: Change progress bar characters
   const bar = '■'.repeat(Math.floor(Number(percentage) / 5)) + 
               '□'.repeat(20 - Math.floor(Number(percentage) / 5));
   ```

2. **Inline Keyboards**: Change the button layout or text
   ```typescript
   const keyboard = {
     inline_keyboard: [
       /* Your custom buttons */
     ]
   };
   ```

3. **Result Format**: Modify how poll results are presented
   ```typescript
   function formatPollResults(results: PollResults): string {
     // Your custom formatting logic
   }
   ```

### Advanced Configuration

For more significant customizations:

1. **Blockchain Integration**:
   - Extend the ring signature implementation
   - Add transaction confirmation for votes
   - Implement token-gated polls

2. **Database Structure**:
   - Add new tables for additional features
   - Modify the relationships between entities
   - Add indexes for performance optimization

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

5. **Telegram Bot Security**:
   - Consider using Telegram's webhook mode for production
   - Implement proper error handling for API calls
   - Be aware of Telegram's rate limits

By following these guidelines, you can customize the Nebula Vote Telegram bot while maintaining its security, privacy, and performance characteristics.

---

## Support & Contribution

For questions, support, or to contribute to the development of Nebula Vote, please:

- Join our [Discord community](https://discord.gg/YpYquYTXsf)
- Visit our [GitHub repository](https://github.com/yourusername/nebulavote-telegram)
- Contact us at [contact@cypherlab.org](mailto:contact@cypherlab.org)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.