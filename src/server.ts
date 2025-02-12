import express from 'express';
import { createServer } from 'http';
import WebSocket from 'ws';
import { eventEmitter } from './data_streams/binance/orders';
import { insertMarketData } from './db/operations';
import marketRoutes from './routes/market';
import cors from 'cors';
import { errorHandler } from './middleware/error';
import { MarketData } from './data_streams/binance/indicators/types';
const app = express();
const PORT = process.env.PORT || 8080;

// 啟用 CORS - 移到最前面
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : true,
  credentials: true
}));

// 創建 HTTP 服務器
const server = createServer(app);

// 在 HTTP 服務器上創建 WebSocket 服務器
const wss = new WebSocket.Server({ 
  server,
  path: '/ws'  // 添加 WebSocket 路徑
});

// 存儲連接的客戶端
const clients = new Set<WebSocket>();

// WebSocket 連接處理
wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  // 添加錯誤處理
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// 監聽訂單數據
eventEmitter.on('newIndicatorData', async (data: MarketData) => {
  // 存儲到數據庫
  try {
    await insertMarketData({
      time: new Date(data.timestamp),
      price: data.price,
      bidVolume: data.bidVolume,
      askVolume: data.askVolume,
      netVolume: data.netVolume,
    });
  } catch (error) {
    console.error('Failed to store market data:', error);
  }

  // 發送到 WebSocket 客戶端
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
});

// 添加一個健康檢查端點
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 註冊 API 路由
app.use('/api/market', marketRoutes);

// 錯誤處理中間件應該在所有路由之後
app.use(errorHandler);

// 啟動服務器
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 