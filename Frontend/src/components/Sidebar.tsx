import { LayoutDashboard, Package, Users, HeadphonesIcon } from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'inventory', icon: Package, label: 'Inventory' },
  { id: 'leads', icon: Users, label: 'Leads' },
  { id: 'support', icon: HeadphonesIcon, label: 'Support' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-[#1A202C] border-r border-[#2D3748] flex flex-col items-center py-8 z-10">
      <div className="space-y-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            className="group relative w-12 h-12 flex items-center justify-center rounded-lg hover:bg-[#2D3748] transition-all duration-300"
          >
            <item.icon className="w-6 h-6 text-[#BDB1A1] group-hover:text-[#C0A062] transition-colors" />
            <span className="absolute left-full ml-4 px-3 py-1.5 bg-[#2D3748] text-[#E2E8F0] text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap font-light">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
