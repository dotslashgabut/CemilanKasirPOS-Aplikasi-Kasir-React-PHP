import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../hooks/useData';
import { StorageService } from '../services/storage';
import { Transaction, PaymentStatus, Customer, UserRole, User, PaymentMethod, StoreSettings, TransactionType } from '../types';
import { formatIDR, formatDate, exportToCSV } from '../utils';
import { generatePrintTransactionDetail } from '../utils/printHelpers';
import { Download, Search, Filter, RotateCcw, X, Eye, FileText, Printer, FileSpreadsheet, UserCheck, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

interface CustomerHistoryProps {
    currentUser: User | null;
}

export const CustomerHistory: React.FC<CustomerHistoryProps> = ({ currentUser }) => {
    const transactions = useData(() => StorageService.getTransactions(), [], 'transactions') || [];
    const customers = useData(() => StorageService.getCustomers(), [], 'customers') || [];
    const banks = useData(() => StorageService.getBanks(), [], 'banks') || [];

    // State
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);
    const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(20);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Reset pagination on filter change
    useEffect(() => {
        setVisibleCount(20);
    }, [selectedCustomerId, startDate, endDate, searchQuery]);

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
                (t.invoiceNumber && t.invoiceNumber.toLowerCase().includes(query)) ||
                t.customerName.toLowerCase().includes(query) ||
                t.cashierName.toLowerCase().includes(query)
            );
        }

        // Cashier Filter
        if (currentUser && currentUser.role === UserRole.CASHIER) {
            items = items.filter(t => t.cashierId === currentUser.id);
        }

        // Sort
        // Sort (Date Descending)
        items.sort((a, b) => {
            const aTime = new Date(a.date).getTime();
            const bTime = new Date(b.date).getTime();
            return bTime - aTime;
        });

        return items;
    }, [transactions, selectedCustomerId, startDate, endDate, searchQuery, currentUser]);

    const visibleTransactions = useMemo(() => filteredTransactions.slice(0, visibleCount), [filteredTransactions, visibleCount]);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount((prev) => prev + 20);
                }
            },
            { threshold: 0.5 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => {
            if (loadMoreRef.current) {
                observer.unobserve(loadMoreRef.current);
            }
        };
    }, [loadMoreRef.current, filteredTransactions]);

    // Calculate totals
    const totals = useMemo(() => {
        const totalSales = filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalPaid = filteredTransactions.reduce((sum, t) => sum + t.amountPaid, 0);
        const totalDebt = filteredTransactions
            .filter(t => t.paymentStatus !== PaymentStatus.PAID)
            .reduce((sum, t) => sum + (t.totalAmount - t.amountPaid), 0);

        return { totalSales, totalPaid, totalDebt };
    }, [filteredTransactions]);



    const handleExport = () => {
        const headers = ['ID Transaksi', 'No Faktur', 'Tanggal', 'Pelanggan', 'Total', 'Dibayar', 'Piutang', 'Kembalian', 'Status', 'Metode', 'Kasir'];
        const rows = filteredTransactions.map(t => {
            const remaining = t.totalAmount - t.amountPaid;
            const piutang = remaining > 0 ? remaining : 0;
            const kembalian = remaining < 0 ? Math.abs(remaining) : 0;
            return [
                t.id,
                t.invoiceNumber || '-',
                formatDate(t.date),
                t.customerName,
                t.totalAmount,
                t.amountPaid,
                piutang,
                kembalian,
                t.type === TransactionType.RETURN ? 'RETUR' : (t.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : t.paymentStatus) + (t.isReturned ? ' (Ada Retur)' : ''),
                t.paymentMethod,
                t.cashierName
            ];
        });
        exportToCSV(`riwayat-pelanggan-${selectedCustomer?.name || 'all'}.csv`, headers, rows);
    };

    const handleExportExcel = () => {
        const data = filteredTransactions.map(t => {
            const remaining = t.totalAmount - t.amountPaid;
            const piutang = remaining > 0 ? remaining : 0;
            const kembalian = remaining < 0 ? Math.abs(remaining) : 0;
            return {
                'ID Transaksi': t.id,
                'No Faktur': t.invoiceNumber || '-',
                'Tanggal': formatDate(t.date),
                'Pelanggan': t.customerName,
                'Total': t.totalAmount,
                'Dibayar': t.amountPaid,
                'Piutang': piutang,
                'Kembalian': kembalian,
                'Status': t.type === TransactionType.RETURN ? 'RETUR' : (t.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : t.paymentStatus) + (t.isReturned ? ' (Ada Retur)' : ''),
                'Metode': t.paymentMethod,
                'Kasir': t.cashierName
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Pelanggan");

        // Auto-width
        worksheet['!cols'] = [
            { wch: 15 }, // ID
            { wch: 20 }, // Faktur
            { wch: 15 }, // Tanggal
            { wch: 20 }, // Pelanggan
            { wch: 15 }, // Total
            { wch: 15 }, // Dibayar
            { wch: 15 }, // Piutang
            { wch: 15 }, // Kembalian
            { wch: 15 }, // Status
            { wch: 15 }, // Metode
            { wch: 15 }  // Kasir
        ];

        XLSX.writeFile(workbook, `Riwayat_Pelanggan_${selectedCustomer?.name || 'All'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const rows = filteredTransactions.map((t, idx) => {
            const remaining = t.totalAmount - t.amountPaid;
            const piutang = remaining > 0 ? remaining : 0;
            const kembalian = remaining < 0 ? Math.abs(remaining) : 0;
            return `
            <tr>
                <td>${idx + 1}</td>
                <td>${formatDate(t.date)}</td>
                <td>${t.id.substring(0, 8)}</td>
                <td>${t.invoiceNumber || '-'}</td>
                <td>${t.customerName}</td>
                <td style="text-align:right">${formatIDR(t.totalAmount)}</td>
                <td style="text-align:right">${formatIDR(t.amountPaid)}</td>
                <td style="text-align:right">${piutang > 0 ? formatIDR(piutang) : '-'}</td>
                <td style="text-align:right">${kembalian > 0 ? formatIDR(kembalian) : '-'}</td>
                <td>${t.type === TransactionType.RETURN ? 'RETUR' : (t.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : t.paymentStatus) + (t.isReturned ? ' (Ada Retur)' : '')}</td>
                <td>${t.cashierName}</td>
            </tr>
        `;
        }).join('');

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
                                <th>Faktur</th>
                                <th>Pelanggan</th>
                                <th>Total</th>
                                <th>Dibayar</th>
                                <th>Piutang</th>
                                <th>Kembalian</th>
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
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <UserCheck className="text-primary" />
                            Riwayat Pelanggan
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Lacak riwayat transaksi dan aktivitas pelanggan</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="text-sm flex items-center gap-2 bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                            <Printer size={16} /> Print
                        </button>
                        <button onClick={handleExportExcel} className="text-sm flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg text-green-700 hover:bg-green-100">
                            <FileSpreadsheet size={16} /> Excel
                        </button>
                        <button onClick={handleExport} className="text-sm flex items-center gap-2 bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                            <Download size={16} /> CSV
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {selectedCustomerId && (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                            <p className="text-xs text-primary mb-1">Total Penjualan</p>
                            <p className="text-lg font-bold text-primary">{formatIDR(totals.totalSales)}</p>
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
                    <label htmlFor="customerFilter" className="sr-only">Filter Pelanggan</label>
                    <select
                        id="customerFilter"
                        name="customerFilter"
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm min-w-[200px]"
                        value={selectedCustomerId}
                        onChange={e => setSelectedCustomerId(e.target.value)}
                    >
                        <option value="">-- Semua Pelanggan --</option>
                        {customers.sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {/* Date Filters */}
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 w-fit">
                        <Filter size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">Filter Tanggal:</span>
                        <div className="relative flex items-center bg-white border border-slate-300 rounded px-2 py-1">
                            <label htmlFor="startDate" className="sr-only">Tanggal Mulai</label>
                            <span className="text-sm text-slate-700 pr-6">
                                {startDate ? new Date(startDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'dd/mm/yyyy'}
                            </span>
                            <input
                                id="startDate"
                                name="startDate"
                                type="date"
                                className="absolute inset-0 opacity-0 w-full h-full"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                            <Calendar size={14} className="absolute right-2 text-slate-400 pointer-events-none" />
                        </div>
                        <span className="text-slate-400">-</span>
                        <div className="relative flex items-center bg-white border border-slate-300 rounded px-2 py-1">
                            <label htmlFor="endDate" className="sr-only">Tanggal Akhir</label>
                            <span className="text-sm text-slate-700 pr-6">
                                {endDate ? new Date(endDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'dd/mm/yyyy'}
                            </span>
                            <input
                                id="endDate"
                                name="endDate"
                                type="date"
                                className="absolute inset-0 opacity-0 w-full h-full"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                            <Calendar size={14} className="absolute right-2 text-slate-400 pointer-events-none" />
                        </div>
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
                        <label htmlFor="searchTransaction" className="sr-only">Cari Transaksi</label>
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            id="searchTransaction"
                            name="searchTransaction"
                            type="text"
                            placeholder="Cari ID transaksi, pelanggan, kasir..."
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-slate-700"
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
                                <th className="p-4 font-medium">Tanggal</th>
                                <th className="p-4 font-medium">ID Transaksi</th>
                                <th className="p-4 font-medium">Faktur</th>
                                <th className="p-4 font-medium">Pelanggan</th>
                                <th className="p-4 font-medium">Total</th>
                                <th className="p-4 font-medium">Dibayar</th>
                                <th className="p-4 font-medium">Piutang</th>
                                <th className="p-4 font-medium">Kembalian</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Metode</th>
                                <th className="p-4 font-medium">Kasir</th>
                                <th className="p-4 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={12} className="p-8 text-center text-slate-400">Tidak ada transaksi.</td>
                                </tr>
                            )}
                            {visibleTransactions.map(t => (
                                <tr key={t.id} onClick={() => setDetailTransaction(t)} className="hover:bg-slate-50 cursor-pointer group">
                                    <td className="p-4 text-slate-600">
                                        <div className="flex flex-col">
                                            <span>{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            <span className="text-xs text-slate-400">{new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-slate-400">#{t.id.substring(0, 6)}</td>
                                    <td className="p-4 font-mono text-sm text-slate-700">{t.invoiceNumber || '-'}</td>
                                    <td className="p-4 font-medium text-slate-800">{t.customerName}</td>
                                    <td className="p-4 font-semibold text-slate-700">{formatIDR(t.totalAmount)}</td>
                                    <td className="p-4 text-green-600">{formatIDR(t.amountPaid)}</td>
                                    <td className="p-4 text-red-600 font-medium">
                                        {(() => {
                                            const remaining = t.totalAmount - t.amountPaid;
                                            return remaining > 0 ? formatIDR(remaining) : '-';
                                        })()}
                                    </td>
                                    <td className="p-4 text-green-600 font-medium">
                                        {(() => {
                                            const remaining = t.totalAmount - t.amountPaid;
                                            return remaining < 0 ? formatIDR(Math.abs(remaining)) : '-';
                                        })()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === TransactionType.RETURN
                                            ? 'bg-purple-100 text-purple-600'
                                            : t.paymentStatus === PaymentStatus.PAID
                                                ? 'bg-green-100 text-green-600'
                                                : t.paymentStatus === PaymentStatus.PARTIAL
                                                    ? 'bg-orange-100 text-orange-600'
                                                    : 'bg-red-100 text-red-600'
                                            }`}>
                                            {t.type === TransactionType.RETURN
                                                ? 'RETUR'
                                                : (t.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : t.paymentStatus) + (t.isReturned ? ' (Ada Retur)' : '')}
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
                            {visibleTransactions.length < filteredTransactions.length && (
                                <tr>
                                    <td colSpan={12} className="p-4 text-center text-slate-400">
                                        <div ref={loadMoreRef}>Loading more...</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {detailTransaction && createPortal(
                <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">
                                Detail Transaksi {detailTransaction.invoiceNumber ? `(${detailTransaction.invoiceNumber})` : `#${detailTransaction.id.substring(0, 8)}`}
                            </h3>
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
                                    {(() => {
                                        if (detailTransaction.bankId) {
                                            const bank = banks.find(b => b.id === detailTransaction.bankId);
                                            if (bank) return <span className="block text-xs text-primary">via {bank.bankName} {bank.accountNumber}</span>;
                                        }
                                        if (detailTransaction.bankName) return <span className="block text-xs text-primary">via {detailTransaction.bankName}</span>;
                                        return null;
                                    })()}
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Status</span>
                                    <span className={`font-bold ${detailTransaction.type === TransactionType.RETURN ? 'text-purple-600' : detailTransaction.paymentStatus === 'LUNAS' ? 'text-green-600' : detailTransaction.paymentStatus === 'SEBAGIAN' ? 'text-orange-600' : 'text-red-600'}`}>
                                        {detailTransaction.type === TransactionType.RETURN ? 'RETUR' : detailTransaction.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : detailTransaction.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            <h4 className="font-bold text-sm text-slate-800 mb-2">Barang</h4>
                            <div className="border border-slate-200 rounded-lg mb-6 divide-y divide-slate-100">
                                {detailTransaction.items.map((item, idx) => (
                                    <div key={idx} className="p-3 flex justify-between">
                                        <div>
                                            <span className="block font-medium text-slate-700">{item.name}</span>
                                            <span className="text-xs text-slate-500">{item.qty} {item.unit || 'Pcs'} x {formatIDR(item.finalPrice)}</span>
                                        </div>
                                        <span className="font-medium text-slate-800">{formatIDR(item.finalPrice * item.qty)}</span>
                                    </div>
                                ))}
                                {(detailTransaction.discountAmount && detailTransaction.discountAmount > 0) && (
                                    <div className="p-3 flex justify-between text-red-600 bg-slate-50">
                                        <span>Diskon</span>
                                        <span>-{formatIDR(detailTransaction.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="bg-slate-50 p-3 flex justify-between font-bold text-slate-900">
                                    <span>Total</span>
                                    <span>{formatIDR(detailTransaction.totalAmount)}</span>
                                </div>
                            </div>

                            {/* Return History (If this is a Sale) */}
                            {transactions.filter(t => t.type === TransactionType.RETURN && t.originalTransactionId === detailTransaction.id).length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-bold text-sm text-slate-800 mb-2">Riwayat Retur</h4>
                                    <div className="bg-orange-50 rounded-lg p-3 space-y-2 text-sm border border-orange-100">
                                        {transactions
                                            .filter(t => t.type === TransactionType.RETURN && t.originalTransactionId === detailTransaction.id)
                                            .map((ret, i) => (
                                                <div key={i} className="flex justify-between border-b border-orange-200 last:border-0 pb-2">
                                                    <div>
                                                        <div className="flex gap-1 text-xs text-slate-500">
                                                            <span>{new Date(ret.date).toLocaleDateString('id-ID')}</span>
                                                            <span className="font-mono bg-slate-200 px-1 rounded text-[10px]">{new Date(ret.date).toLocaleTimeString('id-ID')}</span>
                                                        </div>
                                                        <span className="text-slate-700 block font-medium">Retur #{ret.id.substring(0, 6)}</span>
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {ret.items.map((item, idx) => (
                                                                <div key={idx}>- {item.name} ({item.qty}x)</div>
                                                            ))}
                                                        </div>
                                                        {ret.returnNote && (
                                                            <div className="text-xs text-slate-600 mt-1 italic bg-white/50 p-1 rounded border border-orange-200">
                                                                Catatan: {ret.returnNote}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-red-600">{formatIDR(ret.totalAmount)}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Original Transaction Info (If this is a Return) */}
                            {detailTransaction.type === TransactionType.RETURN && detailTransaction.originalTransactionId && (
                                <div className="mt-6">
                                    <h4 className="font-bold text-sm text-slate-800 mb-2">Info Transaksi Induk</h4>
                                    <div className="bg-primary/5 rounded-lg p-3 text-sm border border-primary/10">
                                        {(() => {
                                            const originalTx = transactions.find(t => t.id === detailTransaction.originalTransactionId);
                                            if (originalTx) {
                                                return (
                                                    <div className="flex justify-between items-center cursor-pointer hover:bg-primary/10 p-2 rounded transition-colors" onClick={() => setDetailTransaction(originalTx)}>
                                                        <div>
                                                            <div className="flex gap-1 text-xs text-slate-500">
                                                                <span>{new Date(originalTx.date).toLocaleDateString('id-ID')}</span>
                                                            </div>
                                                            <span className="text-slate-700 font-bold block">#{originalTx.id.substring(0, 8)}</span>
                                                            <span className="text-xs text-slate-600">Total: {formatIDR(originalTx.totalAmount)}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs bg-white border border-primary/20 px-2 py-1 rounded text-primary flex items-center gap-1">
                                                                <Eye size={10} /> Lihat
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return <span className="text-slate-500 italic">Transaksi induk tidak ditemukan</span>;
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Payment History */}
                            <h4 className="font-bold text-sm text-slate-800 mb-2 mt-6">Riwayat Pembayaran</h4>
                            <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
                                {detailTransaction.paymentHistory?.map((ph, i) => (
                                    <div key={i} className="flex justify-between border-b border-slate-200 last:border-0 pb-1">
                                        <div>
                                            <div className="flex gap-1 text-xs text-slate-500">
                                                <span>{new Date(ph.date).toLocaleDateString('id-ID')}</span>
                                                <span className="font-mono bg-slate-200 px-1 rounded text-[10px]">{new Date(ph.date).toLocaleTimeString('id-ID')}</span>
                                            </div>
                                            <span className="text-slate-700 block">{ph.note || 'Pembayaran'} ({ph.method})</span>
                                            {(() => {
                                                if (ph.bankId) {
                                                    const bank = banks.find(b => b.id === ph.bankId);
                                                    if (bank) return <span className="text-[10px] text-primary italic">via {bank.bankName} {bank.accountNumber}</span>;
                                                }
                                                if (ph.bankName) return <span className="text-[10px] text-primary italic">via {ph.bankName}</span>;
                                                return null;
                                            })()}
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
                                {(() => {
                                    const remaining = detailTransaction.totalAmount - detailTransaction.amountPaid;
                                    if (remaining > 0) {
                                        return (
                                            <div className="flex justify-between text-red-600 font-bold">
                                                <span>Sisa Tagihan</span>
                                                <span>{formatIDR(remaining)}</span>
                                            </div>
                                        );
                                    } else if (remaining < 0) {
                                        return (
                                            <div className="flex justify-between text-green-600 font-bold">
                                                <span>Kembalian</span>
                                                <span>{formatIDR(Math.abs(remaining))}</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                            <button onClick={() => printTransactionDetail(detailTransaction)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
                                <Printer size={16} /> Cetak Detail
                            </button>
                            <button onClick={() => setDetailTransaction(null)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">Tutup</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
