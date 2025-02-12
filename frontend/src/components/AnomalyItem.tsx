import { DateTime } from 'luxon';
import { formatVolume } from '../utils/formatters';

interface AnomalyItemProps {
  data: {
    timestamp: string;
    netVolume: number;
  };
}

export const AnomalyItem = ({ data }: AnomalyItemProps) => (
  <div className="flex items-center justify-between p-2 bg-red-900/20 rounded border border-red-900/20">
    <div className="flex items-center gap-2">
      <span className="text-red-400">⚠️</span>
      <span className="text-xs text-gray-400">
        {DateTime.fromISO(data.timestamp).toFormat('HH:mm:ss')}
      </span>
    </div>
    <span className="text-xs text-red-400">
      {formatVolume(data.netVolume)}
    </span>
  </div>
); 