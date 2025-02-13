// 實時數據格式
export interface RealtimeMarketData {
  timestamp: string;
  price: number;
  bidVolume: number;
  askVolume: number;
  netVolume: number;
}

// 歷史數據格式
export interface HistoricalMarketData {
  time: string;
  price: string;
  bid_volume: string;
  ask_volume: string;
  net_volume: string;
}

// 通用格式 (用於顯示)
export interface MarketData {
  timestamp: string;
  price: number;
  bidVolume: number;
  askVolume: number;
  netVolume: number;
}

// 從後端 API 返回的格式
export interface ApiMarketData {
  time: string;
  price: string;
  bid_volume: string;
  ask_volume: string;
  net_volume: string;
}

export interface AnomalyRecord {
  timestamp: number;
  value: number;
  zScore: number;
  dataTimestamp: string;
  direction: 'positive' | 'negative';
} 