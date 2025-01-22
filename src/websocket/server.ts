import WebSocket from 'ws';
import { formatIndicatorData } from '../data_streams/binance/display/websocket';
import { eventEmitter } from '../data_streams/binance/orders';

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: Number(PORT) });
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// 當收到新的指標數據時，轉發給所有連接的客戶端
eventEmitter.on('newIndicatorData', (data) => {
  const formattedData = formatIndicatorData(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(formattedData));
    }
  });
});

console.log(`WebSocket server started on port ${PORT}`); 