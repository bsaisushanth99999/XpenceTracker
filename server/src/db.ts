import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const DB_FILE_PATH = path.join(__dirname, '..', 'data', 'expense-tracker.db');
const DB_URL = process.env.LIBSQL_URL || `file:${DB_FILE_PATH}`;
const DB_AUTH_TOKEN = process.env.LIBSQL_AUTH_TOKEN;

// Ensure data directory exists if using local file
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
  await db.batch([
    `CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      notes TEXT,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      fingerprint TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)`,
    `CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`,
    `CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category)`,
    `CREATE INDEX IF NOT EXISTS idx_transactions_fingerprint ON transactions(fingerprint)`,
    `CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS monthly_income (
      month TEXT PRIMARY KEY NOT NULL,
      amount REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  ]);
  console.log('Database initialized');
}
