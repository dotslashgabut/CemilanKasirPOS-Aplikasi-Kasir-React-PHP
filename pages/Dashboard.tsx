import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, AreaChart, Area } from 'recharts';
import { Brain, TrendingUp, AlertCircle, Wallet, RefreshCw, Calendar, Package, User as UserIcon } from 'lucide-react';
import { StorageService } from '../services/storage';
import { getBusinessInsights } from '../services/geminiService';
import { formatIDR } from '../utils';
import { Transaction, Product, CartItem, User } from '../types';
import { useData } from '../hooks/useData';

export const Dashboard: React.FC = () => {
  const transactions = useData(() => StorageService.getTransactions(), [], 'transactions') || [];
  const products = useData(() => StorageService.getProducts(), [], 'products') || [];
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('pos_current_user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // --- Data Processing ---

  const getDateRange = useMemo(() => {
    return () => {
      const now = new Date();
      let start = new Date();
      start.setHours(0, 0, 0, 0);

      if (timeFilter === 'weekly') {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        start.setDate(diff);
      } else if (timeFilter === 'monthly') {
        start.setDate(1);
      } else if (timeFilter === 'yearly') {
        start = new Date(selectedYear, 0, 1); // January 1st of selected year
        start.setHours(0, 0, 0, 0);
      }

      // For filtering, compare ISO strings YYYY-MM-DD
      const startTime = start.getTime();
      return startTime;
    };
  }, [timeFilter, selectedYear]);

  const filteredTxs = useMemo(() => {
    const startTime = getDateRange();
    let endTime = new Date().getTime() + (24 * 60 * 60 * 1000); // End of today

    if (timeFilter === 'yearly') {
      // End of selected year (December 31st, 23:59:59)
      endTime = new Date(selectedYear, 11, 31, 23, 59, 59).getTime();
    }

    return transactions.filter(t => {
      const tTime = new Date(t.date).getTime();
      return tTime >= startTime && tTime <= endTime;
    });
  }, [transactions, timeFilter, selectedYear, getDateRange]);

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
      return sum + t.items.reduce((itemSum, item) => itemSum + item.qty, 0);
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
        itemMap.set(item.name, current + item.qty);
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
        catMap.set(catName, current + (item.finalPrice * item.qty));
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
        catMap.set(catName, current + item.qty);
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
        data[hour].total += itemCount;
      });
      return data;
    } else if (timeFilter === 'weekly') {
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const data = days.map(d => ({ name: d, total: 0 }));

      filteredTxs.forEach(t => {
        const dayIndex = new Date(t.date).getDay();
        const itemCount = t.items.reduce((sum, item) => sum + item.qty, 0);
        data[dayIndex].total += itemCount;
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
          data[date - 1].total += itemCount;
        }
      });
      return data;
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const data = months.map(m => ({ name: m, total: 0 }));

      filteredTxs.forEach(t => {
        const month = new Date(t.date).getMonth();
        const itemCount = t.items.reduce((sum, item) => sum + item.qty, 0);
        data[month].total += itemCount;
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleGenerateInsight = async () => {
    setLoadingAI(true);
    const result = await getBusinessInsights(filteredTxs, products);
    setAiInsight(result);
    setLoadingAI(false);
  };

  const timeLabel = timeFilter === 'daily' ? 'Hari Ini' : (timeFilter === 'weekly' ? 'Minggu Ini' : (timeFilter === 'monthly' ? 'Bulan Ini' : 'Tahun Ini'));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500">Ringkasan performa bisnis Anda.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
            <button
              onClick={() => setTimeFilter('daily')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === 'daily' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setTimeFilter('weekly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === 'weekly' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Minggu Ini
            </button>
            <button
              onClick={() => setTimeFilter('monthly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === 'monthly' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setTimeFilter('yearly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeFilter === 'yearly' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Tahun Ini
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className={`text-sm font-medium ${timeFilter === 'yearly' ? 'text-slate-600' : 'text-slate-400'}`}>Tahun:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              disabled={timeFilter !== 'yearly'}
              className={`px-4 py-2 text-sm font-medium border rounded-lg focus:outline-none shadow-sm transition-colors ${timeFilter === 'yearly'
                ? 'border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 cursor-pointer'
                : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {currentUser && (
            <div className="flex items-center gap-3 ml-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <div className="relative group">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm flex-shrink-0">
                  {currentUser.image ? (
                    <img src={currentUser.image} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      <UserIcon size={20} />
                    </div>
                  )}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {currentUser.name}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{timeLabel}</span>
          </div>
          <p className="text-sm text-slate-500">Omzet</p>
          <h3 className="text-2xl font-bold text-slate-800">{formatIDR(totalRevenue)}</h3>
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
          <h3 className="text-2xl font-bold text-slate-800">{formatIDR(totalReceivables)}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <Package size={24} />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{timeLabel}</span>
          </div>
          <p className="text-sm text-slate-500">Item Terjual</p>
          <h3 className="text-2xl font-bold text-slate-800">{totalItemsSold} <span className="text-sm font-normal text-slate-400">Item</span></h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <AlertCircle size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-500">Stok Menipis</p>
          <h3 className="text-2xl font-bold text-slate-800">{lowStockItems} <span className="text-sm font-normal text-slate-400">Item</span></h3>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Brain size={20} className="text-yellow-300" />
              <span className="font-semibold text-yellow-300">AI Assistant</span>
            </div>
            <p className="text-sm text-indigo-100 mb-4">Dapatkan analisa bisnis {timeLabel.toLowerCase()}.</p>
            <button
              onClick={handleGenerateInsight}
              disabled={loadingAI}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              {loadingAI ? <RefreshCw className="animate-spin" size={16} /> : 'Analisa Sekarang'}
            </button>
          </div>
          <Brain size={120} className="absolute -bottom-4 -right-4 text-white/10" />
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[350px]">
        <h3 className="font-bold text-lg text-slate-800 mb-2">Tren Pendapatan ({timeLabel})</h3>
        <div className="h-full w-full pb-6">
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
              <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Items Sold Trend Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[350px]">
        <h3 className="font-bold text-lg text-slate-800 mb-2">Total Item Terjual ({timeLabel})</h3>
        <div className="h-full w-full pb-6">
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
              <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorItems)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Revenue Boxes for Yearly View */}
      {timeFilter === 'yearly' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Omzet per Bulan - Tahun {selectedYear}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {monthlyRevenueData.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 hover:shadow-md transition-shadow"
              >
                <p className="text-xs font-medium text-slate-600 mb-1">{item.month}</p>
                <p className="text-lg font-bold text-blue-600">{formatIDR(item.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights Section */}
      {aiInsight && (
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart: Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="font-bold text-lg text-slate-800 mb-6">5 Produk Terlaris ({timeLabel})</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="qty" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} name="Terjual" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart: Top Categories */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="font-bold text-lg text-slate-800 mb-6">5 Kategori Terlaris ({timeLabel})</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={topCategoriesData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="qty" fill="#10b981" radius={[0, 4, 4, 0]} barSize={30} name="Terjual" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart: Categories Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Pendapatan per Kategori ({timeLabel})</h3>
          <ResponsiveContainer width="100%" height="85%">
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
  );
};