import { pool } from './config';

interface MarketData {
  time: Date;
  price: number;
  bidVolume: number;
  askVolume: number;
  netVolume: number;
}

export async function insertMarketData(data: MarketData) {
  try {
    await pool.query(
      `INSERT INTO market_data (time, price, bid_volume, ask_volume, net_volume)
       VALUES ($1, $2, $3, $4, $5)`,
      [data.time, data.price, data.bidVolume, data.askVolume, data.netVolume]
    );
  } catch (error) {
    console.error('Error inserting market data:', error);
    throw error;
  }
}

export async function getRecentMarketData(intervalType: string, limit: number = 20) {
  try {
    const result = await pool.query(
      `SELECT * FROM market_data 
       WHERE interval_type = $1 
       ORDER BY time DESC 
       LIMIT $2`,
      [intervalType, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
}

interface QueryOptions {
  from: Date;
  to: Date;
  limit?: number;
}

export async function getMarketData(options: QueryOptions) {
  const { from, to, limit = 30 } = options;
  
  let query = `
    SELECT time, price, bid_volume, ask_volume, net_volume
    FROM market_data 
    WHERE time <= $1
    ORDER BY time DESC
    LIMIT $2
  `;
  
  const result = await pool.query(query, [to, limit]);
  
  return result.rows.map(row => ({
    timestamp: row.time,
    price: Number(row.price),
    bidVolume: Number(row.bid_volume),
    askVolume: Number(row.ask_volume),
    netVolume: Number(row.net_volume)
  }));
}

export async function getHistoricalData(options: {
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = `
      SELECT 
        time,
        price,
        bid_volume,
        ask_volume,
        net_volume
      FROM market_data
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 1;
    
    if (options.from) {
      query += ` AND time >= $${paramCount}`;
      params.push(options.from);
      paramCount++;
    }
    
    if (options.to) {
      query += ` AND time <= $${paramCount}`;
      params.push(options.to);
      paramCount++;
    }
    
    query += ` ORDER BY time DESC`;
    
    if (options.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(options.limit);
      paramCount++;
    }

    if (options.offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(options.offset);
    }

    console.log('SQL Query:', query, 'Params:', params);
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
} 