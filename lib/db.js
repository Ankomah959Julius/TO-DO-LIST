import { createClient } from "@libsql/client";

let db;
let initialized = false;

function getClient() {
  if (!db) {
    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error(
        "TURSO_DATABASE_URL is not set. Add it in your hosting platform's Environment Variables."
      );
    }
    db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return db;
}

async function ensureInitialized(client) {
  if (initialized) return;

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      user_id INTEGER NOT NULL DEFAULT 0
    )
  `);

  initialized = true;
}

const db_proxy = {
  async execute(query) {
    const client = getClient();
    await ensureInitialized(client);
    return client.execute(query);
  },
};

export default db_proxy;
