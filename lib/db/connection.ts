/**
 * SQLite database singleton connection.
 * Uses a global variable to prevent multiple connections during hot-reload in dev.
 * RULE EFF-6: MongoDB/DB connection must use a global singleton for serverless cold starts.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { seedDatabase } from "./schema";

const DB_PATH =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join("/tmp", "event.db")
    : path.join(process.cwd(), "data", "event.db");

/**
 * Returns the singleton SQLite database connection.
 * Creates the database and seeds it if it doesn't exist.
 */
export function getDb(): Database.Database {
  if (global.__db) {
    return global.__db;
  }

  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  seedDatabase(db);

  global.__db = db;
  return db;
}

/**
 * Closes and clears the singleton connection (used in tests).
 */
export function closeDb(): void {
  if (global.__db) {
    global.__db.close();
    global.__db = undefined;
  }
}
