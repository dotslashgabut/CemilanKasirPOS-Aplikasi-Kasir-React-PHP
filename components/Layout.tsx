import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Receipt, Wallet, Settings, LogOut, Users, Menu, ChevronLeft, Barcode, ShoppingBag, UserCheck, Truck, ArrowRightLeft, Undo2, ClipboardCheck, X, Info } from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  userRole: UserRole;
  onLogout: () => void;
}

// Memoized NavItem component untuk mencegah re-render yang tidak perlu
const NavItem = React.memo<{
  item: { id: string; label: string; icon: any };
  isActive: boolean;
  isSidebarOpen: boolean;
  onNavigate: (page: string) => void;
}>(({ item, isActive, isSidebarOpen, onNavigate }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={() => onNavigate(item.id)}
      className={`w-full flex items-center ${isSidebarOpen ? 'justify-start gap-3' : 'justify-center'} px-4 py-3 rounded-xl transition-all duration-150 ${isActive
        ? 'bg-white text-primary shadow-lg shadow-black/10'
        : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
      title={!isSidebarOpen ? item.label : ''}
    >
      <Icon size={20} className="flex-shrink-0" />
      {isSidebarOpen && (
        <span className="font-medium whitespace-nowrap transition-opacity duration-150">
          {item.label}
        </span>
      )}
    </button>
  );
});

NavItem.displayName = 'NavItem';

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, userRole, onLogout }) => {
  // Load sidebar state from localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('pos_sidebar_open');
    return saved !== null ? saved === 'true' : true;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('pos_sidebar_open', String(isSidebarOpen));
  }, [isSidebarOpen]);

  // Close mobile menu when page changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activePage]);

  // Memoize toggle function
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Memoize nav items untuk mencegah re-creation setiap render
  const navItems = useMemo(() => {
    let items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'pos', label: 'Kasir (POS)', icon: ShoppingCart },
      { id: 'products', label: 'Produk', icon: Package },
      { id: 'transactions', label: 'Riwayat & Utang', icon: Receipt },
      { id: 'people', label: 'Kontak', icon: Users },
      { id: 'finance', label: 'Keuangan', icon: Wallet },
      { id: 'customer_history', label: 'Riwayat Pelanggan', icon: UserCheck },
      { id: 'supplier_history', label: 'Riwayat Supplier', icon: Truck },
      { id: 'real_stock_check', label: 'Pengecekan Stok', icon: ClipboardCheck },
      { id: 'sold_items', label: 'Barang Terjual', icon: ShoppingBag },
    ];

    // Sembunyikan halaman Kasir (POS) untuk Superadmin dan Gudang (Admin sekarang bisa akses)
    if (userRole === UserRole.SUPERADMIN || userRole === UserRole.WAREHOUSE) {
      items = items.filter(item => item.id !== 'pos');
    }

    // Role GUDANG hanya bisa akses Produk dan Stock Check
    if (userRole === UserRole.WAREHOUSE) {
      items = items.filter(item => item.id === 'products' || item.id === 'real_stock_check');
    }

    if (userRole === UserRole.OWNER || userRole === UserRole.SUPERADMIN || userRole === UserRole.ADMIN) {
      items.push({ id: 'transfer_history', label: 'Riwayat Transfer', icon: ArrowRightLeft });
      items.push({ id: 'return_history', label: 'Riwayat Retur', icon: Undo2 });
      items.push({ id: 'barcode', label: 'Cetak Barcode', icon: Barcode });

      // Settings hanya untuk Owner dan Superadmin
      if (userRole !== UserRole.ADMIN) {
        items.push({ id: 'settings', label: 'Pengaturan', icon: Settings });
      }
    }

    items.push({ id: 'about', label: 'Tentang Aplikasi', icon: Info });

    return items;
  }, [userRole]);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-primary text-white flex flex-col shadow-xl transition-all duration-300 ease-in-out md:static md:translate-x-0 
        ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
        ${isSidebarOpen ? 'md:w-64' : 'md:w-24'}
        `}
        style={{ contain: 'layout style paint' }}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between h-[72px]">
          {(isSidebarOpen || mobileMenuOpen) && (
            <h1 className="text-2xl font-bold text-white tracking-tighter whitespace-nowrap transition-opacity duration-150">
              Cemilan_
            </h1>
          )}

          {/* Desktop Toggle */}
          <button
            onClick={toggleSidebar}
            className={`hidden md:block text-white/80 hover:text-white bg-white/10 rounded p-2 border border-white/10 shadow-sm transition-all duration-150 hover:bg-white/20 active:scale-95 ${!isSidebarOpen ? 'mx-auto' : ''
              }`}
            aria-label={isSidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          >
            <Menu size={18} />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-white/80 hover:text-white bg-white/10 rounded p-2 border border-white/10 shadow-sm transition-all duration-150 hover:bg-white/20 active:scale-95 ml-auto"
            aria-label="Tutup menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 pt-2 space-y-2 overflow-y-auto overflow-x-hidden sidebar-scroll">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={activePage === item.id}
              isSidebarOpen={isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth < 768)} // Always show labels on mobile
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-150 active:scale-95"
            title={!isSidebarOpen ? 'Keluar' : ''}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {(isSidebarOpen || mobileMenuOpen) && <span className="whitespace-nowrap transition-opacity duration-150">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-100 flex flex-col relative w-full">
        {/* Mobile Header */}
        <div className="md:hidden bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-slate-800 text-lg">CemilanKasirPOS</span>
          </div>
          {/* Optional: Add user avatar or other mobile actions here */}
        </div>

        <div className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};