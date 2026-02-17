import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const DB_FILE_PATH = path.join(__dirname, '..', 'data', 'expense-tracker.db');
const DB_URL = process.env.LIBSQL_URL || `file:${DB_FILE_PATH}`;
const DB_AUTH_TOKEN = process.env.LIBSQL_AUTH_TOKEN;

// In Vercel/serverless, we MUST use a remote database (Turso)
// Local file databases won't work in serverless environments
if (process.env.VERCEL && !process.env.LIBSQL_URL) {
  console.error('ERROR: LIBSQL_URL environment variable is required in Vercel');
  console.error('Please set LIBSQL_URL in your Vercel project settings');
}

// Ensure data directory exists if using local file (for local dev only)
if (DB_URL.startsWith('file:')) {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export const db = createClient({
  url: DB_URL,
  authToken: DB_AUTH_TOKEN,
});

export async function initDB() {
  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      notes TEXT,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      fingerprint TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`);

    await db.execute(`CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      saved_amount REAL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`);

    await db.execute(`CREATE TABLE IF NOT EXISTS monthly_income (
      month TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`);

    await db.execute(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category)`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_transactions_fingerprint ON transactions(fingerprint)`);

    // Migration: Add saved_amount if it doesn't exist (fails gracefully if exists)
    try {
      await db.execute(`ALTER TABLE goals ADD COLUMN saved_amount REAL DEFAULT 0`);
    } catch (err: any) {
      if (!err.message.includes('duplicate column name')) throw err;
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}
