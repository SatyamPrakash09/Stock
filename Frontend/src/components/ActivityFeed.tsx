import { Package, Users, HeadphonesIcon } from 'lucide-react';
import type { ActivityItem } from '../types';

interface ActivityFeedProps {
  items: ActivityItem[];
  title?: string;
}

export default function ActivityFeed({ items, title = 'Recent Activity' }: ActivityFeedProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'inventory':
        return <Package className="w-5 h-5 text-[#BDB1A1]" />;
      case 'lead':
        return <Users className="w-5 h-5 text-[#BDB1A1]" />;
      case 'support':
        return <HeadphonesIcon className="w-5 h-5 text-[#BDB1A1]" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-[#374151] text-[#A0AEC0] border-[#4B5563]';
    }
  };

  return (
    <div className="bg-[#2D3748] rounded-lg border border-[#374151]">
      <div className="px-6 py-4 border-b border-[#374151]">
        <h2 className="text-[#E2E8F0] text-lg font-light">{title}</h2>
      </div>
      <div className="divide-y divide-[#374151]">
        {items.map((item) => (
          <div
            key={item.id}
            className="px-6 py-4 hover:bg-[#374151] transition-colors duration-200 cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-[#374151] rounded-lg flex items-center justify-center group-hover:bg-[#4B5563] transition-colors">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-[#E2E8F0] font-light">{item.title}</h3>
                  <span className="text-[#A0AEC0] text-sm font-light whitespace-nowrap">
                    {item.timestamp}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {item.priority && (
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-light border ${getPriorityColor(item.priority)}`}
                    >
                      {item.priority}
                    </span>
                  )}
                  {item.status && (
                    <span className="px-2 py-0.5 rounded text-xs font-light bg-[#374151] text-[#A0AEC0] border border-[#4B5563]">
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
