import { formatVolume } from '../utils/formatters';

interface DataRowProps {
  label: string;
  value: number;
  alert?: boolean;
}

export const DataRow = ({ label, value, alert }: DataRowProps) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400">{label}</span>
    <span className={`${alert ? 'text-red-400' : 'text-cyan-400'}`}>
      {formatVolume(value)}
    </span>
  </div>
); 