import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 初始化 TimescaleDB
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Creating market_data table...');
    
    // 先嘗試刪除現有的表
    await client.query('DROP TABLE IF EXISTS market_data CASCADE;');
    
    // 重新創建表
    await client.query(`
      CREATE TABLE market_data (
        time TIMESTAMPTZ NOT NULL,
        price DECIMAL NOT NULL,
        bid_volume DECIMAL NOT NULL,
        ask_volume DECIMAL NOT NULL,
        net_volume DECIMAL NOT NULL
      );
      
      SELECT create_hypertable('market_data', 'time', if_not_exists => TRUE);
      
      CREATE INDEX IF NOT EXISTS market_data_time_idx ON market_data (time DESC);
    `);
    
    console.log('market_data table created successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  } finally {
    client.release();
  }
} 