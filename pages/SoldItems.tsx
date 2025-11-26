import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../hooks/useData';
import { StorageService } from '../services/storage';
import { TransactionType, UserRole, User } from '../types';
import { formatIDR, exportToCSV } from '../utils';
import { Download, Search, Filter, RotateCcw, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SoldItemsProps {
    currentUser: User | null;
}

export const SoldItems: React.FC<SoldItemsProps> = ({ currentUser }) => {
    const transactions = useData(() => StorageService.getTransactions(), [], 'transactions') || [];

    // Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Sort State
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(20);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Reset pagination on filter change
    useEffect(() => {
        setVisibleCount(20);
    }, [startDate, endDate, searchQuery, sortConfig]);

    // Helper for Jakarta Date
    const getJakartaDateStr = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    };

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        let items = transactions;

        // 1. Cashier Filter
        if (currentUser && currentUser.role === UserRole.CASHIER) {
            items = items.filter(item => item.cashierId === currentUser.id);
        }

        // 2. Date Filter
        if (startDate || endDate) {
            items = items.filter(item => {
                const itemDateStr = getJakartaDateStr(item.date);
                if (startDate && itemDateStr < startDate) return false;
                if (endDate && itemDateStr > endDate) return false;
                return true;
            });
        }

        return items;
    }, [transactions, currentUser, startDate, endDate]);

    const soldItems = useMemo(() => {
        let items = filteredTransactions
            .flatMap(t => t.items.map(item => ({
                ...item,
                transactionId: t.id,
                transactionType: t.type,
                date: t.date,
                cashierName: t.cashierName,
                customerName: t.customerName,
                isReturned: t.isReturned
            })))
            .filter(item => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                    item.name.toLowerCase().includes(query) ||
                    item.transactionId.toLowerCase().includes(query) ||
                    item.cashierName.toLowerCase().includes(query)
                );
            });

        // Sorting
        if (sortConfig) {
            items.sort((a, b) => {
                if (sortConfig.key === 'date') {
                    const aTime = new Date(a.date).getTime();
                    const bTime = new Date(b.date).getTime();
                    return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
                }

                let aVal = a[sortConfig.key as keyof typeof a];
                let bVal = b[sortConfig.key as keyof typeof b];

                // Handle string comparison (case-insensitive)
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    aVal = aVal.toLowerCase() as any;
                    bVal = bVal.toLowerCase() as any;
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return items;
    }, [filteredTransactions, searchQuery, sortConfig]);

    const visibleSoldItems = useMemo(() => soldItems.slice(0, visibleCount), [soldItems, visibleCount]);

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
    }, [loadMoreRef.current, soldItems]);

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

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const showHPP = currentUser?.role !== UserRole.CASHIER;

        const rows = soldItems.map((i, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${new Date(i.date).toLocaleDateString('id-ID')} ${new Date(i.date).toLocaleTimeString('id-ID')}</td>
                <td>${i.transactionId.substring(0, 6)}</td>
                <td>${i.name}</td>
                <td>${i.qty}</td>
                ${showHPP ? `<td style="text-align:right">${formatIDR(i.hpp || 0)}</td>` : ''}
                <td style="text-align:right">${formatIDR(i.finalPrice)}</td>
                <td>${i.selectedPriceType}</td>
                <td>${i.customerName}</td>
                <td>${i.cashierName}</td>
                <td>${i.transactionType === TransactionType.RETURN ? 'RETUR' : i.isReturned ? 'Retur Sebagian' : 'Normal'}</td>
            </tr>
        `).join('');

        const html = `
            <html>
                <head>
                    <title>Laporan Barang Terjual</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
                        h2 { text-align: center; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
                        .text-right { text-align: right; }
                    </style>
                </head>
                <body>
                    <h2>Laporan Barang Terjual</h2>
                    <p>Periode: ${startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Semua'} - ${endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Semua'}</p>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px;">No</th>
                                <th>Waktu</th>
                                <th>ID Transaksi</th>
                                <th>Item</th>
                                <th>Qty</th>
                                ${showHPP ? '<th>HPP</th>' : ''}
                                <th>Harga Jual</th>
                                <th>Kategori</th>
                                <th>Pembeli</th>
                                <th>Kasir</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" style="text-align:right; font-weight:bold;">Total</td>
                                <td style="font-weight:bold;">${soldItems.reduce((s, i) => s + (i.transactionType === TransactionType.RETURN ? -i.qty : i.qty), 0)}</td>
                                <td colspan="${showHPP ? 6 : 5}"></td>
                            </tr>
                        </tfoot>
                    </table>
                    <script>window.print();</script>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const handleExport = () => {
        const showHPP = currentUser?.role !== UserRole.CASHIER;
        let headers = ['ID Transaksi', 'Tanggal', 'Waktu', 'Item', 'Qty', 'Harga Jual', 'Kategori', 'Pembeli', 'Kasir', 'Status'];
        if (showHPP) {
            headers.splice(5, 0, 'HPP');
        }

        const rows = soldItems.map(i => {
            const d = new Date(i.date);
            const row = [
                i.transactionId,
                d.toLocaleDateString('id-ID'),
                d.toLocaleTimeString('id-ID'),
                i.name,
                i.qty,
                i.finalPrice,
                i.selectedPriceType,
                i.customerName,
                i.cashierName,
                i.transactionType === TransactionType.RETURN ? 'RETUR' : i.isReturned ? 'Retur Sebagian' : 'Normal'
            ];
            if (showHPP) {
                row.splice(5, 0, i.hpp || 0);
            }
            return row;
        });
        exportToCSV('laporan-barang-terjual.csv', headers, rows);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-800">Laporan Barang Terjual</h1>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="text-sm flex items-center gap-2 bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                            <Download size={16} /> Print
                        </button>
                        <button onClick={handleExport} className="text-sm flex items-center gap-2 bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
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
                            placeholder="Cari nama barang, ID transaksi, atau kasir..."
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

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between">
                    <span>Daftar Barang Terjual</span>
                    <span className="text-blue-600">Total Item: {soldItems.reduce((s, i) => s + (i.transactionType === TransactionType.RETURN ? -i.qty : i.qty), 0)}</span>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                        <tr>
                            <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('date')}>
                                <div className="flex items-center">Waktu <SortIcon column="date" /></div>
                            </th>
                            <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('transactionId')}>
                                <div className="flex items-center">ID Transaksi <SortIcon column="transactionId" /></div>
                            </th>
                            <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('name')}>
                                <div className="flex items-center">Item <SortIcon column="name" /></div>
                            </th>
                            <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('qty')}>
                                <div className="flex items-center">Qty <SortIcon column="qty" /></div>
                            </th>
                            {currentUser?.role !== UserRole.CASHIER && (
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('hpp')}>
                                    <div className="flex items-center">HPP <SortIcon column="hpp" /></div>
                                </th>
                            )}
                            <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('finalPrice')}>
                                <div className="flex items-center">Harga Jual <SortIcon column="finalPrice" /></div>
                            </th>
                            <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('selectedPriceType')}>
                                <div className="flex items-center">Kategori Harga <SortIcon column="selectedPriceType" /></div>
                            </th>
                            <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('customerName')}>
                                <div className="flex items-center">Pembeli <SortIcon column="customerName" /></div>
                            </th>
                            <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('cashierName')}>
                                <div className="flex items-center">Kasir <SortIcon column="cashierName" /></div>
                            </th>
                            <th className="p-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {soldItems.length === 0 && (
                            <tr>
                                <td colSpan={10} className="p-8 text-center text-slate-400">Tidak ada data barang terjual.</td>
                            </tr>
                        )}
                        {visibleSoldItems.map((item, idx) => (
                            <tr key={`${item.transactionId}-${idx}`} className="hover:bg-slate-50">
                                <td className="p-4 text-slate-600">
                                    <div className="flex flex-col">
                                        <span>{new Date(item.date).toLocaleDateString('id-ID')}</span>
                                        <span className="text-xs text-slate-400">{new Date(item.date).toLocaleTimeString('id-ID')}</span>
                                    </div>
                                </td>
                                <td className="p-4 font-mono text-xs text-slate-400">#{item.transactionId.substring(0, 6)}</td>
                                <td className="p-4 font-medium text-slate-800">{item.name}</td>
                                <td className="p-4">{item.qty}</td>
                                {currentUser?.role !== UserRole.CASHIER && (
                                    <td className="p-4 text-slate-500">{formatIDR(item.hpp || 0)}</td>
                                )}
                                <td className="p-4 text-slate-800">{formatIDR(item.finalPrice)}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-600">
                                        {item.selectedPriceType}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-600">{item.customerName}</td>
                                <td className="p-4 text-slate-600">{item.cashierName}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.transactionType === TransactionType.RETURN
                                        ? 'bg-purple-100 text-purple-600'
                                        : item.isReturned
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'bg-green-100 text-green-600'
                                        }`}>
                                        {item.transactionType === TransactionType.RETURN ? 'RETUR' : item.isReturned ? 'Retur Sebagian' : 'Normal'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {visibleSoldItems.length < soldItems.length && (
                            <tr>
                                <td colSpan={10} className="p-4 text-center text-slate-400">
                                    <div ref={loadMoreRef}>Loading more...</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
