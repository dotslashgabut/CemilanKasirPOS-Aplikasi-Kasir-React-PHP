import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Transaction, Purchase, User, TransactionType, PurchaseType } from '../types';
import { Loading } from '../components/Loading';
import { Undo2, Search, Calendar, Package, ShoppingCart, Printer, FileSpreadsheet, Download, Filter, RotateCcw, X } from 'lucide-react';
import { formatIDR, formatDate, exportToCSV } from '../utils';
import * as XLSX from 'xlsx';

interface ReturnHistoryProps {
    currentUser: User;
}

export const ReturnHistory: React.FC<ReturnHistoryProps> = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales');
    const [salesReturns, setSalesReturns] = useState<Transaction[]>([]);
    const [purchaseReturns, setPurchaseReturns] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [transactions, purchases] = await Promise.all([
                ApiService.getTransactions(),
                ApiService.getPurchases()
            ]);

            setSalesReturns(transactions.filter(t => t.type === TransactionType.RETURN));
            setPurchaseReturns(purchases.filter(p => p.type === PurchaseType.RETURN));
        } catch (error) {
            console.error("Error fetching return history:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = salesReturns.filter(item => {
        const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.returnNote || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.items || []).some((i: any) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const itemDate = new Date(item.date).toISOString().split('T')[0];
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;

        return matchesSearch;
    });

    const filteredPurchases = purchaseReturns.filter(item => {
        const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.returnNote || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.items || []).some((i: any) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const itemDate = new Date(item.date).toISOString().split('T')[0];
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;

        return matchesSearch;
    });

    // Sort by date desc
    filteredSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    filteredPurchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleExport = () => {
        const isSales = activeTab === 'sales';
        const items = isSales ? filteredSales : filteredPurchases;
        const headers = ['Tanggal', 'ID', 'No Faktur', isSales ? 'Pelanggan' : 'Supplier', 'Barang', 'Catatan', 'Nilai Retur'];

        const rows = items.map((item: any) => [
            formatDate(item.date),
            item.id,
            item.invoiceNumber || '-',
            isSales ? item.customerName : item.supplierName,
            item.items.map((i: any) => `${i.name} (${i.qty})`).join('; '),
            item.returnNote || item.paymentNote || '-',
            Math.abs(item.totalAmount)
        ]);

        exportToCSV(`riwayat-retur-${activeTab}.csv`, headers, rows);
    };

    const handleExportExcel = () => {
        const isSales = activeTab === 'sales';
        const items = isSales ? filteredSales : filteredPurchases;

        const data = items.map((item: any) => ({
            'Tanggal': formatDate(item.date),
            'ID': item.id,
            'No Faktur': item.invoiceNumber || '-',
            [isSales ? 'Pelanggan' : 'Supplier']: isSales ? item.customerName : item.supplierName,
            'Barang': item.items.map((i: any) => `${i.name} (${i.qty})`).join('; '),
            'Catatan': item.returnNote || item.paymentNote || '-',
            'Nilai Retur': Math.abs(item.totalAmount)
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Retur ${isSales ? 'Penjualan' : 'Pembelian'}`);

        // Auto-width
        worksheet['!cols'] = [
            { wch: 20 }, // Tanggal
            { wch: 15 }, // ID
            { wch: 20 }, // Faktur
            { wch: 20 }, // Name
            { wch: 40 }, // Barang
            { wch: 30 }, // Catatan
            { wch: 15 }  // Nilai
        ];

        XLSX.writeFile(workbook, `Riwayat_Retur_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const isSales = activeTab === 'sales';
        const items = isSales ? filteredSales : filteredPurchases;

        const rows = items.map((item: any, idx: number) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${formatDate(item.date)}</td>
                <td>${item.id.substring(0, 8)}</td>
                <td>${item.invoiceNumber || '-'}</td>
                <td>${isSales ? item.customerName : item.supplierName}</td>
                <td>
                    <ul style="margin: 0; padding-left: 15px;">
                        ${item.items.map((i: any) => `<li>${i.name} x${i.qty}</li>`).join('')}
                    </ul>
                </td>
                <td>${item.returnNote || item.paymentNote || '-'}</td>
                <td style="text-align:right">${formatIDR(Math.abs(item.totalAmount))}</td>
            </tr>
        `).join('');

        const html = `
            <html>
                <head>
                    <title>Riwayat Retur ${isSales ? 'Penjualan' : 'Pembelian'}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
                        h2 { text-align: center; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .text-right { text-align: right; }
                    </style>
                </head>
                <body>
                    <h2>Laporan Riwayat Retur ${isSales ? 'Penjualan' : 'Pembelian'}</h2>
                    <p>Periode: ${startDate ? formatDate(startDate) : 'Semua'} - ${endDate ? formatDate(endDate) : 'Semua'}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tanggal</th>
                                <th>ID</th>
                                <th>Faktur</th>
                                <th>${isSales ? 'Pelanggan' : 'Supplier'}</th>
                                <th>Barang</th>
                                <th>Catatan</th>
                                <th>Nilai Retur</th>
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

    if (loading) return <Loading />;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Undo2 className="text-red-600" />
                            Riwayat Retur
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Lacak pengembalian barang penjualan dan pembelian</p>
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

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200 w-full">
                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'sales'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <ShoppingCart size={16} />
                        Retur Penjualan
                    </button>
                    <button
                        onClick={() => setActiveTab('purchases')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'purchases'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Package size={16} />
                        Retur Pembelian Stok
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Date Filters */}
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 w-fit">
                        <Filter size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">Filter Tanggal:</span>
                        <div className="relative flex items-center bg-white border border-slate-300 rounded px-2 py-1">
                            <span className="text-sm text-slate-700 pr-6">
                                {startDate ? new Date(startDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'dd/mm/yyyy'}
                            </span>
                            <input
                                type="date"
                                className="absolute inset-0 opacity-0 w-full h-full"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                            <Calendar size={14} className="absolute right-2 text-slate-400 pointer-events-none" />
                        </div>
                        <span className="text-slate-400">-</span>
                        <div className="relative flex items-center bg-white border border-slate-300 rounded px-2 py-1">
                            <span className="text-sm text-slate-700 pr-6">
                                {endDate ? new Date(endDate).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'dd/mm/yyyy'}
                            </span>
                            <input
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
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={activeTab === 'sales' ? "Cari ID, Faktur, Pelanggan, Barang, Catatan..." : "Cari ID, Faktur, Supplier, Barang, Catatan..."}
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-slate-700"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1"
                                title="Hapus pencarian"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700">
                    Daftar Retur ({activeTab === 'sales' ? filteredSales.length : filteredPurchases.length})
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="p-4 font-medium">Tanggal & ID</th>
                                <th className="p-4 font-medium">Faktur</th>
                                <th className="p-4 font-medium">
                                    {activeTab === 'sales' ? 'Pelanggan' : 'Supplier'}
                                </th>
                                <th className="p-4 font-medium">Barang Diretur</th>
                                <th className="p-4 font-medium">Catatan</th>
                                <th className="p-4 font-medium">Nilai Retur</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(activeTab === 'sales' ? filteredSales : filteredPurchases).length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400">
                                        Tidak ada data retur.
                                    </td>
                                </tr>
                            ) : (
                                (activeTab === 'sales' ? filteredSales : filteredPurchases).map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-800">{formatDate(item.date)}</div>
                                            <div className="text-xs text-slate-500">#{item.id.substring(0, 8)}</div>
                                            {item.originalTransactionId && (
                                                <div className="text-xs text-primary mt-1">Ref: #{item.originalTransactionId.substring(0, 8)}</div>
                                            )}
                                            {item.originalPurchaseId && (
                                                <div className="text-xs text-primary mt-1">Ref: #{item.originalPurchaseId.substring(0, 8)}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-mono text-slate-700">{item.invoiceNumber || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {activeTab === 'sales' ? item.customerName : item.supplierName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {item.items && item.items.length > 0 ? (
                                                <ul className="list-disc list-inside">
                                                    {item.items.map((i: any, idx: number) => (
                                                        <li key={idx}>
                                                            {i.name} <span className="text-slate-400">x{i.qty}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="italic text-slate-400">Tidak ada detail barang</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 italic">
                                            {item.returnNote || item.paymentNote || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-red-600">
                                            {formatIDR(Math.abs(item.totalAmount))}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
