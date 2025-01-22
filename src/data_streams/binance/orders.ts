import WebSocket from 'ws';
import dotenv from 'dotenv';
import fs from 'fs';
import { config } from '../../dumps/config';
import { analyzeVWAP } from './indicators/vwap';
import { analyzeVolume } from './indicators/volume';
import { MarketData, IndicatorResult } from './indicators/types';
import { formatConsoleOutput } from './display/console';
import { formatCsvHeader, formatCsvLine, defaultColumns } from './display/csv';
import { EventEmitter } from 'events';

dotenv.config();

const wsBinanceFstream = process.env.WS_BINANACE_FSTREAM;
const wsBinanceSpot = process.env.WS_BINANACE_SPOT;

if (!wsBinanceFstream) {
    throw new Error('WS_BINANACE_FSTREAM environment variable is not set');
}

if (!wsBinanceSpot) {
    throw new Error('WS_BINANACE_SPOT environment variable is not set');
}

const dumpDir = 'dumps';
if (!fs.existsSync(dumpDir)) {
    fs.mkdirSync(dumpDir, { recursive: true });
}

// 定義 CSV 列
const csvColumns = [
    ...defaultColumns,
    {
        header: 'VWAP Bid USD',
        value: (indicator: IndicatorResult) => indicator.values.vwapBid.toString()
    },
    {
        header: 'VWAP Ask USD',
        value: (indicator: IndicatorResult) => indicator.values.vwapAsk.toString()
    },
    {
        header: 'Spread %',
        value: (indicator: IndicatorResult) => indicator.values.spreadPct.toString()
    },
    {
        header: 'Bid Volume USD',
        value: (indicator: IndicatorResult) => indicator.values.bidVolume.toString()
    },
    {
        header: 'Ask Volume USD',
        value: (indicator: IndicatorResult) => indicator.values.askVolume.toString()
    }
];

// 初始化 CSV 文件
if (!fs.existsSync(config.data_streams.dump_file_name)) {
    fs.writeFileSync(config.data_streams.dump_file_name, formatCsvHeader(csvColumns));
}

interface OrderbookState {
    [symbol: string]: {
        bids: Map<number, number>;  // price -> quantity
        asks: Map<number, number>;
    }
}

const orderbooks: OrderbookState = {};

export const eventEmitter = new EventEmitter();

async function binanceTradeStream() {
    const ws = new WebSocket(wsBinanceSpot || '');

    const subscriptionMessage = {
        method: 'SUBSCRIBE',
        params: config.data_streams.pairs.map(pair => `${pair}usdt@depth`) || ['btcusdt@depth'],
        id: 1,
    };

    ws.on('open', () => {
        console.log('WebSocket connected');
        ws.send(JSON.stringify(subscriptionMessage));
        console.log('Subscription message sent');
    });

    ws.on('message', (data: WebSocket.Data) => {
        try {
            const update = JSON.parse(data.toString());

            // Handle subscription confirmation
            if ("result" in update && update.result === null) {
                console.log("✅ Subscription successful");
                return;
            }

            // Skip if not a valid update
            if (!update.s || !update.b || !update.a || !update.E) {
                return;
            }
            
            const symbol = update.s;

            // Initialize orderbook if not exists
            if (!orderbooks[symbol]) {
                orderbooks[symbol] = {
                    bids: new Map(),
                    asks: new Map()
                };
            }

            // Update bids
            update.b.forEach(([price, quantity]: [string, string]) => {
                const priceNum = parseFloat(price);
                const qtyNum = parseFloat(quantity);
                
                if (qtyNum === 0) {
                    orderbooks[symbol].bids.delete(priceNum);
                } else {
                    orderbooks[symbol].bids.set(priceNum, qtyNum);
                }
            });

            // Update asks
            update.a.forEach(([price, quantity]: [string, string]) => {
                const priceNum = parseFloat(price);
                const qtyNum = parseFloat(quantity);
                
                if (qtyNum === 0) {
                    orderbooks[symbol].asks.delete(priceNum);
                } else {
                    orderbooks[symbol].asks.set(priceNum, qtyNum);
                }
            });

            // Convert current orderbook state to MarketData
            const marketData: MarketData = {
                symbol: symbol,
                timestamp: update.E,
                bids: Array.from(orderbooks[symbol].bids.entries())
                    .sort((a, b) => b[0] - a[0]), // sort by price descending
                asks: Array.from(orderbooks[symbol].asks.entries())
                    .sort((a, b) => a[0] - b[0])  // sort by price ascending
            };

            // Calculate indicators
            const vwapResult = analyzeVWAP(marketData);
            const volumeResult = analyzeVolume(marketData);
            const indicators = [volumeResult, vwapResult];

            // Display results
            const output = formatConsoleOutput(
                marketData.timestamp,
                marketData.symbol,
                indicators
            );
            console.log(output);

            // Log to CSV
            fs.appendFileSync(
                config.data_streams.dump_file_name,
                formatCsvLine(indicators, csvColumns)
            );

            eventEmitter.emit('newIndicatorData', indicators);  // 發射事件

        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        // 重新連接
        setTimeout(() => {
            console.log('Attempting to reconnect...');
            binanceTradeStream();
        }, 5000);
    });
}

// 啟動 WebSocket
binanceTradeStream().catch(console.error);
