import { DateTime } from 'luxon';
import { IndicatorResult } from '../indicators/types';

export function formatConsoleOutput(
    timestamp: number,
    symbol: string,
    indicators: IndicatorResult[]
): string {
    // 使用第一個指標的顏色和表情符號
    const primaryIndicator = indicators[0];
    const time = DateTime.fromMillis(timestamp).toFormat("HH:mm:ss");
    
    return primaryIndicator.display.color(
        `${primaryIndicator.display.emoji} ${symbol} ${time} | ` +
        indicators.map(indicator => indicator.display.text).join(' | ')
    );
} 