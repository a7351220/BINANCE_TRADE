import WebSocket from 'ws';
import { eventEmitter } from '../data_streams/binance/orders';

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// 監聽新的訂單數據
eventEmitter.on('newIndicatorData', (indicators) => {
  const data = {
    timestamp: new Date().toISOString(),
    bidVolume: indicators[0].values.bidVolume,
    askVolume: indicators[0].values.askVolume,
    netVolume: indicators[0].values.askVolume - indicators[0].values.bidVolume
  };

  // 廣播給所有連接的客戶端
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
});

console.log('WebSocket server started on port 8080'); 