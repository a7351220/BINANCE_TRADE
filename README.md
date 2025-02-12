# Crypto Market Depth Monitor

A real-time market depth analysis tool for Binance order book data.

## Data Source

- **Binance WebSocket API**: 
  - Order book stream: `btcusdt@depth`
  - Trade stream: `btcusdt@trade`
- Real-time updates with no delay

## Core Metrics

### 1. Volume Analysis
- **Bid Volume**: Sum of buy orders within 1% of current price
- **Ask Volume**: Sum of sell orders within 1% of current price
- **Net Volume**: Ask Volume - Bid Volume
- **Units**: Auto-formatted in K/M based on size
  - K = Thousands (e.g., $100K)
  - M = Millions (e.g., $1.5M)

### 2. Anomaly Detection
- **Method**: Statistical analysis using:
  - Moving Average as baseline
  - Standard Deviation for variance
  - 2σ (two sigma) rule for anomaly flagging
- **Indicators**:
  - Red alerts for volumes exceeding 2 standard deviations
  - Real-time monitoring and notification
  - Historical anomaly tracking

### 3. Market Statistics
- **Total Volume**: Cumulative trading volume
- **Mean Volume**: Average volume per update
- **Standard Deviation**: Market volatility measure
- **Anomaly Count**: Number of detected anomalies

## Data Visualization

### Real-time Charts
- Price movement tracking
- Volume analysis with anomaly highlighting
- Moving average overlay

### Market Data Table
- Time-stamped entries
- Bid/Ask volume comparison
- Net volume calculation
- Anomaly status indication

## Data Export
- CSV format export
- Includes timestamp, volumes, and price data
- Suitable for further analysis

## Technical Notes

- All amounts in USD
- Automatic unit conversion (K/M)
- Real-time calculation and updates
- 1% price range for order book depth analysis

## Usage Tips

1. **Volume Analysis**:
   - Watch for significant imbalances between bid/ask volumes
   - Monitor net volume trends
   - Note sudden volume spikes

2. **Anomaly Alerts**:
   - Red indicators show potential market volatility
   - Compare with historical patterns
   - Consider multiple timeframes

3. **Market Depth**:
   - Focus on orders within 1% of current price
   - Track volume distribution
   - Monitor order book imbalances

## Project Structure

## Data Source Details

- **Binance WebSocket API**: `<symbol>usdt@depth`
- 使用 Top 10% 的訂單簿深度來計算指標
- 實時更新，無延遲

## Core Metrics Description

### 1. VWAP (Volume-Weighted Average Price)
- **Definition**: 成交量加權平均價格
- **Calculation**: Σ(價格 × 數量) / Σ(數量)
- **Meaning**: 
  - 比單純的市場價格更能反映真實交易價值
  - 考慮了訂單量的權重
  - 分別計算買方(Bid)和賣方(Ask)的VWAP

### 2. Spread (價差)
- **Calculation**: ((賣方VWAP - 買方VWAP) / 買方VWAP) × 100%
- **Warning Value**: > 0.1% shows yellow warning ⚠️
- **Meaning**:
  - Reflects market liquidity
  - Large spread indicates low liquidity
  - Normal market spread should be small

### 3. Volume Imbalance (量能差異)
- **Calculation**: ((買方量 - 賣方量) / (買方量 + 賣方量)) × 100%
- **Display**:
  - Strong buy pressure (>50%): 🚀 Green
  - Strong sell pressure (<-50%): �� Red
  - Balance (-50%~50%): 📊 White
- **Meaning**:
  - Reflects market short-term trend
  - Large volume imbalance may indicate price movement

## Data Interpretation

### Example Output 

🚀 BTC 2024-03-14 15:30:45 | Spread: 0.050% | Vol Imb: 25.5% | $67245.50 - $67278.80 | B:$2.5M A:$1.8M

### Market State Judgment

1. **Strong Buy Signal**:
   - 🚀 Green display
   - Volume Imbalance > 50%
   - Small Spread
   - Buy volume significantly greater than sell volume

2. **Strong Sell Signal**:
   - 📉 Red display
   - Volume Imbalance < -50%
   - Small Spread
   - Sell volume significantly greater than buy volume

3. **Market Anomaly Warning**:
   - ⚠️ Yellow display
   - Spread > 0.1%
   - Indicates low liquidity, trade cautiously

4. **Normal Market State**:
   - 📊 White display
   - Moderate Volume Imbalance
   - Small Spread
   - Buy and sell volumes relatively balanced

## Data Recording

All data will be recorded to CSV files, including:
- Timestamp
- Trading pair
- Buy/Sell VWAP
- Spread percentage
- Buy/Sell trading volume (USD)

## Notes

- All amounts are priced in USD
- Large numbers use K(thousand)/M(million)/B(billion) format
- Volume imbalance and spread are calculated in real-time, reflecting current market state
- It's recommended to observe data from multiple time points to judge trends

