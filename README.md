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
