import { MarketData, IndicatorResult } from './types';
import chalk from 'chalk';

function formatUSD(value: number): string {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(0);
}

export function analyzeVolume(data: MarketData): IndicatorResult {
    const bidVolume = data.bids.reduce((sum, [price, qty]) => sum + (price * qty), 0);
    const askVolume = data.asks.reduce((sum, [price, qty]) => sum + (price * qty), 0);
    const volumeImbalance = ((bidVolume - askVolume) / (bidVolume + askVolume)) * 100;

    let color = chalk.white;
    let emoji = '📊';
    
    if (Math.abs(volumeImbalance) > 50) {
        if (volumeImbalance > 0) {
            color = chalk.green;
            emoji = '🚀';
        } else {
            color = chalk.red;
            emoji = '📉';
        }
    }

    return {
        symbol: data.symbol,
        timestamp: data.timestamp,
        values: {
            bidVolume,
            askVolume,
            volumeImbalance
        },
        display: {
            color,
            emoji,
            text: `Vol Imb: ${volumeImbalance.toFixed(1)}% | B:$${formatUSD(bidVolume)} A:$${formatUSD(askVolume)}`
        }
    };
} 