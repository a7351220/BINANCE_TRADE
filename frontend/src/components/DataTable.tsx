import { DateTime } from 'luxon';
import { formatVolume } from '../utils/formatters';
import { MarketData } from '../types/market';

interface DataTableProps {
  data: MarketData[];
  anomalies?: number[];
}

export const DataTable = ({ data, anomalies = [] }: DataTableProps) => (
  <table className="w-full text-sm">
    <thead className="bg-[#1a1a25]">
      <tr>
        <th className="p-3 text-left text-gray-400">TIME</th>
        <th className="p-3 text-right text-gray-400">PRICE</th>
        <th className="p-3 text-right text-gray-400">BID VOL</th>
        <th className="p-3 text-right text-gray-400">ASK VOL</th>
        <th className="p-3 text-right text-gray-400">NET VOL</th>
        <th className="p-3 text-left text-xs tracking-wider text-cyan-400">STATUS</th>
      </tr>
    </thead>
    <tbody>
      {data.map((d, i) => {
        const isAnomaly = anomalies.includes(i);
        const localTime = DateTime.fromISO(d.timestamp).toFormat('HH:mm:ss');

        return (
          <tr
            key={d.timestamp}
            className={`
              ${isAnomaly ? 'bg-red-900/20 hover:bg-red-900/30' : 'hover:bg-[#1a1a25]'} border-b border-[#1a1a25]
            `}
          >
            <td className="p-3 text-gray-300">{localTime}</td>
            <td className="p-3 text-right text-yellow-500">
              ${d.price.toFixed(2)}
            </td>
            <td className="p-3 text-right text-cyan-400">
              {formatVolume(d.bidVolume)}
            </td>
            <td className="p-3 text-right text-cyan-400">
              {formatVolume(d.askVolume)}
            </td>
            <td className="p-3 text-right text-cyan-400">
              {formatVolume(d.netVolume)}
            </td>
            <td className="px-4 py-3 text-sm">
              {isAnomaly ? <span className="text-red-400">⚠️ ANOMALY</span> : <span className="text-green-400">NORMAL</span>}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
); 