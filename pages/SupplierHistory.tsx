import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../hooks/useData';
import { StorageService } from '../services/storage';
import { Purchase, PaymentStatus, Supplier, UserRole, User, PaymentMethod, StoreSettings, PurchaseType } from '../types';
import { formatIDR, formatDate, exportToCSV } from '../utils';
import { generatePrintPurchaseDetail } from '../utils/printHelpers';
import { Download, Search, Filter, RotateCcw, X, Eye, Printer, FileSpreadsheet, Truck as TruckIcon, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

interface SupplierHistoryProps {
    currentUser: User | null;
}

export const SupplierHistory: React.FC<SupplierHistoryProps> = ({ currentUser }) => {
    const purchases = useData(() => StorageService.getPurchases(), [], 'purchases') || [];
    const suppliers = useData(() => StorageService.getSuppliers(), [], 'suppliers') || [];
    const banks = useData(() => StorageService.getBanks(), [], 'banks') || [];

    // State
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [detailPurchase, setDetailPurchase] = useState<Purchase | null>(null);
    const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(20);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Reset pagination on filter change
    useEffect(() => {
        setVisibleCount(20);
    }, [selectedSupplierId, startDate, endDate, searchQuery]);

    // Load store settings
    useEffect(() => {
        StorageService.getStoreSettings().then(setStoreSettings);
    }, []);

    // Helper for Jakarta Date
    const getJakartaDateStr = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    };

    // Get selected supplier
    const selectedSupplier = useMemo(() => {
        return suppliers.find(s => s.id === selectedSupplierId) || null;
    }, [suppliers, selectedSupplierId]);

    // Filter Logic
    const filteredPurchases = useMemo(() => {
        let items = purchases;

        // Filter by supplier
        if (selectedSupplierId) {
            items = items.filter(p => p.supplierId === selectedSupplierId);
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
            items = items.filter(p =>
                p.id.toLowerCase().includes(query) ||
                (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(query)) ||
                p.supplierName.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }

        // Sort
        // Sort (Date Descending)
        items.sort((a, b) => {
            const aTime = new Date(a.date).getTime();
            const bTime = new Date(b.date).getTime();
            return bTime - aTime;
        });

        return items;
    }, [purchases, selectedSupplierId, startDate, endDate, searchQuery]);

    const visiblePurchases = useMemo(() => filteredPurchases.slice(0, visibleCount), [filteredPurchases, visibleCount]);

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
    }, [loadMoreRef.current, filteredPurchases]);

    // Calculate totals
    const totals = useMemo(() => {
        const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalPaid = filteredPurchases.reduce((sum, p) => sum + p.amountPaid, 0);
        const totalDebt = filteredPurchases
            .filter(p => p.paymentStatus !== PaymentStatus.PAID)
            .reduce((sum, p) => sum + (p.totalAmount - p.amountPaid), 0);

        return { totalPurchases, totalPaid, totalDebt };
    }, [filteredPurchases]);



    const handleExport = () => {
        const headers = ['ID Pembelian', 'No Faktur', 'Tanggal', 'Supplier', 'Deskripsi', 'Total', 'Dibayar', 'Sisa', 'Status', 'Metode'];
        const rows = filteredPurchases.map(p => [
            p.id,
            p.invoiceNumber || '-',
            formatDate(p.date),
            p.supplierName,
            p.description,
            p.totalAmount,
            p.amountPaid,
            p.totalAmount - p.amountPaid,
            p.type === PurchaseType.RETURN ? 'RETUR' : (p.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : p.paymentStatus) + (p.isReturned ? ' (Ada Retur)' : ''),
            p.paymentMethod
        ]);
        exportToCSV(`riwayat-supplier-${selectedSupplier?.name || 'all'}.csv`, headers, rows);
    };

    const handleExportExcel = () => {
        const data = filteredPurchases.map(p => ({
            'ID Pembelian': p.id,
            'No Faktur': p.invoiceNumber || '-',
            'Tanggal': formatDate(p.date),
            'Supplier': p.supplierName,
            'Deskripsi': p.description,
            'Total': p.totalAmount,
            'Dibayar': p.amountPaid,
            'Sisa': p.totalAmount - p.amountPaid,
            'Status': p.type === PurchaseType.RETURN ? 'RETUR' : (p.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : p.paymentStatus) + (p.isReturned ? ' (Ada Retur)' : ''),
            'Metode': p.paymentMethod
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Supplier");

        // Auto-width
        worksheet['!cols'] = [
            { wch: 15 }, // ID
            { wch: 20 }, // Faktur
            { wch: 15 }, // Tanggal
            { wch: 20 }, // Supplier
            { wch: 30 }, // Deskripsi
            { wch: 15 }, // Total
            { wch: 15 }, // Dibayar
            { wch: 15 }, // Sisa
            { wch: 15 }, // Status
            { wch: 15 }  // Metode
        ];

        XLSX.writeFile(workbook, `Riwayat_Supplier_${selectedSupplier?.name || 'All'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const rows = filteredPurchases.map((p, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${formatDate(p.date)}</td>
                <td>${p.id.substring(0, 8)}</td>
                <td>${p.invoiceNumber || '-'}</td>
                <td>${p.supplierName}</td>
                <td>${p.description}</td>
                <td style="text-align:right">${formatIDR(p.totalAmount)}</td>
                <td style="text-align:right">${formatIDR(p.amountPaid)}</td>
                <td style="text-align:right">${formatIDR(p.totalAmount - p.amountPaid)}</td>
                <td>${p.type === PurchaseType.RETURN ? 'RETUR' : (p.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : p.paymentStatus) + (p.isReturned ? ' (Ada Retur)' : '')}</td>
            </tr>
        `).join('');

        const html = `
            <html>
                <head>
                    <title>Riwayat Supplier</title>
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
                    <h2>Riwayat Pembelian dari Supplier</h2>
                    <div class="summary">
                        <p><strong>Supplier:</strong> ${selectedSupplier?.name || 'Semua Supplier'}</p>
                        <p><strong>Periode:</strong> ${startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Semua'} - ${endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Semua'}</p>
                        <p><strong>Total Pembelian:</strong> ${formatIDR(totals.totalPurchases)}</p>
                        <p><strong>Total Dibayar:</strong> ${formatIDR(totals.totalPaid)}</p>
                        <p><strong>Total Utang:</strong> ${formatIDR(totals.totalDebt)}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tanggal</th>
                                <th>ID</th>
                                <th>Faktur</th>
                                <th>Supplier</th>
                                <th>Deskripsi</th>
                                <th>Total</th>
                                <th>Dibayar</th>
                                <th>Sisa</th>
                                <th>Status</th>
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

    const printPurchaseDetail = (purchase: Purchase) => {
        const settings = storeSettings || { name: 'Cemilan KasirPOS' } as StoreSettings;
        const w = window.open('', '', 'width=800,height=600');
        if (!w) return;

        const html = generatePrintPurchaseDetail(purchase, settings, formatIDR, formatDate);
        w.document.write(html);
        w.document.close();
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <TruckIcon className="text-primary" />
                            Riwayat Supplier
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Lacak riwayat pembelian dan aktivitas supplier</p>
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
                {selectedSupplierId && (
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                            <p className="text-xs text-primary mb-1">Total Pembelian</p>
                            <p className="text-lg font-bold text-primary">{formatIDR(totals.totalPurchases)}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="text-xs text-green-600 mb-1">Total Dibayar</p>
                            <p className="text-lg font-bold text-green-700">{formatIDR(totals.totalPaid)}</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-xs text-red-600 mb-1">Total Utang</p>
                            <p className="text-lg font-bold text-red-700">{formatIDR(totals.totalDebt)}</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Supplier Selector */}
                    <label htmlFor="supplierFilter" className="sr-only">Filter Supplier</label>
                    <select
                        id="supplierFilter"
                        name="supplierFilter"
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm min-w-[200px]"
                        value={selectedSupplierId}
                        onChange={e => setSelectedSupplierId(e.target.value)}
                    >
                        <option value="">-- Semua Supplier --</option>
                        {suppliers.sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
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
                        <label htmlFor="searchPurchase" className="sr-only">Cari Pembelian</label>
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            id="searchPurchase"
                            name="searchPurchase"
                            type="text"
                            placeholder="Cari ID, faktur, supplier, deskripsi..."
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
                    Daftar Pembelian ({filteredPurchases.length})
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="p-4 font-medium">Tanggal</th>
                                <th className="p-4 font-medium">ID Pembelian</th>
                                <th className="p-4 font-medium">Faktur</th>
                                <th className="p-4 font-medium">Supplier</th>
                                <th className="p-4 font-medium">Deskripsi</th>
                                <th className="p-4 font-medium">Total</th>
                                <th className="p-4 font-medium">Dibayar</th>
                                <th className="p-4 font-medium">Sisa/Utang</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Metode</th>
                                <th className="p-4 font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPurchases.length === 0 && (
                                <tr>
                                    <td colSpan={11} className="p-8 text-center text-slate-400">Tidak ada pembelian.</td>
                                </tr>
                            )}
                            {visiblePurchases.map(p => (
                                <tr key={p.id} onClick={() => setDetailPurchase(p)} className="hover:bg-slate-50 cursor-pointer group">
                                    <td className="p-4 text-slate-600">
                                        <div className="flex flex-col">
                                            <span>{new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            <span className="text-xs text-slate-400">{new Date(p.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-slate-400">#{p.id.substring(0, 6)}</td>
                                    <td className="p-4 font-mono text-sm text-slate-700">{p.invoiceNumber || '-'}</td>
                                    <td className="p-4 font-medium text-slate-800">{p.supplierName}</td>
                                    <td className="p-4 text-slate-600">{p.description}</td>
                                    <td className="p-4 font-semibold text-slate-700">{formatIDR(p.totalAmount)}</td>
                                    <td className="p-4 text-green-600">{formatIDR(p.amountPaid)}</td>
                                    <td className="p-4 text-red-600 font-medium">{formatIDR(p.totalAmount - p.amountPaid)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.type === PurchaseType.RETURN
                                            ? 'bg-purple-100 text-purple-600'
                                            : p.paymentStatus === PaymentStatus.PAID
                                                ? 'bg-green-100 text-green-600'
                                                : p.paymentStatus === PaymentStatus.PARTIAL
                                                    ? 'bg-orange-100 text-orange-600'
                                                    : 'bg-red-100 text-red-600'
                                            }`}>
                                            {p.type === PurchaseType.RETURN
                                                ? 'RETUR'
                                                : (p.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : p.paymentStatus) + (p.isReturned ? ' (Ada Retur)' : '')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600">{p.paymentMethod}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); setDetailPurchase(p); }} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 flex items-center gap-1" title="Detail">
                                                <Eye size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {visiblePurchases.length < filteredPurchases.length && (
                                <tr>
                                    <td colSpan={11} className="p-4 text-center text-slate-400">
                                        <div ref={loadMoreRef}>Loading more...</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {detailPurchase && createPortal(
                <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">
                                Detail Pembelian {detailPurchase.invoiceNumber ? `(${detailPurchase.invoiceNumber})` : `#${detailPurchase.id.substring(0, 8)}`}
                            </h3>
                            <button onClick={() => setDetailPurchase(null)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                <div>
                                    <span className="text-slate-500 block text-xs">Waktu Pembelian</span>
                                    <span className="font-medium text-slate-900">
                                        {formatDate(detailPurchase.date)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Supplier</span>
                                    <span className="font-medium text-slate-900">{detailPurchase.supplierName}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Metode Awal</span>
                                    <span className="font-medium text-slate-900">{detailPurchase.paymentMethod}</span>
                                    {(() => {
                                        if (detailPurchase.bankId) {
                                            const bank = banks.find(b => b.id === detailPurchase.bankId);
                                            if (bank) return <span className="block text-xs text-primary">via {bank.bankName} {bank.accountNumber}</span>;
                                        }
                                        if (detailPurchase.bankName) return <span className="block text-xs text-primary">via {detailPurchase.bankName}</span>;
                                        return null;
                                    })()}
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Status</span>
                                    <span className={`font-bold ${detailPurchase.paymentStatus === 'LUNAS' ? 'text-green-600' : 'text-red-600'}`}>
                                        {detailPurchase.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : detailPurchase.paymentStatus}
                                    </span>
                                </div>
                            </div>

                            <h4 className="font-bold text-sm text-slate-800 mb-2">Keterangan Barang</h4>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-6 text-sm text-slate-700">
                                {detailPurchase.description}
                            </div>

                            {detailPurchase.items && detailPurchase.items.length > 0 ? (
                                <div className="mb-6">
                                    <h4 className="font-bold text-sm text-slate-800 mb-2">Rincian Barang Stok</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        {detailPurchase.items.map((item, i) => (
                                            <div key={i} className="flex justify-between p-3 border-b last:border-0 text-sm">
                                                <div>
                                                    <span className="block font-medium text-slate-700">{item.name}</span>
                                                    <span className="text-xs text-slate-500">{item.qty} {item.unit || 'Pcs'} x {formatIDR(item.finalPrice)}</span>
                                                </div>
                                                <span className="font-medium text-slate-800">{formatIDR(item.finalPrice * item.qty)}</span>
                                            </div>
                                        ))}
                                        <div className="bg-slate-50 p-3 flex justify-between font-bold text-slate-900">
                                            <span>Total</span>
                                            <span>{formatIDR(detailPurchase.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">
                                    <span>Total Pembelian</span>
                                    <span>{formatIDR(detailPurchase.totalAmount)}</span>
                                </div>
                            )}

                            {/* Return History (If this is a Purchase) */}
                            {purchases.filter(p => p.type === PurchaseType.RETURN && (p.originalPurchaseId === detailPurchase.id || p.description.includes(detailPurchase.id))).length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-bold text-sm text-slate-800 mb-2">Riwayat Retur ke Supplier</h4>
                                    <div className="bg-orange-50 rounded-lg p-3 space-y-2 text-sm border border-orange-100">
                                        {purchases
                                            .filter(p => p.type === PurchaseType.RETURN && (p.originalPurchaseId === detailPurchase.id || p.description.includes(detailPurchase.id)))
                                            .map((ret, i) => (
                                                <div key={i} className="flex justify-between border-b border-orange-200 last:border-0 pb-2">
                                                    <div>
                                                        <div className="flex gap-1 text-xs text-slate-500">
                                                            <span>{new Date(ret.date).toLocaleDateString('id-ID')}</span>
                                                            <span className="font-mono bg-slate-200 px-1 rounded text-[10px]">{new Date(ret.date).toLocaleTimeString('id-ID')}</span>
                                                        </div>
                                                        <span className="text-slate-700 block font-medium">Retur #{ret.id.substring(0, 6)}</span>
                                                        <div className="text-xs text-slate-500 mt-1 italic">
                                                            {ret.description}
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

                            {/* Original Purchase Info (If this is a Return) */}
                            {detailPurchase.type === PurchaseType.RETURN && (
                                <div className="mt-6">
                                    <h4 className="font-bold text-sm text-slate-800 mb-2">Info Pembelian Induk</h4>
                                    <div className="bg-primary/5 rounded-lg p-3 text-sm border border-primary/10">
                                        {(() => {
                                            // 1. Coba cari via originalPurchaseId (Prioritas)
                                            let originalTx = detailPurchase.originalPurchaseId
                                                ? purchases.find(p => p.id === detailPurchase.originalPurchaseId)
                                                : null;

                                            // 2. Fallback: Cari via deskripsi (Regex #ID)
                                            if (!originalTx) {
                                                const originalIdMatch = detailPurchase.description.match(/#([a-zA-Z0-9-]+)/);
                                                const originalId = originalIdMatch ? originalIdMatch[1] : null;
                                                if (originalId) {
                                                    originalTx = purchases.find(p => p.id === originalId || p.id.startsWith(originalId));
                                                }
                                            }

                                            if (originalTx) {
                                                return (
                                                    <div className="flex justify-between items-center cursor-pointer hover:bg-primary/10 p-2 rounded transition-colors" onClick={() => setDetailPurchase(originalTx)}>
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
                                            return <span className="text-slate-500 italic">Info pembelian induk tidak ditemukan di deskripsi.</span>;
                                        })()}
                                    </div>
                                </div>
                            )}

                            {/* Payment History */}
                            <h4 className="font-bold text-sm text-slate-800 mb-2 mt-6">Riwayat Pembayaran</h4>
                            <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
                                {detailPurchase.paymentHistory?.map((ph, i) => (
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
                                {!detailPurchase.paymentHistory && (
                                    <div className="flex justify-between">
                                        <span>Pembayaran Awal</span>
                                        <span>{formatIDR(detailPurchase.amountPaid)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 font-bold border-t border-slate-200">
                                    <span>Total Dibayar</span>
                                    <span>{formatIDR(detailPurchase.amountPaid)}</span>
                                </div>
                                <div className="flex justify-between text-red-600 font-bold">
                                    <span>Sisa Utang</span>
                                    <span>{formatIDR(detailPurchase.totalAmount - detailPurchase.amountPaid)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                            <button onClick={() => printPurchaseDetail(detailPurchase)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
                                <Printer size={16} /> Cetak Detail
                            </button>
                            <button onClick={() => setDetailPurchase(null)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold">Tutup</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
