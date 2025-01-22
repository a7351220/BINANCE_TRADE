import { Chalk } from 'chalk';

export interface MarketData {
    symbol: string;
    timestamp: number;
    bids: [number, number][];  // [price, quantity][]
    asks: [number, number][];
}

export interface IndicatorResult {
    symbol: string;
    timestamp: number;
    values: Record<string, number>;
    display: {
        color: Chalk;
        emoji: string;
        text: string;
    };
} 