import { DateTime } from 'luxon';
import { IndicatorResult } from '../indicators/types';

export function formatConsoleOutput(timestamp: number, symbol: string, indicators: any[]) {
  const bidVolume = indicators[0].values.bidVolume;
  const askVolume = indicators[0].values.askVolume;
  const netVolume = askVolume - bidVolume;

  return `${symbol} ${DateTime.fromMillis(timestamp).toFormat('HH:mm:ss')} | Net Vol: ${
    netVolume > 0 ? '+' : ''
  }${netVolume.toFixed(2)}M | B:$${bidVolume.toFixed(2)}M A:$${askVolume.toFixed(2)}M`;
} 