import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Receipt, Wallet, Settings, LogOut, Users, Menu, ChevronLeft, Barcode, ShoppingBag, UserCheck, Truck } from 'lucide-react';
import { UserRole } from '../types';


interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  userRole: UserRole;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, userRole, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Kasir (POS)', icon: ShoppingCart },
    { id: 'products', label: 'Produk', icon: Package },
    { id: 'transactions', label: 'Riwayat & Utang', icon: Receipt },
    { id: 'people', label: 'Kontak', icon: Users },
    { id: 'finance', label: 'Keuangan', icon: Wallet },
    { id: 'customer_history', label: 'Riwayat Pelanggan', icon: UserCheck },
    { id: 'supplier_history', label: 'Riwayat Supplier', icon: Truck },
    { id: 'sold_items', label: 'Barang Terjual', icon: ShoppingBag },
  ];

  if (userRole === UserRole.OWNER || userRole === UserRole.SUPERADMIN) {
    navItems.push({ id: 'barcode', label: 'Cetak Barcode', icon: Barcode });
    navItems.push({ id: 'settings', label: 'Pengaturan', icon: Settings });
  }



  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-24'} bg-slate-900 text-white flex flex-col shadow-xl z-10 transition-[width] duration-300 ease-in-out transform-gpu`}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between h-[72px]">
          {isSidebarOpen && (
            <h1 className="text-2xl font-bold text-blue-400 tracking-tighter whitespace-nowrap animate-fade-in">
              Cemilan<span className="text-white">.</span>
            </h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`text-slate-400 hover:text-white bg-slate-800 rounded p-2 border border-slate-700 shadow-sm ${!isSidebarOpen ? 'mx-auto' : ''}`}
          >
            <Menu size={18} />
          </button>
        </div>



        <nav className="flex-1 p-4 pt-2 space-y-2 overflow-y-auto overflow-x-hidden sidebar-scroll">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'} px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isSidebarOpen && <span className="font-medium whitespace-nowrap animate-fade-in">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-colors"
            title={!isSidebarOpen ? 'Keluar' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {isSidebarOpen && <span className="whitespace-nowrap">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-100">
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};