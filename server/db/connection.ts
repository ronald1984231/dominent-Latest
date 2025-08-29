import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    console.log('🔍 Database URL configured:', databaseUrl ? 'Yes' : 'No');
    console.log('🔍 Environment check:', process.env.NODE_ENV || 'development');

    if (!databaseUrl) {
      console.error('❌ DATABASE_URL environment variable is not set!');
      console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('DB') || key.includes('DATABASE')));
    }

    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl && databaseUrl.includes('neon.tech') ? {
        rejectUnauthorized: false
      } : false
    });

    // Test connection
    this.pool.on('connect', () => {
      console.log('📊 Connected to PostgreSQL database');
      console.log('🔗 Connection string host:', databaseUrl ? new URL(databaseUrl).host : 'localhost');
    });

    this.pool.on('error', (err) => {
      console.error('❌ Database connection error:', err);
      console.log('🔍 DATABASE_URL value:', databaseUrl || 'NOT SET');
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
