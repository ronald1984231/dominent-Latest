import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Test connection
    this.pool.on('connect', () => {
      console.log('📊 Connected to Neon PostgreSQL database');
    });

    this.pool.on('error', (err) => {
      console.error('Database connection error:', err);
    });
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  getPool(): Pool {
    return this.pool;
  }

  async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async transaction(callback: (client: any) => Promise<any>) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}

export const db = Database.getInstance();
export default db;
