import { MarketData, IndicatorResult } from './types';
import chalk from 'chalk';

export function formatVolume(value: number): string {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(0);
}

export function formatMarketData(data: MarketData): string {
    return `${data.symbol} ${new Date(data.timestamp).toLocaleTimeString()} | ` +
        `Price: $${data.price.toFixed(2)} | ` +
        `Net Vol: ${data.netVolume > 0 ? '+' : ''}${formatVolume(data.netVolume)}M | ` +
        `B:$${formatVolume(data.bidVolume)}M A:$${formatVolume(data.askVolume)}M`;
}

export function analyzeVolume(data: MarketData): IndicatorResult {
    const bidVolume = data.bidVolume;
    const askVolume = data.askVolume;
    const netVolume = askVolume - bidVolume;

    return {
        symbol: data.symbol,
        timestamp: data.timestamp,
        values: {
            bidVolume,
            askVolume,
            netVolume
        },
        display: {
            color: chalk.white,
            emoji: '📊',
            text: `B:$${formatVolume(bidVolume)} A:$${formatVolume(askVolume)}`
        }
    };
} 