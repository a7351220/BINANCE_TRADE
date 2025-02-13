import { DateTime } from 'luxon';
import { formatVolume } from '../utils/formatters';

interface HistoricalDataTableProps {
  data: any[];
}

export const HistoricalDataTable = ({ data }: HistoricalDataTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#1a1a25]">
          <tr>
            <th className="p-3 text-left">Time</th>
            <th className="p-3 text-right">Price</th>
            <th className="p-3 text-right">Bid Vol</th>
            <th className="p-3 text-right">Ask Vol</th>
            <th className="p-3 text-right">Net Vol</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-[#1a1a25]">
              <td className="p-3">
                {DateTime.fromISO(row.time).toFormat('HH:mm:ss')}
              </td>
              <td className="p-3 text-right text-yellow-500">
                ${Number(row.price).toFixed(2)}
              </td>
              <td className="p-3 text-right text-cyan-400">
                {formatVolume(Number(row.bid_volume))}
              </td>
              <td className="p-3 text-right text-cyan-400">
                {formatVolume(Number(row.ask_volume))}
              </td>
              <td className="p-3 text-right text-cyan-400">
                {formatVolume(Number(row.net_volume))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 