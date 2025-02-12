import { Chalk } from 'chalk';

export interface MarketData {
    symbol: string;
    timestamp: string;
    price: number;
    bidVolume: number;
    askVolume: number;
    netVolume: number;
}

export interface IndicatorResult {
    symbol: string;
    timestamp: string;
    values: {
        bidVolume: number;
        askVolume: number;
        netVolume: number;
    };
    display: {
        color: Chalk;
        emoji: string;
        text: string;
    };
} 