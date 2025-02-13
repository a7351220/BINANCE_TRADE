import React, { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import 'chartjs-adapter-luxon';
import { Line } from 'react-chartjs-2';
import { DateTime } from 'luxon';
import { useMarketStore } from '../stores/marketStore';
import { StatCard } from '../components/StatCard';
import { DataRow } from '../components/DataRow';
import { AnomalyItem } from '../components/AnomalyItem';
import { DataTable } from '../components/DataTable';
import { MarketData } from '../types/market';
import { formatVolume } from '../utils/formatters';

// 註冊必要的 Chart.js 組件
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

// 創建共用的 X 軸配置
const commonXAxisConfig = {
  type: 'time' as const,
  time: {
    unit: 'second' as const,
    displayFormats: {
      second: 'HH:mm:ss'
    }
  },
  grid: {
    display: false
  }
} as const;

export default function Home() {
  const [currentTime, setCurrentTime] = useState('');
  const { data, stats, anomalies, addData } = useMarketStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [mounted, setMounted] = useState(false);

  // 計算當前頁的數據
  const currentTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, currentPage]);

  // 下載數據
  const downloadData = () => {
    const headers = ['Timestamp', 'Bid Volume', 'Ask Volume', 'Net Volume'];
    const csvData = [
      headers.join(','),
      ...data.map(d => [
        d.timestamp,
        d.bidVolume,
        d.askVolume,
        d.netVolume
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market_data_${DateTime.now().toFormat('yyyyMMdd_HHmmss')}.csv`;
    a.click();
  };

  // 更新當前時間
  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setCurrentTime(DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'));
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const formattedData: MarketData = {
        timestamp: data.timestamp,
        price: Number(data.price),
        bidVolume: Number(data.bidVolume),
        askVolume: Number(data.askVolume),
        netVolume: Number(data.netVolume)
      };
      addData(formattedData);
    };

    return () => {
      ws.close();
    };
  }, [addData]);

  // 避免服務器端渲染時顯示時間
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl text-cyan-400">Real-time Market Data</h1>
          </div>
          {/* 顯示加載中狀態 */}
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      {/* 手機版頂部欄 */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#12121a] border-b border-[#2a2a3a] p-2 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-cyan-400 text-sm">MONITOR</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = '/history'}
              className="p-2 bg-cyan-900/20 rounded hover:bg-cyan-900/30"
              aria-label="View Historical Data"
            >
              <span className="text-cyan-400 text-xl">📊</span>
            </button>
            <span className="text-gray-400 text-sm">
              {DateTime.now().toFormat('HH:mm')}
            </span>
          </div>
        </div>
      </div>

      {/* 桌面版側邊欄 */}
      <aside className="hidden md:block fixed left-0 top-0 h-full w-64 bg-[#12121a] border-r border-[#2a2a3a] p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-3 w-3 bg-cyan-500 rounded-full animate-pulse shadow-lg shadow-cyan-500/50"></div>
          <span className="text-cyan-400 tracking-wider">MONITOR</span>
        </div>

        {/* 添加歷史數據按鈕 */}
        <button 
          onClick={() => window.location.href = '/history'}
          className="w-full bg-cyan-900/20 rounded hover:bg-cyan-900/30 p-3 mb-8 flex items-center gap-2"
        >
          <span className="text-cyan-400">📊</span>
          <span>View Historical Data</span>
        </button>

        <div className="space-y-6">
          <div className="p-3 bg-[#1a1a25] rounded-lg">
            <p className="text-xs text-gray-400 mb-1">
              CURRENT TIME
            </p>
            <p className="text-cyan-300 tracking-wider">
              {currentTime}
            </p>
          </div>
          
          <div className="p-3 bg-[#1a1a25] rounded-lg">
            <p className="text-xs text-gray-400 mb-1">
              CONNECTION STATUS
            </p>
            <p className="text-green-400">
              CONNECTED
            </p>
          </div>
        </div>
      </aside>

      {/* 主要內容區 */}
      <main className="md:ml-64">
        {/* 內容容器 */}
        <div className="p-4 pt-14 md:p-4">
          {/* 桌面版標題 */}
          <h1 className="hidden md:block text-2xl text-cyan-400 mb-4">Real-time Market Data</h1>

          {/* 頂部統計卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
            <StatCard
              title="CURRENT PRICE"
              value={`$${data[data.length - 1]?.price.toFixed(2) || '0.00'}`}
            />
            <StatCard
              title="TOTAL VOLUME"
              value={formatVolume(stats.mean * data.length)}
            />
            <StatCard
              title="MEAN VOLUME"
              value={formatVolume(stats.mean)}
            />
            <StatCard
              title="STD DEVIATION"
              value={formatVolume(stats.stdDev)}
            />
            <StatCard
              title="ANOMALIES"
              value={anomalies.length}
              alert={anomalies.length > 5}
            />
          </div>

          {/* 主圖表區域 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* 左側 - 主要圖表 */}
            <div className="lg:col-span-2 bg-[#12121a] rounded-lg border border-[#2a2a3a] p-3 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-cyan-400 tracking-wider">MARKET ANALYSIS</h2>
                <button onClick={downloadData} className="text-xs bg-[#1a1a25] px-3 py-1 rounded">
                  EXPORT
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {/* 價格圖表 */}
                <div className="h-[200px]">
                  <Line
                    data={{
                      datasets: [{
                        label: 'Price',
                        data: data.map(d => ({
                          x: d.timestamp,
                          y: d.price
                        })),
                        borderColor: 'rgb(234, 179, 8)',
                        backgroundColor: 'rgba(234, 179, 8, 0.05)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y1',
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: { duration: 0 },
                      scales: {
                        x: commonXAxisConfig,
                        y1: {
                          position: 'left',
                          grid: {
                            color: 'rgba(234, 179, 8, 0.1)'
                          },
                          ticks: {
                            color: 'rgba(234, 179, 8, 0.5)'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: true,
                          position: 'top'
                        }
                      }
                    }}
                  />
                </div>

                {/* 原有的成交量圖表 */}
                <div className="h-[200px]">
                  <Line
                    data={{
                      datasets: [{
                        label: 'Net Volume',
                        data: data.map(d => ({
                          x: d.timestamp,
                          y: d.netVolume
                        })),
                        borderColor: 'rgb(34, 211, 238)',
                        backgroundColor: 'rgba(34, 211, 238, 0.05)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: (context) => {
                          const index = context.dataIndex;
                          return anomalies.includes(index) ? 6 : 0;
                        },
                        pointBackgroundColor: 'rgba(239, 68, 68, 0.8)',
                      }, {
                        label: 'Moving Average',
                        data: data.map((d, i) => ({
                          x: d.timestamp,
                          y: stats.movingAverages[i]
                        })),
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      animation: {
                        duration: 0
                      },
                      elements: {
                        line: {
                          tension: 0.4
                        }
                      },
                      scales: {
                        x: commonXAxisConfig,
                        y: {
                          grid: {
                            color: 'rgba(34, 211, 238, 0.1)'
                          },
                          ticks: {
                            color: 'rgba(34, 211, 238, 0.5)'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: true,
                          position: 'top',
                          labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 右側 - 實時數據和異常檢測 */}
            <div className="space-y-4 md:space-y-6">
              {/* 最新數據卡片 */}
              <div className="bg-[#12121a] rounded-lg border border-[#2a2a3a] p-6">
                <h2 className="text-sm text-gray-400 mb-4">LATEST DATA</h2>
                <div className="space-y-3">
                  <DataRow label="BID VOL" value={data[data.length - 1]?.bidVolume} />
                  <DataRow label="ASK VOL" value={data[data.length - 1]?.askVolume} />
                  <DataRow label="NET VOL" value={data[data.length - 1]?.netVolume} alert={anomalies.includes(data.length - 1)} />
                </div>
              </div>

              {/* 異常檢測列表 */}
              <div className="bg-[#12121a] rounded-lg border border-[#2a2a3a] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm text-gray-400">ANOMALY DETECTION</h2>
                  <div className="relative group">
                    <span className="cursor-help text-gray-400 text-xs">
                      (?)</span>
                    <div className="absolute hidden group-hover:block w-64 p-2 bg-[#1a1a25] 
                      border border-[#2a2a3a] rounded-lg shadow-lg -right-2 top-6 z-10">
                      <div className="text-xs space-y-2 text-gray-300">
                        <p>Anomaly Detection Logic:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Uses Moving Average as baseline</li>
                          <li>Flags volume exceeding 2 standard deviations</li>
                          <li>Red alerts indicate potential market volatility</li>
                        </ul>
                        <p className="text-xs text-gray-400 mt-2">
                          *Based on real-time market data analysis
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {anomalies.map((anomaly, index) => (
                    <AnomalyItem key={index} data={data[anomaly]} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 底部數據表格 */}
          <div className="mt-6 bg-[#12121a] rounded-lg border border-[#2a2a3a] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-[#2a2a3a]">
              <h2 className="text-cyan-400 tracking-wider">TRANSACTION HISTORY</h2>
              <div className="flex gap-2">
                {/* 可以添加表格控制按鈕 */}
              </div>
            </div>
            <div className="overflow-x-auto">
              <DataTable data={currentTransactions} anomalies={anomalies} />
            </div>
          </div>

          {/* 分頁控制 */}
          {data.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-cyan-900/20 rounded hover:bg-cyan-900/30 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {currentPage} of {Math.ceil(data.length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= Math.ceil(data.length / itemsPerPage)}
                className="px-4 py-2 bg-cyan-900/20 rounded hover:bg-cyan-900/30 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 