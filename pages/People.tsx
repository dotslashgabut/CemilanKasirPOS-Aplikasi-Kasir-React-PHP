import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../hooks/useData';
import { StorageService } from '../services/storage';
import { Customer, Supplier, PriceType } from '../types';
import { Plus, Edit2, Trash2, Phone, MapPin, Search, User, Truck, Download, Printer, Upload, X } from 'lucide-react';
import { exportToCSV } from '../utils';

export const People: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
    const customers = useData(() => StorageService.getCustomers(), [], 'customers') || [];
    const suppliers = useData(() => StorageService.getSuppliers(), [], 'suppliers') || [];
    const [search, setSearch] = useState('');

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(20);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Reset pagination on tab/search change
    useEffect(() => {
        setVisibleCount(20);
    }, [activeTab, search]);

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<{ name: string, phone: string, address: string, image: string, defaultPriceType?: PriceType }>({ name: '', phone: '', address: '', image: '', defaultPriceType: PriceType.RETAIL });



    const handleOpenModal = (data?: Customer | Supplier) => {
        if (data) {
            setEditingId(data.id);
            const isCust = activeTab === 'customers';
            setFormData({
                name: data.name,
                phone: data.phone,
                address: data.address || '',
                image: data.image || '',
                defaultPriceType: isCust ? (data as Customer).defaultPriceType || PriceType.RETAIL : undefined
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', phone: '', address: '', image: '', defaultPriceType: PriceType.RETAIL });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) return;

        const payload = {
            id: editingId || undefined,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            image: formData.image,
            defaultPriceType: activeTab === 'customers' ? formData.defaultPriceType : undefined
        };

        if (activeTab === 'customers') {
            await StorageService.saveCustomer(payload as Customer);
        } else {
            await StorageService.saveSupplier(payload as Supplier);
        }

        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin hapus kontak ini?')) return;

        if (activeTab === 'customers') {
            await StorageService.deleteCustomer(id);
        } else {
            await StorageService.deleteSupplier(id);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExport = () => {
        const data = activeTab === 'customers' ? customers : suppliers;
        const filename = activeTab === 'customers' ? 'data-pelanggan.csv' : 'data-supplier.csv';
        const headers = ['ID', 'Nama', 'Telepon', 'Alamat', ...(activeTab === 'customers' ? ['Harga Default'] : [])];
        const rows = data.map(d => [
            d.id, d.name, d.phone, d.address || '',
            activeTab === 'customers' ? (d as Customer).defaultPriceType || 'ECERAN' : ''
        ]);
        exportToCSV(filename, headers, rows);
    };

    const handlePrint = () => {
        const data = activeTab === 'customers' ? customers : suppliers;
        const title = activeTab === 'customers' ? 'Laporan Data Pelanggan' : 'Laporan Data Supplier';

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const rowsHtml = data.map((item, idx) => `
          <tr>
              <td style="text-align:center">${idx + 1}</td>
              <td>${item.name}</td>
              <td>${item.phone}</td>
              <td>${item.address || '-'}</td>
          </tr>
      `).join('');

        printWindow.document.write(`
          <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #000; padding: 8px; font-size: 12px; }
                    th { background-color: #f0f0f0; }
                    h2 { text-align: center; margin-bottom: 5px; }
                    .date { text-align: center; font-size: 12px; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <h2>${title}</h2>
                <p class="date">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px">No</th>
                            <th>Nama</th>
                            <th>Telepon</th>
                            <th>Alamat</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
                <script>window.print();</script>
            </body>
          </html>
      `);
        printWindow.document.close();
    };

    const dataList = activeTab === 'customers' ? customers : suppliers;
    const filteredList = useMemo(() => dataList.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.phone.includes(search)
    ), [dataList, search]);

    const visibleList = useMemo(() => filteredList.slice(0, visibleCount), [filteredList, visibleCount]);

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
    }, [loadMoreRef.current, filteredList]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Daftar Kontak</h2>
                <p className="text-slate-500">Kelola data pelanggan dan supplier.</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'customers' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <User size={16} /> Pelanggan
                    </button>
                    <button
                        onClick={() => setActiveTab('suppliers')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'suppliers' ? 'bg-white shadow text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Truck size={16} /> Supplier
                    </button>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama / HP..."
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 bg-white w-full"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={handleExport} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-50">
                        <Download size={18} /> <span className="hidden md:inline">Export</span>
                    </button>
                    <button onClick={handlePrint} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-50">
                        <Printer size={18} /> <span className="hidden md:inline">Print</span>
                    </button>
                    <button onClick={() => handleOpenModal()} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:bg-slate-800">
                        <Plus size={18} /> Tambah
                    </button>
                </div>
            </div>

            {/* Card View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredList.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                        Tidak ada data kontak ditemukan.
                    </div>
                )}
                {visibleList.map(item => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100 flex-shrink-0">
                                    {item.image ? (
                                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${activeTab === 'customers' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {item.name.substring(0, 1).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                                    <span className="text-xs text-slate-400 px-2 py-0.5 bg-slate-50 rounded-full">{activeTab === 'customers' ? 'Pelanggan' : 'Supplier'}</span>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-slate-400" />
                                <span>{item.phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-slate-400" />
                                <span className="line-clamp-1">{item.address || '-'}</span>
                            </div>
                            {activeTab === 'customers' && (item as Customer).defaultPriceType && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                        Harga: {(item as Customer).defaultPriceType}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {visibleList.length < filteredList.length && (
                    <div className="col-span-full text-center py-4 text-slate-400">
                        <div ref={loadMoreRef}>Loading more...</div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xl text-slate-800">
                                {editingId ? 'Edit' : 'Tambah'} {activeTab === 'customers' ? 'Pelanggan' : 'Supplier'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-center mb-4">
                                <label className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden group">
                                    {formData.image ? (
                                        <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <Upload className="text-slate-400 group-hover:text-blue-500" />
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                                        Ubah Foto
                                    </div>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Toko Berkah"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">No. Telepon / HP</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setFormData({ ...formData, phone: val });
                                    }}
                                    placeholder="0812..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                                <textarea
                                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={3}
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            {activeTab === 'customers' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Harga Default</label>
                                    <select
                                        className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        value={formData.defaultPriceType}
                                        onChange={e => setFormData({ ...formData, defaultPriceType: e.target.value as PriceType })}
                                    >
                                        <option value={PriceType.RETAIL}>Eceran (Retail)</option>
                                        <option value={PriceType.GENERAL}>Umum</option>
                                        <option value={PriceType.WHOLESALE}>Grosir</option>
                                        <option value={PriceType.PROMO}>Promo</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Kategori harga ini akan otomatis terpilih saat pelanggan ini dipilih di kasir.</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium">Batal</button>
                                <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Simpan</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};