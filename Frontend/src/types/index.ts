export interface KPICard {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ActivityItem {
  id: string;
  type: 'inventory' | 'lead' | 'support';
  title: string;
  timestamp: string;
  priority?: 'low' | 'medium' | 'high';
  status?: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'closed';
  timestamp: string;
}
