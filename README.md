# StarkNet Opinion Polling Bot

An on-chain private opinion polling bot for Discord and Telegram using the StarkNet blockchain and Ring Signatures. Create private, verifiable polls with cryptographic privacy guarantees.

## 🌟 Features

### Privacy & Security
- Complete voter privacy using Ring Signatures from Alice's Ring library
- Private but verifiable voting
- Double-voting prevention while maintaining anonymity
- Cryptographically secure vote tracking

### On-Chain Integration
- All polls and votes are recorded on StarkNet blockchain
- Complete traceability and transparency
- Results accessible via smart contracts
- Private reward distribution to voters
- Perfect for DAOs and community governance

### User Experience
- Interactive Discord bot interface
- Real-time vote tracking
- Visual progress bars for results
- Custom poll durations
- Up to 20 options per poll
- Rate limiting to prevent spam

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- Yarn package manager
- Discord bot token and application
- StarkNet development environment

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/starknet-opinion-polling
cd starknet-opinion-polling
```

2. Install dependencies
```bash
yarn install
```

3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` file with your configuration:
```env
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
MAX_POLL_OPTIONS=20
```

4. Deploy Discord commands
```bash
ts-node deploy-commands.ts
```

5. Start the bot
```bash
# Development mode
yarn dev

# Production mode
yarn build
yarn start # automatically runs the deploy-commands script
```

### Adding the Bot to Your Server

To use the bot from Cypher Lab, you can invite it to your Discord server using the following link:
```
https://discord.com/oauth2/authorize?client_id=1332644824029069322&permissions=76800&scope=bot%20applications.commands
```


Use this link to invite your custom bot (replace `YOUR_CLIENT_ID` with your Discord application client ID):
```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=76800&scope=bot%20applications.commands
```

## 📚 Usage

### Available Commands

#### /poll
Create a new private poll
```
/poll question:"What should we build next?" options:"DeFi,GameFi,Infrastructure" duration:1440
```

Parameters:
- `question`: Your poll question
- `options`: Comma-separated list of options (max 20)
- `duration`: Poll duration in minutes (1-43200)

#### /info
Display information about the bot and its features

#### /help
Show help information and command details
- `/help`: General help
- `/help command:poll`: Detailed poll command help
- `/help command:info`: Info command help

### Duration Presets
- 5 minutes
- 15 minutes
- 30 minutes
- 1 hour
- 2 hours
- 6 hours
- 12 hours
- 1 day
- 1 week
- 1 month (43200 minutes)

## 🔒 Privacy Features

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

## 🛠 Development

### Database Schema
```sql
CREATE TABLE polls (
  id INTEGER PRIMARY KEY,
  guild_id TEXT,
  channel_id TEXT,
  creator_id TEXT,
  question TEXT,
  end_time DATETIME,
  is_active INTEGER DEFAULT 1
);

CREATE TABLE poll_options (
  id INTEGER PRIMARY KEY,
  poll_id INTEGER,
  option_text TEXT
);

CREATE TABLE votes (
  id INTEGER PRIMARY KEY,
  poll_id INTEGER,
  option_id INTEGER,
  user_id TEXT,
  UNIQUE(poll_id, user_id)
);
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [StarkNet](https://starknet.io/) - Layer 2 blockchain platform
- [Alice's Ring](https://docs.alicesring.com/) - Ring signature cryptographic library
- [Cypher Lab](https://cypherlab.org/) - Cypher Lab website
- [Discord.js](https://discord.js.org/) - Discord bot framework