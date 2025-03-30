# 🗳️ Nebula Vote Discord Bot Documentation

This document provides comprehensive information about the Nebula Vote Discord polling bot, a privacy-focused, on-chain polling solution built on Starknet.

## Getting Started

### Adding the Bot to Your Server

**To use the official Nebula Vote bot:**

1. Visit the following link to invite the bot to your server or click [here](https://discord.com/oauth2/authorize?client_id=1332644824029069322&permissions=76800&scope=bot%20applications.commands)
```
https://discord.com/oauth2/authorize?client_id=1332644824029069322&permissions=76800&scope=bot%20applications.commands
```

1. Select your server from the dropdown menu
2. Review and authorize the requested permissions
3. Once added, the bot will be available in your server

> **Note**: You need "Manage Server" permissions to add the bot to a Discord server.

### Basic Commands

Nebula Vote uses Discord's slash commands for all interactions. Here are the main commands:

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

Nebula Vote's privacy protections are powered by:

### Ring Signatures
The bot uses [Alice's Ring](https://github.com/Cypher-Laboratory/Alice-s-Ring/tree/main) library for cryptographic privacy. Each vote is:
- Anonymous but verifiable
- Protected against double-voting
- Mathematically proven to be private
- On-chain verifiable

### Smart Contract Integration
- All poll data is recorded on Starknet
- Results can be accessed by other smart contracts
- Enables privacy-preserving reward distribution
- Maintains voter anonymity while ensuring vote integrity

## Support
If you need help or have questions not covered in the documentation, join our [🌐 Discord community](https://discord.gg/YpYquYTXsf) or contact us at [📧 contact@cypherlab.org](mailto:contact@cypherlab.org).