import { useState, useMemo } from 'react';
import { DateTime } from 'luxon';
import { DataTable } from '../components/DataTable';
import { StatCard } from '../components/StatCard';
import { formatVolume } from '../utils/formatters';
import { HistoricalDataTable } from '../components/HistoricalDataTable';
import { HistoricalMarketData, MarketData, ApiMarketData } from '../types/market';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function History() {
  const [limit, setLimit] = useState<number | ''>(10);
  const [timeRange, setTimeRange] = useState({
    from: DateTime.now()
      .setZone('Asia/Taipei')
      .minus({ hours: 24 })
      .toFormat("yyyy-MM-dd'T'HH:mm"),
    to: DateTime.now()
      .setZone('Asia/Taipei')
      .toFormat("yyyy-MM-dd'T'HH:mm")
  });
  const [allData, setAllData] = useState<MarketData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return allData.slice(start, end);
  }, [allData, currentPage]);

  const quickLimits = [10, 100, 1000];

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Original input time:', timeRange);
      
      const fromDate = DateTime.fromFormat(timeRange.from, "yyyy-MM-dd'T'HH:mm", { zone: 'Asia/Taipei' })
        .toUTC()
        .toISO();
      const toDate = DateTime.fromFormat(timeRange.to, "yyyy-MM-dd'T'HH:mm", { zone: 'Asia/Taipei' })
        .toUTC()
        .toISO();
      
      console.log('Converted to UTC:', { fromDate, toDate });
      
      const params = new URLSearchParams();
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);
      if (limit) params.append('limit', limit.toString());
      
      const response = await fetch(`${API_URL}/api/market/history?${params}`);
      const data: ApiMarketData[] = await response.json();
      
      const formattedData: MarketData[] = data.map(item => ({
        timestamp: item.time,
        price: Number(item.price),
        bidVolume: Number(item.bid_volume),
        askVolume: Number(item.ask_volume),
        netVolume: Number(item.net_volume)
      }));
      
      setAllData(formattedData);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  const exportData = () => {
    const csv = [
      ['Time', 'Price', 'Bid Volume', 'Ask Volume', 'Net Volume'],
      ...allData.map(row => [
        DateTime.fromISO(row.timestamp).toFormat('yyyy-MM-dd HH:mm:ss'),
        row.price,
        row.bidVolume,
        row.askVolume,
        row.netVolume
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-data-${timeRange.from}-${timeRange.to}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 font-mono overflow-x-hidden">
      {/* 手機版頂部欄 */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#12121a] border-b border-[#2a2a3a] p-2 z-10 h-14">
        <div className="flex justify-between items-center">
          <h1 className="text-lg text-cyan-400">Historical Data</h1>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-3 py-1 bg-cyan-900/20 rounded text-sm"
          >
            Back
          </button>
        </div>
      </div>

      {/* 主要內容 */}
      <main className="container mx-auto px-4 mt-[56px] md:mt-0 md:pt-6">
        {/* 桌面版標題欄 */}
        <div className="hidden md:flex justify-between items-center mb-6">
          <h1 className="text-2xl text-cyan-400">Historical Data</h1>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-cyan-900/20 rounded hover:bg-cyan-900/30"
          >
            Back to Real-time
          </button>
        </div>

        {/* 查詢控制項 */}
        <div className="grid gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="w-full md:w-auto">
              <label className="block text-sm text-gray-400 mb-1">From</label>
              <input 
                type="datetime-local" 
                className="w-full md:w-auto bg-[#1a1a25] border border-[#2a2a3a] p-2 rounded text-sm"
                value={timeRange.from}
                onChange={(e) => setTimeRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div className="w-full md:w-auto">
              <label className="block text-sm text-gray-400 mb-1">To</label>
              <input 
                type="datetime-local"
                className="w-full md:w-auto bg-[#1a1a25] border border-[#2a2a3a] p-2 rounded text-sm"
                value={timeRange.to}
                onChange={(e) => setTimeRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="w-full md:w-auto">
              <label className="block text-sm text-gray-400 mb-1">Number of Records</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  min="1"
                  className="w-24 bg-[#1a1a25] border border-[#2a2a3a] p-2 rounded text-sm"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Custom"
                />
                <div className="flex gap-2">
                  {quickLimits.map(num => (
                    <button
                      key={num}
                      onClick={() => setLimit(num)}
                      className={`px-3 py-1 rounded text-sm ${
                        limit === num 
                          ? 'bg-cyan-500 text-white' 
                          : 'bg-cyan-900/20 hover:bg-cyan-900/30'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={fetchData}
              className="flex-1 md:flex-none px-4 py-2 bg-cyan-500 rounded hover:bg-cyan-600"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load Data'}
            </button>
            <button 
              onClick={exportData}
              className="flex-1 md:flex-none px-4 py-2 bg-cyan-900/20 rounded hover:bg-cyan-900/30"
              disabled={allData.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* 數據表格 */}
        {allData.length > 0 && (
          <div className="space-y-6 overflow-x-auto">
            <DataTable data={currentData} />
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-cyan-900/20 rounded hover:bg-cyan-900/30 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-400">
                Page {currentPage} of {Math.ceil(allData.length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= Math.ceil(allData.length / itemsPerPage)}
                className="px-4 py-2 bg-cyan-900/20 rounded hover:bg-cyan-900/30 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 