import React, { useEffect, useState } from 'react';
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
  bidVolume: number;
  askVolume: number;
  netVolume: number;
}

export default function Home() {
  const [data, setData] = useState<MarketData[]>([]);
  const [minuteData, setMinuteData] = useState<MarketData[]>([]);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';
    console.log('Attempting to connect to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ WebSocket connection established');
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log('🔴 WebSocket connection closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
    };

    ws.onmessage = (event) => {
      try {
        console.log('📨 Received data:', event.data.slice(0, 100) + '...'); // 只顯示前100個字符
        const newData = JSON.parse(event.data);
        setData(prev => [...prev.slice(-50), newData]);

        // 計算當前分鐘
        const now = DateTime.fromISO(newData.timestamp);
        const minuteKey = now.startOf('minute').toISO();

        setMinuteData(prev => {
          const lastEntry = prev[prev.length - 1];
          
          if (lastEntry && DateTime.fromISO(lastEntry.timestamp).startOf('minute').toISO() === minuteKey) {
            // 更新當前分鐘的累積數據
            const updatedData = [...prev.slice(0, -1), {
              timestamp: minuteKey,
              bidVolume: lastEntry.bidVolume + newData.bidVolume,
              askVolume: lastEntry.askVolume + newData.askVolume,
              netVolume: (lastEntry.askVolume + newData.askVolume) - (lastEntry.bidVolume + newData.bidVolume)
            }];
            return updatedData;
          } else {
            // 新的一分鐘
            return [...prev.slice(-19), {
              timestamp: minuteKey,
              bidVolume: newData.bidVolume,
              askVolume: newData.askVolume,
              netVolume: newData.askVolume - newData.bidVolume
            }];
          }
        });
      } catch (error) {
        console.error('❌ Error processing message:', error);
      }
    };

    return () => {
      console.log('🔄 Cleaning up WebSocket connection');
      ws.close();
    };
  }, []);

  const chartData = {
    labels: minuteData.map(d => DateTime.fromISO(d.timestamp).toFormat('HH:mm')),
    datasets: [
      {
        label: 'Net Volume (1分鐘)',
        data: minuteData.map(d => d.netVolume),
        backgroundColor: (context) => {
          const value = context.raw as number;
          return value >= 0 ? 'rgba(255, 99, 132, 0.5)' : 'rgba(75, 192, 192, 0.5)';
        },
        borderColor: (context) => {
          const value = context.raw as number;
          return value >= 0 ? 'rgb(255, 99, 132)' : 'rgb(75, 192, 192)';
        },
        borderWidth: 1
      }
    ]
  };

  const latestData = data[data.length - 1];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Market Depth Monitor</h1>

      {/* 即時指標 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-gray-100 rounded">
          <h2>Net Volume</h2>
          <p className={`text-2xl ${
            latestData?.netVolume > 0 ? 'text-red-500' : 'text-green-500'
          }`}>
            ${Math.abs(latestData?.netVolume || 0).toFixed(2)}M
          </p>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2>Bid Volume</h2>
          <p className="text-2xl text-gray-700">
            ${latestData?.bidVolume.toFixed(2)}M
          </p>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h2>Ask Volume</h2>
          <p className="text-2xl text-gray-700">
            ${latestData?.askVolume.toFixed(2)}M
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
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top' as const
            }
          }
        }} />
      </div>
    </div>
  );
} 