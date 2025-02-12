import { pool } from './config';

export async function cleanOldData(daysToKeep: number = 30) {
  try {
    await pool.query(
      `DELETE FROM market_data 
       WHERE time < NOW() - INTERVAL '${daysToKeep} days'`
    );
  } catch (error) {
    console.error('Error cleaning old data:', error);
  }
} 