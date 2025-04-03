import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import { config } from './config';

let db: Database;

export function initializeDatabase(): void {
  db = new sqlite3.Database(config.database.filename);

  db.serialize(() => {
    // Create polls table with tx_hash field
    db.run(`
      CREATE TABLE IF NOT EXISTS polls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        creator_id TEXT NOT NULL,
        question TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        is_active BOOLEAN DEFAULT 1,
        tx_hash TEXT
      )
    `);

    // Create options table
    db.run(`
      CREATE TABLE IF NOT EXISTS poll_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        poll_id INTEGER NOT NULL,
        option_text TEXT NOT NULL,
        FOREIGN KEY (poll_id) REFERENCES polls (id)
      )
    `);

    // Create votes table with tx_hash field
    db.run(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        poll_id INTEGER NOT NULL,
        option_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tx_hash TEXT,
        FOREIGN KEY (poll_id) REFERENCES polls (id),
        FOREIGN KEY (option_id) REFERENCES poll_options (id),
        UNIQUE(poll_id, user_id)
      )
    `);

    // Save the user's public keys to create future rings
    db.run(`
      CREATE TABLE IF NOT EXISTS user_pub_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        public_key TEXT NOT NULL,
        UNIQUE(user_id)
      )
    `);

    // Create voting cooldown table to prevent spam
    db.run(`
      CREATE TABLE IF NOT EXISTS is_voting (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        poll_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        transaction_status TEXT DEFAULT 'pending',
        FOREIGN KEY (poll_id) REFERENCES polls (id),
        UNIQUE(poll_id, user_id)
      )
    `);

    // Add migration for existing tables if needed
    db.all(`PRAGMA table_info(polls)`, (err, columns) => {
      if (err) {
        console.error('Error getting columns for polls table:', err);
        return;
      }

      // Check if tx_hash column exists
      const txHashExists = columns.some(col => (col as any).name === 'tx_hash');

      if (!txHashExists) {
        console.log('Adding tx_hash column to polls table...');
        db.run('ALTER TABLE polls ADD COLUMN tx_hash TEXT', (err) => {
          if (err) {
            console.error('Error adding tx_hash to polls table:', err);
          } else {
            console.log('Successfully added tx_hash to polls table');
          }
        });
      }
    });

    // Similar migration for votes table
    db.all(`PRAGMA table_info(votes)`, (err, columns) => {
      if (err) {
        console.error('Error getting columns for votes table:', err);
        return;
      }

      // Check if tx_hash column exists
      const txHashExists = columns.some(col => (col as any).name === 'tx_hash');

      if (!txHashExists) {
        console.log('Adding tx_hash column to votes table...');
        db.run('ALTER TABLE votes ADD COLUMN tx_hash TEXT', (err) => {
          if (err) {
            console.error('Error adding tx_hash to votes table:', err);
          } else {
            console.log('Successfully added tx_hash to votes table');
          }
        });
      }
    });
  });

  console.log('Database initialized');
}

export function getDb(): Database {
  return db;
}