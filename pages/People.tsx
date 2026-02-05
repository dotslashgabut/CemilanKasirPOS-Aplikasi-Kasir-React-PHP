import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../hooks/useData';
import { StorageService } from '../services/storage';
import { Customer, Supplier, PriceType, UserRole } from '../types';
import { Plus, Edit2, Trash2, Phone, MapPin, Search, User, Truck, Download, Printer, Upload, X, FileSpreadsheet, Users, Mail, ArrowUpDown } from 'lucide-react';
import { exportToCSV, generateUUID, compressImage } from '../utils';
import * as XLSX from 'xlsx';

export const People: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');
    const customers = useData(() => StorageService.getCustomers(), [], 'customers') || [];
    const suppliers = useData(() => StorageService.getSuppliers(), [], 'suppliers') || [];
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'name_asc' | 'name_desc'>('name_asc');

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
    const [formData, setFormData] = useState<{ name: string, phone: string, address: string, email: string, image: string, defaultPriceType?: PriceType }>({ name: '', phone: '', address: '', email: '', image: '', defaultPriceType: PriceType.RETAIL });



    const handleOpenModal = (data?: Customer | Supplier) => {
        if (data) {
            setEditingId(data.id);
            const isCust = activeTab === 'customers';
            setFormData({
                name: data.name,
                phone: data.phone,
                address: data.address || '',
                email: data.email || '',
                image: data.image || '',
                defaultPriceType: isCust ? (data as Customer).defaultPriceType || PriceType.RETAIL : undefined
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', phone: '', address: '', email: '', image: '', defaultPriceType: PriceType.RETAIL });
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
            email: formData.email,
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressed = await compressImage(file);
                setFormData({ ...formData, image: compressed });
            } catch (error) {
                console.error("Gagal memproses gambar", error);
            }
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFormData({ ...formData, image: '' });
    };

    const handleExport = () => {
        const data = activeTab === 'customers' ? customers : suppliers;
        const filename = activeTab === 'customers' ? 'data-pelanggan.csv' : 'data-supplier.csv';
        const headers = ['ID', 'Nama', 'Telepon', 'Alamat', 'Email', ...(activeTab === 'customers' ? ['Harga Default'] : [])];
        const rows = data.map(d => {
            const row = [d.id, d.name, d.phone, d.address || '', d.email || ''];
            if (activeTab === 'customers') {
                row.push((d as Customer).defaultPriceType || 'ECERAN');
            }
            return row;
        });
        exportToCSV(filename, headers, rows);
    };

    const handleExportExcel = () => {
        const data = activeTab === 'customers' ? customers : suppliers;
        const sheetName = activeTab === 'customers' ? 'Data Pelanggan' : 'Data Supplier';
        const fileNamePrefix = activeTab === 'customers' ? 'Data_Pelanggan' : 'Data_Supplier';

        const exportData = data.map(d => ({
            'ID': d.id,
            'Nama': d.name,
            'Telepon': d.phone,
            'Alamat': d.address || '',
            'Email': d.email || '',
            ...(activeTab === 'customers' ? { 'Harga Default': (d as Customer).defaultPriceType || 'ECERAN' } : {})
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Auto-width
        const max_width = exportData.reduce((w, r) => Math.max(w, r['Nama'].length), 10);
        worksheet['!cols'] = [
            { wch: 15 }, // ID
            { wch: 30 }, // Nama
            { wch: 15 }, // Telepon
            { wch: 40 }, // Alamat
            { wch: 25 }, // Email
            ...(activeTab === 'customers' ? [{ wch: 15 }] : []) // Harga Default
        ];

        XLSX.writeFile(workbook, `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrint = () => {
        const data = activeTab === 'customers' ? customers : suppliers;
        const title = activeTab === 'customers' ? 'Laporan Data Pelanggan' : 'Laporan Data Supplier';
        const isCustomer = activeTab === 'customers';

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const rowsHtml = data.map((item, idx) => `
          <tr>
              <td style="text-align:center">${idx + 1}</td>
              <td>${item.name}</td>
              <td>${item.phone}</td>
              <td>${item.address || '-'}</td>
              <td>${item.email || '-'}</td>
              ${isCustomer ? `<td>${(item as Customer).defaultPriceType || '-'}</td>` : ''}
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
                            <th>Email</th>
                            ${isCustomer ? '<th>Harga Default</th>' : ''}
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

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            let text = event.target?.result as string;

            // Remove BOM if present
            if (text.charCodeAt(0) === 0xFEFF) {
                text = text.slice(1);
            }

            // Split by newline, handling \r\n and \n
            const lines = text.split(/\r?\n/).filter(l => l.trim());

            if (lines.length < 2) {
                alert('Format CSV tidak valid atau kosong.');
                return;
            }

            // Detect Delimiter (priority to semicolon if more common in header)
            const firstLine = lines[0];
            const commaCount = (firstLine.match(/,/g) || []).length;
            const semiCount = (firstLine.match(/;/g) || []).length;
            const delimiter = semiCount > commaCount ? ';' : ',';

            console.log('CSV Import Debug:', { delimiter, firstLine });

            // Parse Headers
            const headers = firstLine.split(delimiter).map(h => h.replace(/"/g, '').trim().toLowerCase());
            console.log('Parsed Headers:', headers);

            // Column Mapping
            const colMap = {
                id: headers.findIndex(h => h === 'id'),
                name: headers.findIndex(h => h.includes('nama') || h.includes('name') || h === 'supplier' || h === 'pelanggan' || h.includes('toko') || h.includes('pemasok')),
                phone: headers.findIndex(h => h.includes('telepon') || h.includes('phone') || h.includes('hp') || h.includes('telp') || h.includes('wa')),
                address: headers.findIndex(h => h.includes('alamat') || h.includes('address') || h.includes('lokasi')),
                email: headers.findIndex(h => h.includes('email') || h.includes('e-mail') || h.includes('surat') || h.includes('mail')),
                priceType: headers.findIndex(h => h.includes('harga') || h.includes('price') || h.includes('tipe') || h.includes('level'))
            };

            console.log('Column Map:', colMap);

            // Basic Validation
            if (colMap.name === -1) {
                alert(`Kolom "Nama" tidak ditemukan dalam CSV (Delimiter: "${delimiter}", Header: "${headers.join(', ')}"). Pastikan ada kolom nama/name/supplier.`);
                return;
            }

            const newItems: any[] = [];

            // Skip header, start from 1
            for (let i = 1; i < lines.length; i++) {
                // Robust CSV split handling quoted fields
                const rowLine = lines[i];
                const cols: string[] = [];
                let current = '';
                let inQuote = false;

                for (let j = 0; j < rowLine.length; j++) {
                    const char = rowLine[j];
                    if (char === '"') {
                        inQuote = !inQuote;
                        current += char;
                    } else if (char === delimiter && !inQuote) {
                        cols.push(current);
                        current = '';
                    } else {
                        current += char;
                    }
                }
                cols.push(current);

                if (cols.length < headers.length && cols.length === 1 && cols[0] === '') continue; // Skip empty rows

                const getValue = (index: number) => {
                    if (index === -1) return '';
                    let val = cols[index]?.trim() || '';
                    // Remove surrounding quotes if present and unescape double quotes
                    if (val.startsWith('"') && val.endsWith('"')) {
                        val = val.slice(1, -1).replace(/""/g, '"');
                    } else {
                        val = val.replace(/"/g, ''); // Fallback cleanup
                    }
                    return val;
                };

                const existingId = getValue(colMap.id);

                const item: any = {
                    id: existingId || generateUUID(),
                    name: getValue(colMap.name),
                    phone: getValue(colMap.phone),
                    address: getValue(colMap.address),
                    email: getValue(colMap.email),
                    image: ''
                };

                if (activeTab === 'customers') {
                    // Default Price Type mapping
                    let priceType = PriceType.RETAIL;
                    const rawPriceType = getValue(colMap.priceType).toUpperCase();
                    if (Object.values(PriceType).includes(rawPriceType as PriceType)) {
                        priceType = rawPriceType as PriceType;
                    }
                    item.defaultPriceType = priceType;
                    newItems.push(item as Customer);
                } else {
                    newItems.push(item as Supplier);
                }
            }

            if (newItems.length > 0) {
                if (activeTab === 'customers') {
                    StorageService.saveCustomersBulk(newItems as Customer[])
                        .then(() => {
                            alert(`Berhasil memproses ${newItems.length} pelanggan (Tambah/Update).`);
                            window.location.reload();
                        })
                        .catch(err => {
                            console.error(err);
                            alert('Gagal menyimpan data pelanggan: ' + err.message);
                        });
                } else {
                    StorageService.saveSuppliersBulk(newItems as Supplier[])
                        .then(() => {
                            alert(`Berhasil memproses ${newItems.length} supplier (Tambah/Update).`);
                            window.location.reload();
                        })
                        .catch(err => {
                            console.error(err);
                            alert('Gagal menyimpan data supplier: ' + err.message);
                        });
                }
            } else {
                alert('Tidak ada data yang dapat diproses.');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input
    };

    const dataList = activeTab === 'customers' ? customers : suppliers;
    const filteredList = useMemo(() => {
        const filtered = dataList.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.phone.includes(search) ||
            (item.email && item.email.toLowerCase().includes(search.toLowerCase())) ||
            (item.address && item.address.toLowerCase().includes(search.toLowerCase()))
        );

        return filtered.sort((a, b) => {
            if (sortOrder === 'name_asc') return a.name.localeCompare(b.name);
            if (sortOrder === 'name_desc') return b.name.localeCompare(a.name);
            return 0;
        });
    }, [dataList, search, sortOrder]);

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
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Users className="text-primary" />
                    Daftar Kontak
                </h2>
                <p className="text-slate-500 text-sm mt-1">Kelola data pelanggan dan supplier.</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'customers' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <User size={16} /> Pelanggan
                    </button>
                    <button
                        onClick={() => setActiveTab('suppliers')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'suppliers' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Truck size={16} /> Supplier
                    </button>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <label htmlFor="peopleSearch" className="sr-only">Cari Kontak</label>
                        <input
                            id="peopleSearch"
                            name="peopleSearch"
                            type="text"
                            placeholder="Cari nama / HP / Email / Alamat..."
                            className="pl-10 pr-10 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-white w-full"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1"
                                title="Hapus pencarian"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <label htmlFor="peopleSort" className="sr-only">Urutkan</label>
                        <select
                            id="peopleSort"
                            name="peopleSort"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as any)}
                            className="pl-10 pr-8 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-primary bg-white text-slate-700 appearance-none cursor-pointer hover:bg-slate-50 h-[42px]"
                        >
                            <option value="name_asc">A-Z</option>
                            <option value="name_desc">Z-A</option>
                        </select>
                    </div>
                    {/* Hide Import CSV for Cashier and Admin */}
                    {['CASHIER', 'ADMIN'].indexOf((JSON.parse(localStorage.getItem('pos_current_user') || '{}') as any).role) === -1 && (
                        <label className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-50 cursor-pointer">
                            <Upload size={18} /> <span className="hidden md:inline">CSV</span>
                            <input id="csvImport" name="csvImport" type="file" accept=".csv" className="hidden" onChange={handleImport} />
                        </label>
                    )}
                    <button onClick={handleExportExcel} className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-green-100">
                        <FileSpreadsheet size={18} /> <span className="hidden md:inline">Excel</span>
                    </button>
                    <button onClick={handleExport} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-50">
                        <Download size={18} /> <span className="hidden md:inline">CSV</span>
                    </button>
                    <button onClick={handlePrint} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-slate-50">
                        <Printer size={18} /> <span className="hidden md:inline">Print</span>
                    </button>
                    <button onClick={() => handleOpenModal()} className="bg-primary text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:bg-primary/90">
                        <Plus size={18} />
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
                    <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-primary/50 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-100 flex-shrink-0">
                                    {item.image ? (
                                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                    ) : (
                                        <div className={`w-full h-full flex items-center justify-center text-lg font-bold ${activeTab === 'customers' ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-600'}`}>
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
                                <button onClick={() => handleOpenModal(item)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Edit2 size={16} /></button>
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
                            {item.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={14} className="text-slate-400" />
                                    <span className="line-clamp-1">{item.email}</span>
                                </div>
                            )}
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
                            <div className="flex justify-center mb-4 relative">
                                <label className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-primary overflow-hidden group">
                                    {formData.image ? (
                                        <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <Upload className="text-slate-400 group-hover:text-primary" />
                                    )}
                                    <input id="imageUpload" name="imageUpload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity text-white text-xs ${formData.image ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}>
                                        Ubah Foto
                                    </div>
                                </label>
                                {formData.image && (
                                    <button
                                        onClick={handleRemoveImage}
                                        className="absolute -top-1 -right-1 md:right-auto md:left-2/3 bg-white text-red-600 p-1.5 rounded-full shadow-md border border-slate-200 hover:bg-red-50 z-10"
                                        title="Hapus Foto"
                                        type="button"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Toko Berkah"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">No. Telepon / HP</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    autoComplete="tel"
                                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    value={formData.phone}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setFormData({ ...formData, phone: val });
                                    }}
                                    placeholder="0812..."
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="nama@email.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    autoComplete="street-address"
                                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    rows={2}
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            {activeTab === 'customers' && (
                                <div>
                                    <label htmlFor="priceType" className="block text-sm font-medium text-slate-700 mb-1">Kategori Harga Default</label>
                                    <select
                                        id="priceType"
                                        name="priceType"
                                        className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
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
                                <button onClick={handleSave} className="flex-1 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90">Simpan</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};