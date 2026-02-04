import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { StorageService } from '../services/storage';
import { Product, StockAdjustment, User } from '../types';
import { formatDate, generateUUID, formatIDR, exportToCSV } from '../utils';
import { Search, Filter, RotateCcw, Save, Package, TrendingUp, TrendingDown, FileText, Printer, Download, FileSpreadsheet, Calendar, X } from 'lucide-react';
import * as XLSX from 'xlsx';

interface RealStockCheckProps {
    currentUser: User | null;
}

export const RealStockCheck: React.FC<RealStockCheckProps> = ({ currentUser }) => {
    // Data Loading
    const products = useData(() => StorageService.getProducts(), [], 'products') || [];
    const stockAdjustments = useData(() => StorageService.getStockAdjustments(), [], 'stock_adjustments') || [];

    // Form State
    const [selectedProductId, setSelectedProductId] = useState('');
    const [adjustmentType, setAdjustmentType] = useState<'INCREASE' | 'DECREASE'>('DECREASE'); // Default decrease (loss/damage is common)
    const [reason, setReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [qty, setQty] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New State for Input Mode
    const [inputMode, setInputMode] = useState<'MANUAL' | 'FINAL'>('MANUAL');
    const [finalStockInput, setFinalStockInput] = useState('');

    // Product Search State
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

    // Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Derived Data
    const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);

    // Constant Reasons
    const REDUCTION_REASONS = ['Kadaluarsa', 'Hilang', 'Rusak', 'Retur Manual', 'Hadiah', 'Pengecekan Manual', 'Lain-lain'];
    const ADDITION_REASONS = ['Hadiah', 'Retur Manual', 'Pengecekan Manual', 'Lain-lain'];

    // Sort Adjustments (Newest First)
    const sortedAdjustments = useMemo(() => {
        let items = [...stockAdjustments];

        // Date Filter
        if (startDate || endDate) {
            items = items.filter(item => {
                const itemDateStr = new Date(item.date).toISOString().split('T')[0];
                if (startDate && itemDateStr < startDate) return false;
                if (endDate && itemDateStr > endDate) return false;
                return true;
            });
        }

        // Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.productName?.toLowerCase().includes(q) ||
                item.reason.toLowerCase().includes(q) ||
                item.note?.toLowerCase().includes(q) ||
                item.userName?.toLowerCase().includes(q)
            );
        }

        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [stockAdjustments, startDate, endDate, searchQuery]);

    // Effect to calculate qty and type when in FINAL mode
    useEffect(() => {
        if (inputMode === 'FINAL' && selectedProduct && finalStockInput !== '') {
            const finalStock = parseInt(finalStockInput);
            if (!isNaN(finalStock)) {
                const diff = finalStock - selectedProduct.stock;
                if (diff > 0) {
                    setAdjustmentType('INCREASE');
                    setQty(diff.toString());
                } else if (diff < 0) {
                    setAdjustmentType('DECREASE');
                    setQty(Math.abs(diff).toString());
                } else {
                    setQty('0');
                }
            } else {
                setQty('');
            }
        }
    }, [inputMode, finalStockInput, selectedProduct]);

    // Effect to reset final stock input when product changes
    useEffect(() => {
        setFinalStockInput('');
        setQty('');
    }, [selectedProductId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !qty || !reason) return;

        const quantity = parseInt(qty);
        if (isNaN(quantity) || quantity <= 0) {
            alert("Jumlah harus angka positif.");
            return;
        }

        if (adjustmentType === 'DECREASE' && quantity > selectedProduct.stock) {
            alert("Stok tidak mencukupi untuk pengurangan ini.");
            return;
        }

        const finalReason = reason === 'Lain-lain' ? (customReason || 'Lain-lain') : reason;

        setIsSubmitting(true);
        try {
            const adjustment: StockAdjustment = {
                id: generateUUID(),
                date: new Date().toISOString(),
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                type: adjustmentType,
                reason: finalReason,
                qty: quantity,
                note: note,
                userId: currentUser?.id,
                userName: currentUser?.name
            };

            await StorageService.addStockAdjustment(adjustment);

            // Update Product Stock (Backend handles this now)
            // But we need to refresh local data
            // const updatedProduct = { ...selectedProduct };
            // if (adjustmentType === 'INCREASE') {
            //     updatedProduct.stock += quantity;
            // } else {
            //     updatedProduct.stock -= quantity;
            // }
            // await StorageService.saveProduct(updatedProduct);

            // Notify listeners handled in storage service

            // Reset Form
            // Reset Form
            setQty('');
            setNote('');
            setReason('');
            setCustomReason('');
            setFinalStockInput('');
            setReason('');
            setCustomReason('');
            setProductSearchTerm('');
            setSelectedProductId('');
            setIsProductDropdownOpen(false);

            alert('Stok berhasil diperbarui.');
        } catch (error) {
            console.error(error);
            alert('Gagal menyimpan data.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExportExcel = () => {
        const data = sortedAdjustments.map(item => ({
            'Tanggal': new Date(item.date).toLocaleDateString('id-ID'),
            'Jam': new Date(item.date).toLocaleTimeString('id-ID'),
            'Produk': item.productName,
            'Tipe': item.type === 'INCREASE' ? 'Penambahan' : 'Pengurangan',
            'Alasan': item.reason,
            'Stok Awal': item.previousStock ?? '-',
            'Qty': item.qty,
            'Stok Akhir': item.currentStock ?? '-',
            'User': item.userName,
            'Catatan': item.note
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Stok Adjustments");
        XLSX.writeFile(workbook, `Cek_Stok_Real_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const rows = sortedAdjustments.map((item, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${new Date(item.date).toLocaleString('id-ID')}</td>
                <td>${item.productName}</td>
                <td style="color: ${item.type === 'INCREASE' ? 'green' : 'red'}">${item.type === 'INCREASE' ? 'TAMBAH' : 'KURANG'}</td>
                <td>${item.reason}</td>
                <td>${item.previousStock ?? '-'}</td>
                <td>${item.qty}</td>
                <td>${item.currentStock ?? '-'}</td>
                <td>${item.userName || '-'}</td>
                <td>${item.note || '-'}</td>
            </tr>
        `).join('');

        const html = `
            <html>
                <head>
                    <title>Laporan Cek Stok Real</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        h2 { text-align: center; }
                    </style>
                </head>
                <body>
                    <h2>Laporan Riwayat Cek Stok Real</h2>
                    <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Waktu</th>
                                <th>Produk</th>
                                <th>Tipe</th>
                                <th>Alasan</th>
                                <th>Stok Awal</th>
                                <th>Qty</th>
                                <th>Stok Akhir</th>
                                <th>User</th>
                                <th>Ket</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <script>window.print();</script>
                </body>
            </html>
        `;
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6 animate-fade-in p-2 md:p-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Package className="text-primary" />
                        Pengecekan Stok Real
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Kelola penyesuaian stok fisik (opname) dan riwayatnya.</p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button onClick={handlePrint} className="flex-1 md:flex-none items-center justify-center gap-2 bg-white border border-slate-300 px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 transition-all flex text-sm font-medium">
                        <Printer size={18} /> Print
                    </button>
                    <button onClick={handleExportExcel} className="flex-1 md:flex-none items-center justify-center gap-2 bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl text-green-700 hover:bg-green-100 transition-all flex text-sm font-medium">
                        <FileSpreadsheet size={18} /> Excel
                    </button>
                </div>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <FileText size={18} className="text-primary" />
                    Input Penyesuaian Stok
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Selection (Searchable) */}
                    <div className="relative">
                        <label htmlFor="productSearchInput" className="block text-sm font-medium text-slate-700 mb-2">Pilih Produk (Ketik untuk mencari)</label>
                        <div className="relative">
                            <input
                                id="productSearchInput"
                                name="productSearchInput"
                                type="text"
                                className="w-full px-4 py-3 pl-11 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Ketik nama produk..."
                                value={productSearchTerm}
                                onChange={(e) => {
                                    setProductSearchTerm(e.target.value);
                                    setIsProductDropdownOpen(true);
                                    if (e.target.value === '') {
                                        setSelectedProductId('');
                                    }
                                }}
                                onFocus={() => setIsProductDropdownOpen(true)}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />

                            {/* Clear Button */}
                            {productSearchTerm && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProductSearchTerm('');
                                        setSelectedProductId('');
                                        setQty('');
                                        setIsProductDropdownOpen(true);
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Dropdown List */}
                        {isProductDropdownOpen && (
                            <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                                {products
                                    .filter(p => !productSearchTerm || p.name.toLowerCase().includes(productSearchTerm.toLowerCase()))
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .length === 0 ? (
                                    <div className="p-4 text-center text-slate-500 text-sm">Produk tidak ditemukan.</div>
                                ) : (
                                    products
                                        .filter(p => !productSearchTerm || p.name.toLowerCase().includes(productSearchTerm.toLowerCase()))
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedProductId(p.id);
                                                    setProductSearchTerm(p.name);
                                                    setIsProductDropdownOpen(false);
                                                    setQty('');
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex justify-between items-center group"
                                            >
                                                <div>
                                                    <span className="font-medium text-slate-700 group-hover:text-primary transition-colors">{p.name}</span>
                                                    <div className="text-xs text-slate-400">{p.unit ? `Unit: ${p.unit}` : ''}</div>
                                                </div>
                                                <div className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-500 font-bold group-hover:bg-primary/10 group-hover:text-primary">
                                                    Stok: {p.stock}
                                                </div>
                                            </button>
                                        ))
                                )
                                }
                            </div>
                        )}

                        {/* Overlay to close dropdown when clicking outside */}
                        {isProductDropdownOpen && (
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsProductDropdownOpen(false)}
                            ></div>
                        )}
                    </div>

                    {selectedProduct && (
                        <div className="flex flex-col md:flex-row gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            {/* Product Info */}
                            <div className="flex items-start gap-4 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
                                <div className="w-24 h-24 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {selectedProduct.image ? (
                                        <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="text-slate-300" size={32} />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 line-clamp-2">{selectedProduct.name}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{selectedProduct.categoryName}</p>
                                    <div className="mt-3 inline-flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                                        <span className="text-xs text-slate-500">Stok Sekarang:</span>
                                        <span className="font-bold text-lg text-primary">{selectedProduct.stock}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Metode Input</label>
                                    <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-fit">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setInputMode('MANUAL');
                                                setQty('');
                                                setReason('');
                                            }}
                                            className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all ${inputMode === 'MANUAL' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Selisih Manual
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setInputMode('FINAL');
                                                setFinalStockInput('');
                                                setQty('');
                                                setReason('');
                                            }}
                                            className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all ${inputMode === 'FINAL' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Stok Opname
                                        </button>
                                    </div>
                                </div>

                                {inputMode === 'MANUAL' ? (
                                    <>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Jenis Perubahan</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setAdjustmentType('DECREASE')}
                                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${adjustmentType === 'DECREASE'
                                                        ? 'bg-red-100 text-red-700 border-2 border-red-200'
                                                        : 'bg-white border-2 border-slate-200 text-slate-500 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <TrendingDown size={16} /> Pengurangan
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setAdjustmentType('INCREASE')}
                                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${adjustmentType === 'INCREASE'
                                                        ? 'bg-green-100 text-green-700 border-2 border-green-200'
                                                        : 'bg-white border-2 border-slate-200 text-slate-500 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <TrendingUp size={16} /> Penambahan
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="manualQty" className="block text-xs font-semibold text-slate-500 uppercase mb-1">Jumlah (Qty)</label>
                                            <input
                                                id="manualQty"
                                                name="manualQty"
                                                type="number"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary outline-none font-bold"
                                                placeholder="0"
                                                min="1"
                                                value={qty}
                                                onChange={e => setQty(e.target.value)}
                                                required
                                            />
                                            {adjustmentType === 'DECREASE' && qty && parseInt(qty) > selectedProduct.stock && (
                                                <p className="text-red-500 text-xs mt-1">* Melebihi stok saat ini</p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="finalStock" className="block text-xs font-semibold text-slate-500 uppercase mb-1">Stok Akhir Fisik</label>
                                            <input
                                                id="finalStock"
                                                name="finalStock"
                                                type="number"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-primary outline-none font-bold text-lg"
                                                placeholder={selectedProduct.stock.toString()}
                                                min="0"
                                                value={finalStockInput}
                                                onChange={e => setFinalStockInput(e.target.value)}
                                                required
                                            />
                                            <p className="text-slate-400 text-xs mt-1">
                                                Stok saat ini: <span className="font-bold">{selectedProduct.stock}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center">
                                            {finalStockInput !== '' && !isNaN(parseInt(finalStockInput)) && parseInt(qty) > 0 ? (
                                                <div className={`w-full p-3 rounded-xl border flex items-center gap-3 ${adjustmentType === 'INCREASE'
                                                    ? 'bg-green-50 border-green-200 text-green-700'
                                                    : 'bg-red-50 border-red-200 text-red-700'
                                                    }`}>
                                                    <div className={`p-2 rounded-full ${adjustmentType === 'INCREASE' ? 'bg-green-200' : 'bg-red-200'
                                                        }`}>
                                                        {adjustmentType === 'INCREASE' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg">
                                                            {adjustmentType === 'INCREASE' ? '+' : '-'}{qty} Unit
                                                        </div>
                                                        <div className="text-xs opacity-80">
                                                            Otomatis terhitung sebagai {adjustmentType === 'INCREASE' ? 'Penambahan' : 'Pengurangan'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : finalStockInput !== '' && parseInt(finalStockInput) === selectedProduct.stock ? (
                                                <div className="w-full p-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-500 flex items-center gap-3">
                                                    <div className="p-2 rounded-full bg-slate-200">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm">Tidak ada perubahan</div>
                                                        <div className="text-xs">Stok akhir sama dengan stok sistem.</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full p-3 rounded-xl border bg-slate-50 border-dashed border-slate-300 text-slate-400 flex items-center justify-center text-sm">
                                                    Masukkan stok akhir untuk melihat kalkulasi
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="stockReason" className="block text-xs font-semibold text-slate-500 uppercase mb-1">Alasan</label>
                                    <select
                                        id="stockReason"
                                        name="stockReason"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary outline-none"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Alasan --</option>
                                        {(adjustmentType === 'DECREASE' ? REDUCTION_REASONS : ADDITION_REASONS).map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                    {reason === 'Lain-lain' && (
                                        <>
                                            <label htmlFor="customReason" className="sr-only">Alasan Lain</label>
                                            <input
                                                id="customReason"
                                                name="customReason"
                                                type="text"
                                                className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                placeholder="Tulis alasan spesifik..."
                                                value={customReason}
                                                onChange={e => setCustomReason(e.target.value)}
                                                required
                                            />
                                        </>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="stockNote" className="block text-xs font-semibold text-slate-500 uppercase mb-1">Catatan (Opsional)</label>
                                    <textarea
                                        id="stockNote"
                                        name="stockNote"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-primary outline-none h-[42px] min-h-[42px] resize-none"
                                        placeholder="Keterangan tambahan..."
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedProduct || !qty || !reason}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        >
                            <Save size={18} />
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 justify-between items-center">
                    <h3 className="font-bold text-slate-800">Riwayat Penyesuaian</h3>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex items-center bg-white border border-slate-300 rounded-lg px-2 py-1.5">
                            <label htmlFor="filterStartDate" className="sr-only">Tanggal Mulai</label>
                            <input
                                id="filterStartDate"
                                name="filterStartDate"
                                type="date"
                                className="text-sm outline-none text-slate-600"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                            <span className="mx-2 text-slate-400">-</span>
                            <label htmlFor="filterEndDate" className="sr-only">Tanggal Akhir</label>
                            <input
                                id="filterEndDate"
                                name="filterEndDate"
                                type="date"
                                className="text-sm outline-none text-slate-600"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <label htmlFor="searchHistory" className="sr-only">Cari Riwayat</label>
                            <input
                                id="searchHistory"
                                name="searchHistory"
                                type="text"
                                placeholder="Cari..."
                                className="pl-9 pr-8 py-1.5 border border-slate-300 rounded-lg text-sm focus:border-primary outline-none"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); setSearchQuery(''); }}
                            className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                            title="Reset Filter"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">Produk</th>
                                <th className="p-4">Tipe</th>
                                <th className="p-4">Alasan</th>
                                <th className="p-4 text-center">Stok Awal</th>
                                <th className="p-4 text-center">Qty</th>
                                <th className="p-4 text-center">Stok Akhir</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedAdjustments.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400">Belum ada riwayat penyesuaian stok.</td>
                                </tr>
                            )}
                            {sortedAdjustments.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-slate-600">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900">{new Date(item.date).toLocaleDateString('id-ID')}</span>
                                            <span className="text-xs text-slate-400">{new Date(item.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-800">{item.productName}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.type === 'INCREASE'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {item.type === 'INCREASE' ? 'PENAMBAHAN' : 'PENGURANGAN'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-700">{item.reason}</td>
                                    <td className="p-4 text-center text-slate-500">{item.previousStock ?? '-'}</td>
                                    <td className="p-4 text-center font-bold text-slate-800">{item.qty}</td>
                                    <td className="p-4 text-center font-bold text-primary">{item.currentStock ?? '-'}</td>
                                    <td className="p-4 text-slate-600 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                            {item.userName?.charAt(0) || '?'}
                                        </div>
                                        {item.userName}
                                    </td>
                                    <td className="p-4 text-slate-500 italic max-w-xs truncate" title={item.note}>{item.note || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
