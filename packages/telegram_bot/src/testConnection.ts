import { Telegraf } from 'telegraf';
import { config } from './config';

async function testConnection() {
  const bot = new Telegraf(config.token);
  
  try {
    console.log('Testing connection to Telegram API...');
    
    // Test getMe
    console.log('Testing getMe...');
    const me = await bot.telegram.getMe();
    console.log('Bot info:', me);
    
    // Test getUpdates
    console.log('\nTesting getUpdates...');
    const updates = await bot.telegram.getUpdates(0, 1, 0, undefined);
    console.log('Updates response:', updates);
    
    console.log('\nAll tests passed! Bot token and connection are working.');
    process.exit(0);
  } catch (error) {
    console.error('Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();