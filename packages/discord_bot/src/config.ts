import "dotenv/config";

interface Config {
  token: string;
  clientId: string;
  database: {
    filename: string;
  };
  polls: {
    maxOptions: number;
    maxDuration: number; // in minutes
    minDuration: number; // in minutes
    defaultDuration: number; // in minutes
  };
}
export const config: Config = {
  // Bot configuration
  token: process.env.DISCORD_TOKEN || 'YOUR_BOT_TOKEN',
  clientId: process.env.DISCORD_CLIENT_ID || 'YOUR_DISCORD_CLIENT_ID',

  // Database configuration
  database: {
    filename: process.env.DB_FILENAME || 'polls.db',
  },

  // Poll settings
  polls: {
    maxOptions: parseInt(process.env.MAX_POLL_OPTIONS || '10'),
    maxDuration: parseInt(process.env.MAX_POLL_DURATION || '10080'), // 1 week in minutes
    minDuration: parseInt(process.env.MIN_POLL_DURATION || '1'), // 1 minute
    defaultDuration: parseInt(process.env.DEFAULT_POLL_DURATION || '1440'), // 24 hours
  },
};