import express from 'express';
import { createServer } from 'http';
import WebSocket from 'ws';
import { eventEmitter } from './data_streams/binance/orders';

const app = express();
const PORT = process.env.PORT || 8080;

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
eventEmitter.on('newIndicatorData', (indicators) => {
  const data = {
    timestamp: new Date().toISOString(),
    bidVolume: indicators[0].values.bidVolume,
    askVolume: indicators[0].values.askVolume,
    netVolume: indicators[0].values.askVolume - indicators[0].values.bidVolume
  };

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

// 啟動服務器
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 