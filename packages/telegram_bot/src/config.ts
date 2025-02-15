import "dotenv/config";

interface Config {
  token: string;
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
  token: process.env.TELEGRAM_TOKEN || 'YOUR_BOT_TOKEN',
  database: {
    filename: process.env.DB_FILENAME || 'polls.db',
  },
  polls: {
    maxOptions: parseInt(process.env.MAX_POLL_OPTIONS || '10'),
    maxDuration: parseInt(process.env.MAX_POLL_DURATION || '10080'), // 1 week in minutes
    minDuration: parseInt(process.env.MIN_POLL_DURATION || '1'), // 1 minute
    defaultDuration: parseInt(process.env.DEFAULT_POLL_DURATION || '1440'), // 24 hours
  },
};

export const STARKNET_LOGO_URL = 'https://www.starknet.io/wp-content/uploads/2024/05/SN-Symbol-Flat-colour-150x150.png';
export const POWERED_BY_STARKNET = `<a href="${STARKNET_LOGO_URL}">​</a><i>Powered by Starknet</i>`;