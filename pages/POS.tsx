import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Search, Trash2, User, Plus, Minus, ShoppingBag, Printer, CreditCard, Banknote, Clock, ScanLine, StickyNote, Image as ImageIcon } from 'lucide-react';
import { useData } from '../hooks/useData';
import { StorageService } from '../services/storage';
import { Product, CartItem, PriceType, PaymentStatus, Transaction, PaymentMethod, User as UserType, Customer, StoreSettings, BankAccount, CashFlowType } from '../types';
import { formatIDR, getPriceByType, generateId, formatDate, toMySQLDate } from '../utils';
import { generatePrintInvoice } from '../utils/printHelpers';

export const POS: React.FC = () => {
  const products = useData(() => StorageService.getProducts()) || [];
  const customers = useData(() => StorageService.getCustomers()) || [];
  const banks = useData(() => StorageService.getBanks()) || [];

  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');

  // Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState(''); // Still used for display or custom walk-in name

  // Payment State
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState('');

  // Settings
  const [defaultPriceType, setDefaultPriceType] = useState<PriceType>(PriceType.RETAIL);

  const currentUser = JSON.parse(localStorage.getItem('pos_current_user') || '{}') as UserType; // Need to grab current user
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus search for scanner
    searchInputRef.current?.focus();
  }, []);

  // Update customer name when ID changes & Auto set Price Type
  useEffect(() => {
    if (selectedCustomerId) {
      const c = customers.find(cust => cust.id === selectedCustomerId);
      if (c) {
        setCustomerName(c.name);
        if (c.defaultPriceType) {
          setDefaultPriceType(c.defaultPriceType);
        }
      }
    } else {
      setCustomerName('Pelanggan Umum');
      setDefaultPriceType(PriceType.RETAIL); // Default back to Retail for walk-in
    }
  }, [selectedCustomerId, customers]);

  // Scan Logic (Enter Key)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search) {
      // Try to find exact match first (Scanner behavior)
      const exactMatch = products.find(p => p.sku.toLowerCase() === search.toLowerCase());
      if (exactMatch) {
        addToCart(exactMatch);
        setSearch(''); // Clear for next scan
      }
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedPriceType === defaultPriceType);
      if (existing) {
        return prev.map(item =>
          (item.id === product.id && item.selectedPriceType === defaultPriceType)
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      const price = getPriceByType(product, defaultPriceType);
      return [...prev, { ...product, qty: 1, selectedPriceType: defaultPriceType, finalPrice: price }];
    });
  };

  const updateCartItem = (index: number, updates: Partial<CartItem>) => {
    setCart(prev => {
      const newCart = [...prev];
      newCart[index] = { ...newCart[index], ...updates };
      if (updates.selectedPriceType) {
        newCart[index].finalPrice = getPriceByType(newCart[index], updates.selectedPriceType as PriceType);
      }
      return newCart;
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.finalPrice * item.qty), 0);
  }, [cart]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckout = async () => {
    let paid = parseFloat(amountPaid) || 0;

    // Validation: Check for zero price items
    const zeroPriceItems = cart.filter(item => item.finalPrice === 0);
    if (zeroPriceItems.length > 0) {
      alert(`Peringatan: Terdapat item dengan harga 0 / tanpa harga di keranjang. Mohon periksa kembali.`);
      return;
    }

    // Validation
    if (paymentMethod === PaymentMethod.TEMPO && paid === 0) {
      paid = 0;
    } else if (paymentMethod !== PaymentMethod.TEMPO && paid < totalAmount) {
      alert('Pembayaran kurang!');
      return;
    }

    if (paymentMethod === PaymentMethod.TRANSFER && !selectedBankId) {
      alert('Silakan pilih rekening bank tujuan transfer.');
      return;
    }

    const isDebt = paid < totalAmount;
    const status = isDebt ? (paid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID) : PaymentStatus.PAID;
    const selectedBank = banks.find(b => b.id === selectedBankId);

    const transaction: Transaction = {
      id: generateId(),
      date: toMySQLDate(new Date()),
      items: cart,
      totalAmount,
      amountPaid: paid,
      change: paid - totalAmount,
      paymentStatus: status,
      paymentMethod: paymentMethod,
      paymentNote: paymentNote,
      bankId: selectedBankId,
      bankName: selectedBank?.bankName,
      customerId: selectedCustomerId || undefined,
      customerName: customerName || 'Pelanggan Umum',
      cashierId: currentUser.id || 'unknown',
      cashierName: currentUser.name || 'Kasir',
    };

    try {
      await StorageService.addTransaction(transaction);

      // Add Cashflow Entry for Sale (if paid > 0)
      if (paid > 0) {
        const paymentMethodText = paymentMethod === PaymentMethod.TRANSFER
          ? `Transfer${selectedBank ? ` (${selectedBank.bankName})` : ''}`
          : paymentMethod === PaymentMethod.CASH
            ? 'Tunai'
            : 'Tempo';

        await StorageService.addCashFlow({
          id: '',
          date: transaction.date,
          type: CashFlowType.IN,
          amount: paid,
          category: 'Penjualan',
          description: `Penjualan ke ${customerName} (Tx: ${transaction.id.substring(0, 6)}) via ${paymentMethodText} - ${currentUser.name}`,
          userId: currentUser.id,
          userName: currentUser.name
        });
      }

      // Print Logic
      const settings = await StorageService.getStoreSettings();
      printReceipt(transaction, settings);

      // Reset
      setCart([]);
      setAmountPaid('');
      setPaymentNote('');
      setSelectedBankId('');
      setSelectedCustomerId('');
      setCustomerName('Pelanggan Umum');
      setShowPaymentModal(false);
      searchInputRef.current?.focus();
      alert('Transaksi berhasil!');
    } catch (error) {
      console.error(error);
      alert('Gagal memproses transaksi. Silakan coba lagi.');
    }
  };

  const printReceipt = (tx: Transaction, settings: StoreSettings) => {
    const w = window.open('', '', 'width=800,height=600');
    if (!w) return;

    const html = generatePrintInvoice(tx, settings, formatIDR, formatDate);
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-white z-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Scan Barcode atau Cari Nama..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <ScanLine className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
          <select
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600"
            value={defaultPriceType}
            onChange={(e) => setDefaultPriceType(e.target.value as PriceType)}
          >
            <option value={PriceType.RETAIL}>Eceran</option>
            <option value={PriceType.GENERAL}>Umum</option>
            <option value={PriceType.WHOLESALE}>Grosir</option>
            <option value={PriceType.PROMO}>Promo</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 content-start">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="group flex flex-col items-start text-left bg-white border border-slate-100 rounded-xl p-3 hover:shadow-md hover:border-blue-300 transition-all active:scale-95"
            >
              <div className="w-full aspect-square bg-slate-100 rounded-lg mb-3 overflow-hidden relative">
                {product.image && !product.image.includes('picsum.photos') ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-slate-300" />
                  </div>
                )}
                <span className="absolute bottom-1 right-1 text-[10px] bg-black/50 text-white px-1 rounded backdrop-blur-sm">{product.stock}</span>
              </div>
              <h4 className="font-semibold text-slate-800 line-clamp-2 text-sm h-10">{product.name}</h4>
              <div className="mt-2 w-full">
                <span className={`block font-bold ${defaultPriceType === PriceType.RETAIL ? 'text-blue-700' :
                  defaultPriceType === PriceType.GENERAL ? 'text-slate-500' :
                    defaultPriceType === PriceType.WHOLESALE ? 'text-slate-400' :
                      defaultPriceType === PriceType.PROMO ? 'text-red-600' : 'text-slate-800'
                  }`}>
                  {getPriceByType(product, defaultPriceType) === 0 ? '0' : formatIDR(getPriceByType(product, defaultPriceType))}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2 mb-3">
            <User size={18} className="text-slate-400" />
            <select
              className="bg-transparent font-medium text-slate-700 focus:outline-none border-b border-dashed border-slate-300 w-full focus:border-blue-500 transition-colors"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Pelanggan Umum (Walk-in)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-slate-500 text-sm">Total Tagihan</span>
            <span className="text-2xl font-bold text-slate-900">{formatIDR(totalAmount)}</span>
          </div>
          {/* Clear Cart Button */}
          {cart.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Hapus semua item di keranjang?')) {
                  setCart([]);
                }
              }}
              className="mt-3 w-full py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Kosongkan Keranjang
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <ShoppingBag size={48} className="mb-2 opacity-20" />
              <p>Keranjang Kosong</p>
            </div>
          )}
          {cart.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0">
              <div className="flex-1">
                <h5 className="font-medium text-slate-800 text-sm">{item.name}</h5>
                <div className="flex items-center gap-2 mt-1">
                  <select
                    className="text-xs bg-slate-100 border-none rounded px-1 py-0.5 text-slate-600"
                    value={item.selectedPriceType}
                    onChange={(e) => updateCartItem(idx, { selectedPriceType: e.target.value as PriceType })}
                  >
                    <option value={PriceType.RETAIL}>Eceran</option>
                    <option value={PriceType.GENERAL}>Umum</option>
                    <option value={PriceType.WHOLESALE}>Grosir</option>
                    <option value={PriceType.PROMO}>Promo</option>
                  </select>
                  <span className="text-xs text-slate-400">@{formatIDR(item.finalPrice)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200">
                    <button onClick={() => item.qty > 1 ? updateCartItem(idx, { qty: item.qty - 1 }) : removeFromCart(idx)} className="p-1 hover:bg-slate-200 rounded text-slate-500"><Minus size={14} /></button>
                    <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                    <button onClick={() => updateCartItem(idx, { qty: item.qty + 1 })} className="p-1 hover:bg-slate-200 rounded text-slate-500"><Plus size={14} /></button>
                  </div>
                  {/* Delete Item Button */}
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="p-1.5 hover:bg-red-50 rounded text-red-500 hover:text-red-600 transition-colors"
                    title="Hapus item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <span className="text-sm font-semibold text-slate-700">{formatIDR(item.finalPrice * item.qty)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              setAmountPaid(''); // Reset on open
              setShowPaymentModal(true);
            }}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Printer size={20} />
            Bayar & Cetak
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 p-6 text-white shrink-0">
              <h3 className="text-lg font-semibold">Konfirmasi Pembayaran</h3>
              <p className="text-slate-400 text-sm mt-1">Total: {formatIDR(totalAmount)}</p>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => { setPaymentMethod(PaymentMethod.CASH); setSelectedBankId(''); }}
                    className={`p-2 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 ${paymentMethod === PaymentMethod.CASH ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}
                  >
                    <Banknote size={20} /> Tunai
                  </button>
                  <button
                    onClick={() => { setPaymentMethod(PaymentMethod.TRANSFER); setAmountPaid(totalAmount.toString()); }}
                    className={`p-2 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 ${paymentMethod === PaymentMethod.TRANSFER ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}
                  >
                    <CreditCard size={20} /> Transfer
                  </button>
                  <button
                    onClick={() => { setPaymentMethod(PaymentMethod.TEMPO); setAmountPaid('0'); setSelectedBankId(''); }}
                    className={`p-2 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 ${paymentMethod === PaymentMethod.TEMPO ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}
                  >
                    <Clock size={20} /> Tempo
                  </button>
                </div>
              </div>

              {/* Bank Selector for Transfer or Tempo (Partial Transfer) */}
              {(paymentMethod === PaymentMethod.TRANSFER || paymentMethod === PaymentMethod.TEMPO) && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    {paymentMethod === PaymentMethod.TRANSFER ? 'Pilih Rekening Tujuan' : 'Rekening Tujuan (Jika DP Transfer)'}
                  </label>
                  <select
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    value={selectedBankId}
                    onChange={e => setSelectedBankId(e.target.value)}
                  >
                    <option value="">-- Pilih Bank / E-Wallet --</option>
                    {banks.map(b => (
                      <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-600">Jumlah Diterima</label>
                  {paymentMethod === PaymentMethod.CASH && (
                    <button
                      onClick={() => setAmountPaid(totalAmount.toString())}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200 transition-colors"
                    >
                      Uang Pas
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 text-xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={amountPaid}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setAmountPaid(val);
                    }}
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Catatan (Opsional)</label>
                <div className="relative">
                  <StickyNote size={16} className="absolute left-3 top-3 text-slate-400" />
                  <textarea
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    rows={2}
                    placeholder="Catatan tambahan..."
                    value={paymentNote}
                    onChange={e => setPaymentNote(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Summary Logic */}
              {(paymentMethod === PaymentMethod.CASH || paymentMethod === PaymentMethod.TRANSFER) && parseFloat(amountPaid) >= totalAmount && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-center">
                  <p className="text-sm text-green-600">Kembalian</p>
                  <p className="text-2xl font-bold text-green-700">{formatIDR(parseFloat(amountPaid) - totalAmount)}</p>
                </div>
              )}

              {(paymentMethod === PaymentMethod.TEMPO || parseFloat(amountPaid) < totalAmount) && (paymentMethod !== PaymentMethod.TRANSFER && paymentMethod !== PaymentMethod.CASH) && (
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <p className="text-sm text-orange-600 font-medium">Sisa Hutang</p>
                  <p className="text-xl font-bold text-orange-700">{formatIDR(totalAmount - (parseFloat(amountPaid) || 0))}</p>
                  <p className="text-xs text-orange-500 mt-1">Akan dicatat sebagai piutang {customerName}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium">Batal</button>
                <button onClick={handleCheckout} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold shadow-lg hover:bg-slate-800">
                  Proses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};