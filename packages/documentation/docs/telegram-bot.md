# 🗳️ Nebula Vote Telegram Bot Documentation

This document provides comprehensive information about the Nebula Vote Telegram polling bot, a privacy-focused, on-chain polling solution built on Starknet.

# Features

### Privacy & Security
- **Ring Signature Technology**: Uses [Alice's Ring](https://github.com/Cypher-Laboratory/Alice-s-Ring/tree/main) cryptographic library for true voter privacy
- **Anonymous Voting**: No one can see who voted for what, not even the poll creator
- **Double-Vote Prevention**: Each user can only vote once per poll, without compromising anonymity
- **On-Chain Verification**: All votes are securely recorded on Starknet blockchain

### User Experience
- **Simple Command Interface**: Easy-to-use Telegram commands
- **Real-Time Results**: Visual progress bars show vote distributions as they happen
- **Multi-Option Support**: Create polls with multiple options
- **Customizable Duration**: Set polls to expire after a specified time period
- **Interactive UI**: Vote with a simple button click

## Getting Started

### Adding the Bot to Your Group

1. **Find the Bot**: Search for `@NebulaVote_bot` in Telegram
2. **Start a Chat**: Click "Start" to initialize the bot in a private chat
3. **Add to Group**: 
   - Open your Telegram group
   - Click the group name at the top
   - Select "Add members"
   - Search for `@NebulaVote_bot` and add it

4. **Set Permissions**: The bot requires permission to:
   - Read messages
   - Send messages
   - Edit messages
   - Add inline buttons

> **Note**: You need administrator privileges to add a bot to a Telegram group.

### Basic Commands

Nebula Vote uses the following commands:

- `/start` - Get started with the bot
- `/createpoll` - Create a new poll
- `/help` - View general help or help for specific commands
- `/ping` - Check if the bot is running

You can type these commands in any chat where the bot is present.

## Creating Polls

To create a new poll, use the `/createpoll` command following this format:

```
/createpoll
Your question
Option 1, Option 2, Option 3
Duration in minutes (optional)
```

### Poll Format

The poll command has three components:

1. **Question**: The main question you want to ask
2. **Options**: A comma-separated list of voting options
3. **Duration**: How long the poll should remain active (in minutes)

**Example**:
```
/createpoll
What should we build next?
DeFi platform, GameFi application, Infrastructure tool
60
```

This creates a poll that asks "What should we build next?" with three options, lasting for 60 minutes.

### Poll Duration

- The duration is specified in minutes
- If you don't specify a duration, polls default to 15 minutes
- You can set durations from 1 minute up to the system maximum (typically 10080 minutes / 1 week)

## Voting in Polls

To vote in an active poll:

1. Find the poll message in your Telegram chat
2. Click on the button corresponding to your preferred option
3. You'll receive a confirmation that your vote was recorded

Each user can only vote once per poll. You cannot change your vote after it's been cast.

## Poll Results

Poll results are displayed in real-time with:

- Visual progress bars for each option
- Percentage of votes for each option
- Total vote count for each option
- Total number of participants
- Time remaining until the poll expires

When a poll expires, it will no longer accept votes, and the final results will remain visible.

## Advanced Privacy Features

Nebula Vote's privacy protections are powered by:

### Ring Signatures
The bot uses [Alice's Ring](https://github.com/Cypher-Laboratory/Alice-s-Ring/tree/main) library for cryptographic privacy. Each vote is:
- Anonymous but verifiable
- Protected against double-voting
- Mathematically proven to be private
- On-chain verifiable

### Blockchain Integration
- All poll data is recorded on Starknet
- Results can be accessed via smart contracts
- Enables privacy-preserving reward distribution
- Maintains voter anonymity while ensuring vote integrity

## Support
If you need help or have questions not covered in the documentation, join our [🌐 Discord community](https://discord.gg/YpYquYTXsf) or contact us at [📧 contact@cypherlab.org](mailto:contact@cypherlab.org).