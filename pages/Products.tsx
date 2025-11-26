import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../hooks/useData';
import { StorageService } from '../services/storage';
import { Product, Category, UserRole } from '../types';
import { formatIDR, exportToCSV, generateSKU } from '../utils';
import { Edit2, Trash2, Plus, X, Download, Upload, Tag, Barcode, Image as ImageIcon, Search, Printer, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const Products: React.FC = () => {
  const products = useData(() => StorageService.getProducts(), [], 'products') || [];
  const categories = useData(() => StorageService.getCategories(), [], 'categories') || [];

  // Filters
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Sort State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Pagination State
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 200;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryFormName, setCategoryFormName] = useState('');

  // Product Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', sku: '', stock: 0, hpp: 0, priceRetail: 0, priceGeneral: 0, priceWholesale: 0, pricePromo: 0, categoryId: '', categoryName: '', image: ''
  });



  // --- PRODUCT ACTIONS ---

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.priceRetail) {
      alert("Nama produk dan harga eceran wajib diisi!");
      return;
    }
    if (!formData.sku) {
      alert("SKU wajib diisi! Silakan scan barcode atau gunakan tombol generate.");
      return;
    }

    const selectedCat = categories.find(c => c.id === formData.categoryId);

    const payload = {
      ...formData,
      id: editingId || undefined,
      categoryName: selectedCat?.name || 'Umum',
      categoryId: formData.categoryId || '',
      image: formData.image || ''
    } as Product;

    await StorageService.saveProduct(payload);
    setIsProductModalOpen(false);
    setEditingId(null);
    resetProductForm();
  };

  const handleEditProduct = (p: Product) => {
    setFormData(p);
    setEditingId(p.id);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Yakin hapus produk ini?')) {
      await StorageService.deleteProduct(id);
    }
  };

  const handleGenerateCode = () => {
    setFormData({ ...formData, sku: generateSKU() });
  };

  const resetProductForm = () => {
    setFormData({ name: '', sku: '', stock: 0, hpp: 0, priceRetail: 0, priceGeneral: 0, priceWholesale: 0, pricePromo: 0, categoryId: '', categoryName: '', image: '' });
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

  // Helper for numeric input
  const handleNumericInput = (key: keyof Product, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, [key]: parseInt(numericValue) || 0 });
  };

  // --- CATEGORY ACTIONS ---

  const handleSaveCategory = async () => {
    if (!categoryFormName) return;
    await StorageService.saveCategory({ id: editingId || '', name: categoryFormName });
    setCategoryFormName('');
    setEditingId(null);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Yakin hapus kategori? Produk dalam kategori ini akan tetap ada namun tanpa kategori.')) {
      await StorageService.deleteCategory(id);
    }
  };

  // --- SORTING ---
  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key && current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown size={14} className="ml-1 text-slate-400 inline" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={14} className="ml-1 text-blue-600 inline" />
      : <ArrowDown size={14} className="ml-1 text-blue-600 inline" />;
  };

  // --- IMPORT / EXPORT ---

  const handleExport = () => {
    const headers = ['ID', 'Nama Produk', 'SKU', 'Kategori', 'Stok', 'HPP', 'Harga Eceran', 'Harga Umum', 'Harga Grosir', 'Harga Promo'];
    const rows = products.map(p => [
      p.id, p.name, p.sku, p.categoryName, p.stock, p.hpp, p.priceRetail, p.priceGeneral, p.priceWholesale, p.pricePromo || 0
    ]);
    exportToCSV(`produk-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentUser = JSON.parse(localStorage.getItem('pos_current_user') || '{}');
    const isCashier = currentUser.role === UserRole.CASHIER;

    const rows = filteredProducts.map(p => `
      <tr>
        <td>${p.name}</td>
        <td style="font-family: monospace; font-size: 11px;">${p.sku}</td>
        <td>${p.categoryName}</td>
        <td style="text-align: center;">${p.stock}</td>
        ${!isCashier ? `<td style="text-align: right;">${formatIDR(p.hpp || 0)}</td>` : ''}
        <td style="text-align: right;">
          <div style="font-size: 11px;">
            <div style="color: #1d4ed8; font-weight: bold;">E: ${formatIDR(p.priceRetail)}</div>
            <div>U: ${formatIDR(p.priceGeneral)}</div>
            <div style="color: #64748b;">G: ${formatIDR(p.priceWholesale)}</div>
            ${p.pricePromo ? `<div style="color: #dc2626; font-weight: bold;">P: ${formatIDR(p.pricePromo)}</div>` : ''}
          </div>
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Daftar Produk</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h2 { text-align: center; margin-bottom: 5px; }
            .subtitle { text-align: center; color: #666; font-size: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 8px; font-size: 12px; }
            th { background-color: #eee; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Daftar Produk</h2>
          <p class="subtitle">Total: ${filteredProducts.length} produk${filterCategory !== 'ALL' ? ` - Kategori: ${categories.find(c => c.id === filterCategory)?.name || 'Semua'}` : ''}</p>
          <table>
            <thead>
              <tr>
                <th>Nama Produk</th>
                <th>SKU</th>
                <th>Kategori</th>
                <th>Stok</th>
                ${!isCashier ? '<th>HPP (Modal)</th>' : ''}
                <th>Harga Jual</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
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
      const text = event.target?.result as string;
      const lines = text.split('\n');
      // Skip header, start from 1
      const newProducts: Product[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length < 4) continue; // Basic validation

        // Expected CSV Format: Name,SKU,CategoryName,Stock,HPP,PriceRetail,PriceGeneral,PriceWholesale
        // Note: This is a basic parser, does not handle commas inside quotes perfectly
        newProducts.push({
          id: generateSKU(), // Generate new IDs
          name: cols[0]?.replace(/"/g, '') || 'Imported Item',
          sku: cols[1]?.replace(/"/g, '') || generateSKU(),
          categoryId: '', // Needs manual assignment or complex matching
          categoryName: cols[2]?.replace(/"/g, '') || 'Import',
          stock: parseInt(cols[3]) || 0,
          hpp: parseInt(cols[4]) || 0,
          priceRetail: parseInt(cols[5]) || 0,
          priceGeneral: parseInt(cols[6]) || 0,
          priceWholesale: parseInt(cols[7]) || 0,
          pricePromo: parseInt(cols[8]) || 0,
          image: ''
        });
      }

      if (newProducts.length > 0) {
        StorageService.saveProductsBulk(newProducts).then(() => {
          alert(`Berhasil import ${newProducts.length} produk.`);
        });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // --- RENDER ---
  // --- RENDER ---
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => filterCategory === 'ALL' || p.categoryId === filterCategory)
      .filter(p => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.categoryName.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (!sortConfig) return 0;

        let aVal: any = a[sortConfig.key as keyof Product];
        let bVal: any = b[sortConfig.key as keyof Product];

        // Handle numeric vs string
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, filterCategory, searchQuery, sortConfig]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [filterCategory, searchQuery, sortConfig]);

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
  }, [loadMoreRef.current, filteredProducts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Daftar Produk</h2>
          <p className="text-slate-500 text-sm">Kelola inventaris, harga modal (HPP) dan harga jual.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setIsCategoryModalOpen(true)} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 text-sm font-medium">
            <Tag size={16} /> Kategori
          </button>
          <label className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 cursor-pointer text-sm font-medium">
            <Upload size={16} /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          <button onClick={handleExport} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 text-sm font-medium">
            <Download size={16} /> Export
          </button>
          <button onClick={handlePrint} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 text-sm font-medium">
            <Printer size={16} /> Print
          </button>
          <button onClick={() => { resetProductForm(); setIsProductModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-sm font-medium">
            <Plus size={18} /> Tambah Produk
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => scroll('left')}
          className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar flex-1 scroll-smooth"
        >
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterCategory === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            Semua
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filterCategory === c.id ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama produk, SKU, atau kategori..."
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

      {/* Result Counter */}
      {searchQuery && (
        <div className="text-sm text-slate-600">
          <span className="font-medium">{filteredProducts.length}</span> produk ditemukan untuk "{searchQuery}"
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                Produk <SortIcon column="name" />
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('sku')}>
                SKU <SortIcon column="sku" />
              </th>
              <th className="p-4 text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('stock')}>
                Stok <SortIcon column="stock" />
              </th>
              {/* Hide HPP for Cashier */}
              {(JSON.parse(localStorage.getItem('pos_current_user') || '{}') as any).role !== UserRole.CASHIER && (
                <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('hpp')}>
                  HPP (Modal) <SortIcon column="hpp" />
                </th>
              )}
              <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('priceRetail')}>
                Harga Jual <SortIcon column="priceRetail" />
              </th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {visibleProducts.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 group">
                <td className="p-4 flex items-center gap-3">
                  {p.image && !p.image.includes('picsum.photos') ? (
                    <img src={p.image} alt="" loading="lazy" className="w-10 h-10 rounded-lg object-cover bg-slate-200 border border-slate-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <ImageIcon size={16} className="text-slate-400" />
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-slate-800 block">{p.name}</span>
                    <span className="text-xs text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">{p.categoryName}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-500 font-mono text-xs">{p.sku}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded-md font-bold text-xs ${p.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {p.stock}
                  </span>
                </td>
                {/* Hide HPP for Cashier */}
                {(JSON.parse(localStorage.getItem('pos_current_user') || '{}') as any).role !== UserRole.CASHIER && (
                  <td className="p-4 text-slate-500 font-medium">{formatIDR(p.hpp || 0)}</td>
                )}
                <td className="p-4 text-slate-600">
                  <div className="flex flex-col gap-0.5 text-xs">
                    <span className="text-blue-700 font-bold">E: {formatIDR(p.priceRetail)}</span>
                    <span className="text-slate-500">U: {formatIDR(p.priceGeneral)}</span>
                    <span className="text-slate-400">G: {formatIDR(p.priceWholesale)}</span>
                    {p.pricePromo ? <span className="text-red-600 font-bold">P: {formatIDR(p.pricePromo)}</span> : null}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditProduct(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {/* Sentinel for Infinite Scroll */}
            {visibleProducts.length < filteredProducts.length && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-slate-400">
                  <div ref={loadMoreRef}>Loading more...</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PRODUCT MODAL */}
      {isProductModalOpen && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Edit Produk' : 'Produk Baru'}</h3>
              <button onClick={() => setIsProductModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Image Uploader */}
              <div className="col-span-2 flex justify-center">
                <label className="relative w-full max-w-xs aspect-video bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 group overflow-hidden">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-contain" />
                  ) : (
                    <>
                      <ImageIcon className="text-slate-400 mb-2 group-hover:text-blue-500" size={32} />
                      <span className="text-xs text-slate-500">Upload Gambar Produk</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Ganti Gambar
                  </div>
                </label>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk</label>
                <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: Keripik..." />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode SKU / Barcode</label>
                <div className="flex gap-2">
                  <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="Scan atau ketik..." />
                  <button onClick={handleGenerateCode} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg" title="Generate Code"><Barcode size={20} /></button>
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Stok Awal</label>
                <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.stock} onChange={e => handleNumericInput('stock', e.target.value)} />
              </div>

              <div className="col-span-2 my-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={18} className="text-blue-600" />
                  <p className="text-sm font-bold text-slate-800">Harga & Modal</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Hide HPP for Cashier */}
                  {(JSON.parse(localStorage.getItem('pos_current_user') || '{}') as any).role !== UserRole.CASHIER && (
                    <div className="col-span-2 md:col-span-4 mb-2">
                      <label className="block text-xs font-bold text-red-500 mb-1">HPP (Harga Modal)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">Rp</span>
                        <input type="text" className="w-full border border-red-200 bg-red-50/50 p-2 pl-8 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" value={formData.hpp} onChange={e => handleNumericInput('hpp', e.target.value)} />
                      </div>
                    </div>
                  )}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">Harga Eceran</label>
                    <input type="text" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.priceRetail} onChange={e => handleNumericInput('priceRetail', e.target.value)} />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">Harga Umum</label>
                    <input type="text" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.priceGeneral} onChange={e => handleNumericInput('priceGeneral', e.target.value)} />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-slate-500 mb-1">Harga Grosir</label>
                    <input type="text" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.priceWholesale} onChange={e => handleNumericInput('priceWholesale', e.target.value)} />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-red-500 font-bold mb-1">Harga Promo</label>
                    <input type="text" className="w-full border border-red-200 bg-red-50 p-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" value={formData.pricePromo || 0} onChange={e => handleNumericInput('pricePromo', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsProductModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-lg font-medium">Batal</button>
              <button onClick={handleSaveProduct} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg shadow-blue-600/20">Simpan Produk</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Kelola Kategori</h3>
              <button onClick={() => setIsCategoryModalOpen(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex gap-2">
              <input
                type="text"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Nama Kategori Baru"
                value={categoryFormName}
                onChange={e => setCategoryFormName(e.target.value)}
              />
              <button onClick={handleSaveCategory} className="bg-slate-900 text-white px-4 rounded-lg text-sm font-bold">
                {editingId ? 'Update' : 'Tambah'}
              </button>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {categories.length === 0 && <p className="text-center text-slate-400 py-4 text-sm">Belum ada kategori.</p>}
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg group">
                  <span className="font-medium text-slate-700">{c.name}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => { setCategoryFormName(c.name); setEditingId(c.id); }} className="text-blue-600 hover:bg-blue-100 p-1 rounded"><Edit2 size={14} /></button>
                    <button onClick={() => handleDeleteCategory(c.id)} className="text-red-600 hover:bg-red-100 p-1 rounded"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};