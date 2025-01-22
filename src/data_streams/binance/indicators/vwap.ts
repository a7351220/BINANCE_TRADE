import { MarketData, IndicatorResult } from './types';
import chalk from 'chalk';

export function calculateVWAP(orders: [number, number][]) {
    let totalVolume = 0;
    let weightedSum = 0;
    orders.forEach(([price, quantity]) => {
        weightedSum += price * quantity;
        totalVolume += quantity;
    });
    return totalVolume > 0 ? weightedSum / totalVolume : 0;
}

export function analyzeVWAP(data: MarketData): IndicatorResult {
    const numOrders = Math.ceil(data.bids.length * 0.1); // top 10%
    const topBids = data.bids.slice(0, numOrders);
    const topAsks = data.asks.slice(0, numOrders);

    const vwapBid = calculateVWAP(topBids);
    const vwapAsk = calculateVWAP(topAsks);
    const spreadPct = ((vwapAsk - vwapBid) / vwapBid) * 100;

    return {
        symbol: data.symbol,
        timestamp: data.timestamp,
        values: {
            vwapBid,
            vwapAsk,
            spreadPct
        },
        display: {
            color: spreadPct > 0.1 ? chalk.yellow : chalk.white,
            emoji: spreadPct > 0.1 ? '⚠️' : '📊',
            text: `Spread: ${spreadPct.toFixed(3)}% | $${vwapBid.toFixed(2)} - $${vwapAsk.toFixed(2)}`
        }
    };
} 