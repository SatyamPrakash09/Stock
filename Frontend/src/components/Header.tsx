import { User } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-20 right-0 h-16 bg-[#1A202C] border-b border-[#2D3748] flex items-center justify-between px-8 z-10">
      <h1 className="text-2xl font-light text-[#BDB1A1] tracking-wider">
        InventoryX
      </h1>
      <button className="w-10 h-10 rounded-full bg-[#2D3748] flex items-center justify-center hover:bg-[#374151] transition-colors">
        <User className="w-5 h-5 text-[#BDB1A1]" />
      </button>
    </header>
  );
}
