import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

let db: Database;

export function initializeDatabase(): void {
  db = new sqlite3.Database('polls.db');
  
  db.serialize(() => {
    // Create polls table
    db.run(`
      CREATE TABLE IF NOT EXISTS polls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        creator_id TEXT NOT NULL,
        question TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        is_active BOOLEAN DEFAULT 1
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

    // Create votes table
    db.run(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        poll_id INTEGER NOT NULL,
        option_id INTEGER NOT NULL,
        user_id TEXT NOT NULL,
        voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
  });

  console.log('Database initialized');
}

export function getDb(): Database {
  return db;
}