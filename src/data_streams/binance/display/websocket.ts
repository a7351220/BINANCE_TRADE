import { IndicatorResult } from '../indicators/types';

export function formatIndicatorData(indicators: IndicatorResult[]) {
  const vwap = indicators.find(i => 'vwapBid' in i.values);
  const volume = indicators.find(i => 'volumeImbalance' in i.values);

  return {
    timestamp: new Date(indicators[0].timestamp).toISOString(),
    symbol: indicators[0].symbol,
    vwapBid: vwap?.values.vwapBid || 0,
    vwapAsk: vwap?.values.vwapAsk || 0,
    spread: vwap?.values.spreadPct || 0,
    volumeImbalance: volume?.values.volumeImbalance || 0,
    bidVolume: volume?.values.bidVolume || 0,
    askVolume: volume?.values.askVolume || 0
  };
} 