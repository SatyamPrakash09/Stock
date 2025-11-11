import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPICard as KPICardType } from '../types';

interface KPICardProps {
  data: KPICardType;
}

export default function KPICard({ data }: KPICardProps) {
  const getTrendIcon = () => {
    if (data.trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (data.trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (data.trend === 'up') return 'text-green-400';
    if (data.trend === 'down') return 'text-red-400';
    return 'text-[#A0AEC0]';
  };

  return (
    <div className="bg-[#2D3748] rounded-lg p-6 border border-[#374151] hover:border-[#BDB1A1] transition-all duration-300">
      <h3 className="text-[#A0AEC0] text-sm font-light mb-3">{data.title}</h3>
      <div className="flex items-end justify-between">
        <p className="text-[#E2E8F0] text-3xl font-light">{data.value}</p>
        {data.change && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-light">{data.change}</span>
          </div>
        )}
      </div>
    </div>
  );
}
