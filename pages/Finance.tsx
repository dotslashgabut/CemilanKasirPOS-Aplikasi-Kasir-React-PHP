import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../hooks/useData';
import { StorageService } from '../services/storage';
import { Transaction, PaymentStatus, CashFlow, CashFlowType, Purchase, Supplier, PaymentMethod, CashFlow as CashFlowTypeInterface, StoreSettings, BankAccount, User, UserRole, TransactionType, PurchaseType } from '../types';
import { formatIDR, formatDate, exportToCSV, generateId } from '../utils';
import { generatePrintInvoice, generatePrintGoodsNote, generatePrintSuratJalan, generatePrintTransactionDetail, generatePrintPurchaseDetail } from '../utils/printHelpers';
import { ArrowDownLeft, ArrowUpRight, Download, Plus, Printer, FileText, Filter, RotateCcw, X, Eye, ShoppingBag, Calendar, Clock, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface FinanceProps {
    currentUser: User | null;
    defaultTab?: 'history' | 'debt_customer' | 'purchase_history' | 'debt_supplier' | 'cashflow';
}

export const Finance: React.FC<FinanceProps> = ({ currentUser, defaultTab = 'history' }) => {
    const [activeTab, setActiveTab] = useState<'history' | 'debt_customer' | 'purchase_history' | 'debt_supplier' | 'cashflow' | 'profit_loss'>(defaultTab);

    // Data State with useData
    const transactions = useData(() => StorageService.getTransactions()) || [];
    const purchases = useData(() => StorageService.getPurchases()) || [];
    const cashFlows = useData(() => StorageService.getCashFlow()) || [];
    const suppliers = useData(() => StorageService.getSuppliers()) || [];
    const banks = useData(() => StorageService.getBanks()) || [];
    const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

    // Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(''); // Filter category for cashflow

    // Sort State
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Reset sort when tab changes
    useEffect(() => {
        setSortConfig(null);
    }, [activeTab]);

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

    // Helper for Jakarta Date
    const getJakartaDateStr = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    };

    // Detail Modal State
    const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);
    const [detailPurchase, setDetailPurchase] = useState<Purchase | null>(null);

    // Debt Payment State (Customer - Piutang)
    const [selectedDebt, setSelectedDebt] = useState<Transaction | null>(null);
    const [repaymentAmount, setRepaymentAmount] = useState('');
    const [repaymentMethod, setRepaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [repaymentBankId, setRepaymentBankId] = useState('');
    const [repaymentNote, setRepaymentNote] = useState('');

    // Debt Payment State (Supplier - Utang)
    const [selectedPayable, setSelectedPayable] = useState<Purchase | null>(null);
    const [payableRepaymentAmount, setPayableRepaymentAmount] = useState('');
    const [payableRepaymentMethod, setPayableRepaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [payableBankId, setPayableBankId] = useState('');
    const [payableNote, setPayableNote] = useState('');

    // Purchase State (New Stock)
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [purchaseForm, setPurchaseForm] = useState({
        supplierId: '', description: '', amount: '', paid: '', paymentMethod: PaymentMethod.CASH, bankId: ''
    });

    // Cashflow Entry State
    const [cfAmount, setCfAmount] = useState('');
    const [cfType, setCfType] = useState<CashFlowType>(CashFlowType.OUT);
    const [cfDesc, setCfDesc] = useState('');
    const [cfCategory, setCfCategory] = useState(''); // New State
    const [cfPaymentMethod, setCfPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [cfBankId, setCfBankId] = useState('');

    // Return State
    const [isReturnTxModalOpen, setIsReturnTxModalOpen] = useState(false);
    const [returnTxItems, setReturnTxItems] = useState<{ id: string, qty: number, maxQty: number, price: number, name: string }[]>([]);

    const [isReturnPurchaseModalOpen, setIsReturnPurchaseModalOpen] = useState(false);
    const [returnPurchaseItems, setReturnPurchaseItems] = useState<{ id: string, qty: number, price: number, name: string }[]>([]);
    const products = useData(() => StorageService.getProducts()) || [];
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        StorageService.getStoreSettings().then(setStoreSettings);
    }, []);

    // Return Logic
    const openReturnTxModal = (tx: Transaction) => {
        setReturnTxItems(tx.items.map(i => ({
            id: i.id,
            qty: 0,
            maxQty: i.qty,
            price: i.finalPrice,
            name: i.name
        })));
        setIsReturnTxModalOpen(true);
    };

    const submitReturnTx = async () => {
        if (!detailTransaction) return;
        const itemsToReturn = returnTxItems.filter(i => i.qty > 0);
        if (itemsToReturn.length === 0) return;

        const totalRefund = itemsToReturn.reduce((sum, i) => sum + (i.qty * i.price), 0);

        const returnTx: Transaction = {
            id: generateId(),
            type: TransactionType.RETURN,
            originalTransactionId: detailTransaction.id,
            date: new Date().toISOString(),
            items: itemsToReturn.map(i => {
                const originalItem = detailTransaction.items.find(oi => oi.id === i.id);
                return {
                    ...originalItem!,
                    qty: i.qty,
                    finalPrice: i.price
                };
            }),
            totalAmount: -totalRefund, // Negative for return
            amountPaid: -totalRefund,
            change: 0,
            paymentStatus: PaymentStatus.PAID,
            paymentMethod: PaymentMethod.CASH, // Assume cash refund for now
            paymentNote: `Retur dari Transaksi #${detailTransaction.id.substring(0, 6)}`,
            customerName: detailTransaction.customerName,
            cashierId: currentUser?.id || 'SYSTEM',
            cashierName: currentUser?.name || 'System'
        };

        await StorageService.addTransaction(returnTx);

        // Record Cash Out (Refund)
        await StorageService.addCashFlow({
            id: '',
            date: new Date().toISOString(),
            type: CashFlowType.OUT,
            amount: totalRefund,
            category: 'Retur Penjualan',
            description: `Refund Retur Transaksi #${detailTransaction.id.substring(0, 6)}`,
            paymentMethod: PaymentMethod.CASH,
            userId: currentUser?.id,
            userName: currentUser?.name
        });

        setIsReturnTxModalOpen(false);
        setDetailTransaction(null);
        alert('Retur berhasil diproses.');
    };

    const submitReturnPurchase = async () => {
        if (!detailPurchase) return;
        const itemsToReturn = returnPurchaseItems.filter(i => i.qty > 0);
        if (itemsToReturn.length === 0) return;

        const totalRefund = itemsToReturn.reduce((sum, i) => sum + (i.qty * i.price), 0);

        const returnPurchase: Purchase = {
            id: generateId(),
            type: PurchaseType.RETURN,
            date: new Date().toISOString(),
            supplierId: detailPurchase.supplierId,
            supplierName: detailPurchase.supplierName,
            description: `Retur Barang: ${itemsToReturn.map(i => i.name).join(', ')}`,
            items: itemsToReturn.map(i => {
                const product = products.find(p => p.id === i.id);
                return {
                    ...product,
                    qty: i.qty,
                    finalPrice: i.price,
                    selectedPriceType: 'UMUM'
                } as any;
            }),
            totalAmount: -totalRefund,
            amountPaid: -totalRefund,
            paymentStatus: PaymentStatus.PAID,
            paymentMethod: PaymentMethod.CASH,
            paymentHistory: []
        };

        await StorageService.addPurchase(returnPurchase);

        // Record Cash In (Refund from Supplier)
        await StorageService.addCashFlow({
            id: '',
            date: new Date().toISOString(),
            type: CashFlowType.IN,
            amount: totalRefund,
            category: 'Retur Pembelian',
            description: `Refund Retur Pembelian dari ${detailPurchase.supplierName}`,
            paymentMethod: PaymentMethod.CASH,
            userId: currentUser?.id,
            userName: currentUser?.name
        });

        setIsReturnPurchaseModalOpen(false);
        setDetailPurchase(null);
        alert('Retur pembelian berhasil diproses.');
    };

    // Filter Logic
    const applyDateFilter = (items: any[]) => {
        if (!startDate && !endDate) return items;

        return items.filter(item => {
            const itemDateStr = getJakartaDateStr(item.date);
            if (startDate && itemDateStr < startDate) return false;
            if (endDate && itemDateStr > endDate) return false;
            return true;
        });
    };

    // Search Logic
    const applySearch = (items: any[], type: 'transaction' | 'purchase' | 'cashflow') => {
        if (!searchQuery.trim()) return items;
        const query = searchQuery.toLowerCase();

        return items.filter(item => {
            if (type === 'transaction') {
                return (
                    item.id.toLowerCase().includes(query) ||
                    item.customerName.toLowerCase().includes(query) ||
                    item.cashierName.toLowerCase().includes(query)
                );
            } else if (type === 'purchase') {
                return (
                    item.supplierName.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    item.id.toLowerCase().includes(query)
                );
            } else if (type === 'cashflow') {
                return (
                    item.category.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query)
                );
            }
            return false;
        });
    };

    // Category Filter Logic for Cashflow
    const applyCategoryFilter = (items: CashFlow[]) => {
        if (!categoryFilter) return items;
        return items.filter(cf => cf.category === categoryFilter);
    };

    // Cashier Filter - Only show data created by the cashier
    const applyCashierFilter = (items: any[], type: 'transaction' | 'purchase' | 'cashflow') => {
        if (!currentUser || currentUser.role !== UserRole.CASHIER) return items;

        if (type === 'transaction') {
            return items.filter(item => item.cashierId === currentUser.id);
        } else if (type === 'purchase') {
            // Purchases don't have cashierId, so cashiers see all purchases
            return items;
        } else if (type === 'cashflow') {
            // Filter cashflows related to cashier's transactions
            const cashierTransactionIds = transactions
                .filter(t => t.cashierId === currentUser.id)
                .map(t => t.id);

            return items.filter(item => {
                // 1. Check if explicitly created by this user (New Data)
                if (item.userId) {
                    return item.userId === currentUser.id;
                }

                // 2. Legacy/System generated cashflows linked to transactions (Old Data fallback)
                if (item.category === 'Pelunasan Piutang') {
                    return cashierTransactionIds.some(txId =>
                        item.description.includes(txId.substring(0, 6))
                    );
                }

                // 3. Strict Mode: Hide everything else not performed by this user
                return false;
            });
        }
        return items;
    };

    const sortItems = (items: any[]) => {
        if (!sortConfig) return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Default desc date

        return [...items].sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];

            if (sortConfig.key === 'date') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            } else if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const filteredTransactions = sortItems(applySearch(applyDateFilter(applyCashierFilter(transactions, 'transaction')), 'transaction'));
    const filteredPurchases = sortItems(applySearch(applyDateFilter(applyCashierFilter(purchases, 'purchase')), 'purchase'));
    const filteredCashFlows = sortItems(applySearch(applyCategoryFilter(applyDateFilter(applyCashierFilter(cashFlows, 'cashflow'))), 'cashflow'));

    const receivables = sortItems(applySearch(applyCashierFilter(transactions.filter(t => t.paymentStatus !== PaymentStatus.PAID), 'transaction'), 'transaction'));
    const payables = sortItems(applySearch(applyCashierFilter(purchases.filter(p => p.paymentStatus !== PaymentStatus.PAID), 'purchase'), 'purchase'));

    // --- ACTION HANDLERS ---

    const handleRepaymentCustomer = async () => {
        if (!selectedDebt) return;
        const pay = parseFloat(repaymentAmount) || 0;

        if (pay <= 0) return;

        if (repaymentMethod === PaymentMethod.TRANSFER && !repaymentBankId) {
            alert("Pilih rekening bank tujuan transfer.");
            return;
        }

        const newPaid = selectedDebt.amountPaid + pay;
        const newStatus = newPaid >= selectedDebt.totalAmount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
        const now = new Date().toISOString(); // Capture exact time
        const selectedBank = banks.find(b => b.id === repaymentBankId);

        const updatedHistory = [...(selectedDebt.paymentHistory || [])];
        updatedHistory.push({
            date: now,
            amount: pay,
            method: repaymentMethod,
            bankId: repaymentBankId,
            bankName: selectedBank?.bankName,
            note: repaymentNote || 'Cicilan Piutang'
        });

        const updatedTx = {
            ...selectedDebt,
            amountPaid: newPaid,
            paymentStatus: newStatus,
            change: newPaid > selectedDebt.totalAmount ? newPaid - selectedDebt.totalAmount : 0,
            paymentHistory: updatedHistory
        };

        await StorageService.updateTransaction(updatedTx);

        await StorageService.addCashFlow({
            id: '',
            date: now,
            type: CashFlowType.IN,
            amount: pay,
            category: 'Pelunasan Piutang',
            description: `Pelunasan dari ${selectedDebt.customerName} (Tx: ${selectedDebt.id.substring(0, 6)}) via ${repaymentMethod} ${selectedBank ? `(${selectedBank.bankName})` : ''}`,
            paymentMethod: repaymentMethod,
            bankId: repaymentBankId,
            bankName: selectedBank?.bankName,
            userId: currentUser?.id,
            userName: currentUser?.name
        });

        setSelectedDebt(null);
        setRepaymentAmount('');
        setRepaymentNote('');
        setRepaymentBankId('');
    };

    const handleRepaymentSupplier = async () => {
        if (!selectedPayable) return;
        const pay = parseFloat(payableRepaymentAmount) || 0;

        if (pay <= 0) return;

        if (payableRepaymentMethod === PaymentMethod.TRANSFER && !payableBankId) {
            alert("Pilih rekening bank sumber transfer.");
            return;
        }

        const newPaid = selectedPayable.amountPaid + pay;
        const newStatus = newPaid >= selectedPayable.totalAmount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;
        const now = new Date().toISOString(); // Capture exact time
        const selectedBank = banks.find(b => b.id === payableBankId);

        const updatedHistory = [...(selectedPayable.paymentHistory || [])];
        updatedHistory.push({
            date: now,
            amount: pay,
            method: payableRepaymentMethod,
            bankId: payableBankId,
            bankName: selectedBank?.bankName,
            note: payableNote || 'Cicilan Utang'
        });

        const updatedPurchase = {
            ...selectedPayable,
            amountPaid: newPaid,
            paymentStatus: newStatus,
            paymentHistory: updatedHistory
        };

        await StorageService.updatePurchase(updatedPurchase);

        await StorageService.addCashFlow({
            id: '',
            date: now,
            type: CashFlowType.OUT,
            amount: pay,
            category: 'Pelunasan Utang Supplier',
            description: `Bayar Utang ke ${selectedPayable.supplierName} (Ref: ${selectedPayable.id.substring(0, 6)}) via ${payableRepaymentMethod} ${selectedBank ? `(${selectedBank.bankName})` : ''}`,
            paymentMethod: payableRepaymentMethod,
            bankId: payableBankId,
            bankName: selectedBank?.bankName,
            userId: currentUser?.id,
            userName: currentUser?.name
        });

        setSelectedPayable(null);
        setPayableRepaymentAmount('');
        setPayableNote('');
        setPayableBankId('');
    };

    const handlePurchaseSubmit = async () => {
        if (!purchaseForm.supplierId || !purchaseForm.amount) {
            alert("Harap lengkapi data Supplier dan Total Pembelian!");
            return;
        }

        const total = parseFloat(purchaseForm.amount.replace(/[^0-9]/g, ''));
        const paid = parseFloat(purchaseForm.paid.replace(/[^0-9]/g, '')) || 0;

        if (total <= 0) {
            alert("Total pembelian harus lebih dari 0!");
            return;
        }

        if (!purchaseForm.description || purchaseForm.description.trim() === '') {
            alert("Harap isi deskripsi/keterangan pembelian!");
            return;
        }

        const supplier = suppliers.find(s => s.id === purchaseForm.supplierId);

        if (!supplier) {
            alert("Supplier tidak ditemukan!");
            return;
        }

        const now = new Date().toISOString(); // Capture exact time

        if (purchaseForm.paymentMethod === PaymentMethod.TRANSFER && !purchaseForm.bankId && paid > 0) {
            alert("Pilih rekening bank untuk pembayaran transfer.");
            return;
        }

        const selectedBank = banks.find(b => b.id === purchaseForm.bankId);
        const status = paid >= total ? PaymentStatus.PAID : (paid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID);

        const newPurchase: Purchase = {
            id: generateId(),
            date: now,
            supplierId: purchaseForm.supplierId,
            supplierName: supplier.name,
            description: purchaseForm.description.trim(),
            totalAmount: total,
            amountPaid: paid,
            paymentMethod: purchaseForm.paymentMethod,
            paymentStatus: status,
            bankId: purchaseForm.bankId || undefined,
            bankName: selectedBank?.bankName,
            paymentHistory: paid > 0 ? [{
                date: now,
                amount: paid,
                method: purchaseForm.paymentMethod,
                bankId: purchaseForm.bankId,
                bankName: selectedBank?.bankName,
                note: 'Pembayaran Awal'
            }] : []
        };

        console.log("📦 Saving purchase:", newPurchase);

        try {
            await StorageService.addPurchase(newPurchase);
            console.log("✅ Purchase saved successfully!");

            // If paid amount > 0, record cash out
            if (paid > 0) {
                const cashFlowData = {
                    id: '',
                    date: now,
                    type: CashFlowType.OUT,
                    amount: paid,
                    category: 'Pembelian Stok',
                    description: `Pembelian dari ${supplier.name}: ${purchaseForm.description} via ${purchaseForm.paymentMethod} ${selectedBank ? `(${selectedBank.bankName})` : ''}`,
                    paymentMethod: purchaseForm.paymentMethod,
                    bankId: purchaseForm.bankId || undefined,
                    bankName: selectedBank?.bankName,
                    userId: currentUser?.id,
                    userName: currentUser?.name
                };
                console.log("💰 Saving cash flow:", cashFlowData);
                await StorageService.addCashFlow(cashFlowData);
                console.log("✅ Cash flow saved successfully!");
            }

            // Success feedback
            alert("✅ Pembelian berhasil dicatat!");

            setIsPurchaseModalOpen(false);
            setPurchaseForm({ supplierId: '', description: '', amount: '', paid: '', paymentMethod: PaymentMethod.CASH, bankId: '' });
        } catch (error) {
            console.error("❌ Error saving purchase:", error);
            alert(`❌ Gagal menyimpan pembelian!\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nSilakan cek console untuk detail.`);
        }
    };



    const handleAddCashFlow = async () => {
        const amount = parseFloat(cfAmount);
        if (!amount || !cfDesc || !cfCategory) { // Validate category
            alert("Mohon lengkapi jumlah, kategori, dan keterangan.");
            return;
        }

        if (cfPaymentMethod === PaymentMethod.TRANSFER && !cfBankId) {
            alert("Pilih rekening bank.");
            return;
        }

        const selectedBank = banks.find(b => b.id === cfBankId);

        await StorageService.addCashFlow({
            id: '',
            date: new Date().toISOString(),
            type: cfType,
            amount,
            category: cfCategory, // Use selected category
            description: `${cfDesc} (via ${cfPaymentMethod}${selectedBank ? ` - ${selectedBank.bankName}` : ''})`,
            paymentMethod: cfPaymentMethod,
            bankId: cfBankId,
            bankName: selectedBank?.bankName,
            userId: currentUser?.id,
            userName: currentUser?.name
        });
        setCfAmount('');
        setCfDesc('');
        setCfCategory(''); // Reset category
        setCfPaymentMethod(PaymentMethod.CASH);
        setCfBankId('');
    };

    // Profit Loss Calculation
    const calculateProfitLoss = () => {
        const txs = filteredTransactions; // Already date filtered
        const cfs = filteredCashFlows; // Already date filtered

        const revenue = txs.reduce((sum, t) => sum + t.totalAmount, 0);

        const cogs = txs.reduce((sum, t) => {
            const txCogs = t.items.reduce((isum, item) => isum + ((item.hpp || 0) * item.qty), 0);
            return sum + txCogs;
        }, 0);

        const grossProfit = revenue - cogs;

        // Expenses: CashFlow OUT excluding Stock Purchase and Debt Repayment (which are asset/liability movements)
        // We assume 'Pembelian Stok' and 'Pelunasan Utang Supplier' are not operational expenses in this simple view.
        // However, 'Operasional' and others are.
        const expenses = cfs
            .filter(c => c.type === CashFlowType.OUT &&
                c.category !== 'Pembelian Stok' &&
                !c.category.includes('Pelunasan Utang'))
            .reduce((sum, c) => sum + c.amount, 0);

        const netProfit = grossProfit - expenses;

        return { revenue, cogs, grossProfit, expenses, netProfit };
    };

    const plData = calculateProfitLoss();

    const handleExport = () => {
        let headers: string[] = [];
        let rows: any[][] = [];
        let filename = 'export.csv';

        if (activeTab === 'history') {
            headers = ['ID', 'Tanggal', 'Waktu', 'Pelanggan', 'Kasir', 'Total', 'Dibayar', 'Status', 'Metode'];
            rows = filteredTransactions.map(t => {
                const d = new Date(t.date);
                return [t.id, d.toLocaleDateString('id-ID'), d.toLocaleTimeString('id-ID'), t.customerName, t.cashierName, t.totalAmount, t.amountPaid, t.paymentStatus, t.paymentMethod]
            });
            filename = 'laporan-transaksi.csv';
        } else if (activeTab === 'debt_customer') {
            headers = ['ID', 'Tanggal', 'Pelanggan', 'Total', 'Dibayar', 'Sisa', 'Status'];
            rows = receivables.map(r => [r.id, formatDate(r.date), r.customerName, r.totalAmount, r.amountPaid, r.totalAmount - r.amountPaid, r.paymentStatus]);
            filename = 'laporan-piutang-pelanggan.csv';
        } else if (activeTab === 'purchase_history') {
            headers = ['ID', 'Tanggal', 'Waktu', 'Supplier', 'Keterangan', 'Total', 'Dibayar', 'Status'];
            rows = filteredPurchases.map(p => {
                const d = new Date(p.date);
                return [p.id, d.toLocaleDateString('id-ID'), d.toLocaleTimeString('id-ID'), p.supplierName, p.description, p.totalAmount, p.amountPaid, p.paymentStatus]
            });
            filename = 'laporan-pembelian.csv';
        } else if (activeTab === 'debt_supplier') {
            headers = ['ID', 'Tanggal', 'Supplier', 'Keterangan', 'Total', 'Dibayar', 'Sisa', 'Status'];
            rows = payables.map(p => [p.id, formatDate(p.date), p.supplierName, p.description, p.totalAmount, p.amountPaid, p.totalAmount - p.amountPaid, p.paymentStatus]);
            filename = 'laporan-utang-supplier.csv';
        } else if (activeTab === 'cashflow') {
            headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Keterangan'];
            rows = filteredCashFlows.map(c => [c.id, formatDate(c.date), c.type, c.category, c.amount, c.description]);
            filename = 'laporan-arus-kas.csv';
        } else if (activeTab === 'profit_loss') {
            headers = ['Item', 'Nilai'];
            rows = [
                ['Pendapatan Penjualan (Omzet)', plData.revenue],
                ['Harga Pokok Penjualan (HPP)', plData.cogs],
                ['Laba Kotor', plData.grossProfit],
                ['Beban Operasional', plData.expenses],
                ['Laba Bersih', plData.netProfit]
            ];
            filename = 'laporan-laba-rugi.csv';
        }

        exportToCSV(filename, headers, rows);
    };

    const handleCleanPrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        let content = '';
        let title = '';

        if (activeTab === 'history') {
            title = 'Laporan Transaksi Penjualan';
            const rows = filteredTransactions.map(t => `
              <tr>
                  <td>${t.id.substring(0, 8)}</td>
                  <td>${formatDate(t.date)}</td>
                  <td>${t.customerName}</td>
                  <td>${t.cashierName}</td>
                  <td style="text-align:right">${formatIDR(t.totalAmount)}</td>
                  <td>${t.paymentStatus}</td>
              </tr>
          `).join('');
            content = `<thead><tr><th>ID</th><th>Tanggal & Waktu</th><th>Pelanggan</th><th>Kasir</th><th>Total</th><th>Status</th></tr></thead><tbody>${rows}</tbody>`;
        } else if (activeTab === 'debt_customer') {
            title = 'Laporan Piutang Pelanggan';
            const rows = receivables.map(r => `
              <tr>
                  <td>${r.id.substring(0, 8)}</td>
                  <td>${formatDate(r.date)}</td>
                  <td>${r.customerName}</td>
                  <td style="text-align:right">${formatIDR(r.totalAmount)}</td>
                  <td style="text-align:right">${formatIDR(r.amountPaid)}</td>
                  <td style="text-align:right; color:red;">${formatIDR(r.totalAmount - r.amountPaid)}</td>
              </tr>
          `).join('');
            content = `<thead><tr><th>ID</th><th>Tanggal</th><th>Pelanggan</th><th>Total</th><th>Dibayar</th><th>Sisa Utang</th></tr></thead><tbody>${rows}</tbody>`;
        } else if (activeTab === 'purchase_history') {
            title = 'Laporan Pembelian Stok';
            const rows = filteredPurchases.map(p => `
              <tr>
                  <td>${p.id.substring(0, 8)}</td>
                  <td>${formatDate(p.date)}</td>
                  <td>${p.supplierName}</td>
                  <td>${p.description}</td>
                  <td style="text-align:right">${formatIDR(p.totalAmount)}</td>
                  <td>${p.paymentStatus}</td>
              </tr>
          `).join('');
            content = `<thead><tr><th>ID</th><th>Tanggal & Waktu</th><th>Supplier</th><th>Keterangan</th><th>Total</th><th>Status</th></tr></thead><tbody>${rows}</tbody>`;
        } else if (activeTab === 'debt_supplier') {
            title = 'Laporan Utang Supplier';
            const rows = payables.map(p => `
              <tr>
                  <td>${p.id.substring(0, 8)}</td>
                  <td>${formatDate(p.date)}</td>
                  <td>${p.supplierName}</td>
                  <td style="text-align:right">${formatIDR(p.totalAmount)}</td>
                  <td style="text-align:right">${formatIDR(p.amountPaid)}</td>
                  <td style="text-align:right; color:red;">${formatIDR(p.totalAmount - p.amountPaid)}</td>
              </tr>
          `).join('');
            content = `<thead><tr><th>ID</th><th>Tanggal</th><th>Supplier</th><th>Total</th><th>Dibayar</th><th>Sisa Utang</th></tr></thead><tbody>${rows}</tbody>`;
        } else if (activeTab === 'cashflow') {
            title = 'Laporan Arus Kas';
            const rows = filteredCashFlows.map(c => `
              <tr>
                  <td>${formatDate(c.date)}</td>
                  <td>${c.type}</td>
                  <td>${c.category}</td>
                  <td>${c.description}</td>
                  <td style="text-align:right">${formatIDR(c.amount)}</td>
              </tr>
          `).join('');
            content = `<thead><tr><th>Tanggal & Waktu</th><th>Tipe</th><th>Kategori</th><th>Keterangan</th><th>Jumlah</th></tr></thead><tbody>${rows}</tbody>`;
        } else if (activeTab === 'profit_loss') {
            title = 'Laporan Laba Rugi';
            content = `
                <tbody>
                    <tr>
                        <td style="font-weight:bold;">Pendapatan Penjualan (Omzet)</td>
                        <td style="text-align:right; font-weight:bold;">${formatIDR(plData.revenue)}</td>
                    </tr>
                    <tr>
                        <td>Harga Pokok Penjualan (HPP)</td>
                        <td style="text-align:right; color:red;">(${formatIDR(plData.cogs)})</td>
                    </tr>
                    <tr style="background-color:#f0f9ff;">
                        <td style="font-weight:bold;">Laba Kotor</td>
                        <td style="text-align:right; font-weight:bold;">${formatIDR(plData.grossProfit)}</td>
                    </tr>
                    <tr>
                        <td>Beban Operasional</td>
                        <td style="text-align:right; color:red;">(${formatIDR(plData.expenses)})</td>
                    </tr>
                    <tr style="background-color:#f0fdf4;">
                        <td style="font-weight:bold; font-size:1.2em;">Laba Bersih</td>
                        <td style="text-align:right; font-weight:bold; font-size:1.2em;">${formatIDR(plData.netProfit)}</td>
                    </tr>
                </tbody>
            `;
        }

        printWindow.document.write(`
          <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    h2 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #000; padding: 8px; font-size: 12px; }
                    th { background-color: #eee; }
                </style>
            </head>
            <body>
                <h2>${title}</h2>
                <p style="text-align:center; font-size:12px;">Periode: ${startDate || 'Awal'} s/d ${endDate || 'Sekarang'}</p>
                <table>
                    ${content}
                </table>
                <script>window.onload = () => window.print();</script>
            </body>
          </html>
      `);
        printWindow.document.close();
    };

    const printInvoice = (tx: Transaction) => {
        const settings = storeSettings || { name: 'KasirPintar' } as StoreSettings;
        const w = window.open('', '', 'width=800,height=600');
        if (!w) return;

        const html = generatePrintInvoice(tx, settings, formatIDR, formatDate);
        w.document.write(html);
        w.document.close();
    };

    const printGoodsNote = (tx: Transaction) => {
        const settings = storeSettings || { name: 'KasirPintar' } as StoreSettings;
        const w = window.open('', '', 'width=800,height=600');
        if (!w) return;

        const html = generatePrintGoodsNote(tx, settings, formatIDR, formatDate);
        w.document.write(html);
        w.document.close();
    };

    const printSuratJalan = (tx: Transaction) => {
        const settings = storeSettings || { name: 'KasirPintar' } as StoreSettings;
        const w = window.open('', '', 'width=800,height=600');
        if (!w) return;

        const html = generatePrintSuratJalan(tx, settings, formatDate, formatIDR);
        w.document.write(html);
        w.document.close();
    };

    const printTransactionDetail = (tx: Transaction) => {
        const settings = storeSettings || { name: 'KasirPintar' } as StoreSettings;
        const w = window.open('', '', 'width=800,height=600');
        if (!w) return;

        const html = generatePrintTransactionDetail(tx, settings, formatIDR, formatDate);
        w.document.write(html);
        w.document.close();
    };

    const printPurchaseDetail = (purchase: Purchase) => {
        const settings = storeSettings || { name: 'KasirPintar' } as StoreSettings;
        const w = window.open('', '', 'width=800,height=600');
        if (!w) return;

        const html = generatePrintPurchaseDetail(purchase, settings, formatIDR, formatDate);
        w.document.write(html);
        w.document.close();
    };

    // Render logic helper
    const numericInput = (val: string) => val.replace(/[^0-9]/g, '');

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
                {/* Top Controls */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'history', label: 'Riwayat Transaksi' },
                            { id: 'debt_customer', label: 'Piutang Pelanggan' },
                            { id: 'purchase_history', label: 'Riwayat Pembelian' },
                            { id: 'debt_supplier', label: 'Utang Supplier' },
                            { id: 'cashflow', label: 'Arus Kas' },
                            { id: 'profit_loss', label: 'Laba Rugi' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 font-medium text-sm transition-all relative whitespace-nowrap rounded-lg ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExport} className="text-sm flex items-center gap-2 bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                            <Download size={16} /> Export
                        </button>
                        <button onClick={handleCleanPrint} className="text-sm flex items-center gap-2 bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                            <Printer size={16} /> Print
                        </button>
                        {activeTab === 'debt_supplier' && (
                            <button onClick={() => setIsPurchaseModalOpen(true)} className="text-sm flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg shadow hover:bg-slate-800">
                                <Plus size={16} /> Catat Pembelian
                            </button>
                        )}
                    </div>
                </div>

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

                {/* Category Filter for Cashflow */}
                {activeTab === 'cashflow' && (
                    <div className="flex gap-3 w-full">
                        <div className="relative w-full max-w-xs">
                            <select
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm text-slate-700 pr-10 appearance-none cursor-pointer"
                                value={categoryFilter}
                                onChange={e => setCategoryFilter(e.target.value)}
                            >
                                <option value="">Semua Kategori</option>
                                {Array.from(new Set(cashFlows.map(cf => cf.category))).sort().map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <div className="relative flex-1 max-w-md">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari kategori atau keterangan..."
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
                )}

                {/* Search Input */}
                {activeTab !== 'profit_loss' && activeTab !== 'cashflow' && (
                    <div className="relative w-full max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={
                                activeTab === 'history' ? 'Cari ID, pelanggan, kasir...' :
                                    activeTab === 'debt_customer' ? 'Cari nama pelanggan...' :
                                        activeTab === 'debt_supplier' ? 'Cari supplier atau keterangan...' :
                                            'Cari kategori atau keterangan...'
                            }
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
                )}
            </div>

            {/* --- TAB: PROFIT LOSS --- */}
            {activeTab === 'profit_loss' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-slate-500 font-medium mb-2">Pendapatan (Omzet)</h3>
                            <p className="text-2xl font-bold text-slate-800">{formatIDR(plData.revenue)}</p>
                            <p className="text-xs text-slate-400 mt-1">Total penjualan kotor</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-slate-500 font-medium mb-2">Laba Kotor</h3>
                            <p className="text-2xl font-bold text-blue-600">{formatIDR(plData.grossProfit)}</p>
                            <p className="text-xs text-slate-400 mt-1">Omzet - HPP</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-slate-500 font-medium mb-2">Laba Bersih</h3>
                            <p className={`text-2xl font-bold ${plData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatIDR(plData.netProfit)}</p>
                            <p className="text-xs text-slate-400 mt-1">Laba Kotor - Beban Operasional</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700">
                            Detail Laba Rugi
                        </div>
                        <div className="p-6">
                            <div className="space-y-4 max-w-2xl mx-auto">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-slate-600">Pendapatan Penjualan</span>
                                    <span className="font-bold text-slate-800 text-right">{formatIDR(plData.revenue)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-slate-600">Harga Pokok Penjualan (HPP)</span>
                                    <span className="font-bold text-red-500 text-right">({formatIDR(plData.cogs)})</span>
                                </div>
                                <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                                    <span className="font-bold text-blue-800">Laba Kotor</span>
                                    <span className="font-bold text-blue-800 text-right">{formatIDR(plData.grossProfit)}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2 pt-2">
                                    <span className="text-slate-600">Beban Operasional</span>
                                    <span className="font-bold text-red-500 text-right">({formatIDR(plData.expenses)})</span>
                                </div>
                                <div className={`flex justify-between items-center p-4 rounded-xl ${plData.netProfit >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    <span className="font-bold text-lg">Laba Bersih</span>
                                    <span className="font-bold text-lg text-right">{formatIDR(plData.netProfit)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB: HISTORY --- */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between">
                        <span>Riwayat Transaksi Penjualan</span>
                        <span className="text-blue-600">Total: {formatIDR(filteredTransactions.reduce((s, t) => s + t.totalAmount, 0))}</span>
                    </div>
                    {searchQuery && (
                        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-sm text-blue-700">
                            <span className="font-medium">{filteredTransactions.length}</span> hasil ditemukan untuk "{searchQuery}"
                        </div>
                    )}
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('id')}>ID <SortIcon column="id" /></th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('date')}>Waktu <SortIcon column="date" /></th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('customerName')}>Pelanggan <SortIcon column="customerName" /></th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('totalAmount')}>Total <SortIcon column="totalAmount" /></th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('paymentStatus')}>Status <SortIcon column="paymentStatus" /></th>
                                <th className="p-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.map(t => (
                                <tr key={t.id} onClick={() => setDetailTransaction(t)} className="hover:bg-slate-50 cursor-pointer group">
                                    <td className="p-4 font-mono text-xs text-slate-400">#{t.id.substring(0, 6)}</td>
                                    <td className="p-4 text-slate-600">
                                        <div className="flex flex-col">
                                            <span>{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            <span className="text-xs text-slate-400">{new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-800">{t.customerName}</td>
                                    <td className="p-4 text-slate-800">{formatIDR(t.totalAmount)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${t.paymentStatus === 'LUNAS' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {t.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); printInvoice(t); }} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1" title="Cetak Nota">
                                                <Printer size={12} /> Nota
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); printGoodsNote(t); }} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 flex items-center gap-1" title="Cetak Nota Barang (Tanpa Bayar)">
                                                <ShoppingBag size={12} /> Barang
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); printSuratJalan(t); }} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 flex items-center gap-1" title="Cetak Surat Jalan">
                                                <FileText size={12} /> SJ
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setDetailTransaction(t); }} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 flex items-center gap-1" title="Detail">
                                                <Eye size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- TAB: CUSTOMER DEBT (PIUTANG) --- */}
            {activeTab === 'debt_customer' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between">
                            <span>Daftar Piutang Pelanggan</span>
                            <span className="text-orange-600">Total: {formatIDR(receivables.reduce((s, t) => s + (t.totalAmount - t.amountPaid), 0))}</span>
                        </div>
                        {searchQuery && (
                            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-sm text-blue-700">
                                <span className="font-medium">{receivables.length}</span> hasil ditemukan untuk "{searchQuery}"
                            </div>
                        )}
                        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                            {receivables.length === 0 && <div className="p-8 text-center text-slate-400">Tidak ada data piutang.</div>}
                            {receivables.map(t => {
                                const remaining = t.totalAmount - t.amountPaid;
                                return (
                                    <div key={t.id} className={`p-4 flex items-center justify-between cursor-pointer border-l-4 transition-colors ${selectedDebt?.id === t.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-slate-50 border-transparent'}`} onClick={() => setSelectedDebt(t)}>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{t.customerName}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span className="font-mono text-slate-400">#{t.id.substring(0, 6)}</span>
                                                <span>•</span>
                                                <Calendar size={12} /> {formatDate(t.date)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-red-600 font-bold">{formatIDR(remaining)}</p>
                                            <p className="text-xs text-slate-400">dari {formatIDR(t.totalAmount)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit sticky top-6">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Bayar Piutang</h3>
                        {selectedDebt ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-800 text-sm">
                                    <span className="block text-xs text-blue-400 uppercase tracking-wider font-bold mb-1">Pelanggan</span>
                                    <span className="font-bold text-lg">{selectedDebt.customerName}</span>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Sisa Tagihan</label>
                                    <div className="text-2xl font-bold text-slate-900">{formatIDR(selectedDebt.totalAmount - selectedDebt.amountPaid)}</div>
                                </div>

                                {/* History */}
                                {selectedDebt.paymentHistory && selectedDebt.paymentHistory.length > 0 && (
                                    <div className="bg-slate-50 p-3 rounded-lg max-h-40 overflow-y-auto border border-slate-200">
                                        <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Riwayat Pembayaran</p>
                                        {selectedDebt.paymentHistory.map((ph, idx) => (
                                            <div key={idx} className="flex justify-between text-xs text-slate-600 mb-2 border-b border-dashed border-slate-200 pb-1 last:border-0 last:pb-0 last:mb-0">
                                                <div className="flex flex-col">
                                                    <span>{new Date(ph.date).toLocaleDateString('id-ID')}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(ph.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                    {ph.note && <span className="text-[10px] italic text-slate-500">"{ph.note}"</span>}
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-slate-700">{formatIDR(ph.amount)}</span>
                                                    <div className="text-[10px] text-slate-400">{ph.method}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Jumlah Bayar</label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={repaymentAmount}
                                        onChange={e => setRepaymentAmount(numericInput(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Metode Bayar</label>
                                    <select
                                        className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg"
                                        value={repaymentMethod}
                                        onChange={e => {
                                            setRepaymentMethod(e.target.value as PaymentMethod);
                                            setRepaymentBankId('');
                                        }}
                                    >
                                        <option value={PaymentMethod.CASH}>Tunai</option>
                                        <option value={PaymentMethod.TRANSFER}>Transfer</option>
                                    </select>
                                </div>
                                {repaymentMethod === PaymentMethod.TRANSFER && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Ke Rekening</label>
                                        <select
                                            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg text-sm"
                                            value={repaymentBankId}
                                            onChange={e => setRepaymentBankId(e.target.value)}
                                        >
                                            <option value="">-- Pilih --</option>
                                            {banks.map(b => (
                                                <option key={b.id} value={b.id}>{b.bankName}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Catatan (Opsional)</label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={repaymentNote}
                                        onChange={e => setRepaymentNote(e.target.value)}
                                        placeholder="Ket. tambahan"
                                    />
                                </div>
                                <button
                                    onClick={handleRepaymentCustomer}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                                >
                                    Proses Pembayaran
                                </button>
                                <button onClick={() => setSelectedDebt(null)} className="w-full text-slate-400 text-sm hover:text-slate-600">Batal</button>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm text-center">Pilih transaksi dari daftar di samping untuk memproses pembayaran utang pelanggan.</p>
                        )}
                    </div>
                </div>
            )}

            {/* --- TAB: PURCHASE HISTORY --- */}
            {activeTab === 'purchase_history' && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between">
                        <span>Riwayat Pembelian Stok</span>
                        <span className="text-indigo-600">Total: {formatIDR(filteredPurchases.reduce((s, p) => s + p.totalAmount, 0))}</span>
                    </div>
                    {searchQuery && (
                        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-sm text-blue-700">
                            <span className="font-medium">{filteredPurchases.length}</span> hasil ditemukan untuk "{searchQuery}"
                        </div>
                    )}
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('id')}>ID <SortIcon column="id" /></th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('date')}>Tanggal <SortIcon column="date" /></th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('supplierName')}>Supplier <SortIcon column="supplierName" /></th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('description')}>Keterangan <SortIcon column="description" /></th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('totalAmount')}>Total <SortIcon column="totalAmount" /></th>
                                <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('paymentStatus')}>Status <SortIcon column="paymentStatus" /></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPurchases.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setDetailPurchase(p)}>
                                    <td className="p-4 font-mono text-xs text-slate-400">#{p.id.substring(0, 6)}</td>
                                    <td className="p-4 text-slate-600">
                                        <div className="flex flex-col">
                                            <span>{new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            <span className="text-xs text-slate-400">{new Date(p.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-800">{p.supplierName}</td>
                                    <td className="p-4 text-slate-600">{p.description}</td>
                                    <td className="p-4 text-slate-800">{formatIDR(p.totalAmount)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.paymentStatus === 'LUNAS' ? 'bg-green-100 text-green-600' :
                                            p.paymentStatus === 'SEBAGIAN' ? 'bg-orange-100 text-orange-600' :
                                                'bg-red-100 text-red-600'
                                            }`}>
                                            {p.paymentStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- TAB: SUPPLIER DEBT (UTANG) --- */}
            {activeTab === 'debt_supplier' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between">
                            <span>Daftar Utang ke Supplier</span>
                            <span className="text-red-600">Total: {formatIDR(payables.reduce((s, p) => s + (p.totalAmount - p.amountPaid), 0))}</span>
                        </div>
                        {searchQuery && (
                            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-sm text-blue-700">
                                <span className="font-medium">{payables.length}</span> hasil ditemukan untuk "{searchQuery}"
                            </div>
                        )}
                        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                            {payables.length === 0 && <div className="p-8 text-center text-slate-400">Tidak ada utang ke supplier.</div>}
                            {payables.map(p => (
                                <div key={p.id} className={`p-4 cursor-pointer border-l-4 transition-colors ${selectedPayable?.id === p.id ? 'bg-red-50 border-red-500' : 'hover:bg-slate-50 border-transparent'}`} onClick={() => setSelectedPayable(p)}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <div className="font-medium text-slate-800">{p.supplierName}</div>
                                            <div className="font-mono text-xs text-slate-400">#{p.id.substring(0, 6)}</div>
                                        </div>
                                        <div className="text-red-600 font-bold">{formatIDR(p.totalAmount - p.amountPaid)}</div>
                                    </div>
                                    <div className="flex justify-between items-end text-xs text-slate-500">
                                        <div>
                                            <div className="mb-1">{p.description}</div>
                                            <div className="flex items-center gap-2"><Calendar size={12} /> {formatDate(p.date)}</div>
                                        </div>
                                        <div>Total: {formatIDR(p.totalAmount)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit sticky top-6">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Bayar Utang Supplier</h3>
                        {selectedPayable ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-red-50 rounded-lg text-red-800 text-sm">
                                    <span className="block text-xs text-red-400 uppercase tracking-wider font-bold mb-1">Supplier</span>
                                    <span className="font-bold text-lg">{selectedPayable.supplierName}</span>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Sisa Utang</label>
                                    <div className="text-2xl font-bold text-slate-900">{formatIDR(selectedPayable.totalAmount - selectedPayable.amountPaid)}</div>
                                </div>

                                {/* History */}
                                {selectedPayable.paymentHistory && selectedPayable.paymentHistory.length > 0 && (
                                    <div className="bg-slate-50 p-3 rounded-lg max-h-40 overflow-y-auto border border-slate-200">
                                        <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Riwayat Pembayaran</p>
                                        {selectedPayable.paymentHistory.map((ph, idx) => (
                                            <div key={idx} className="flex justify-between text-xs text-slate-600 mb-2 border-b border-dashed border-slate-200 pb-1 last:border-0 last:pb-0 last:mb-0">
                                                <div className="flex flex-col">
                                                    <span>{new Date(ph.date).toLocaleDateString('id-ID')}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(ph.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                                    {ph.note && <span className="text-[10px] italic text-slate-500">"{ph.note}"</span>}
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-slate-700">{formatIDR(ph.amount)}</span>
                                                    <div className="text-[10px] text-slate-400">{ph.method}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-slate-700">Jumlah Bayar</label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={payableRepaymentAmount}
                                        onChange={e => setPayableRepaymentAmount(numericInput(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Metode Bayar</label>
                                    <select
                                        className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg"
                                        value={payableRepaymentMethod}
                                        onChange={e => {
                                            setPayableRepaymentMethod(e.target.value as PaymentMethod);
                                            setPayableBankId('');
                                        }}
                                    >
                                        <option value={PaymentMethod.CASH}>Tunai</option>
                                        <option value={PaymentMethod.TRANSFER}>Transfer</option>
                                    </select>
                                </div>
                                {payableRepaymentMethod === PaymentMethod.TRANSFER && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Dari Rekening</label>
                                        <select
                                            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg text-sm"
                                            value={payableBankId}
                                            onChange={e => setPayableBankId(e.target.value)}
                                        >
                                            <option value="">-- Pilih --</option>
                                            {banks.map(b => (
                                                <option key={b.id} value={b.id}>{b.bankName}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Catatan</label>
                                    <input
                                        type="text"
                                        className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={payableNote}
                                        onChange={e => setPayableNote(e.target.value)}
                                        placeholder="Ket. tambahan"
                                    />
                                </div>
                                <button
                                    onClick={handleRepaymentSupplier}
                                    className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800"
                                >
                                    Bayar Utang
                                </button>
                                <button onClick={() => setSelectedPayable(null)} className="w-full text-slate-400 text-sm hover:text-slate-600">Batal</button>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm text-center">Pilih data pembelian dari daftar di samping untuk memproses pembayaran utang ke supplier.</p>
                        )}
                    </div>
                </div>
            )}

            {/* --- TAB: CASHFLOW --- */}
            {activeTab === 'cashflow' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-slate-700">Riwayat Arus Kas</span>
                                <div className="flex gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <ArrowDownLeft size={16} className="text-green-600" />
                                        <span className="text-slate-500">Masuk:</span>
                                        <span className="font-bold text-green-600">
                                            {formatIDR(filteredCashFlows.filter(cf => cf.type === CashFlowType.IN).reduce((sum, cf) => sum + cf.amount, 0))}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ArrowUpRight size={16} className="text-red-600" />
                                        <span className="text-slate-500">Keluar:</span>
                                        <span className="font-bold text-red-600">
                                            {formatIDR(filteredCashFlows.filter(cf => cf.type === CashFlowType.OUT).reduce((sum, cf) => sum + cf.amount, 0))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {searchQuery && (
                            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-sm text-blue-700">
                                <span className="font-medium">{filteredCashFlows.length}</span> hasil ditemukan untuk "{searchQuery}"
                            </div>
                        )}
                        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                            {filteredCashFlows.map(cf => (
                                <div key={cf.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${cf.type === CashFlowType.IN ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {cf.type === CashFlowType.IN ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{cf.category}</p>
                                            <p className="text-xs text-slate-500">{cf.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${cf.type === CashFlowType.IN ? 'text-green-600' : 'text-red-600'}`}>
                                            {cf.type === CashFlowType.IN ? '+' : '-'}{formatIDR(cf.amount)}
                                        </p>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400">{formatDate(cf.date)}</span>
                                            <span className="text-[10px] text-slate-300">{new Date(cf.date).toLocaleTimeString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit">
                        <h3 className="font-bold text-lg mb-4 text-slate-800">Catat Kas Manual</h3>
                        <div className="space-y-4">
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                                <button onClick={() => setCfType(CashFlowType.OUT)} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${cfType === CashFlowType.OUT ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}>Uang Keluar</button>
                                <button onClick={() => setCfType(CashFlowType.IN)} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${cfType === CashFlowType.IN ? 'bg-white shadow text-green-600' : 'text-slate-500'}`}>Uang Masuk</button>
                            </div>
                            <input
                                type="text"
                                placeholder="Jumlah (Rp)"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                value={cfAmount}
                                onChange={e => setCfAmount(numericInput(e.target.value))}
                            />

                            {/* Category Selection */}
                            <select
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm"
                                value={cfCategory}
                                onChange={e => setCfCategory(e.target.value)}
                            >
                                <option value="">-- Pilih Kategori --</option>
                                {cfType === CashFlowType.IN ? (
                                    <>
                                        <option value="Pemasukan Lain">Pemasukan Lain</option>
                                        <option value="Modal Tambahan">Modal Tambahan</option>
                                        <option value="Pendapatan Jasa">Pendapatan Jasa</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Operasional">Operasional</option>
                                        <option value="Gaji Karyawan">Gaji Karyawan</option>
                                        <option value="Listrik & Air">Listrik & Air</option>
                                        <option value="Sewa Tempat">Sewa Tempat</option>
                                        <option value="Perbaikan & Maintenance">Perbaikan & Maintenance</option>
                                        <option value="Prive">Prive (Tarik Tunai)</option>
                                        <option value="Pengeluaran Lain">Pengeluaran Lain</option>
                                    </>
                                )}
                            </select>

                            <textarea
                                placeholder="Keterangan (misal: Beli plastik, Bayar listrik)"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm"
                                rows={3}
                                value={cfDesc}
                                onChange={e => setCfDesc(e.target.value)}
                            ></textarea>
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm"
                                    value={cfPaymentMethod}
                                    onChange={e => {
                                        setCfPaymentMethod(e.target.value as PaymentMethod);
                                        setCfBankId('');
                                    }}
                                >
                                    <option value={PaymentMethod.CASH}>Tunai</option>
                                    <option value={PaymentMethod.TRANSFER}>Transfer</option>
                                </select>
                                {cfPaymentMethod === PaymentMethod.TRANSFER && (
                                    <select
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm"
                                        value={cfBankId}
                                        onChange={e => setCfBankId(e.target.value)}
                                    >
                                        <option value="">-- Bank --</option>
                                        {banks.map(b => (
                                            <option key={b.id} value={b.id}>{b.bankName}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <button
                                onClick={handleAddCashFlow}
                                className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800"
                            >
                                Simpan Catatan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAIL MODAL */}
            {detailTransaction && createPortal(
                <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Detail Transaksi #{detailTransaction.id.substring(0, 8)}</h3>
                            <button onClick={() => setDetailTransaction(null)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                <div>
                                    <span className="text-slate-500 block text-xs">Waktu Transaksi</span>
                                    <span className="font-medium text-slate-900">
                                        {formatDate(detailTransaction.date)} <span className="text-slate-400 text-xs">({new Date(detailTransaction.date).toLocaleTimeString('id-ID')})</span>
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Kasir</span>
                                    <span className="font-medium text-slate-900">{detailTransaction.cashierName}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Pelanggan</span>
                                    <span className="font-medium text-slate-900">{detailTransaction.customerName}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Metode Awal</span>
                                    <span className="font-medium text-slate-900">{detailTransaction.paymentMethod}</span>
                                    {detailTransaction.bankName && <span className="block text-xs text-blue-600">via {detailTransaction.bankName}</span>}
                                </div>
                            </div>

                            <h4 className="font-bold text-sm text-slate-800 mb-2">Barang Dibeli</h4>
                            <div className="border rounded-lg overflow-hidden mb-6">
                                {detailTransaction.items.map((item, i) => (
                                    <div key={i} className="flex justify-between p-3 border-b last:border-0 text-sm">
                                        <div>
                                            <span className="block font-medium text-slate-700">{item.name}</span>
                                            <span className="text-xs text-slate-500">{item.qty} x {formatIDR(item.finalPrice)}</span>
                                        </div>
                                        <span className="font-medium text-slate-800">{formatIDR(item.finalPrice * item.qty)}</span>
                                    </div>
                                ))}
                                <div className="bg-slate-50 p-3 flex justify-between font-bold text-slate-900">
                                    <span>Total</span>
                                    <span>{formatIDR(detailTransaction.totalAmount)}</span>
                                </div>
                            </div>

                            {/* Payment History */}
                            <h4 className="font-bold text-sm text-slate-800 mb-2">Riwayat Pembayaran</h4>
                            <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
                                {detailTransaction.paymentHistory?.map((ph, i) => (
                                    <div key={i} className="flex justify-between border-b border-slate-200 last:border-0 pb-1">
                                        <div>
                                            <div className="flex gap-1 text-xs text-slate-500">
                                                <span>{new Date(ph.date).toLocaleDateString('id-ID')}</span>
                                                <span className="font-mono bg-slate-200 px-1 rounded text-[10px]">{new Date(ph.date).toLocaleTimeString('id-ID')}</span>
                                            </div>
                                            <span className="text-slate-700 block">{ph.note || 'Pembayaran'} ({ph.method})</span>
                                            {ph.bankName && <span className="text-[10px] text-blue-600 italic">via {ph.bankName}</span>}
                                        </div>
                                        <span className="font-medium text-green-600">{formatIDR(ph.amount)}</span>
                                    </div>
                                ))}
                                {!detailTransaction.paymentHistory && (
                                    <div className="flex justify-between">
                                        <span>Pembayaran Awal</span>
                                        <span>{formatIDR(detailTransaction.amountPaid)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 font-bold border-t border-slate-200">
                                    <span>Total Dibayar</span>
                                    <span>{formatIDR(detailTransaction.amountPaid)}</span>
                                </div>
                                <div className="flex justify-between text-red-600 font-bold">
                                    <span>Sisa Tagihan</span>
                                    <span>{formatIDR(detailTransaction.totalAmount - detailTransaction.amountPaid)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                            <button onClick={() => openReturnTxModal(detailTransaction)} className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-100">
                                <RotateCcw size={16} /> Retur
                            </button>
                            <button onClick={() => printTransactionDetail(detailTransaction)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
                                <Printer size={16} /> Cetak Detail
                            </button>
                            <button onClick={() => setDetailTransaction(null)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Tutup</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* PURCHASE DETAIL MODAL */}
            {detailPurchase && createPortal(
                <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Detail Pembelian #{detailPurchase.id.substring(0, 8)}</h3>
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
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs">Status</span>
                                    <span className={`font-bold ${detailPurchase.paymentStatus === 'LUNAS' ? 'text-green-600' : 'text-red-600'}`}>{detailPurchase.paymentStatus}</span>
                                </div>
                            </div>

                            <h4 className="font-bold text-sm text-slate-800 mb-2">Keterangan Barang</h4>
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-6 text-sm text-slate-700">
                                {detailPurchase.description}
                            </div>

                            <div className="flex justify-between font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">
                                <span>Total Pembelian</span>
                                <span>{formatIDR(detailPurchase.totalAmount)}</span>
                            </div>

                            {/* Payment History */}
                            <h4 className="font-bold text-sm text-slate-800 mb-2">Riwayat Pembayaran</h4>
                            <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
                                {detailPurchase.paymentHistory?.map((ph, i) => (
                                    <div key={i} className="flex justify-between border-b border-slate-200 last:border-0 pb-1">
                                        <div>
                                            <div className="flex gap-1 text-xs text-slate-500">
                                                <span>{new Date(ph.date).toLocaleDateString('id-ID')}</span>
                                            </div>
                                            <span className="text-slate-700 block">{ph.note || 'Pembayaran'} ({ph.method})</span>
                                            {ph.bankName && <span className="text-[10px] text-blue-600 italic">via {ph.bankName}</span>}
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
                            <button onClick={() => setIsReturnPurchaseModalOpen(true)} className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-100">
                                <RotateCcw size={16} /> Retur
                            </button>
                            <button onClick={() => printPurchaseDetail(detailPurchase)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
                                <Printer size={16} /> Cetak Detail
                            </button>
                            <button onClick={() => setDetailPurchase(null)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Tutup</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* PURCHASE MODAL */}
            {isPurchaseModalOpen && createPortal(
                <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
                        <h3 className="font-bold text-xl mb-4">Catat Pembelian Stok</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                                <select
                                    className="w-full border border-slate-300 p-2 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={purchaseForm.supplierId}
                                    onChange={e => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}
                                >
                                    <option value="">-- Pilih Supplier --</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan Barang</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Misal: 10 Bal Keripik Singkong"
                                    value={purchaseForm.description}
                                    onChange={e => setPurchaseForm({ ...purchaseForm, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Total Belanja (Rp)</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={purchaseForm.amount}
                                    onChange={e => setPurchaseForm({ ...purchaseForm, amount: numericInput(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Dibayar (Rp)</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0 jika tempo"
                                    value={purchaseForm.paid}
                                    onChange={e => setPurchaseForm({ ...purchaseForm, paid: numericInput(e.target.value) })}
                                />
                                <p className="text-xs text-slate-500 mt-1">Sisa akan dicatat sebagai utang supplier.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
                                <select
                                    className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={purchaseForm.paymentMethod}
                                    onChange={e => setPurchaseForm({ ...purchaseForm, paymentMethod: e.target.value as PaymentMethod, bankId: '' })}
                                >
                                    <option value={PaymentMethod.CASH}>Tunai</option>
                                    <option value={PaymentMethod.TRANSFER}>Transfer</option>
                                </select>
                            </div>
                            {purchaseForm.paymentMethod === PaymentMethod.TRANSFER && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Rekening Sumber</label>
                                    <select
                                        className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={purchaseForm.bankId}
                                        onChange={e => setPurchaseForm({ ...purchaseForm, bankId: e.target.value })}
                                    >
                                        <option value="">-- Pilih Rekening --</option>
                                        {banks.map(b => (
                                            <option key={b.id} value={b.id}>{b.bankName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setIsPurchaseModalOpen(false)} className="flex-1 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium">Batal</button>
                                <button onClick={handlePurchaseSubmit} className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">Simpan</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* RETURN TRANSACTION MODAL */}
            {isReturnTxModalOpen && createPortal(
                <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Retur Penjualan</h3>
                            <button onClick={() => setIsReturnTxModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <p className="text-sm text-slate-600 mb-4">Pilih barang dan jumlah yang ingin diretur dari transaksi ini.</p>
                            <div className="space-y-3">
                                {returnTxItems.map((item, idx) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-800">{item.name}</div>
                                            <div className="text-xs text-slate-500">Maks: {item.maxQty} | Harga: {formatIDR(item.price)}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    const newItems = [...returnTxItems];
                                                    if (newItems[idx].qty > 0) newItems[idx].qty--;
                                                    setReturnTxItems(newItems);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200"
                                            >-</button>
                                            <span className="w-8 text-center font-bold">{item.qty}</span>
                                            <button
                                                onClick={() => {
                                                    const newItems = [...returnTxItems];
                                                    if (newItems[idx].qty < item.maxQty) newItems[idx].qty++;
                                                    setReturnTxItems(newItems);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200"
                                            >+</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 bg-red-50 rounded-xl flex justify-between items-center">
                                <span className="text-red-800 font-medium">Total Refund</span>
                                <span className="text-red-800 font-bold text-xl">
                                    {formatIDR(returnTxItems.reduce((sum, i) => sum + (i.qty * i.price), 0))}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                            <button onClick={() => setIsReturnTxModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Batal</button>
                            <button onClick={submitReturnTx} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-200">
                                Proses Retur
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* RETURN PURCHASE MODAL */}
            {isReturnPurchaseModalOpen && createPortal(
                <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800">Retur Pembelian (Ke Supplier)</h3>
                            <button onClick={() => setIsReturnPurchaseModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <p className="text-sm text-slate-600 mb-4">Pilih barang dari stok yang ingin dikembalikan ke supplier <b>{detailPurchase?.supplierName}</b>.</p>

                            {/* Product Search */}
                            <div className="mb-4 relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari barang untuk diretur..."
                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                />
                                {productSearch && (
                                    <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                        {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                                            <div
                                                key={p.id}
                                                className="p-2 hover:bg-slate-50 cursor-pointer text-sm flex justify-between"
                                                onClick={() => {
                                                    if (!returnPurchaseItems.find(i => i.id === p.id)) {
                                                        setReturnPurchaseItems([...returnPurchaseItems, { id: p.id, qty: 1, price: p.hpp, name: p.name }]);
                                                    }
                                                    setProductSearch('');
                                                }}
                                            >
                                                <span>{p.name}</span>
                                                <span className="text-slate-400 text-xs">Stok: {p.stock}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                {returnPurchaseItems.map((item, idx) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-800">{item.name}</div>
                                            <div className="text-xs text-slate-500">Refund/Item: {formatIDR(item.price)}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => {
                                                    const newItems = [...returnPurchaseItems];
                                                    if (newItems[idx].qty > 0) newItems[idx].qty--;
                                                    if (newItems[idx].qty === 0) {
                                                        setReturnPurchaseItems(newItems.filter((_, i) => i !== idx));
                                                    } else {
                                                        setReturnPurchaseItems(newItems);
                                                    }
                                                }}
                                                className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200"
                                            >-</button>
                                            <span className="w-8 text-center font-bold">{item.qty}</span>
                                            <button
                                                onClick={() => {
                                                    const newItems = [...returnPurchaseItems];
                                                    newItems[idx].qty++;
                                                    setReturnPurchaseItems(newItems);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200"
                                            >+</button>
                                            <button onClick={() => setReturnPurchaseItems(returnPurchaseItems.filter((_, i) => i !== idx))} className="text-red-500 ml-2"><X size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                {returnPurchaseItems.length === 0 && (
                                    <div className="text-center text-slate-400 py-4 text-sm">Belum ada barang dipilih.</div>
                                )}
                            </div>
                            <div className="mt-6 p-4 bg-green-50 rounded-xl flex justify-between items-center">
                                <span className="text-green-800 font-medium">Total Refund (Masuk)</span>
                                <span className="text-green-800 font-bold text-xl">
                                    {formatIDR(returnPurchaseItems.reduce((sum, i) => sum + (i.qty * i.price), 0))}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                            <button onClick={() => setIsReturnPurchaseModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Batal</button>
                            <button onClick={submitReturnPurchase} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-200">
                                Proses Retur
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};