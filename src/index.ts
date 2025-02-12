import './data_streams/binance/orders';
import './server';
import { initializeDatabase } from './db/config';

// 確保數據庫初始化完成後再啟動服務器
async function main() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('✅ Database initialized');
    
    // 導入其他模塊
    await import('./data_streams/binance/orders');
    await import('./server');
    
  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

main().catch(console.error); 