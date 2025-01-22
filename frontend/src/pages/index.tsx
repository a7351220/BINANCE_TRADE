import React from 'react';
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DateTime } from 'luxon';

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MarketData {
  timestamp: string;
  symbol: string;
  vwapBid: number;
  vwapAsk: number;
  spread: number;
  volumeImbalance: number;
  bidVolume: number;
  askVolume: number;
}

export default function Home() {
  const [data, setData] = useState<MarketData[]>([]);
  const [activeTab, setActiveTab] = useState<'raw' | 'indicators'>('indicators');
  const [minuteData, setMinuteData] = useState<{
    timestamp: string;
    bidVolume: number;
    askVolume: number;
    volumeImbalance: number;
    spread: number;
  }[]>([]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(prev => [...prev.slice(-50), newData]);
      
      // 累積一分鐘的數據
      const currentMinute = DateTime.fromISO(newData.timestamp).startOf('minute');
      
      setMinuteData(prev => {
        const lastEntry = prev[prev.length - 1];
        if (!lastEntry || DateTime.fromISO(lastEntry.timestamp).toMillis() !== currentMinute.toMillis()) {
          // 新的一分鐘
          return [...prev.slice(-50), {
            timestamp: currentMinute.toISO(),
            bidVolume: newData.bidVolume,
            askVolume: newData.askVolume,
            volumeImbalance: newData.volumeImbalance,
            spread: newData.spread
          }];
        } else {
          // 更新當前分鐘的數據
          const updatedData = [...prev.slice(0, -1), {
            ...lastEntry,
            bidVolume: Math.max(lastEntry.bidVolume, newData.bidVolume),
            askVolume: Math.max(lastEntry.askVolume, newData.askVolume),
            volumeImbalance: newData.volumeImbalance,  // 使用最新值
            spread: newData.spread  // 使用最新值
          }];
          return updatedData;
        }
      });
    };

    return () => ws.close();
  }, []);

  const chartData = {
    labels: minuteData.map(d => DateTime.fromISO(d.timestamp).toFormat('HH:mm')),
    datasets: [
      {
        label: 'Volume Imbalance %',
        data: minuteData.map(d => d.volumeImbalance),
        backgroundColor: minuteData.map(d => 
          d.volumeImbalance > 0 ? 'rgba(75, 192, 192, 0.5)' : 'rgba(255, 99, 132, 0.5)'
        ),
        borderColor: minuteData.map(d => 
          d.volumeImbalance > 0 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'
        ),
        borderWidth: 1
      }
    ]
  };

  const rawChartData = {
    labels: minuteData.map(d => DateTime.fromISO(d.timestamp).toFormat('HH:mm')),
    datasets: [
      {
        label: 'Bid Volume',
        data: minuteData.map(d => d.bidVolume),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      },
      {
        label: 'Ask Volume',
        data: minuteData.map(d => d.askVolume),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Market Depth Monitor</h1>
      
      {/* 頁籤 */}
      <div className="flex mb-4">
        <button
          className={`px-4 py-2 mr-2 rounded ${
            activeTab === 'indicators' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('indicators')}
        >
          Indicators
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'raw' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('raw')}
        >
          Raw Data
        </button>
      </div>

      {activeTab === 'indicators' ? (
        <>
          {/* 即時指標 */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-gray-100 rounded">
              <h2>Volume Imbalance</h2>
              <p className={`text-2xl ${
                data[data.length-1]?.volumeImbalance > 50 ? 'text-green-500' :
                data[data.length-1]?.volumeImbalance < -50 ? 'text-red-500' :
                'text-gray-700'
              }`}>
                {data[data.length-1]?.volumeImbalance.toFixed(2)}%
              </p>
            </div>
            
            <div className="p-4 bg-gray-100 rounded">
              <h2>Spread</h2>
              <p className={`text-2xl ${
                data[data.length-1]?.spread > 0.1 ? 'text-yellow-500' : 'text-gray-700'
              }`}>
                {data[data.length-1]?.spread.toFixed(3)}%
              </p>
            </div>
            
            <div className="p-4 bg-gray-100 rounded">
              <h2>VWAP</h2>
              <p className="text-2xl text-gray-700">
                ${data[data.length-1]?.vwapBid.toFixed(2)} - ${data[data.length-1]?.vwapAsk.toFixed(2)}
              </p>
            </div>
          </div>

          {/* 圖表 */}
          <div className="h-96">
            <Bar data={chartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
          </div>
        </>
      ) : (
        <>
          {/* 原始數據 */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-100 rounded">
              <h2>Bid Volume</h2>
              <p className="text-2xl text-gray-700">
                ${data[data.length-1]?.bidVolume.toFixed(2)}M
              </p>
            </div>
            
            <div className="p-4 bg-gray-100 rounded">
              <h2>Ask Volume</h2>
              <p className="text-2xl text-gray-700">
                ${data[data.length-1]?.askVolume.toFixed(2)}M
              </p>
            </div>
          </div>

          {/* 原始數據圖表 */}
          <div className="h-96">
            <Bar data={rawChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
          </div>
        </>
      )}
    </div>
  );
} 