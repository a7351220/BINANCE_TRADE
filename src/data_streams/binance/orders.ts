import WebSocket from 'ws';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';

dotenv.config();

const wsBinanceSpot = process.env.WS_BINANACE_SPOT;

if (!wsBinanceSpot) {
    throw new Error('WS_BINANACE_SPOT environment variable is not set');
}

export const eventEmitter = new EventEmitter();

const orderbooks: {
    [symbol: string]: {
        price: number;
        bids: Map<number, number>;
        asks: Map<number, number>;
    }
} = {};

// 添加配置常量
const PRICE_RANGE_PERCENTAGE = 0.01; // 1% range from current price

async function binanceTradeStream() {
    const ws = new WebSocket(wsBinanceSpot as string);

    const subscriptionMessage = {
        method: 'SUBSCRIBE',
        params: [
            'btcusdt@depth',    // 深度數據
            'btcusdt@trade'     // 價格數據
        ],
        id: 1,
    };

    ws.on('open', () => {
        console.log('WebSocket connected');
        ws.send(JSON.stringify(subscriptionMessage));
    });

    ws.on('message', (data: WebSocket.Data) => {
        try {
            const update = JSON.parse(data.toString());
            
            if (!update.s) return;
            
            const symbol = update.s;

            if (!orderbooks[symbol]) {
                orderbooks[symbol] = {
                    price: 0,
                    bids: new Map(),
                    asks: new Map()
                };
            }

            // 處理價格更新
            if (update.e === 'trade') {
                orderbooks[symbol].price = parseFloat(update.p);
                return;
            }

            // 處理深度更新
            if (update.b && update.a) {
                // 更新 bids
                update.b.forEach(([price, quantity]: [string, string]) => {
                    const priceNum = parseFloat(price);
                    const qtyNum = parseFloat(quantity);
                    
                    if (qtyNum === 0) {
                        orderbooks[symbol].bids.delete(priceNum);
                    } else {
                        orderbooks[symbol].bids.set(priceNum, qtyNum);
                    }
                });

                // 更新 asks
                update.a.forEach(([price, quantity]: [string, string]) => {
                    const priceNum = parseFloat(price);
                    const qtyNum = parseFloat(quantity);
                    
                    if (qtyNum === 0) {
                        orderbooks[symbol].asks.delete(priceNum);
                    } else {
                        orderbooks[symbol].asks.set(priceNum, qtyNum);
                    }
                });

                // 獲取價格範圍
                const upperPriceRange = orderbooks[symbol].price * (1 + PRICE_RANGE_PERCENTAGE);
                const lowerPriceRange = orderbooks[symbol].price * (1 - PRICE_RANGE_PERCENTAGE);

                // 計算範圍內的 volume
                const bidVolume = Array.from(orderbooks[symbol].bids.entries())
                    .filter(([price, _]) => price >= lowerPriceRange)
                    .reduce((sum, [_, qty]) => sum + (orderbooks[symbol].price * qty), 0);

                const askVolume = Array.from(orderbooks[symbol].asks.entries())
                    .filter(([price, _]) => price <= upperPriceRange)
                    .reduce((sum, [_, qty]) => sum + (orderbooks[symbol].price * qty), 0);

                const netVolume = askVolume - bidVolume;

                const data = {
                    timestamp: new Date(update.E).toISOString(),
                    price: orderbooks[symbol].price,
                    bidVolume,
                    askVolume,
                    netVolume
                };

                console.log(`${symbol} ${new Date(update.E).toLocaleTimeString()} | ` +
                    `Price: $${data.price.toFixed(2)} | ` +
                    `Net Vol: ${netVolume > 0 ? '+' : ''}${formatBackendVolume(netVolume)} | ` +
                    `B:${formatBackendVolume(bidVolume)} A:${formatBackendVolume(askVolume)}`);

                eventEmitter.emit('newIndicatorData', data);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        setTimeout(binanceTradeStream, 5000);
    });
}

binanceTradeStream().catch(console.error);

// 添加格式化函數
function formatBackendVolume(volume: number): string {
    if (Math.abs(volume) >= 1000000) {
        return `$${(volume / 1000000).toFixed(2)}M`;
    }
    return `$${(volume / 1000).toFixed(2)}K`;
}
