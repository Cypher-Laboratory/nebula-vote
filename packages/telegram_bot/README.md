# 🗳️ Nebula Vote Telegram Bot

> A privacy-focused, on-chain polling solution built on Starknet using Ring Signature technology.

Nebula Vote is a Telegram bot that enables anonymous yet verifiable polling within Telegram groups, with all results securely recorded on the Starknet blockchain.

## ✨ Features

### Privacy & Security
- **True Anonymity**: Ring Signature technology ensures no one can see who voted for what, not even the poll creator
- **Double-Vote Prevention**: Each user can only vote once per poll, without compromising anonymity
- **On-Chain Verification**: All votes are recorded on Starknet blockchain for transparency and verifiability

### User Experience
- **Simple Command Interface**: Easy-to-use Telegram commands
- **Real-Time Results**: Visual progress bars show vote distributions as they happen
- **Multi-Option Support**: Create polls with up to 20 voting options
- **Customizable Duration**: Set polls to expire from 1 minute up to 1 week

## 🚀 Getting Started

### For Users

1. **Find the Bot**: Search for "@NebulaVote_bot" in Telegram
2. **Start a Chat**: Click "Start" to initialize the bot in a private chat
3. **Add to Group**: Add the bot to your Telegram group through the group settings

## 📱 Importing & Using the Bot on Telegram

### Adding the Bot to Your Personal Chat

1. Open Telegram and tap on the search icon
2. Type "@NebulaVote_bot" in the search bar
3. Select the bot from the search results
4. Tap "Start" to begin interacting with the bot
5. You'll receive a welcome message with basic instructions

### Adding the Bot to a Group

1. **Method 1: From Group Settings**
   - Open your Telegram group
   - Tap the group name at the top to open group info
   - Select "Add members"
   - Search for "@NebulaVote_bot" 
   - Tap on the bot to add it to your group

2. **Method 2: From Bot Chat**
   - Start a chat with the bot as described above
   - Tap the bot name at the top
   - Select "Add to Group"
   - Choose the target group from the list

3. **Required Permissions**:
   The bot needs these permissions to function properly:
   - Read messages
   - Send messages
   - Edit messages
   - Add inline buttons

   > **Note**: Only group administrators can add bots to groups and manage their permissions.

### Using the Bot

1. **Creating Your First Poll**:
   ```
   /createpoll
   What do you want for lunch?
   Pizza, Salad, Burgers, Sushi
   30
   ```

2. **Voting in a Poll**:
   - Find the poll message in the chat
   - Tap on the option button you want to vote for
   - You'll receive confirmation that your vote was recorded
   - Poll results update in real-time with visual progress bars

3. **Viewing Results**:
   - Results are displayed directly on the poll message
   - Each option shows:
     - Visual progress bar
     - Percentage of votes
     - Total vote count
   - The message also shows:
     - Total number of participants
     - Time remaining until poll expiration

### Basic Commands

- `/start` - Get started with the bot
- `/createpoll` - Create a new poll
- `/help` - View general help or help for specific commands
- `/ping` - Check if the bot is running

### Creating Polls

```
/createpoll
Your question
Option 1, Option 2, Option 3
Duration in minutes (optional)
```

**Example**:
```
/createpoll
What should we build next?
DeFi platform, GameFi application, Infrastructure tool
60
```

## 🛠️ For Developers

### Technology Stack

- **Node.js** (v20.x+)
- **TypeScript**
- **Telegraf** framework
- **SQLite** database
- **Starknet.js** for blockchain interactions
- **Alice's Ring** cryptography library

### Creating Your Own Bot Instance with BotFather

If you want to customize Nebula Vote or run your own instance, you'll need to create a new bot through Telegram's BotFather and run the bot on your server:

1. **Start BotFather**:
   - Open Telegram and search for "@BotFather"
   - Start a chat and send `/start`

2. **Create a New Bot**:
   - Send `/newbot` to BotFather
   - Provide a name for your bot (e.g., "My Nebula Vote")
   - Provide a username for your bot (must end with "bot", e.g., "my_nebula_vote_bot")

3. **Get Your Bot Token**:
   - BotFather will generate a token for your bot
   - This token should be kept private and secure
   - Use this token in your `.env` file as `TELEGRAM_TOKEN`

4. **Configure Bot Settings** (Optional):
   - **Set Description**: `/setdescription` - Brief explanation of what your bot does
   - **Set About Text**: `/setabouttext` - Short info displayed in the bot's profile
   - **Set Profile Picture**: `/setuserpic` - Upload an image for your bot
   - **Set Commands**: `/setcommands` - Define the command menu users will see
     ```
     start - Get started with the bot
     createpoll - Create a new poll
     help - View help information
     ping - Check if the bot is running
     ```

5. **Enable Inline Mode** (Optional, if you want to allow polls in inline mode):
   - Send `/setinline` to BotFather
   - Select your bot
   - Provide a placeholder text (e.g., "Create a new poll")

### Quick Setup

1. Clone the repository:
```bash
git clone https://github.com/Cypher-Laboratory/nebula-vote
cd nebulavote-telegram
```

2. Install dependencies:
```bash
yarn install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the bot:
```bash
# Development mode
yarn dev

# Production mode
yarn build
yarn start
```

### Environment Configuration

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

## 🔒 How It Works

Nebula Vote leverages Ring Signature cryptography ([Alice's Ring](https://github.com/Cypher-Laboratory/Alice-s-Ring/tree/main)) to enable:

1. **Anonymous but Verifiable Voting**: Votes cannot be traced back to individual voters
2. **Double-Vote Prevention**: The system prevents the same user from voting multiple times
3. **On-Chain Record**: All votes are recorded on Starknet for transparency

The bot's architecture consists of:
- Command handlers for user interaction
- Poll management for creating and tracking polls
- Database operations for storing poll information
- Rate limiting to prevent abuse
- Blockchain interactions for on-chain verification

## 📊 Database Schema

The bot uses SQLite with three main tables:
- **Polls**: Stores poll metadata, questions, and timing information
- **Poll Options**: Stores the available options for each poll
- **Votes**: Records anonymous votes while preventing double-voting

## 👥 Support & Community

- Join our [Discord community](https://discord.gg/YpYquYTXsf)
- Visit our [GitHub repository](https://github.com/Cypher-Laboratory/nebula-vote)
- Contact us at [contact@cypherlab.org](mailto:contact@cypherlab.org)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [CypherLab](https://cypherlab.org)