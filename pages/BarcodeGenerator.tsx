import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import { StorageService } from '../services/storage';
import { Product } from '../types';
import { Barcode, Search, Printer, X } from 'lucide-react';
import { formatIDR } from '../utils';

export const BarcodeGenerator: React.FC = () => {
    const products = useData(() => StorageService.getProducts(), [], 'products') || [];
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<{ product: Product; count: number }[]>([]);

    const filteredProducts = React.useMemo(() => products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ), [products, searchQuery]);

    const handleAddProduct = (product: Product) => {
        const existing = selectedProducts.find(p => p.product.id === product.id);
        if (existing) {
            setSelectedProducts(selectedProducts.map(p =>
                p.product.id === product.id ? { ...p, count: p.count + 1 } : p
            ));
        } else {
            setSelectedProducts([...selectedProducts, { product, count: 1 }]);
        }
    };

    const handleRemoveProduct = (productId: string) => {
        setSelectedProducts(selectedProducts.filter(p => p.product.id !== productId));
    };

    const handleUpdateCount = (productId: string, count: number) => {
        if (count < 1) return;
        setSelectedProducts(selectedProducts.map(p =>
            p.product.id === productId ? { ...p, count } : p
        ));
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const barcodeItems = selectedProducts.flatMap(item =>
            Array(item.count).fill(item.product)
        );

        const html = `
      <html>
        <head>
          <title>Cetak Barcode</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: sans-serif; padding: 0; margin: 0; }
            .barcode-container { 
              display: flex; 
              flex-wrap: wrap; 
              justify-content: flex-start; 
            }
            .barcode-item { 
              border: 1px dashed #ccc; 
              padding: 5px; 
              text-align: center; 
              width: 19%; 
              height: 80px;
              margin: 0.5%;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .product-name { 
              font-size: 10px; 
              margin-bottom: 5px; 
              white-space: nowrap; 
              overflow: hidden; 
              text-overflow: ellipsis; 
              max-width: 100%;
            }
            .product-price { font-size: 10px; font-weight: bold; margin-top: 2px; }
            svg { width: 100%; height: 50px; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
              .barcode-item { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            ${barcodeItems.map((p, idx) => `
              <div class="barcode-item">
                <div class="product-name">${p.name}</div>
                <svg id="barcode-${idx}"></svg>
                <div class="product-price">${formatIDR(p.priceRetail)}</div>
              </div>
            `).join('')}
          </div>
          <script>
            ${barcodeItems.map((p, idx) => `
              JsBarcode("#barcode-${idx}", "${p.sku}", {
                format: "CODE128",
                displayValue: true,
                fontSize: 12,
                height: 30,
                margin: 0
              });
            `).join('')}
            window.onload = () => {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Cetak Barcode</h2>
                <p className="text-slate-500 text-sm">Pilih produk untuk dicetak barcodenya.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Selection */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="h-[500px] overflow-y-auto pr-2 space-y-2">
                        {filteredProducts.map(p => (
                            <div key={p.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50">
                                <div>
                                    <div className="font-medium text-slate-800">{p.name}</div>
                                    <div className="text-xs text-slate-500">SKU: {p.sku} | Stok: {p.stock}</div>
                                </div>
                                <button
                                    onClick={() => handleAddProduct(p)}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
                                >
                                    Tambah
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Print Queue */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[600px]">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Printer size={18} /> Antrian Cetak
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                        {selectedProducts.length === 0 ? (
                            <div className="text-center text-slate-400 py-10 text-sm">
                                Belum ada produk dipilih.
                            </div>
                        ) : (
                            selectedProducts.map((item) => (
                                <div key={item.product.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-sm text-slate-800 line-clamp-1">{item.product.name}</span>
                                        <button onClick={() => handleRemoveProduct(item.product.id)} className="text-slate-400 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">{item.product.sku}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleUpdateCount(item.product.id, item.count - 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100"
                                            >-</button>
                                            <span className="text-sm font-medium w-8 text-center">{item.count}</span>
                                            <button
                                                onClick={() => handleUpdateCount(item.product.id, item.count + 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-100"
                                            >+</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex justify-between mb-4 text-sm font-medium text-slate-600">
                            <span>Total Label:</span>
                            <span>{selectedProducts.reduce((acc, curr) => acc + curr.count, 0)}</span>
                        </div>
                        <button
                            onClick={handlePrint}
                            disabled={selectedProducts.length === 0}
                            className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Printer size={18} /> Cetak Barcode
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
