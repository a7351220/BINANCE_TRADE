export const calculateMovingAverage = (data: number[], period: number = 60) => {
  if (data.length < period) return data.reduce((a, b) => a + b, 0) / data.length;
  
  const latestData = data.slice(-period);
  return latestData.reduce((a, b) => a + b, 0) / period;
};

// 使用一個類來管理異常值，避免全局狀態問題
class AnomalyDetector {
  private anomalies = new Map<number, number>();
  
  addAnomaly(timestamp: number, relativeIndex: number) {
    this.anomalies.set(timestamp, relativeIndex);
    this.cleanup();
  }
  
  private cleanup() {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [timestamp] of this.anomalies) {
      if (timestamp < tenMinutesAgo) {
        this.anomalies.delete(timestamp);
      }
    }
  }
  
  getAnomalies(): number[] {
    return Array.from(this.anomalies.entries())
      .sort((a, b) => b[0] - a[0])  // 按時間戳降序排序
      .map(([_, index]) => index)
      .slice(0, 10);  // 只保留最近的 10 個異常值
  }
}

const detector = new AnomalyDetector();

export const calculateStats = (data: Array<{ netVolume: number }>, period: number = 60) => {
  const volumes = data.map(d => d.netVolume);
  const mean = calculateMovingAverage(volumes, period);
  
  // 計算標準差
  const recentVolumes = volumes.slice(-period);
  const stdDev = Math.sqrt(
    recentVolumes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period
  );

  // 只檢查最新的數據點
  const latestValue = volumes[volumes.length - 1];
  const zScore = Math.abs(latestValue - mean) / stdDev;
  
  // 如果最新數據點是異常值，添加到檢測器中
  if (zScore > 2.5) {  // 稍微提高閾值，減少誤報
    detector.addAnomaly(Date.now(), data.length - 1);
  }

  // 獲取異常值列表並調整索引
  const anomalies = detector.getAnomalies()
    .filter(index => index >= data.length - 100)  // 只保留最近 100 筆數據的異常值
    .map(index => index % 100);  // 轉換為相對索引

  // 計算移動平均線數據
  const movingAverages = volumes.map((_, i) => {
    if (i < period) {
      return calculateMovingAverage(volumes.slice(0, i + 1));
    }
    return calculateMovingAverage(volumes.slice(i - period + 1, i + 1));
  });

  return { 
    mean, 
    stdDev, 
    anomalies,
    movingAverages 
  };
}; 