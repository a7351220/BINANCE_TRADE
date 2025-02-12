import { create } from 'zustand';
import { MarketData, AnomalyRecord } from '../types/market';

interface MarketState {
  data: MarketData[];
  anomalyRecords: AnomalyRecord[];
  anomalies: number[];
  stats: {
    mean: number;
    stdDev: number;
    movingAverages: number[];
  };
  addData: (newData: MarketData) => void;
}

const WINDOW_SIZE = 60;  // 滾動窗口大小
const MAX_DATA_POINTS = 100;  // 最大數據點數
const ANOMALY_THRESHOLD = 3.0;  // 異常值閾值

const calculateStats = (volumes: number[]) => {
  const recentVolumes = volumes.slice(-WINDOW_SIZE);
  const sortedVolumes = [...recentVolumes].sort((a, b) => a - b);
  const median = sortedVolumes[Math.floor(sortedVolumes.length / 2)];
  
  // 分別計算正負偏差
  const positiveDeviations = recentVolumes
    .filter(v => v >= median)
    .map(v => Math.abs(v - median));
  
  const negativeDeviations = recentVolumes
    .filter(v => v < median)
    .map(v => Math.abs(v - median));

  const positiveMad = positiveDeviations.length > 0
    ? positiveDeviations.sort((a, b) => a - b)[Math.floor(positiveDeviations.length / 2)] * 1.4826
    : 0;
  
  const negativeMad = negativeDeviations.length > 0
    ? negativeDeviations.sort((a, b) => a - b)[Math.floor(negativeDeviations.length / 2)] * 1.4826
    : 0;

  return { median, positiveMad, negativeMad };
};

export const useMarketStore = create<MarketState>((set, get) => ({
  data: [],
  anomalyRecords: [],
  anomalies: [],
  stats: {
    mean: 0,
    stdDev: 0,
    movingAverages: []
  },
  
  addData: (newData: MarketData) => {
    set(state => {
      const updatedData = [...state.data.slice(-MAX_DATA_POINTS + 1), newData];
      const volumes = updatedData.map(d => d.netVolume);
      
      // 計算統計量
      const { median, positiveMad, negativeMad } = calculateStats(volumes);
      
      // 檢查新數據是否異常
      const latestValue = newData.netVolume;
      const deviation = latestValue - median;
      const mad = deviation >= 0 ? positiveMad : negativeMad;
      const zScore = mad !== 0 ? Math.abs(deviation) / mad : 0;

      // 更新異常記錄
      let updatedAnomalyRecords = [...state.anomalyRecords];
      
      if (zScore > ANOMALY_THRESHOLD) {
        updatedAnomalyRecords.push({
          timestamp: Date.now(),
          value: latestValue,
          zScore,
          dataTimestamp: newData.timestamp,  // 存儲數據的時間戳
          direction: deviation >= 0 ? 'positive' : 'negative'
        });
      }

      // 清理舊記錄
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      updatedAnomalyRecords = updatedAnomalyRecords
        .filter(record => record.timestamp > tenMinutesAgo)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);

      // 計算異常值索引
      const anomalies = updatedAnomalyRecords
        .map(record => {
          // 根據時間戳在當前數據中找到對應的索引
          return updatedData.findIndex(d => d.timestamp === record.dataTimestamp);
        })
        .filter(index => index !== -1);  // 移除未找到的索引

      return {
        data: updatedData,  // data 中已經包含了價格信息
        anomalyRecords: updatedAnomalyRecords,
        anomalies,
        stats: {
          mean: median,
          stdDev: (positiveMad + negativeMad) / 2,
          movingAverages: volumes.map((_, i) => {
            const start = Math.max(0, i - WINDOW_SIZE + 1);
            const windowData = volumes.slice(start, i + 1);
            return windowData.reduce((a, b) => a + b, 0) / windowData.length;
          })
        }
      };
    });
  }
})); 