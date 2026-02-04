import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { PaymentMethod, User } from '../types';
import { Loading } from '../components/Loading';
import { ArrowRightLeft, Search, Calendar, ArrowUpRight, ArrowDownLeft, Printer, FileSpreadsheet, Download, Filter, RotateCcw, X } from 'lucide-react';
import { formatIDR, formatDate, exportToCSV } from '../utils';
import * as XLSX from 'xlsx';

interface TransferHistoryProps {
    currentUser: User;
}

interface TransferItem {
    id: string;
    date: string;
    type: 'TRANSACTION' | 'PURCHASE' | 'CASHFLOW';
    subType: string; // e.g. 'Penjualan', 'Pembelian', 'Operasional'
    description: string;
    amount: number;
    flow: 'IN' | 'OUT';
    bankName: string;
    bankAccountNumber?: string;
    bankId?: string;
}

export const TransferHistory: React.FC<TransferHistoryProps> = ({ currentUser }) => {
    const [items, setItems] = useState<TransferItem[]>([]);
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
            const [cashflows, banks, transactions, purchases] = await Promise.all([
                ApiService.getCashFlow(),
                ApiService.getBanks(),
                ApiService.getTransactions(),
                ApiService.getPurchases()
            ]);

            // Create a map of bankId -> accountNumber for quick lookup
            const bankMap = new Map(banks.map(b => [b.id, b.accountNumber]));

            const transferItems: TransferItem[] = cashflows
                .filter(c => c.paymentMethod === PaymentMethod.TRANSFER)
                .map(c => {
                    let type: 'TRANSACTION' | 'PURCHASE' | 'CASHFLOW' = 'CASHFLOW';
                    if (c.category.toLowerCase().includes('penjualan') || c.category.toLowerCase().includes('piutang')) {
                        type = 'TRANSACTION';
                    } else if (c.category.toLowerCase().includes('pembelian') || c.category.toLowerCase().includes('utang')) {
                        type = 'PURCHASE';
                    }

                    let description = c.description;
                    let invoiceRef = '';

                    // Logic to find invoice number for specific categories
                    if ((c.category === 'Pelunasan Piutang' || c.category === 'Pelunasan Utang Supplier') && c.referenceId) {
                        if (type === 'TRANSACTION') {
                            const tx = transactions.find(t => t.id === c.referenceId);
                            if (tx && tx.invoiceNumber) {
                                invoiceRef = tx.invoiceNumber;
                            }
                        } else if (type === 'PURCHASE') {
                            const pur = purchases.find(p => p.id === c.referenceId);
                            if (pur && pur.invoiceNumber) {
                                invoiceRef = pur.invoiceNumber;
                            }
                        }
                    }

                    if (invoiceRef) {
                        description += ` (Faktur: ${invoiceRef})`;
                    }

                    return {
                        id: c.id,
                        date: c.date,
                        type: type,
                        subType: c.category,
                        description: description,
                        amount: c.amount,
                        flow: c.type === 'MASUK' ? 'IN' : 'OUT',
                        bankName: c.bankName || 'Unknown Bank',
                        bankAccountNumber: c.bankId ? bankMap.get(c.bankId) : undefined,
                        bankId: c.bankId
                    };
                });

            // Sort by date desc
            transferItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setItems(transferItems);
        } catch (error) {
            console.error("Error fetching transfer history:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.subType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.bankAccountNumber && item.bankAccountNumber.toLowerCase().includes(searchTerm.toLowerCase()));

        // Date Filter
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;

        return matchesSearch;
    });

    const handleExport = () => {
        const headers = ['Tanggal', 'ID', 'Tipe', 'Deskripsi', 'Bank/E-Wallet', 'Alur', 'Jumlah'];
        const rows = filteredItems.map(item => [
            formatDate(item.date),
            item.id,
            item.subType,
            item.description,
            item.bankAccountNumber ? `${item.bankName} - ${item.bankAccountNumber}` : item.bankName,
            item.flow === 'IN' ? 'Masuk' : 'Keluar',
            item.amount
        ]);
        exportToCSV('riwayat-transfer.csv', headers, rows);
    };

    const handleExportExcel = () => {
        const data = filteredItems.map(item => ({
            'Tanggal': formatDate(item.date),
            'ID': item.id,
            'Tipe': item.subType,
            'Deskripsi': item.description,
            'Bank/E-Wallet': item.bankAccountNumber ? `${item.bankName} - ${item.bankAccountNumber}` : item.bankName,
            'Alur': item.flow === 'IN' ? 'Masuk' : 'Keluar',
            'Jumlah': item.amount
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Transfer");

        // Auto-width
        worksheet['!cols'] = [
            { wch: 20 }, // Tanggal
            { wch: 15 }, // ID
            { wch: 20 }, // Tipe
            { wch: 40 }, // Deskripsi
            { wch: 20 }, // Bank
            { wch: 10 }, // Alur
            { wch: 15 }  // Jumlah
        ];

        XLSX.writeFile(workbook, `Riwayat_Transfer_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const rows = filteredItems.map((item, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${formatDate(item.date)}</td>
                <td>${item.id.substring(0, 8)}</td>
                <td>${item.subType}</td>
                <td>${item.description}</td>
                <td>${item.bankAccountNumber ? `${item.bankName}<br/><small>${item.bankAccountNumber}</small>` : item.bankName}</td>
                <td style="text-align:center">${item.flow === 'IN' ? 'Masuk' : 'Keluar'}</td>
                <td style="text-align:right">${formatIDR(item.amount)}</td>
            </tr>
        `).join('');

        const html = `
            <html>
                <head>
                    <title>Riwayat Transfer</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
                        h2 { text-align: center; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                    </style>
                </head>
                <body>
                    <h2>Laporan Riwayat Transfer</h2>
                    <p>Periode: ${startDate ? formatDate(startDate) : 'Semua'} - ${endDate ? formatDate(endDate) : 'Semua'}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tanggal</th>
                                <th>ID</th>
                                <th>Tipe</th>
                                <th>Deskripsi</th>
                                <th>Bank/E-Wallet</th>
                                <th>Alur</th>
                                <th>Jumlah</th>
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
                            <ArrowRightLeft className="text-primary" />
                            Riwayat Transfer
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Lacak semua transaksi via Transfer Bank & E-Wallet</p>
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

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
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
                        <label htmlFor="searchTransfer" className="sr-only">Cari Transfer</label>
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            id="searchTransfer"
                            name="searchTransfer"
                            type="text"
                            placeholder="Cari ID, faktur, deskripsi, bank, nomor rekening, atau tipe..."
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

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700">
                    Daftar Transfer ({filteredItems.length})
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="p-4 font-medium">Tanggal & ID</th>
                                <th className="p-4 font-medium">Tipe</th>
                                <th className="p-4 font-medium">Deskripsi</th>
                                <th className="p-4 font-medium">Bank / E-Wallet</th>
                                <th className="p-4 font-medium">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">
                                        Tidak ada data riwayat transfer.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-800">{formatDate(item.date)}</div>
                                            <div className="text-xs text-slate-500">#{item.id.substring(0, 8)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.type === 'TRANSACTION' ? 'bg-blue-100 text-blue-800' :
                                                item.type === 'PURCHASE' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-orange-100 text-orange-800'
                                                }`}>
                                                {item.subType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                                            {item.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <ArrowRightLeft size={14} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800">{item.bankName}</div>
                                                    {item.bankAccountNumber && (
                                                        <div className="text-xs text-slate-500">{item.bankAccountNumber}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${item.flow === 'IN' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            <div className="flex items-center justify-end gap-1">
                                                {item.flow === 'IN' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                {formatIDR(item.amount)}
                                            </div>
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
