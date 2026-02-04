import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, AreaChart, Area } from 'recharts';
import { Brain, TrendingUp, AlertCircle, Wallet, RefreshCw, Calendar, Package, User as UserIcon, LayoutDashboard, Printer } from 'lucide-react';
import { StorageService } from '../services/storage';
import { getBusinessInsights } from '../services/geminiService';
import { formatIDR } from '../utils';
import { generatePrintDashboard } from '../utils/printHelpers';
import { Transaction, Product, CartItem, User, TransactionType } from '../types';
import { useData } from '../hooks/useData';

export const Dashboard: React.FC = () => {
  const transactions = useData(() => StorageService.getTransactions(), [], 'transactions') || [];
  const products = useData(() => StorageService.getProducts(), [], 'products') || [];
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('pos_current_user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // Sync selectedWeekStart when Month/Year changes in Weekly view
  useEffect(() => {
    if (timeFilter === 'weekly') {
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

      const validStarts: number[] = [];
      const firstDayDay = firstDay.getDay() || 7;
      const iterDate = new Date(firstDay);
      iterDate.setDate(firstDay.getDate() - (firstDayDay - 1));
      iterDate.setHours(0, 0, 0, 0);

      while (iterDate <= lastDay) {
        validStarts.push(iterDate.getTime());
        iterDate.setDate(iterDate.getDate() + 7);
      }

      const currentMilli = new Date(selectedWeekStart).setHours(0, 0, 0, 0);
      const isValid = validStarts.some(t => Math.abs(t - currentMilli) < 1000 * 60 * 60 * 12); // Tolerance

      if (!isValid && validStarts.length > 0) {
        setSelectedWeekStart(new Date(validStarts[0]));
      }
    }
  }, [selectedMonth, selectedYear, timeFilter, selectedWeekStart]);

  // --- Data Processing ---


  const filteredTxs = useMemo(() => {
    let startTime = new Date().getTime();
    let endTime = new Date().getTime();

    if (timeFilter === 'daily') {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      startTime = start.getTime();

      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      endTime = end.getTime();
    } else if (timeFilter === 'weekly') {
      // Use selectedWeekStart
      startTime = selectedWeekStart.getTime();
      const end = new Date(selectedWeekStart);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      endTime = end.getTime();
    } else if (timeFilter === 'monthly') {
      const start = new Date(selectedYear, selectedMonth, 1);
      start.setHours(0, 0, 0, 0);
      startTime = start.getTime();

      const end = new Date(selectedYear, selectedMonth + 1, 0);
      end.setHours(23, 59, 59, 999);
      endTime = end.getTime();
    } else if (timeFilter === 'yearly') {
      const start = new Date(selectedYear, 0, 1);
      start.setHours(0, 0, 0, 0);
      startTime = start.getTime();

      const end = new Date(selectedYear, 11, 31, 23, 59, 59);
      endTime = end.getTime();
    }

    return transactions.filter(t => {
      const tTime = new Date(t.date).getTime();
      return tTime >= startTime && tTime <= endTime;
    });
  }, [transactions, timeFilter, selectedDate, selectedWeekStart, selectedMonth, selectedYear]);

  // Stats
  const totalRevenue = useMemo(() => filteredTxs.reduce((sum, t) => sum + t.totalAmount, 0), [filteredTxs]);
  const totalTransactions = useMemo(() => filteredTxs.length, [filteredTxs]);

  // Total Piutang: Calculate from beginning up to end of selected year
  const totalReceivables = useMemo(() => {
    const endOfSelectedYear = new Date(selectedYear, 11, 31, 23, 59, 59).getTime();
    return transactions
      .filter(t => {
        const txTime = new Date(t.date).getTime();
        return t.paymentStatus !== 'LUNAS' && txTime <= endOfSelectedYear;
      })
      .reduce((sum, t) => sum + (t.totalAmount - t.amountPaid), 0);
  }, [transactions, selectedYear]);

  const lowStockItems = useMemo(() => products.filter(p => p.stock < 10).length, [products]);
  const totalItemsSold = useMemo(() => {
    return filteredTxs.reduce((sum, t) => {
      const itemQty = t.items.reduce((itemSum, item) => itemSum + item.qty, 0);
      // Subtract quantity for RETURN transactions, add for normal SALE transactions
      return sum + (t.type === TransactionType.RETURN ? -itemQty : itemQty);
    }, 0);
  }, [filteredTxs]);

  // Chart Data: Revenue Trend (Daily/Weekly/Monthly/Yearly)
  const revenueTrendData = useMemo(() => {
    if (timeFilter === 'daily') {
      const data = Array.from({ length: 24 }, (_, i) => ({
        name: `${i}:00`,
        total: 0
      }));
      filteredTxs.forEach(t => {
        const hour = new Date(t.date).getHours();
        data[hour].total += t.totalAmount;
      });
      return data;
    } else if (timeFilter === 'weekly') {
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const data = days.map(d => ({ name: d, total: 0 }));

      filteredTxs.forEach(t => {
        const dayIndex = new Date(t.date).getDay();
        data[dayIndex].total += t.totalAmount;
      });

      const sunday = data.shift();
      if (sunday) data.push(sunday);

      return data;
    } else if (timeFilter === 'monthly') {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

      const data = Array.from({ length: daysInMonth }, (_, i) => ({
        name: (i + 1).toString(),
        total: 0
      }));

      filteredTxs.forEach(t => {
        const date = new Date(t.date).getDate();
        if (date <= daysInMonth) {
          data[date - 1].total += t.totalAmount;
        }
      });
      return data;
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const data = months.map(m => ({ name: m, total: 0 }));

      filteredTxs.forEach(t => {
        const month = new Date(t.date).getMonth();
        data[month].total += t.totalAmount;
      });

      return data;
    }
  }, [filteredTxs, timeFilter]);

  // Chart Data: Top Products
  const topProductsData = useMemo(() => {
    const itemMap = new Map<string, number>();
    filteredTxs.forEach(tx => {
      tx.items.forEach(item => {
        const current = itemMap.get(item.name) || 0;
        // Subtract for RETURN transactions
        const qty = tx.type === TransactionType.RETURN ? -item.qty : item.qty;
        itemMap.set(item.name, current + qty);
      });
    });

    return Array.from(itemMap.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredTxs]);

  // Chart Data: Category Performance
  const categoryPerformanceData = useMemo(() => {
    const catMap = new Map<string, number>();
    filteredTxs.forEach(tx => {
      tx.items.forEach(item => {
        const catName = item.categoryName || 'Lainnya';
        const current = catMap.get(catName) || 0;
        // Subtract for RETURN transactions
        const value = tx.type === TransactionType.RETURN ? -(item.finalPrice * item.qty) : (item.finalPrice * item.qty);
        catMap.set(catName, current + value);
      });
    });

    return Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTxs]);

  // Chart Data: Top Categories by Quantity
  const topCategoriesData = useMemo(() => {
    const catMap = new Map<string, number>();
    filteredTxs.forEach(tx => {
      tx.items.forEach(item => {
        const catName = item.categoryName || 'Lainnya';
        const current = catMap.get(catName) || 0;
        // Subtract for RETURN transactions
        const qty = tx.type === TransactionType.RETURN ? -item.qty : item.qty;
        catMap.set(catName, current + qty);
      });
    });

    return Array.from(catMap.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredTxs]);

  // Chart Data: Items Sold Trend (similar to revenue trend but for quantity)
  const itemsSoldTrendData = useMemo(() => {
    if (timeFilter === 'daily') {
      const data = Array.from({ length: 24 }, (_, i) => ({
        name: `${i}:00`,
        total: 0
      }));
      filteredTxs.forEach(t => {
        const hour = new Date(t.date).getHours();
        const itemCount = t.items.reduce((sum, item) => sum + item.qty, 0);
        // Subtract for RETURN transactions
        data[hour].total += (t.type === TransactionType.RETURN ? -itemCount : itemCount);
      });
      return data;
    } else if (timeFilter === 'weekly') {
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const data = days.map(d => ({ name: d, total: 0 }));

      filteredTxs.forEach(t => {
        const dayIndex = new Date(t.date).getDay();
        const itemCount = t.items.reduce((sum, item) => sum + item.qty, 0);
        // Subtract for RETURN transactions
        data[dayIndex].total += (t.type === TransactionType.RETURN ? -itemCount : itemCount);
      });

      const sunday = data.shift();
      if (sunday) data.push(sunday);

      return data;
    } else if (timeFilter === 'monthly') {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

      const data = Array.from({ length: daysInMonth }, (_, i) => ({
        name: (i + 1).toString(),
        total: 0
      }));

      filteredTxs.forEach(t => {
        const date = new Date(t.date).getDate();
        const itemCount = t.items.reduce((sum, item) => sum + item.qty, 0);
        if (date <= daysInMonth) {
          // Subtract for RETURN transactions
          data[date - 1].total += (t.type === TransactionType.RETURN ? -itemCount : itemCount);
        }
      });
      return data;
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const data = months.map(m => ({ name: m, total: 0 }));

      filteredTxs.forEach(t => {
        const month = new Date(t.date).getMonth();
        const itemCount = t.items.reduce((sum, item) => sum + item.qty, 0);
        // Subtract for RETURN transactions
        data[month].total += (t.type === TransactionType.RETURN ? -itemCount : itemCount);
      });

      return data;
    }
  }, [filteredTxs, timeFilter]);

  // Get monthly revenue for yearly view
  const monthlyRevenueData = useMemo(() => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return months.map((month, index) => {
      const monthTotal = filteredTxs
        .filter(t => new Date(t.date).getMonth() === index)
        .reduce((sum, t) => sum + t.totalAmount, 0);
      return { month, total: monthTotal };
    });
  }, [filteredTxs]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

  const handleGenerateInsight = async () => {
    setLoadingAI(true);
    const result = await getBusinessInsights(filteredTxs, products);
    setAiInsight(result);
    setLoadingAI(false);
  };


  const timeLabel = timeFilter === 'daily' ? 'Hari Ini' : (timeFilter === 'weekly' ? 'Minggu Ini' : (timeFilter === 'monthly' ? 'Bulan Ini' : 'Tahun Ini'));

  const handlePrint = async () => {
    const storeSettings = await StorageService.getStoreSettings();
    if (!storeSettings) return;

    // Generate specific period details string
    let periodDetails = '';
    if (timeFilter === 'daily') {
      periodDetails = selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } else if (timeFilter === 'weekly') {
      const end = new Date(selectedWeekStart);
      end.setDate(end.getDate() + 6);
      periodDetails = `${selectedWeekStart.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (timeFilter === 'monthly') {
      periodDetails = new Date(selectedYear, selectedMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    } else {
      periodDetails = `Tahun ${selectedYear}`;
    }

    const dashboardData = {
      totalRevenue,
      totalTransactions,
      totalReceivables,
      totalItemsSold,
      lowStockItems,
      revenueTrend: revenueTrendData,
      itemsSoldTrend: itemsSoldTrendData,
      topProducts: topProductsData,
      topCategories: topCategoriesData,
      categoryPerformance: categoryPerformanceData,
      monthlyRevenue: timeFilter === 'yearly' ? monthlyRevenueData : undefined,
      timeLabel,
      periodDetails
    };

    const themeHue = localStorage.getItem('theme_hue') || '348';
    const themeSaturation = localStorage.getItem('theme_saturation') || '90%';
    const themeLightness = '56%'; // Standard lightness

    const printHtml = generatePrintDashboard(
      dashboardData,
      storeSettings,
      formatIDR,
      { h: themeHue, s: themeSaturation, l: themeLightness }
    );

    // Create iframe to print
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(printHtml);
      doc.close();
    }

    // The printHelpers script handles the printing and closing, 
    // but since we are using an iframe approach here (cleaner for SPA), 
    // we might need to adjust or rely on the script inside `generatePrintDashboard` which does window.print()
    // However, the `generatePrintDashboard` returns a full HTML string with <script>window.print()</script>.
    // Writing it to an iframe works well.
    // Note: The helper's script attempts to close the window. Inside an iframe `window.close()` does nothing, which is fine.
    // We should remove the iframe after printing, but since we don't know when it finishes, we can leave it or set a timeout.
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 5000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="text-primary" />
            Dashboard
          </h2>
          <p className="text-slate-500 mt-1">Ringkasan performa bisnis Anda.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="bg-slate-100 p-1 rounded-lg flex gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <button
              onClick={() => setTimeFilter('daily')}
              className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === 'daily' ? 'bg-primary shadow text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setTimeFilter('weekly')}
              className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === 'weekly' ? 'bg-primary shadow text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Minggu Ini
            </button>
            <button
              onClick={() => setTimeFilter('monthly')}
              className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === 'monthly' ? 'bg-primary shadow text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setTimeFilter('yearly')}
              className={`whitespace-nowrap px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === 'yearly' ? 'bg-primary shadow text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Tahun Ini
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors shadow-sm ml-2"
            title="Cetak Laporan Dashboard"
          >
            <Printer size={18} />
            <span className="hidden sm:inline text-sm font-medium">Print</span>
          </button>
          <div className="flex items-center gap-2">
            {/* Year selector removed from here */}
          </div>
          {currentUser && (
            <div className="flex items-center gap-3 ml-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <div className="relative group">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm flex-shrink-0">
                  {currentUser.image ? (
                    <img src={currentUser.image} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary text-white">
                      <UserIcon size={20} />
                    </div>
                  )}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {currentUser.name}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary"></div>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-slate-500">Logged in as</p>
                <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{timeLabel}</span>
          </div>
          <p className="text-sm text-slate-500">Omzet</p>
          <h3 className="text-xl font-bold text-slate-800">{formatIDR(totalRevenue)}</h3>
          <p className="text-xs text-slate-400 mt-1">{totalTransactions} Transaksi</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Global</span>
          </div>
          <p className="text-sm text-slate-500">Total Piutang</p>
          <h3 className="text-xl font-bold text-slate-800">{formatIDR(totalReceivables)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <Package size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{timeLabel}</span>
          </div>
          <p className="text-sm text-slate-500">Item Terjual</p>
          <h3 className="text-xl font-bold text-slate-800">{totalItemsSold} <span className="text-sm font-normal text-slate-400">Item</span></h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-500">Stok Menipis</p>
          <h3 className="text-xl font-bold text-slate-800">{lowStockItems} <span className="text-sm font-normal text-slate-400">Item</span></h3>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h3 className="font-bold text-lg text-slate-800">Tren Pendapatan ({timeLabel})</h3>

          <div className="flex flex-wrap items-center gap-2">
            {timeFilter === 'daily' && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                <label htmlFor="dateFilter" className="text-sm font-medium text-slate-500">Tanggal:</label>
                <div className="relative flex items-center">
                  <span className="text-sm font-medium text-slate-700 pr-6">
                    {selectedDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('/')}
                  </span>
                  <input
                    id="dateFilter"
                    name="dateFilter"
                    type="date"
                    aria-label="Filter Tanggal"
                    value={selectedDate.toLocaleDateString('en-CA')}
                    onChange={(e) => {
                      const parts = e.target.value.split('-');
                      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                      if (!isNaN(date.getTime())) setSelectedDate(date);
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <Calendar size={16} className="absolute right-0 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {timeFilter === 'weekly' && (
              <div className="flex flex-wrap item-center gap-2">
                <label htmlFor="weekSelect" className="sr-only">Pilih Minggu</label>
                <select
                  id="weekSelect"
                  name="weekSelect"
                  aria-label="Pilih Minggu"
                  value={selectedWeekStart.toISOString()}
                  onChange={(e) => setSelectedWeekStart(new Date(e.target.value))}
                  className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {/* Generate weeks for current selected month/year or just ranges */}
                  {(() => {
                    const weeks = [];
                    // Generate weeks for the selected Year/Month to offer context
                    // Or just +/- 4 weeks from current? 
                    // Let's list weeks of the selected Month
                    const firstDay = new Date(selectedYear, selectedMonth, 1);
                    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

                    // Adjust to Start of Week (Monday) of the week containing the 1st
                    const firstDayDay = firstDay.getDay() || 7;
                    let iterDate = new Date(firstDay);
                    iterDate.setDate(firstDay.getDate() - (firstDayDay - 1));

                    let weekNum = 1;
                    // Show weeks until we pass the end of month
                    while (iterDate <= lastDay) {
                      const wStart = new Date(iterDate);
                      const wEnd = new Date(iterDate);
                      wEnd.setDate(wEnd.getDate() + 6);

                      const label = `Minggu ke-${weekNum} (${wStart.getDate()} ${wStart.toLocaleDateString('id-ID', { month: 'short' })} - ${wEnd.getDate()} ${wEnd.toLocaleDateString('id-ID', { month: 'short' })})`;
                      weeks.push(
                        <option key={wStart.toISOString()} value={wStart.toISOString()}>{label}</option>
                      );

                      iterDate.setDate(iterDate.getDate() + 7);
                      weekNum++;
                    }
                    return weeks;
                  })()}
                </select>
                <label htmlFor="monthSelectWeekly" className="sr-only">Pilih Bulan</label>
                <select
                  id="monthSelectWeekly"
                  name="monthSelectWeekly"
                  aria-label="Pilih Bulan"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
                <label htmlFor="yearSelectWeekly" className="sr-only">Pilih Tahun</label>
                <select
                  id="yearSelectWeekly"
                  name="yearSelectWeekly"
                  aria-label="Pilih Tahun"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {timeFilter === 'monthly' && (
              <div className="flex items-center gap-2">
                <label htmlFor="monthSelectMonthly" className="text-sm font-medium text-slate-500">Bulan:</label>
                <select
                  id="monthSelectMonthly"
                  name="monthSelectMonthly"
                  aria-label="Bulan"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
                <label htmlFor="yearSelectMonthly" className="sr-only">Pilih Tahun</label>
                <select
                  id="yearSelectMonthly"
                  name="yearSelectMonthly"
                  aria-label="Pilih Tahun"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {timeFilter === 'yearly' && (
              <div className="flex items-center gap-2">
                <label htmlFor="yearSelectYearly" className="text-sm font-medium text-slate-500">Tahun:</label>
                <select
                  id="yearSelectYearly"
                  name="yearSelectYearly"
                  aria-label="Tahun"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip
                formatter={(value: number) => [formatIDR(value), 'Pendapatan']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Items Sold Trend Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[350px] flex flex-col">
        <h3 className="font-bold text-lg text-slate-800 mb-2">Total Item Terjual ({timeLabel})</h3>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={itemsSoldTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <Tooltip
                formatter={(value: number) => [value, 'Item Terjual']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorItems)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Revenue Boxes for Yearly View */}
      {
        timeFilter === 'yearly' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Omzet per Bulan - Tahun {selectedYear}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {monthlyRevenueData.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100 hover:shadow-md transition-shadow"
                >
                  <p className="text-xs font-medium text-slate-600 mb-1">{item.month}</p>
                  <p className="text-lg font-bold text-primary">{formatIDR(item.total)}</p>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {/* AI Insights Section */}
      {
        aiInsight && (
          <div className="bg-white border border-indigo-100 p-6 rounded-2xl shadow-sm animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-full">
                <Brain size={20} className="text-indigo-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Analisis Cerdas Gemini</h3>
            </div>
            <div className="prose prose-slate max-w-none whitespace-pre-line text-slate-600 bg-slate-50 p-4 rounded-xl">
              {aiInsight}
            </div>
          </div>
        )
      }

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart: Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-6">5 Produk Terlaris ({timeLabel})</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="qty" fill="#ee712e" radius={[0, 4, 4, 0]} barSize={30} name="Terjual" isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Top Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-6">5 Kategori Terlaris ({timeLabel})</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategoriesData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#475569', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="qty" fill="#10b981" radius={[0, 4, 4, 0]} barSize={30} name="Terjual" isAnimationActive={true} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Categories Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Pendapatan per Kategori ({timeLabel})</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPerformanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {categoryPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatIDR(value)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div >
  );
};