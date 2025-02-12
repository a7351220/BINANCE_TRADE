export interface MarketData {
  timestamp: string;
  symbol: string;
  price: number;
  bidVolume: number;
  askVolume: number;
  netVolume: number;
}

export interface AnomalyRecord {
  timestamp: number;
  value: number;
  zScore: number;
  dataTimestamp: string;
  direction: 'positive' | 'negative';
} 