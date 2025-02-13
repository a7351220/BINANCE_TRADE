// 統計卡片組件
import { formatNumber } from '../utils/formatters';

interface StatCardProps {
  title: string;
  value: string | number;
  alert?: boolean;
}

export const StatCard = ({ title, value, alert }: StatCardProps) => (
  <div className="bg-[#12121a] rounded-lg border border-[#2a2a3a] p-4 hover:shadow-lg hover:shadow-cyan-900/20 transition-all duration-300">
    <h3 className="text-xs text-gray-400 mb-2 truncate">{title}</h3>
    <p className={`text-xl md:text-2xl tracking-wider truncate ${alert ? 'text-red-400' : 'text-cyan-400'}`}>
      {typeof value === 'number' ? formatNumber(value) : value}
    </p>
  </div>
); 