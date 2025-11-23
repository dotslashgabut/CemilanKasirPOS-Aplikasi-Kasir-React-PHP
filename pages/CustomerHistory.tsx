import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../hooks/useData';
import { StorageService } from '../services/storage';
import { Transaction, PaymentStatus, Customer, UserRole, User, PaymentMethod, StoreSettings } from '../types';
import { formatIDR, formatDate, exportToCSV } from '../utils';
import { generatePrintTransactionDetail } from '../utils/printHelpers';
import { Download, Search, Filter, RotateCcw, X, ArrowUpDown, ArrowUp, ArrowDown, Eye, FileText, Printer } from 'lucide-react';

interface CustomerHistoryProps {
    currentUser: User | null;
}

export const CustomerHistory: React.FC<CustomerHistoryProps> = ({ currentUser }) => {
    const transactions = useData(() => StorageService.getTransactions()) || [];
    const customers = useData(() => StorageService.getCustomers()) || [];

    // State
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
    const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);
    const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

    // Load store settings
    useEffect(() => {
        StorageService.getStoreSettings().then(setStoreSettings);
    }, []);

    // Helper for Jakarta Date
    const getJakartaDateStr = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    };

    // Get selected customer
    const selectedCustomer = useMemo(() => {
        return customers.find(c => c.id === selectedCustomerId) || null;
    }, [customers, selectedCustomerId]);

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        let items = transactions;

        // Filter by customer
        if (selectedCustomerId) {
            items = items.filter(t => t.customerId === selectedCustomerId);
        }

        // Date Filter
        if (startDate || endDate) {
            items = items.filter(item => {
                const itemDateStr = getJakartaDateStr(item.date);
                if (startDate && itemDateStr < startDate) return false;
                if (endDate && itemDateStr > endDate) return false;
                return true;
            });
        }

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            items = items.filter(t =>
                t.id.toLowerCase().includes(query) ||
                t.customerName.toLowerCase().includes(query) ||
                t.cashierName.toLowerCase().includes(query)
            );
        }

        // Cashier Filter
        if (currentUser && currentUser.role === UserRole.CASHIER) {
            items = items.filter(t => t.cashierId === currentUser.id);
        }

        // Sort
        items.sort((a, b) => {
            let aVal = a[sortConfig.key as keyof Transaction];
            let bVal = b[sortConfig.key as keyof Transaction];

            if (sortConfig.key === 'date') {
                aVal = new Date(a.date).getTime() as any;
                bVal = new Date(b.date).getTime() as any;
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return items;
    }, [transactions, selectedCustomerId, startDate, endDate, searchQuery, sortConfig, currentUser]);

    // Calculate totals
    const totals = useMemo(() => {
        const totalSales = filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalPaid = filteredTransactions.reduce((sum, t) => sum + t.amountPaid, 0);
        const totalDebt = filteredTransactions
            .filter(t => t.paymentStatus !== PaymentStatus.PAID)
            .reduce((sum, t) => sum + (t.totalAmount - t.amountPaid), 0);

        return { totalSales, totalPaid, totalDebt };
    }, [filteredTransactions]);

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig.key !== column) return <ArrowUpDown size={14} className="ml-1 text-slate-400" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="ml-1 text-blue-600" />
            : <ArrowDown size={14} className="ml-1 text-blue-600" />;
    };

    const handleExport = () => {
        const headers = ['ID Transaksi', 'Tanggal', 'Pelanggan', 'Total', 'Dibayar', 'Sisa', 'Status', 'Metode', 'Kasir'];
        const rows = filteredTransactions.map(t => [
            t.id,
            formatDate(t.date),
            t.customerName,
            t.totalAmount,
            t.amountPaid,
            t.totalAmount - t.amountPaid,
            t.paymentStatus,
            t.paymentMethod,
            t.cashierName
        ]);
        exportToCSV(`riwayat-pelanggan-${selectedCustomer?.name || 'all'}.csv`, headers, rows);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const rows = filteredTransactions.map((t, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${formatDate(t.date)}</td>
                <td>${t.id.substring(0, 8)}</td>
                <td>${t.customerName}</td>
                <td style="text-align:right">${formatIDR(t.totalAmount)}</td>
                <td style="text-align:right">${formatIDR(t.amountPaid)}</td>
                <td style="text-align:right">${formatIDR(t.totalAmount - t.amountPaid)}</td>
                <td>${t.paymentStatus}</td>
                <td>${t.cashierName}</td>
            </tr>
        `).join('');

        const html = `
            <html>
                <head>
                    <title>Riwayat Pelanggan</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
                        h2 { text-align: center; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .summary { margin-bottom: 20px; padding: 10px; background: #f9f9f9; border: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    <h2>Riwayat Transaksi Pelanggan</h2>
                    <div class="summary">
                        <p><strong>Pelanggan:</strong> ${selectedCustomer?.name || 'Semua Pelanggan'}</p>
                        <p><strong>Periode:</strong> ${startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Semua'} - ${endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Semua'}</p>
                        <p><strong>Total Penjualan:</strong> ${formatIDR(totals.totalSales)}</p>
                        <p><strong>Total Dibayar:</strong> ${formatIDR(totals.totalPaid)}</p>
                        <p><strong>Total Piutang:</strong> ${formatIDR(totals.totalDebt)}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tanggal</th>
                                <th>ID</th>
                                <th>Pelanggan</th>
                                <th>Total</th>
                                <th>Dibayar</th>
                                <th>Sisa</th>
                                <th>Status</th>
                                <th>Kasir</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                    <script>window.print();</script>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const printTransactionDetail = (tx: Transaction) => {
        const settings = storeSettings || { name: 'Cemilan KasirPOS' } as StoreSettings;
        const w = window.open('', '', 'width=800,height=600');
        if (!w) return;

        const html = generatePrintTransactionDetail(tx, settings, formatIDR, formatDate);
        w.document.write(html);
        w.document.close();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-800">Riwayat Pelanggan</h1>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="text-sm flex items-center gap-2 bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                            <Printer size={16} /> Print
                        </button>
                        <button onClick={handleExport} className="text-sm flex items-center gap-2 bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {selectedCustomerId && (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-xs text-blue-600 mb-1">Total Penjualan</p>
                            <p className="text-lg font-bold text-blue-700">{formatIDR(totals.totalSales)}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="text-xs text-green-600 mb-1">Total Dibayar</p>
                            <p className="text-lg font-bold text-green-700">{formatIDR(totals.totalPaid)}</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-xs text-red-600 mb-1">Total Piutang</p>
                            <p className="text-lg font-bold text-red-700">{formatIDR(totals.totalDebt)}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Customer Selector */}
                    <select
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm min-w-[200px]"
                        value={selectedCustomerId}
                        onChange={e => setSelectedCustomerId(e.target.value)}
                    >
                        <option value="">-- Semua Pelanggan --</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {/* Date Filters */}
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 w-fit">
                        <Filter size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">Filter Tanggal:</span>
                        <input
                            type="date"
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-sm text-slate-700"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                        <span className="text-slate-400">-</span>
                        <input
                            type="date"
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-sm text-slate-700"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="p-1 text-slate-400 hover:text-slate-600 bg-slate-200 rounded ml-2"
                            title="Reset Filter"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Cari ID transaksi, pelanggan, kasir..."
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm text-slate-700"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1"
                                title="Hapus pencarian"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700">
                    Daftar Transaksi ({filteredTransactions.length})
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('date')}>
                                    <div className="flex items-center">Tanggal <SortIcon column="date" /></div>
                                </th>
                                <th className="p-4 font-medium">ID Transaksi</th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('customerName')}>
                                    <div className="flex items-center">Pelanggan <SortIcon column="customerName" /></div>
                                </th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('totalAmount')}>
                                    <div className="flex items-center">Total <SortIcon column="totalAmount" /></div>
                                </th>
                                <th className="p-4 font-medium">Dibayar</th>
                                <th className="p-4 font-medium">Sisa/Piutang</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Metode</th>
                                <th className="p-4 font-medium">Kasir</th>
                                <th className="p-4 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-slate-400">Tidak ada transaksi.</td>
                                </tr>
                            )}
                            {filteredTransactions.map(t => (
                                <tr key={t.id} onClick={() => setDetailTransaction(t)} className="hover:bg-slate-50 cursor-pointer group">
                                    <td className="p-4 text-slate-600">
                                        <div className="flex flex-col">
                                            <span>{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            <span className="text-xs text-slate-400">{new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-slate-400">#{t.id.substring(0, 6)}</td>
                                    <td className="p-4 font-medium text-slate-800">{t.customerName}</td>
                                    <td className="p-4 font-semibold text-slate-700">{formatIDR(t.totalAmount)}</td>
                                    <td className="p-4 text-green-600">{formatIDR(t.amountPaid)}</td>
                                    <td className="p-4 text-red-600 font-medium">{formatIDR(t.totalAmount - t.amountPaid)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${t.paymentStatus === PaymentStatus.PAID
                                            ? 'bg-green-100 text-green-600'
                                            : t.paymentStatus === PaymentStatus.PARTIAL
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'bg-red-100 text-red-600'
                                            }`}>
                                            {t.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600">{t.paymentMethod}</td>
                                    <td className="p-4 text-slate-600">{t.cashierName}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); setDetailTransaction(t); }} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 flex items-center gap-1" title="Detail">
                                                <Eye size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {detailTransaction && createPortal(
                <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Detail Transaksi #{detailTransaction.id.substring(0, 8)}</h3>
                            <button onClick={() => setDetailTransaction(null)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                <div>
                                    <span className="text-slate-500 block text-xs">Waktu Transaksi</span>
                                    <span className="font-medium text-slate-900">
                                        {formatDate(detailTransaction.date)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Pelanggan</span>
                                    <span className="font-medium text-slate-900">{detailTransaction.customerName}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Kasir</span>
                                    <span className="font-medium text-slate-900">{detailTransaction.cashierName}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Metode Awal</span>
                                    <span className="font-medium text-slate-900">{detailTransaction.paymentMethod}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Status</span>
                                    <span className={`font-bold ${detailTransaction.paymentStatus === 'LUNAS' ? 'text-green-600' : detailTransaction.paymentStatus === 'SEBAGIAN' ? 'text-orange-600' : 'text-red-600'}`}>{detailTransaction.paymentStatus}</span>
                                </div>
                            </div>

                            <h4 className="font-bold text-sm text-slate-800 mb-2">Barang</h4>
                            <div className="border border-slate-200 rounded-lg mb-6 divide-y divide-slate-100">
                                {detailTransaction.items.map((item, idx) => (
                                    <div key={idx} className="p-3 flex justify-between">
                                        <div>
                                            <span className="block font-medium text-slate-700">{item.name}</span>
                                            <span className="text-xs text-slate-500">{item.qty} x {formatIDR(item.finalPrice)}</span>
                                        </div>
                                        <span className="font-medium text-slate-800">{formatIDR(item.finalPrice * item.qty)}</span>
                                    </div>
                                ))}
                                <div className="bg-slate-50 p-3 flex justify-between font-bold text-slate-900">
                                    <span>Total</span>
                                    <span>{formatIDR(detailTransaction.totalAmount)}</span>
                                </div>
                            </div>

                            {/* Payment History */}
                            <h4 className="font-bold text-sm text-slate-800 mb-2">Riwayat Pembayaran</h4>
                            <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
                                {detailTransaction.paymentHistory?.map((ph, i) => (
                                    <div key={i} className="flex justify-between border-b border-slate-200 last:border-0 pb-1">
                                        <div>
                                            <div className="flex gap-1 text-xs text-slate-500">
                                                <span>{new Date(ph.date).toLocaleDateString('id-ID')}</span>
                                                <span className="font-mono bg-slate-200 px-1 rounded text-[10px]">{new Date(ph.date).toLocaleTimeString('id-ID')}</span>
                                            </div>
                                            <span className="text-slate-700 block">{ph.note || 'Pembayaran'} ({ph.method})</span>
                                            {ph.bankName && <span className="text-[10px] text-blue-600 italic">via {ph.bankName}</span>}
                                        </div>
                                        <span className="font-medium text-green-600">{formatIDR(ph.amount)}</span>
                                    </div>
                                ))}
                                {!detailTransaction.paymentHistory && (
                                    <div className="flex justify-between">
                                        <span>Pembayaran Awal</span>
                                        <span>{formatIDR(detailTransaction.amountPaid)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 font-bold border-t border-slate-200">
                                    <span>Total Dibayar</span>
                                    <span>{formatIDR(detailTransaction.amountPaid)}</span>
                                </div>
                                <div className="flex justify-between text-red-600 font-bold">
                                    <span>Sisa Tagihan</span>
                                    <span>{formatIDR(detailTransaction.totalAmount - detailTransaction.amountPaid)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                            <button onClick={() => printTransactionDetail(detailTransaction)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
                                <Printer size={16} /> Cetak Detail
                            </button>
                            <button onClick={() => setDetailTransaction(null)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Tutup</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
