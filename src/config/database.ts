import { Pool, PoolClient, QueryResult } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false, // ❗ disables CA verification, but keeps encryption
  },
});

pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Extend PoolClient with lastQuery
interface CustomPoolClient extends PoolClient {
  lastQuery?: unknown[];
}

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log("Executed query", { text, duration, rows: res.rowCount });
  return res;
};

export const getClient = async (): Promise<CustomPoolClient> => {
  const client: CustomPoolClient = await pool.connect();

  const originalQuery = client.query.bind(client); // 🔒 bind to preserve `this`
  const originalRelease = client.release.bind(client);

  const timeout = setTimeout(() => {
    console.error("A client has been checked out for more than 5 seconds!");
    console.error("Last executed query:", client.lastQuery);
  }, 5000);

  // ✅ Safe monkey-patching with proper casting
  client.query = ((...args: Parameters<PoolClient["query"]>) => {
    client.lastQuery = args;
    return originalQuery(...args);
  }) as PoolClient["query"];

  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease();
  };

  return client;
};

export default { query, getClient };
