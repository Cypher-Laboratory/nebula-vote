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

    // Create authorized users table
    db.run(`
      CREATE TABLE IF NOT EXISTS authorized_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        authorized_by TEXT NOT NULL,
        authorized_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(chat_id, user_id)
      )
    `);
  });
}

// Helper functions for authorization
export async function isUserAuthorized(chatId: string, userId: string): Promise<boolean> {
  return new Promise((resolve) => {
    db.get(
      'SELECT 1 FROM authorized_users WHERE chat_id = ? AND user_id = ?',
      [chatId, userId],
      (err, row) => {
        resolve(!!row);
      }
    );
  });
}

export async function addAuthorizedUser(chatId: string, userId: string, authorizedBy: string): Promise<boolean> {
  return new Promise((resolve) => {
    db.run(
      'INSERT OR IGNORE INTO authorized_users (chat_id, user_id, authorized_by) VALUES (?, ?, ?)',
      [chatId, userId, authorizedBy],
      function(err) {
        resolve(!err && this.changes > 0);
      }
    );
  });
}

export async function removeAuthorizedUser(chatId: string, userId: string): Promise<boolean> {
  return new Promise((resolve) => {
    db.run(
      'DELETE FROM authorized_users WHERE chat_id = ? AND user_id = ?',
      [chatId, userId],
      function(err) {
        resolve(!err && this.changes > 0);
      }
    );
  });
}

export async function listAuthorizedUsers(chatId: string): Promise<Array<{user_id: string, authorized_by: string, authorized_at: string}>> {
  return new Promise((resolve) => {
    db.all(
      'SELECT user_id, authorized_by, authorized_at FROM authorized_users WHERE chat_id = ?',
      [chatId],
      (err, rows) => {
        resolve(rows as any || []);
      }
    );
  });
}

export function getDb(): Database {
  return db;
}