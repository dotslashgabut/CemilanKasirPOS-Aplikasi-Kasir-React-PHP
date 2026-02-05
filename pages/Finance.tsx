import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../hooks/useData';
import { StorageService } from '../services/storage';
import { Transaction, PaymentStatus, CashFlow, CashFlowType, Purchase, Supplier, PaymentMethod, CashFlow as CashFlowTypeInterface, StoreSettings, BankAccount, User, UserRole, TransactionType, PurchaseType } from '../types';
import { formatIDR, formatDate, exportToCSV, generateId } from '../utils';
import { generatePrintInvoice, generatePrintGoodsNote, generatePrintSuratJalan, generatePrintTransactionDetail, generatePrintPurchaseDetail, generatePrintPurchaseNote } from '../utils/printHelpers';
import { ArrowDownLeft, ArrowUpRight, Download, Plus, Printer, FileText, Filter, RotateCcw, X, Eye, ShoppingBag, Calendar, Clock, Search, ArrowUpDown, ArrowUp, ArrowDown, Trash2, FileSpreadsheet } from 'lucide-react';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import * as XLSX from 'xlsx';

interface FinanceProps {
    currentUser: User | null;
    defaultTab?: 'history' | 'debt_customer' | 'purchase_history' | 'debt_supplier' | 'cashflow';
}

export const Finance: React.FC<FinanceProps> = ({ currentUser, defaultTab = 'history' }) => {
    const [activeTab, setActiveTab] = useState<'history' | 'debt_customer' | 'purchase_history' | 'debt_supplier' | 'cashflow' | 'profit_loss' | 'manual_cash_report'>(defaultTab);

    // Data State with useData
    const transactions = useData(() => StorageService.getTransactions(), [], 'transactions') || [];
    const purchases = useData(() => StorageService.getPurchases(), [], 'purchases') || [];
    const cashFlows = useData(() => StorageService.getCashFlow(), [], 'cashflow') || [];
    const suppliers = useData(() => StorageService.getSuppliers(), [], 'suppliers') || [];
    const customers = useData(() => StorageService.getCustomers(), [], 'customers') || [];
    const banks = useData(() => StorageService.getBanks(), [], 'banks') || [];
    const users = useMemo(() => {
        // 1. Group by ID first to merge "username" vs "FullName" for the same user ID
        const usersById = new Map<string, string>(); // ID -> Name

        const processUser = (id: string | number | undefined, name: string | undefined) => {
            if (!id || !name) return;
            const strId = String(id);

            if (!usersById.has(strId)) {
                usersById.set(strId, name);
            } else {
                const existingName = usersById.get(strId)!;
                // Heuristic: Prefer longer name (e.g. "Administrator" over "admin")
                // This helps avoid showing username when proper name is available
                if (name.length > existingName.length) {
                    usersById.set(strId, name);
                }
            }
        };

        transactions.forEach(t => processUser(t.cashierId, t.cashierName));
        cashFlows.forEach(cf => processUser(cf.userId, cf.userName));
        purchases.forEach(p => processUser(p.userId, p.userName));

        // 2. Extract unique names
        // But we want to return the ID as the key, and the Best Name as the label.

        return Array.from(usersById.entries())
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [transactions, cashFlows, purchases]);
    const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(20);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Reset pagination and filters on tab change
    useEffect(() => {
        setVisibleCount(20);
        setCategoryFilter('');
        setPaymentMethodFilter('');
        setStatusFilter('');
    }, [activeTab]);

    // Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(''); // Filter category for cashflow
    const [paymentMethodFilter, setPaymentMethodFilter] = useState(''); // Filter payment method for cashflow
    const [statusFilter, setStatusFilter] = useState(''); // Filter payment status/type for transactions/purchases
    const [userFilter, setUserFilter] = useState(''); // Filter by user/cashier

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
            ? <ArrowUp size={14} className="ml-1 text-primary inline" />
            : <ArrowDown size={14} className="ml-1 text-primary inline" />;
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
    const [purchaseItems, setPurchaseItems] = useState<{ id: string, qty: number, price: number, name: string }[]>([]);
    const [purchaseMode, setPurchaseMode] = useState<'items' | 'manual'>('items');
    const [purchaseProductSearch, setPurchaseProductSearch] = useState('');

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
    const [returnPurchaseItems, setReturnPurchaseItems] = useState<{ id: string, qty: number, maxQty: number, price: number, name: string }[]>([]);
    const products = useData(() => StorageService.getProducts(), [], 'products') || [];
    const [productSearch, setProductSearch] = useState('');
    const [returnPurchaseMethod, setReturnPurchaseMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [returnPurchaseBankId, setReturnPurchaseBankId] = useState('');
    const [returnPurchaseManualAmount, setReturnPurchaseManualAmount] = useState('');
    const [returnPurchaseMode, setReturnPurchaseMode] = useState<'items' | 'manual'>('items');
    const [returnTxNote, setReturnTxNote] = useState('');
    const [returnTxMethod, setReturnTxMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
    const [returnTxBankId, setReturnTxBankId] = useState('');
    const [returnPurchaseNote, setReturnPurchaseNote] = useState('');

    // Confirmation Modal State
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        cancelLabel: string;
        onConfirm: () => void;
        type: 'default' | 'danger' | 'warning';
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: 'Konfirmasi',
        cancelLabel: 'Batal',
        onConfirm: () => { },
        type: 'default'
    });

    useEffect(() => {
        StorageService.getStoreSettings().then(setStoreSettings);
    }, []);

    // Return Logic
    const openReturnTxModal = (tx: Transaction) => {
        // Prevent returning a return transaction
        if (tx.type === TransactionType.RETURN) {
            alert("Transaksi Retur tidak dapat diretur kembali.");
            return;
        }

        // Calculate previously returned quantities for this transaction
        const previousReturns = transactions.filter(t =>
            t.type === TransactionType.RETURN &&
            t.originalTransactionId === tx.id
        );

        const returnedQuantities: Record<string, number> = {};
        previousReturns.forEach(ret => {
            ret.items.forEach(item => {
                returnedQuantities[item.id] = (returnedQuantities[item.id] || 0) + item.qty;
            });
        });

        const itemsWithRemainingQty = tx.items.map(i => {
            const returnedQty = returnedQuantities[i.id] || 0;
            const remainingQty = Math.max(0, i.qty - returnedQty);

            return {
                id: i.id,
                qty: 0,
                maxQty: remainingQty,
                price: i.finalPrice,
                name: i.name
            };
        });

        // Check if there are any items left to return
        const canReturn = itemsWithRemainingQty.some(i => i.maxQty > 0);

        if (!canReturn) {
            alert("Transaksi ini sudah diretur sepenuhnya (Full Return).");
            return;
        }

        setReturnTxItems(itemsWithRemainingQty);
        setReturnTxMethod(PaymentMethod.CASH);
        setReturnTxBankId('');
        setIsReturnTxModalOpen(true);
    };

    const openReturnPurchaseModal = (purchase: Purchase) => {
        if (purchase.type === PurchaseType.RETURN) {
            alert("Pembelian Retur tidak dapat diretur kembali.");
            return;
        }

        // Calculate previously returned quantities
        const previousReturns = purchases.filter(p =>
            p.type === PurchaseType.RETURN &&
            p.originalPurchaseId === purchase.id
        );

        const returnedQuantities: Record<string, number> = {};
        previousReturns.forEach(ret => {
            ret.items.forEach(item => {
                returnedQuantities[item.id] = (returnedQuantities[item.id] || 0) + item.qty;
            });
        });

        const itemsWithRemainingQty = purchase.items.map(i => {
            const returnedQty = returnedQuantities[i.id] || 0;
            const remainingQty = Math.max(0, i.qty - returnedQty);

            return {
                id: i.id,
                qty: 0,
                maxQty: remainingQty,
                price: i.finalPrice,
                name: i.name
            };
        });

        const canReturn = itemsWithRemainingQty.some(i => i.maxQty > 0);

        if (!canReturn) {
            alert("Pembelian ini sudah diretur sepenuhnya.");
            return;
        }

        setReturnPurchaseItems(itemsWithRemainingQty);
        setReturnPurchaseMode('items');
        setIsReturnPurchaseModalOpen(true);
    };

    const submitReturnTx = async () => {
        try {
            if (!detailTransaction) return;

            if (returnTxMethod === PaymentMethod.TRANSFER && !returnTxBankId) {
                alert("Pilih rekening bank untuk pengembalian dana via transfer.");
                return;
            }

            const itemsToReturn = returnTxItems.filter(i => i.qty > 0);
            if (itemsToReturn.length === 0) {
                alert("Pilih setidaknya satu barang untuk diretur.");
                return;
            }

            const totalReturnValue = itemsToReturn.reduce((sum, i) => sum + (i.qty * i.price), 0);

            // 1. Hitung Hutang Saat Ini (Sisa Tagihan)
            const currentDebt = detailTransaction.totalAmount - detailTransaction.amountPaid;

            // 2. Tentukan Alokasi Nilai Retur
            // Prioritas: Potong Hutang dulu, baru Refund Tunai
            const cutDebtAmount = Math.min(totalReturnValue, currentDebt);
            const cashRefundAmount = totalReturnValue - cutDebtAmount;

            const now = new Date().toISOString();

            // 3. Update Transaksi Asal
            // Always update isReturned status
            let updatedOriginalTx = {
                ...detailTransaction,
                isReturned: true
            };

            // Jika ada potong hutang, update payment info
            if (cutDebtAmount > 0) {
                const newPaid = detailTransaction.amountPaid + cutDebtAmount;
                const newStatus = newPaid >= detailTransaction.totalAmount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

                const updatedHistory = [...(detailTransaction.paymentHistory || [])];
                updatedHistory.push({
                    date: now,
                    amount: cutDebtAmount,
                    method: PaymentMethod.CASH, // Dianggap sebagai pembayaran via retur
                    note: 'Potong Utang (Retur Barang)'
                });

                updatedOriginalTx = {
                    ...updatedOriginalTx,
                    amountPaid: newPaid,
                    paymentStatus: newStatus,
                    paymentHistory: updatedHistory,
                    change: 0
                };
            }

            await StorageService.updateTransaction(updatedOriginalTx);

            // 4. Buat Transaksi Retur (Record Stock In & History)
            const returnTx: Transaction = {
                id: generateId(),
                type: TransactionType.RETURN,
                originalTransactionId: detailTransaction.id,
                date: now,
                items: itemsToReturn.map(i => {
                    const originalItem = detailTransaction.items.find(oi => oi.id === i.id);
                    return {
                        ...originalItem!,
                        qty: i.qty,
                        finalPrice: i.price
                    };
                }),
                totalAmount: -totalReturnValue, // Negative for return
                amountPaid: -totalReturnValue, // Anggap lunas
                change: 0,
                paymentStatus: PaymentStatus.PAID,
                paymentMethod: returnTxMethod,
                bankId: returnTxMethod === PaymentMethod.TRANSFER ? returnTxBankId : undefined,
                bankName: returnTxMethod === PaymentMethod.TRANSFER ? banks.find(b => b.id === returnTxBankId)?.bankName : undefined,
                paymentNote: `Retur dari ${detailTransaction.invoiceNumber ? `Faktur ${detailTransaction.invoiceNumber}` : `#${detailTransaction.id.substring(0, 6)}`}` + (cutDebtAmount > 0 ? ` (Potong Utang: ${formatIDR(cutDebtAmount)})` : ''),
                returnNote: returnTxNote,
                ...(detailTransaction.customerId && { customerId: detailTransaction.customerId }), // Only include if exists
                customerName: detailTransaction.customerName,
                cashierId: currentUser?.id || 'SYSTEM',
                cashierName: currentUser?.name || 'System',
                skipCashFlow: cutDebtAmount > 0 // Skip backend auto-cashflow if we are cutting debt (complex case)
            };

            await StorageService.addTransaction(returnTx);

            // 5. Record Cash Out (Hanya jika ada uang tunai yang dikembalikan)
            // If we cut debt, we skipped backend auto-cashflow, so we must add it manually here if there is a cash refund
            if (cutDebtAmount > 0 && cashRefundAmount > 0) {
                await StorageService.addCashFlow({
                    id: '',
                    date: now,
                    type: CashFlowType.OUT,
                    amount: cashRefundAmount,
                    category: 'Retur Penjualan',
                    description: `Refund Retur ${detailTransaction.invoiceNumber ? `Faktur ${detailTransaction.invoiceNumber}` : `Transaksi #${detailTransaction.id.substring(0, 6)}`}` + (returnTxMethod === PaymentMethod.TRANSFER ? ` (via ${banks.find(b => b.id === returnTxBankId)?.bankName})` : ''),
                    paymentMethod: returnTxMethod,
                    bankId: returnTxMethod === PaymentMethod.TRANSFER ? returnTxBankId : undefined,
                    bankName: returnTxMethod === PaymentMethod.TRANSFER ? banks.find(b => b.id === returnTxBankId)?.bankName : undefined,
                    userId: currentUser?.id,
                    userName: currentUser?.name,
                    referenceId: returnTx.id // Link to Return Transaction ID
                });
            }

            setIsReturnTxModalOpen(false);
            setDetailTransaction(null);
            setReturnTxNote('');

            let message = 'Retur berhasil diproses.';
            if (cutDebtAmount > 0) message += `\nDipotong dari hutang: ${formatIDR(cutDebtAmount)}`;
            if (cashRefundAmount > 0) message += `\nDikembalikan tunai: ${formatIDR(cashRefundAmount)}`;

            alert(message);
        } catch (error) {
            console.error('Error processing return:', error);
            alert(`Gagal memproses retur: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const submitReturnPurchase = async () => {
        if (!detailPurchase) return;

        let totalRefund = 0;
        let itemsToReturn: any[] = [];
        let description = '';

        if (returnPurchaseMode === 'items') {
            itemsToReturn = returnPurchaseItems.filter(i => i.qty > 0);
            if (itemsToReturn.length === 0) {
                alert("Pilih setidaknya satu barang untuk diretur.");
                return;
            }
            totalRefund = itemsToReturn.reduce((sum, i) => sum + (i.qty * i.price), 0);
            description = `Retur Barang: ${itemsToReturn.map(i => i.name).join(', ')}`;
        } else {
            totalRefund = parseFloat(returnPurchaseManualAmount.replace(/[^0-9]/g, ''));
            if (totalRefund <= 0) {
                alert("Masukkan nominal retur yang valid.");
                return;
            }
            description = `Retur Nominal (Manual) dari Pembelian #${detailPurchase.id.substring(0, 6)}`;
        }

        if (returnPurchaseMethod === PaymentMethod.TRANSFER && !returnPurchaseBankId) {
            alert("Pilih rekening bank tujuan pengembalian dana.");
            return;
        }

        const selectedBank = banks.find(b => b.id === returnPurchaseBankId);

        // 1. Hitung Hutang Saat Ini (Sisa Tagihan)
        const currentDebt = detailPurchase.totalAmount - detailPurchase.amountPaid;

        // 2. Tentukan Alokasi Nilai Retur
        // Prioritas: Potong Hutang dulu, baru Refund Tunai
        const cutDebtAmount = Math.min(totalRefund, currentDebt);
        const cashRefundAmount = totalRefund - cutDebtAmount;

        const now = new Date().toISOString();

        // 3. Update Pembelian Asal (Potong Utang)
        let updatedOriginalPurchase = {
            ...detailPurchase,
            isReturned: true
        };

        if (cutDebtAmount > 0) {
            const newPaid = detailPurchase.amountPaid + cutDebtAmount;
            const newStatus = newPaid >= detailPurchase.totalAmount ? PaymentStatus.PAID : PaymentStatus.PARTIAL;

            const updatedHistory = [...(detailPurchase.paymentHistory || [])];
            updatedHistory.push({
                date: now,
                amount: cutDebtAmount,
                method: PaymentMethod.CASH, // Dianggap sebagai pembayaran via retur
                note: 'Potong Utang (Retur Pembelian)'
            });

            updatedOriginalPurchase = {
                ...updatedOriginalPurchase,
                amountPaid: newPaid,
                paymentStatus: newStatus,
                paymentHistory: updatedHistory
            };
        }

        await StorageService.updatePurchase(updatedOriginalPurchase);

        // 4. Buat Transaksi Retur Pembelian
        const returnPurchase: Purchase = {
            id: generateId(),
            type: PurchaseType.RETURN,
            date: now,
            supplierId: detailPurchase.supplierId,
            supplierName: detailPurchase.supplierName,
            originalPurchaseId: detailPurchase.id,
            description: description,
            items: returnPurchaseMode === 'items' ? itemsToReturn.map(i => {
                const product = products.find(p => p.id === i.id);
                return {
                    ...product,
                    qty: i.qty,
                    finalPrice: i.price,
                    selectedPriceType: 'UMUM'
                } as any;
            }) : [],
            totalAmount: -totalRefund,
            amountPaid: -totalRefund,
            paymentStatus: PaymentStatus.PAID,
            paymentMethod: returnPurchaseMethod,
            bankId: returnPurchaseMethod === PaymentMethod.TRANSFER ? returnPurchaseBankId : undefined,
            bankName: selectedBank?.bankName,
            paymentHistory: [],
            returnNote: returnPurchaseNote + (cutDebtAmount > 0 ? ` (Potong Utang: ${formatIDR(cutDebtAmount)})` : ''),
            skipCashFlow: cutDebtAmount > 0 // Skip backend auto-cashflow if we are cutting debt
        };

        await StorageService.addPurchase(returnPurchase);

        // 5. Record Cash In (Hanya jika ada uang tunai yang dikembalikan)
        // If we cut debt, we skipped backend auto-cashflow, so we must add it manually here if there is a cash refund
        if (cutDebtAmount > 0 && cashRefundAmount > 0) {
            await StorageService.addCashFlow({
                id: '',
                date: now,
                type: CashFlowType.IN,
                amount: cashRefundAmount,
                category: 'Retur Pembelian',
                description: `Refund Retur Pembelian ${detailPurchase.invoiceNumber ? `Invoice ${detailPurchase.invoiceNumber}` : `#${detailPurchase.id.substring(0, 6)}`}` + (returnPurchaseMethod === PaymentMethod.TRANSFER ? ` (via ${selectedBank?.bankName})` : ''),
                paymentMethod: returnPurchaseMethod,
                bankId: returnPurchaseMethod === PaymentMethod.TRANSFER ? returnPurchaseBankId : undefined,
                bankName: selectedBank?.bankName,
                userId: currentUser?.id,
                userName: currentUser?.name,
                referenceId: returnPurchase.id
            });
        }

        setIsReturnPurchaseModalOpen(false);
        setDetailPurchase(null);
        setReturnPurchaseItems([]);
        setReturnPurchaseManualAmount('');
        setReturnPurchaseMethod(PaymentMethod.CASH);
        setReturnPurchaseBankId('');
        setReturnPurchaseNote('');

        let message = 'Retur pembelian berhasil diproses.';
        if (cutDebtAmount > 0) message += `\nDipotong dari utang: ${formatIDR(cutDebtAmount)}`;
        if (cashRefundAmount > 0) message += `\nDikembalikan tunai: ${formatIDR(cashRefundAmount)}`;

        alert(message);
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
                let matchesParent = false;
                if (item.type === TransactionType.RETURN && item.originalTransactionId) {
                    const parentTx = transactions.find(t => t.id === item.originalTransactionId);
                    if (parentTx && parentTx.invoiceNumber && parentTx.invoiceNumber.toLowerCase().includes(query)) {
                        matchesParent = true;
                    }
                }

                return (
                    item.id.toLowerCase().includes(query) ||
                    (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(query)) ||
                    item.customerName.toLowerCase().includes(query) ||
                    item.cashierName.toLowerCase().includes(query) ||
                    (item.paymentNote && item.paymentNote.toLowerCase().includes(query)) ||
                    matchesParent
                );
            } else if (type === 'purchase') {
                let matchesParent = false;
                if (item.type === PurchaseType.RETURN && item.originalPurchaseId) {
                    const parentPur = purchases.find(p => p.id === item.originalPurchaseId);
                    if (parentPur && parentPur.invoiceNumber && parentPur.invoiceNumber.toLowerCase().includes(query)) {
                        matchesParent = true;
                    }
                }

                return (
                    item.supplierName.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    item.id.toLowerCase().includes(query) ||
                    (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(query)) ||
                    matchesParent
                );
            } else if (type === 'cashflow') {
                // Check if referenceId (Transaction/Purchase) has a matching invoice number
                let matchesReference = false;
                if (item.referenceId) {
                    const linkedTx = transactions.find(t => t.id === item.referenceId);
                    if (linkedTx) {
                        if (linkedTx.invoiceNumber && linkedTx.invoiceNumber.toLowerCase().includes(query)) {
                            matchesReference = true;
                        } else if (linkedTx.type === TransactionType.RETURN && linkedTx.originalTransactionId) {
                            // Deep search for parent invoice in case of Return
                            const parentTx = transactions.find(pt => pt.id === linkedTx.originalTransactionId);
                            if (parentTx && parentTx.invoiceNumber && parentTx.invoiceNumber.toLowerCase().includes(query)) {
                                matchesReference = true;
                            }
                        }
                    }

                    if (!matchesReference) {
                        const linkedPurchase = purchases.find(p => p.id === item.referenceId);
                        if (linkedPurchase) {
                            if (linkedPurchase.invoiceNumber && linkedPurchase.invoiceNumber.toLowerCase().includes(query)) {
                                matchesReference = true;
                            } else if (linkedPurchase.type === PurchaseType.RETURN && linkedPurchase.originalPurchaseId) {
                                // Deep search for parent invoice in case of Return Purchase
                                const parentPur = purchases.find(pp => pp.id === linkedPurchase.originalPurchaseId);
                                if (parentPur && parentPur.invoiceNumber && parentPur.invoiceNumber.toLowerCase().includes(query)) {
                                    matchesReference = true;
                                }
                            }
                        }
                    }
                }

                return (
                    item.category.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    matchesReference
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

    const applyPaymentMethodFilter = (items: CashFlow[]) => {
        if (!paymentMethodFilter) return items;
        return items.filter(cf => cf.paymentMethod === paymentMethodFilter);
    };

    const applyCashierFilter = (items: any[], type: 'transaction' | 'purchase' | 'cashflow') => {
        if (!currentUser || currentUser.role !== UserRole.CASHIER) return items;

        if (type === 'transaction') {
            return items.filter(item => item.cashierId === currentUser.id);
        } else if (type === 'purchase') {
            // Filter purchases by userId
            return items.filter(item => item.userId === currentUser.id);
        } else if (type === 'cashflow') {
            // Filter cashflows related to cashier's transactions OR all purchases
            const cashierTransactionIds = transactions
                .filter(t => t.cashierId === currentUser.id)
                .map(t => t.id);

            return items.filter(item => {
                // 1. Check if explicitly created by this user (New Data)
                if (item.userId && item.userId === currentUser.id) {
                    return true;
                }

                // 2. Allow all Purchase-related categories (REMOVED - now relies on userId)
                // const purchaseCategories = [
                //     'Pembelian',
                //     'Pembelian Stok',
                //     'Pelunasan Utang Supplier',
                //     'Retur Pembelian'
                // ];
                // if (purchaseCategories.includes(item.category)) {
                //     return true;
                // }

                // 3. Check for Transaction-related items (Sales, Returns, Receivables)
                // Check by Reference ID (Best)
                if (item.referenceId && cashierTransactionIds.includes(item.referenceId)) {
                    return true;
                }

                // 4. Fallback: Check by Description (Legacy/System)
                // This covers 'Penjualan', 'Pelunasan Piutang', 'Retur Penjualan' if referenceId is missing
                const transactionCategories = [
                    'Penjualan',
                    'Pelunasan Piutang',
                    'Retur Penjualan'
                ];

                if (transactionCategories.includes(item.category)) {
                    // Check if description contains any of the cashier's transaction IDs
                    return cashierTransactionIds.some(txId =>
                        item.description.includes(txId) ||
                        item.description.includes(txId.substring(0, 6))
                    );
                }

                return false;
            });
        }
        return items;
    };

    const applyStatusFilter = (items: any[], type: 'transaction' | 'purchase') => {
        if (!statusFilter) return items;

        return items.filter(item => {
            if (statusFilter === 'RETUR') {
                return item.type === (type === 'transaction' ? TransactionType.RETURN : PurchaseType.RETURN);
            }
            if (type === 'transaction' && item.type === TransactionType.RETURN) return false; // Exclude return if filtering by payment status
            if (type === 'purchase' && item.type === PurchaseType.RETURN) return false; // Exclude return if filtering by payment status

            return item.paymentStatus === statusFilter;
        });
    };

    const applyUserFilter = (items: any[], type: 'transaction' | 'purchase' | 'cashflow') => {
        if (!userFilter) return items;

        return items.filter(item => {
            // Filter by ID now, not Name.
            // Note: Data might have empty or string IDs. We match loosely assuming userFilter is the ID.
            if (type === 'transaction') {
                return String(item.cashierId || '') === userFilter;
            } else if (type === 'purchase') {
                return String(item.userId || '') === userFilter;
            } else if (type === 'cashflow') {
                return String(item.userId || '') === userFilter;
            }
            return true;
        });
    };

    const sortItems = (items: any[]) => {
        if (!sortConfig) return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Default desc date

        return [...items].sort((a, b) => {
            let aVal: any = a[sortConfig.key];
            let bVal: any = b[sortConfig.key];

            // Special handling for paymentStatus when sorting transactions with RETURN type
            if (sortConfig.key === 'paymentStatus') {
                // If item is a RETURN transaction, use "RETUR" as the sort value
                aVal = a.type === TransactionType.RETURN ? 'RETUR' : aVal;
                bVal = b.type === TransactionType.RETURN ? 'RETUR' : bVal;
            }

            if (sortConfig.key === 'date') {
                const aTime = new Date(a.date).getTime();
                const bTime = new Date(b.date).getTime();
                return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
            } else if (typeof aVal === 'string' && typeof bVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const filteredTransactions = useMemo(() => sortItems(applySearch(applyDateFilter(applyUserFilter(applyStatusFilter(applyCashierFilter(transactions, 'transaction'), 'transaction'), 'transaction')), 'transaction')), [transactions, searchQuery, startDate, endDate, sortConfig, currentUser, userFilter, statusFilter]);
    const filteredPurchases = useMemo(() => sortItems(applySearch(applyDateFilter(applyUserFilter(applyStatusFilter(applyCashierFilter(purchases, 'purchase'), 'purchase'), 'purchase')), 'purchase')), [purchases, searchQuery, startDate, endDate, sortConfig, currentUser, userFilter, statusFilter]);
    const filteredCashFlows = useMemo(() => sortItems(applySearch(applyPaymentMethodFilter(applyCategoryFilter(applyDateFilter(applyUserFilter(applyCashierFilter(cashFlows, 'cashflow'), 'cashflow')))), 'cashflow')), [cashFlows, searchQuery, startDate, endDate, categoryFilter, paymentMethodFilter, sortConfig, currentUser, userFilter]);

    const visibleTransactions = useMemo(() => filteredTransactions.slice(0, visibleCount), [filteredTransactions, visibleCount]);
    const visiblePurchases = useMemo(() => filteredPurchases.slice(0, visibleCount), [filteredPurchases, visibleCount]);
    const visibleCashFlows = useMemo(() => filteredCashFlows.slice(0, visibleCount), [filteredCashFlows, visibleCount]);

    const receivables = useMemo(() => sortItems(applySearch(applyUserFilter(applyCashierFilter(transactions.filter(t => t.paymentStatus !== PaymentStatus.PAID), 'transaction'), 'transaction'), 'transaction')), [transactions, searchQuery, sortConfig, currentUser, userFilter]);
    const payables = useMemo(() => sortItems(applySearch(applyUserFilter(applyCashierFilter(purchases.filter(p => p.paymentStatus !== PaymentStatus.PAID), 'purchase'), 'purchase'), 'purchase')), [purchases, searchQuery, sortConfig, currentUser, userFilter]);

    const visibleReceivables = useMemo(() => receivables.slice(0, visibleCount), [receivables, visibleCount]);
    const visiblePayables = useMemo(() => payables.slice(0, visibleCount), [payables, visibleCount]);

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
    }, [loadMoreRef.current, activeTab, filteredTransactions, filteredPurchases, filteredCashFlows, receivables, payables]);

    // --- ACTION HANDLERS ---

    const handleRepaymentCustomer = async () => {
        if (!selectedDebt) return;
        const pay = parseFloat(repaymentAmount) || 0;

        if (pay <= 0) return;

        if (repaymentMethod === PaymentMethod.TRANSFER && !repaymentBankId) {
            alert("Pilih rekening bank tujuan transfer.");
            return;
        }

        const remainingDebt = selectedDebt.totalAmount - selectedDebt.amountPaid;

        if (pay > remainingDebt) {
            alert(`Nominal pembayaran melebihi sisa piutang (${formatIDR(remainingDebt)}).`);
            return;
        }
        const effectivePayment = Math.min(pay, remainingDebt);
        const change = pay > remainingDebt ? pay - remainingDebt : 0;

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
            change: change, // Update change for this transaction
            paymentHistory: updatedHistory
        };

        await StorageService.updateTransaction(updatedTx);

        let description = `Pelunasan dari ${selectedDebt.customerName} (Tx: ${selectedDebt.id.substring(0, 6)}) via ${repaymentMethod} ${selectedBank ? `(${selectedBank.bankName})` : ''}`;
        if (change > 0) {
            description += ` (Terima: ${formatIDR(pay)}, Kembali: ${formatIDR(change)})`;
        }

        await StorageService.addCashFlow({
            id: '',
            date: now,
            type: CashFlowType.IN,
            amount: effectivePayment,
            category: 'Pelunasan Piutang',
            description: description,
            paymentMethod: repaymentMethod,
            bankId: repaymentBankId,
            bankName: selectedBank?.bankName,
            userId: currentUser?.id,
            userName: currentUser?.name,
            referenceId: selectedDebt.id
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

        const remainingDebt = selectedPayable.totalAmount - selectedPayable.amountPaid;
        if (pay > remainingDebt) {
            alert(`Nominal pembayaran melebihi sisa utang (${formatIDR(remainingDebt)}).`);
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
            userName: currentUser?.name,
            referenceId: selectedPayable.id
        });

        setSelectedPayable(null);
        setPayableRepaymentAmount('');
        setPayableNote('');
        setPayableBankId('');
    };

    const handlePurchaseSubmit = async () => {
        if (!purchaseForm.supplierId) {
            alert("Harap pilih Supplier!");
            return;
        }

        let total = 0;
        let description = purchaseForm.description;
        let items: any[] = [];

        if (purchaseMode === 'items') {
            if (purchaseItems.length === 0) {
                alert("Pilih setidaknya satu barang untuk dibeli.");
                return;
            }
            total = purchaseItems.reduce((sum, i) => sum + (i.qty * i.price), 0);
            const itemsList = purchaseItems.map(i => i.name).join(', ');
            description = purchaseForm.description
                ? `${purchaseForm.description} (${itemsList})`
                : `Pembelian Stok: ${itemsList}`;
            items = purchaseItems.map(i => {
                const product = products.find(p => p.id === i.id);
                return {
                    ...product,
                    qty: i.qty,
                    finalPrice: i.price, // Purchase price (HPP)
                    selectedPriceType: 'UMUM'
                };
            });
        } else {
            total = parseFloat(purchaseForm.amount.replace(/[^0-9]/g, ''));
            if (total <= 0) {
                alert("Total pembelian harus lebih dari 0!");
                return;
            }
            if (!description || description.trim() === '') {
                alert("Harap isi deskripsi/keterangan pembelian!");
                return;
            }
        }

        const paid = parseFloat(purchaseForm.paid.replace(/[^0-9]/g, '')) || 0;
        const supplier = suppliers.find(s => s.id === purchaseForm.supplierId);

        if (!supplier) {
            alert("Supplier tidak ditemukan!");
            return;
        }

        const now = new Date().toISOString();

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
            description: description.trim(),
            totalAmount: total,
            amountPaid: paid,
            paymentMethod: purchaseForm.paymentMethod,
            paymentStatus: status,
            bankId: purchaseForm.bankId || undefined,
            bankName: selectedBank?.bankName,
            items: items,
            invoiceNumber: undefined, // Let backend generate it
            userId: currentUser?.id,
            userName: currentUser?.name,
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

            // If paid amount > 0, record cash out - Handled by Backend automatically now

            // Success feedback
            alert("✅ Pembelian berhasil dicatat!");

            setIsPurchaseModalOpen(false);
            setPurchaseForm({ supplierId: '', description: '', amount: '', paid: '', paymentMethod: PaymentMethod.CASH, bankId: '' });
            setPurchaseItems([]);
            setPurchaseMode('items');
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
            description: `${cfDesc} (via ${cfPaymentMethod}${selectedBank ? ` - ${selectedBank.bankName} ${selectedBank.accountNumber}` : ''})`,
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

    const handleDeleteCashFlow = async (id: string) => {
        const cf = cashFlows.find(c => c.id === id);
        let message = "Hapus catatan arus kas ini?";

        if (cf && cf.referenceId && (cf.category.includes('Pelunasan') || cf.category.includes('Cicilan'))) {
            message = "PERINGATAN: Menghapus data ini akan MENGEMBALIKAN saldo Utang/Piutang ke jumlah sebelum pelunasan ini. Lanjutkan?";
        }

        if (!confirm(message)) return;
        try {
            await StorageService.deleteCashFlow(id);
        } catch (error) {
            console.error("Failed to delete cashflow:", error);
            alert("Gagal menghapus data. Pastikan Anda memiliki izin yang sesuai.");
        }
    };

    // Profit Loss Calculation
    const calculateProfitLoss = () => {
        const txs = filteredTransactions; // Already date filtered
        const cfs = filteredCashFlows; // Already date filtered

        // Calculate Gross Revenue from Item Sales (before discount)
        const grossRevenue = txs.reduce((sum, t) => {
            const txGross = t.items.reduce((isum, item) => isum + (item.finalPrice * item.qty), 0);
            if (t.type === TransactionType.RETURN) {
                return sum - txGross; // Reduce gross revenue for returns (assuming full price return for now)
            }
            return sum + txGross;
        }, 0);

        // Calculate Total Discounts
        // Fix: Ensure discountAmount is treated as a number to prevent string concatenation
        const totalDiscounts = txs.reduce((sum, t) => sum + (Number(t.discountAmount) || 0), 0);

        // Net Revenue
        const revenue = grossRevenue - totalDiscounts;

        // Calculate COGS (HPP)
        // - Untuk penjualan normal: tambahkan HPP
        // - Untuk retur: kurangi HPP (karena barang kembali ke stok)
        const cogs = txs.reduce((sum, t) => {
            const txCogs = t.items.reduce((isum, item) => isum + ((item.hpp || 0) * item.qty), 0);

            // Untuk transaksi RETURN, COGS harus dikurangi (barang kembali)
            if (t.type === TransactionType.RETURN) {
                return sum - txCogs;
            }

            // Untuk transaksi normal, COGS ditambahkan
            return sum + txCogs;
        }, 0);

        const grossProfit = revenue - cogs;

        // Expenses: CashFlow OUT excluding Stock Purchase, Debt Repayment, and Returns
        const expenses = cfs
            .filter(c => c.type === CashFlowType.OUT &&
                c.category !== 'Pembelian Stok' &&
                c.category !== 'Retur Penjualan' &&
                c.category !== 'Retur Pembelian' &&
                !c.category.includes('Pelunasan Utang'))
            .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

        const netProfit = grossProfit - expenses;

        return { grossRevenue, totalDiscounts, revenue, cogs, grossProfit, expenses, netProfit };
    };

    const plData = calculateProfitLoss();

    const handleExport = () => {
        let headers: string[] = [];
        let rows: any[][] = [];
        let filename = 'export.csv';

        if (activeTab === 'history') {
            headers = ['ID', 'Tanggal', 'Waktu', 'Faktur', 'Pelanggan', 'Keterangan', 'Kasir', 'Total', 'Dibayar', 'Piutang', 'Kembalian', 'Status', 'Metode'];
            rows = filteredTransactions.map(t => {
                const d = new Date(t.date);
                const remaining = t.totalAmount - t.amountPaid;
                const piutang = remaining > 0 ? remaining : 0;
                const kembalian = remaining < 0 ? Math.abs(remaining) : 0;
                let status = t.type === TransactionType.RETURN ? 'RETUR' : (t.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : t.paymentStatus);
                if (t.isReturned && t.type !== TransactionType.RETURN) {
                    status += ' (Ada Retur)';
                }
                return [t.id, d.toLocaleDateString('id-ID'), d.toLocaleTimeString('id-ID'), t.invoiceNumber || '-', t.customerName, t.paymentNote || '-', t.cashierName, t.totalAmount, t.amountPaid, piutang, kembalian, status, t.paymentMethod]
            });
            filename = 'laporan-transaksi.csv';
        } else if (activeTab === 'debt_customer') {
            headers = ['ID', 'Tanggal', 'Faktur', 'Pelanggan', 'Total', 'Dibayar', 'Sisa', 'Status'];
            rows = receivables.map(r => [r.id, formatDate(r.date), r.invoiceNumber || '-', r.customerName, r.totalAmount, r.amountPaid, r.totalAmount - r.amountPaid, r.paymentStatus]);
            filename = 'laporan-piutang-pelanggan.csv';
        } else if (activeTab === 'purchase_history') {
            headers = ['ID', 'Tanggal', 'Waktu', 'Faktur', 'Supplier', 'Keterangan', 'Jml Item', 'Total', 'Dibayar', 'Status'];
            rows = filteredPurchases.map(p => {
                const d = new Date(p.date);
                const itemCount = p.items ? p.items.reduce((sum, i) => sum + i.qty, 0) : 0;
                let status = p.type === PurchaseType.RETURN ? 'RETUR' : (p.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : p.paymentStatus);
                if (p.isReturned && p.type !== PurchaseType.RETURN) {
                    status += ' (Ada Retur)';
                }
                let description = p.description;
                if (p.type === PurchaseType.RETURN && p.originalPurchaseId) {
                    const original = purchases.find(op => op.id === p.originalPurchaseId);
                    if (original && original.invoiceNumber) {
                        description += ` (Ref Faktur: ${original.invoiceNumber})`;
                    }
                }
                return [p.id, d.toLocaleDateString('id-ID'), d.toLocaleTimeString('id-ID'), p.invoiceNumber || '-', p.supplierName, description, itemCount, p.totalAmount, p.amountPaid, status]
            });
            filename = 'laporan-pembelian.csv';
        } else if (activeTab === 'debt_supplier') {
            headers = ['ID', 'Tanggal', 'Faktur', 'Supplier', 'Keterangan', 'Total', 'Dibayar', 'Sisa', 'Status'];
            rows = payables.map(p => [p.id, formatDate(p.date), p.invoiceNumber || '-', p.supplierName, p.description, p.totalAmount, p.amountPaid, p.totalAmount - p.amountPaid, p.paymentStatus]);
            filename = 'laporan-utang-supplier.csv';
        } else if (activeTab === 'cashflow') {
            headers = ['ID', 'Tanggal', 'Faktur Ref', 'Tipe', 'Kategori', 'Jumlah', 'Keterangan'];
            rows = filteredCashFlows.map(c => {
                let refInvoice = '-';
                let description = c.description;

                if (c.referenceId) {
                    const tx = transactions.find(t => t.id === c.referenceId);
                    if (tx) {
                        refInvoice = tx.invoiceNumber || '-';
                        if (tx.type === TransactionType.RETURN && tx.originalTransactionId) {
                            const originalTx = transactions.find(ot => ot.id === tx.originalTransactionId);
                            if (originalTx && originalTx.invoiceNumber) {
                                description += ` (Ref Faktur: ${originalTx.invoiceNumber})`;
                            }
                        }
                    } else {
                        const pur = purchases.find(p => p.id === c.referenceId);
                        if (pur) {
                            refInvoice = pur.invoiceNumber || '-';
                            if (pur.type === PurchaseType.RETURN && pur.originalPurchaseId) {
                                const originalPur = purchases.find(op => op.id === pur.originalPurchaseId);
                                if (originalPur && originalPur.invoiceNumber) {
                                    description += ` (Ref Faktur: ${originalPur.invoiceNumber})`;
                                }
                            }
                        }
                    }
                }
                return [c.id, formatDate(c.date), refInvoice, c.type, c.category, c.amount, description];
            });
            filename = 'laporan-arus-kas.csv';
        } else if (activeTab === 'profit_loss') {
            headers = ['Item', 'Nilai'];
            rows = [
                ['Penjualan Kotor', plData.grossRevenue],
                ['Diskon Penjualan', plData.totalDiscounts],
                ['Pendapatan Bersih (Net Sales)', plData.revenue],
                ['Harga Pokok Penjualan (HPP)', plData.cogs],
                ['Laba Kotor', plData.grossProfit],
                ['Beban Operasional', plData.expenses],
                ['Laba Bersih', plData.netProfit]
            ];
            filename = 'laporan-laba-rugi.csv';
        } else if (activeTab === 'manual_cash_report') {
            const manualFlows = filteredCashFlows.filter(cf => !cf.referenceId);
            headers = ['Tanggal', 'Waktu', 'Kategori', 'Keterangan', 'Uang Masuk', 'Uang Keluar', 'Metode', 'Bank'];
            rows = manualFlows.map(c => {
                const d = new Date(c.date);
                return [
                    d.toLocaleDateString('id-ID'),
                    d.toLocaleTimeString('id-ID'),
                    c.category,
                    c.description,
                    c.type === CashFlowType.IN ? c.amount : 0,
                    c.type === CashFlowType.OUT ? c.amount : 0,
                    c.paymentMethod || '-',
                    c.bankName || '-'
                ];
            });
            filename = 'laporan-kas-manual.csv';
        }

        exportToCSV(filename, headers, rows);
    };

    const handleExportExcel = () => {
        let data: any[] = [];
        let sheetName = "";
        let fileNamePrefix = "";
        let cols: any[] = [];

        if (activeTab === 'history') {
            sheetName = "Riwayat Transaksi";
            fileNamePrefix = "Laporan_Transaksi";
            data = filteredTransactions.map(t => {
                const itemsSummary = t.items.map(i => `${i.name} (${i.qty}x)`).join(', ');
                const remaining = t.totalAmount - t.amountPaid;
                const piutang = remaining > 0 ? remaining : 0;
                const kembalian = remaining < 0 ? Math.abs(remaining) : 0;
                let status = t.type === TransactionType.RETURN ? 'RETUR' : (t.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : t.paymentStatus);
                if (t.isReturned && t.type !== TransactionType.RETURN) {
                    status += ' (Ada Retur)';
                }
                return {
                    'ID Transaksi': t.id,
                    'Tanggal': new Date(t.date).toLocaleDateString('id-ID'),
                    'Waktu': new Date(t.date).toLocaleTimeString('id-ID'),
                    'Faktur': t.invoiceNumber || '-',
                    'Tipe': t.type === TransactionType.RETURN ? 'RETUR' : 'PENJUALAN',
                    'Pelanggan': t.customerName,
                    'Item': itemsSummary,
                    'Total': t.totalAmount,
                    'Dibayar': t.amountPaid,
                    'Piutang': piutang,
                    'Kembalian': kembalian,
                    'Status': status,
                    'Metode Bayar': t.paymentMethod,
                    'Bank': t.bankName || '-',
                    'Keterangan': t.paymentNote || '-'
                };
            });
            cols = [
                { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, { wch: 20 },
                { wch: 50 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
            ];
        } else if (activeTab === 'debt_customer') {
            sheetName = "Piutang Pelanggan";
            fileNamePrefix = "Laporan_Piutang_Pelanggan";
            data = receivables.map(r => ({
                'ID Transaksi': r.id,
                'Tanggal': formatDate(r.date),
                'Faktur': r.invoiceNumber || '-',
                'Pelanggan': r.customerName,
                'Total Tagihan': r.totalAmount,
                'Sudah Dibayar': r.amountPaid,
                'Sisa Piutang': r.totalAmount - r.amountPaid,
                'Status': r.paymentStatus
            }));
            cols = [
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
            ];
        } else if (activeTab === 'purchase_history') {
            sheetName = "Riwayat Pembelian";
            fileNamePrefix = "Laporan_Pembelian";
            data = filteredPurchases.map(p => {
                const itemsSummary = p.items ? p.items.map(i => `${i.name} (${i.qty}x)`).join(', ') : '-';
                const itemCount = p.items ? p.items.reduce((sum, i) => sum + i.qty, 0) : 0;
                let status = p.type === PurchaseType.RETURN ? 'RETUR' : (p.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : p.paymentStatus);
                if (p.isReturned && p.type !== PurchaseType.RETURN) {
                    status += ' (Ada Retur)';
                }
                let description = p.description;
                if (p.type === PurchaseType.RETURN && p.originalPurchaseId) {
                    const original = purchases.find(op => op.id === p.originalPurchaseId);
                    if (original && original.invoiceNumber) {
                        description += ` (Ref Faktur: ${original.invoiceNumber})`;
                    }
                }
                return {
                    'ID Pembelian': p.id,
                    'Tanggal': new Date(p.date).toLocaleDateString('id-ID'),
                    'Waktu': new Date(p.date).toLocaleTimeString('id-ID'),
                    'Faktur': p.invoiceNumber || '-',
                    'Supplier': p.supplierName,
                    'Keterangan': description,
                    'Item': itemsSummary,
                    'Jml Item': itemCount,
                    'Total': p.totalAmount,
                    'Dibayar': p.amountPaid,
                    'Status': status,
                    'Metode Bayar': p.paymentMethod,
                    'Bank': p.bankName || '-'
                };
            });
            cols = [
                { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 30 },
                { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
            ];
        } else if (activeTab === 'debt_supplier') {
            sheetName = "Utang Supplier";
            fileNamePrefix = "Laporan_Utang_Supplier";
            data = payables.map(p => ({
                'ID Pembelian': p.id,
                'Tanggal': formatDate(p.date),
                'Faktur': p.invoiceNumber || '-',
                'Supplier': p.supplierName,
                'Keterangan': p.description,
                'Total Tagihan': p.totalAmount,
                'Sudah Dibayar': p.amountPaid,
                'Sisa Utang': p.totalAmount - p.amountPaid,
                'Status': p.paymentStatus
            }));
            cols = [
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
            ];
        } else if (activeTab === 'cashflow') {
            sheetName = "Arus Kas";
            fileNamePrefix = "Laporan_Arus_Kas";
            data = filteredCashFlows.map(c => {
                let refInvoice = '-';
                let description = c.description;

                if (c.referenceId) {
                    const tx = transactions.find(t => t.id === c.referenceId);
                    if (tx) {
                        refInvoice = tx.invoiceNumber || '-';
                        if (tx.type === TransactionType.RETURN && tx.originalTransactionId) {
                            const originalTx = transactions.find(ot => ot.id === tx.originalTransactionId);
                            if (originalTx && originalTx.invoiceNumber) {
                                description += ` (Ref Faktur: ${originalTx.invoiceNumber})`;
                            }
                        }
                    } else {
                        const pur = purchases.find(p => p.id === c.referenceId);
                        if (pur) {
                            refInvoice = pur.invoiceNumber || '-';
                            if (pur.type === PurchaseType.RETURN && pur.originalPurchaseId) {
                                const originalPur = purchases.find(op => op.id === pur.originalPurchaseId);
                                if (originalPur && originalPur.invoiceNumber) {
                                    description += ` (Ref Faktur: ${originalPur.invoiceNumber})`;
                                }
                            }
                        }
                    }
                }
                return {
                    'Tanggal': new Date(c.date).toLocaleDateString('id-ID'),
                    'Waktu': new Date(c.date).toLocaleTimeString('id-ID'),
                    'No. Referensi': c.id,
                    'Faktur Ref': refInvoice,
                    'Tipe': c.type === CashFlowType.IN ? 'MASUK' : 'KELUAR',
                    'Kategori': c.category,
                    'Jumlah': c.amount,
                    'Keterangan': description,
                    'Metode': c.paymentMethod,
                    'Bank': c.bankName || '-'
                };
            });
            cols = [
                { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: 15 }
            ];
        } else if (activeTab === 'profit_loss') {
            sheetName = "Laba Rugi";
            fileNamePrefix = "Laporan_Laba_Rugi";
            data = [
                { 'Item': 'Penjualan Kotor', 'Nilai': plData.grossRevenue },
                { 'Item': 'Diskon Penjualan', 'Nilai': plData.totalDiscounts },
                { 'Item': 'Pendapatan Bersih (Net Sales)', 'Nilai': plData.revenue },
                { 'Item': 'Harga Pokok Penjualan (HPP)', 'Nilai': plData.cogs },
                { 'Item': 'Laba Kotor', 'Nilai': plData.grossProfit },
                { 'Item': 'Beban Operasional', 'Nilai': plData.expenses },
                { 'Item': 'Laba Bersih', 'Nilai': plData.netProfit }
            ];
            cols = [{ wch: 30 }, { wch: 20 }];
        } else if (activeTab === 'manual_cash_report') {
            const manualFlows = filteredCashFlows.filter(cf => !cf.referenceId);
            sheetName = "Kas Manual";
            fileNamePrefix = "Laporan_Kas_Manual";
            data = manualFlows.map(c => ({
                'Tanggal': new Date(c.date).toLocaleDateString('id-ID'),
                'Waktu': new Date(c.date).toLocaleTimeString('id-ID'),
                'Kategori': c.category,
                'Keterangan': c.description,
                'Uang Masuk': c.type === CashFlowType.IN ? c.amount : 0,
                'Uang Keluar': c.type === CashFlowType.OUT ? c.amount : 0,
                'Metode': c.paymentMethod || '-',
                'Bank': c.bankName || '-'
            }));
            cols = [
                { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
            ];
        } else {
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        if (cols.length > 0) {
            worksheet['!cols'] = cols;
        }

        XLSX.writeFile(workbook, `${fileNamePrefix}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleCleanPrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        let content = '';
        let title = '';
        let summaryHtml = '';

        if (activeTab === 'history') {
            title = 'Laporan Transaksi Penjualan';

            // Calculate Totals
            const totalTx = filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
            const totalPaid = filteredTransactions.reduce((sum, t) => sum + t.amountPaid, 0);
            const totalDebt = filteredTransactions.reduce((sum, t) => sum + Math.max(0, t.totalAmount - t.amountPaid), 0);

            summaryHtml = `
                <div style="margin-bottom: 20px; font-size: 14px;">
                    <table style="width: auto; border: none;">
                        <tr style="border: none;"><td style="border: none; padding: 4px 10px 4px 0;"><strong>Total Transaksi</strong></td><td style="border: none; padding: 4px;">: ${formatIDR(totalTx)}</td></tr>
                        <tr style="border: none;"><td style="border: none; padding: 4px 10px 4px 0;"><strong>Total Dibayar</strong></td><td style="border: none; padding: 4px;">: ${formatIDR(totalPaid)}</td></tr>
                        <tr style="border: none;"><td style="border: none; padding: 4px 10px 4px 0;"><strong>Total Piutang</strong></td><td style="border: none; padding: 4px;">: ${formatIDR(totalDebt)}</td></tr>
                    </table>
                </div>
            `;

            const rows = filteredTransactions.map(t => {
                const remaining = t.totalAmount - t.amountPaid;
                const piutang = remaining > 0 ? remaining : 0;
                const kembalian = remaining < 0 ? Math.abs(remaining) : 0;
                let status = t.type === TransactionType.RETURN ? 'RETUR' : (t.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : t.paymentStatus);
                if (t.isReturned && t.type !== TransactionType.RETURN) {
                    status += ' (Ada Retur)';
                }
                return `
              <tr>
                  <td>${t.id.substring(0, 8)}</td>
                  <td>${formatDate(t.date)}</td>
                  <td>${t.invoiceNumber || '-'}</td>
                  <td>${t.customerName}</td>
                  <td>${t.paymentNote || '-'}</td>
                  <td>${t.cashierName}</td>
                  <td style="text-align:right">${formatIDR(t.totalAmount)}</td>
                  <td style="text-align:right">${formatIDR(t.amountPaid)}</td>
                  <td style="text-align:right">${piutang > 0 ? formatIDR(piutang) : '-'}</td>
                  <td style="text-align:right">${kembalian > 0 ? formatIDR(kembalian) : '-'}</td>
                  <td>${status}</td>
              </tr>
          `;
            }).join('');
            content = `<thead><tr><th>ID</th><th>Tanggal & Waktu</th><th>Faktur</th><th>Pelanggan</th><th>Keterangan</th><th>Kasir</th><th>Total</th><th>Dibayar</th><th>Piutang</th><th>Kembalian</th><th>Status</th></tr></thead><tbody>${rows}</tbody>`;
        } else if (activeTab === 'debt_customer') {
            title = 'Laporan Piutang Pelanggan';

            const totalTx = receivables.reduce((sum, r) => sum + r.totalAmount, 0);
            const totalPaid = receivables.reduce((sum, r) => sum + r.amountPaid, 0);
            const totalRemaining = receivables.reduce((sum, r) => sum + (r.totalAmount - r.amountPaid), 0);

            summaryHtml = `
                <div style="margin-bottom: 20px; font-size: 14px;">
                    <table style="width: auto; border: none;">
                        <tr style="border: none;"><td style="border: none; padding: 4px 10px 4px 0;"><strong>Total Piutang</strong></td><td style="border: none; padding: 4px;">: ${formatIDR(totalTx)}</td></tr>
                        <tr style="border: none;"><td style="border: none; padding: 4px 10px 4px 0;"><strong>Sudah Dibayar</strong></td><td style="border: none; padding: 4px;">: ${formatIDR(totalPaid)}</td></tr>
                        <tr style="border: none;"><td style="border: none; padding: 4px 10px 4px 0;"><strong>Sisa Piutang</strong></td><td style="border: none; padding: 4px;">: ${formatIDR(totalRemaining)}</td></tr>
                    </table>
                </div>
            `;

            const rows = receivables.map(r => `
              <tr>
                  <td>${r.id.substring(0, 8)}</td>
                  <td>${formatDate(r.date)}</td>
                  <td>${r.invoiceNumber || '-'}</td>
                  <td>${r.customerName}</td>
                  <td style="text-align:right">${formatIDR(r.totalAmount)}</td>
                  <td style="text-align:right">${formatIDR(r.amountPaid)}</td>
                  <td style="text-align:right; color:red;">${formatIDR(r.totalAmount - r.amountPaid)}</td>
              </tr>
          `).join('');
            content = `<thead><tr><th>ID</th><th>Tanggal</th><th>Faktur</th><th>Pelanggan</th><th>Total</th><th>Dibayar</th><th>Sisa Utang</th></tr></thead><tbody>${rows}</tbody>`;
        } else if (activeTab === 'purchase_history') {
            title = 'Laporan Pembelian Stok';

            const totalPurchase = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

            summaryHtml = `
                <div style="margin-bottom: 20px; font-size: 14px;">
                    <table style="width: auto; border: none;">
                        <tr style="border: none;"><td style="border: none; padding: 4px 10px 4px 0;"><strong>Total Pembelian</strong></td><td style="border: none; padding: 4px;">: ${formatIDR(totalPurchase)}</td></tr>
                    </table>
                </div>
            `;

            const rows = filteredPurchases.map(p => {
                const itemCount = p.items ? p.items.reduce((sum, i) => sum + i.qty, 0) : 0;
                let status = p.type === PurchaseType.RETURN ? 'RETUR' : (p.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : p.paymentStatus);
                if (p.isReturned && p.type !== PurchaseType.RETURN) {
                    status += ' (Ada Retur)';
                }
                let description = p.description;
                if (p.type === PurchaseType.RETURN && p.originalPurchaseId) {
                    const original = purchases.find(op => op.id === p.originalPurchaseId);
                    if (original && original.invoiceNumber) {
                        description += ` (Ref Faktur: ${original.invoiceNumber})`;
                    }
                }
                return `
              <tr>
                  <td>${p.id.substring(0, 8)}</td>
                  <td>${formatDate(p.date)}</td>
                  <td>${p.invoiceNumber || '-'}</td>
                  <td>${p.supplierName}</td>
                  <td>${description}</td>
                  <td style="text-align:center">${itemCount}</td>
                  <td style="text-align:right">${formatIDR(p.totalAmount)}</td>
                  <td>${status}</td>
              </tr>
          `;
            }).join('');
            content = `<thead><tr><th>ID</th><th>Tanggal & Waktu</th><th>Faktur</th><th>Supplier</th><th>Keterangan</th><th>Item</th><th>Total</th><th>Status</th></tr></thead><tbody>${rows}</tbody>`;
        } else if (activeTab === 'debt_supplier') {
            title = 'Laporan Utang Supplier';

            const totalPurchase = payables.reduce((sum, p) => sum + p.totalAmount, 0);
            const totalPaid = payables.reduce((sum, p) => sum + p.amountPaid, 0);
            const totalRemaining = payables.reduce((sum, p) => sum + (p.totalAmount - p.amountPaid), 0);

            summaryHtml = `
                <div style="margin-bottom: 20px; font-size: 14px;">
                    <table style="width: auto; border: none;">
                        <tr style="border: none;"><td style="border: none; padding: 4px 10px 4px 0;"><strong>Total Utang</strong></td><td style="border: none; padding: 4px;">: ${formatIDR(totalPurchase)}</td></tr>
                        <tr style="border: none;"><td style="border: none; padding: 4px 10px 4px 0;"><strong>Sudah Dibayar</strong></td><td style="border: none; padding: 4px;">: ${formatIDR(totalPaid)}</td></tr>
                        <tr style="border: none;"><td style="border: none; padding: 4px 10px 4px 0;"><strong>Sisa Utang</strong></td><td style="border: none; padding: 4px;">: ${formatIDR(totalRemaining)}</td></tr>
                    </table>
                </div>
            `;

            const rows = payables.map(p => `
              <tr>
                  <td>${p.id.substring(0, 8)}</td>
                  <td>${formatDate(p.date)}</td>
                  <td>${p.invoiceNumber || '-'}</td>
                  <td>${p.supplierName}</td>
                  <td style="text-align:right">${formatIDR(p.totalAmount)}</td>
                  <td style="text-align:right">${formatIDR(p.amountPaid)}</td>
                  <td style="text-align:right; color:red;">${formatIDR(p.totalAmount - p.amountPaid)}</td>
              </tr>
          `).join('');
            content = `<thead><tr><th>ID</th><th>Tanggal</th><th>Faktur</th><th>Supplier</th><th>Total</th><th>Dibayar</th><th>Sisa Utang</th></tr></thead><tbody>${rows}</tbody>`;
        } else if (activeTab === 'cashflow') {
            title = 'Laporan Arus Kas';

            const totalIn = filteredCashFlows.filter(c => c.type === CashFlowType.IN).reduce((sum, c) => sum + c.amount, 0);
            const totalOut = filteredCashFlows.filter(c => c.type === CashFlowType.OUT).reduce((sum, c) => sum + c.amount, 0);

            summaryHtml = `
                <div style="margin-bottom: 20px; font-size: 14px;">
                    <table style="width: auto; border: none;">
                        <tr style="border: none;">
                            <td style="border: none; padding: 4px 10px 4px 0;"><strong>Total Masuk</strong></td>
                            <td style="border: none; padding: 4px; color: green;">: ${formatIDR(totalIn)}</td>
                        </tr>
                        <tr style="border: none;">
                            <td style="border: none; padding: 4px 10px 4px 0;"><strong>Total Keluar</strong></td>
                            <td style="border: none; padding: 4px; color: red;">: ${formatIDR(totalOut)}</td>
                        </tr>
                        <tr style="border: none;">
                            <td style="border: none; padding: 4px 10px 4px 0;"><strong>Selisih (Net)</strong></td>
                            <td style="border: none; padding: 4px; font-weight: bold;">: ${formatIDR(totalIn - totalOut)}</td>
                        </tr>
                    </table>
                </div>
            `;

            const rows = filteredCashFlows.map(c => {
                let refInvoice = '-';
                let description = c.description;

                if (c.referenceId) {
                    const tx = transactions.find(t => t.id === c.referenceId);
                    if (tx) {
                        refInvoice = tx.invoiceNumber || '-';
                        if (tx.type === TransactionType.RETURN && tx.originalTransactionId) {
                            const originalTx = transactions.find(ot => ot.id === tx.originalTransactionId);
                            if (originalTx && originalTx.invoiceNumber) {
                                description += ` (Ref Faktur: ${originalTx.invoiceNumber})`;
                            }
                        }
                    } else {
                        const pur = purchases.find(p => p.id === c.referenceId);
                        if (pur) {
                            refInvoice = pur.invoiceNumber || '-';
                            if (pur.type === PurchaseType.RETURN && pur.originalPurchaseId) {
                                const originalPur = purchases.find(op => op.id === pur.originalPurchaseId);
                                if (originalPur && originalPur.invoiceNumber) {
                                    description += ` (Ref Faktur: ${originalPur.invoiceNumber})`;
                                }
                            }
                        }
                    }
                }
                return `
              <tr>
                  <td>${formatDate(c.date)}</td>
                  <td>${refInvoice}</td>
                  <td>${c.type}</td>
                  <td>${c.category}</td>
                  <td>${description}</td>
                  <td style="text-align:right">${formatIDR(c.amount)}</td>
              </tr>
          `
            }).join('');
            content = `<thead><tr><th>Tanggal & Waktu</th><th>Faktur Ref</th><th>Tipe</th><th>Kategori</th><th>Keterangan</th><th>Jumlah</th></tr></thead><tbody>${rows}</tbody>`;
        } else if (activeTab === 'profit_loss') {
            title = 'Laporan Laba Rugi';
            content = `
                <tbody>
                    <tr>
                        <td style="font-weight:bold;">Penjualan Kotor</td>
                        <td style="text-align:right;">${formatIDR(plData.grossRevenue)}</td>
                    </tr>
                    ${plData.totalDiscounts > 0 ? `
                    <tr>
                        <td style="padding-left: 20px;">Diskon Penjualan</td>
                        <td style="text-align:right; color:red;">(${formatIDR(plData.totalDiscounts)})</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="font-weight:bold;">Pendapatan Bersih (Net Sales)</td>
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
        } else if (activeTab === 'manual_cash_report') {
            const manualFlows = filteredCashFlows.filter(cf => !cf.referenceId);
            const totalIn = manualFlows.filter(cf => cf.type === CashFlowType.IN).reduce((sum, cf) => sum + cf.amount, 0);
            const totalOut = manualFlows.filter(cf => cf.type === CashFlowType.OUT).reduce((sum, cf) => sum + cf.amount, 0);
            title = 'Laporan Kas Manual';
            const rows = manualFlows.map(c => `
              <tr>
                  <td>${formatDate(c.date)}</td>
                  <td>${c.category}</td>
                  <td>${c.description}</td>
                  <td style="text-align:right; color:green;">${c.type === CashFlowType.IN ? formatIDR(c.amount) : '-'}</td>
                  <td style="text-align:right; color:red;">${c.type === CashFlowType.OUT ? formatIDR(c.amount) : '-'}</td>
              </tr>
          `).join('');
            content = `
                <thead>
                    <tr>
                        <th>Tanggal & Waktu</th>
                        <th>Kategori</th>
                        <th>Keterangan</th>
                        <th style="text-align:right;">Uang Masuk</th>
                        <th style="text-align:right;">Uang Keluar</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr style="background-color:#f0fdf4; font-weight:bold; border-top: 2px solid #000;">
                        <td colspan="3" style="text-align:right;">TOTAL:</td>
                        <td style="text-align:right; color:green;">${formatIDR(totalIn)}</td>
                        <td style="text-align:right; color:red;">${formatIDR(totalOut)}</td>
                    </tr>
                    <tr style="background-color:#f0f9ff; font-weight:bold;">
                        <td colspan="3" style="text-align:right;">SELISIH (NET):</td>
                        <td colspan="2" style="text-align:right;">${formatIDR(totalIn - totalOut)}</td>
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
                ${summaryHtml}
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

        // Ensure customer address is populated
        let txToPrint = { ...tx };
        if ((!txToPrint.customerAddress || txToPrint.customerAddress === '-') && txToPrint.customerId) {
            const customer = customers.find(c => c.id === txToPrint.customerId);
            if (customer && customer.address) {
                txToPrint.customerAddress = customer.address;
            }
        }

        const html = generatePrintInvoice(txToPrint, settings, formatIDR, formatDate);
        w.document.write(html);
        w.document.close();
    };

    const printGoodsNote = (tx: Transaction) => {
        const settings = storeSettings || { name: 'KasirPintar' } as StoreSettings;
        const w = window.open('', '', 'width=800,height=600');
        if (!w) return;

        // Ensure customer address is populated
        let txToPrint = { ...tx };
        if ((!txToPrint.customerAddress || txToPrint.customerAddress === '-') && txToPrint.customerId) {
            const customer = customers.find(c => c.id === txToPrint.customerId);
            if (customer && customer.address) {
                txToPrint.customerAddress = customer.address;
            }
        }

        const html = generatePrintGoodsNote(txToPrint, settings, formatIDR, formatDate);
        w.document.write(html);
        w.document.close();
    };

    const printSuratJalan = (tx: Transaction) => {
        const settings = storeSettings || { name: 'KasirPintar' } as StoreSettings;
        const w = window.open('', '', 'width=800,height=600');
        if (!w) return;

        // Ensure customer address is populated
        let txToPrint = { ...tx };
        if ((!txToPrint.customerAddress || txToPrint.customerAddress === '-') && txToPrint.customerId) {
            const customer = customers.find(c => c.id === txToPrint.customerId);
            if (customer && customer.address) {
                txToPrint.customerAddress = customer.address;
            }
        }

        const html = generatePrintSuratJalan(txToPrint, settings, formatDate, formatIDR);
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

    const printPurchaseNote = (purchase: Purchase) => {
        const settings = storeSettings || { name: 'KasirPintar' } as StoreSettings;
        const w = window.open('', '', 'width=800,height=600');
        if (!w) return;

        const html = generatePrintPurchaseNote(purchase, settings, formatIDR, formatDate);
        w.document.write(html);
        w.document.close();
    };

    // Render logic helper
    const numericInput = (val: string) => val.replace(/[^0-9]/g, '');

    // --- CONFIRMATION WRAPPERS ---

    const initiateRepaymentCustomer = () => {
        if (!selectedDebt) return;
        const pay = parseFloat(repaymentAmount) || 0;
        if (pay <= 0) {
            alert("Masukkan nominal pembayaran yang valid.");
            return;
        }
        if (repaymentMethod === PaymentMethod.TRANSFER && !repaymentBankId) {
            alert("Pilih rekening bank tujuan transfer.");
            return;
        }
        const remainingDebt = selectedDebt.totalAmount - selectedDebt.amountPaid;
        if (pay > remainingDebt) {
            alert(`Nominal pembayaran melebihi sisa piutang (${formatIDR(remainingDebt)}).`);
            return;
        }

        setConfirmation({
            isOpen: true,
            title: 'Konfirmasi Pembayaran Piutang',
            message: `Cek kembali data pembayaran:\n\nPelanggan: ${selectedDebt.customerName}\nNominal: ${formatIDR(pay)}\nMetode: ${repaymentMethod}\n\nLanjutkan proses pembayaran?`,
            confirmLabel: 'Proses',
            cancelLabel: 'Batal',
            onConfirm: handleRepaymentCustomer,
            type: 'warning'
        });
    };

    const initiateRepaymentSupplier = () => {
        if (!selectedPayable) return;
        const pay = parseFloat(payableRepaymentAmount) || 0;
        if (pay <= 0) {
            alert("Masukkan nominal pembayaran yang valid.");
            return;
        }
        if (payableRepaymentMethod === PaymentMethod.TRANSFER && !payableBankId) {
            alert("Pilih rekening bank sumber transfer.");
            return;
        }
        const remainingDebt = selectedPayable.totalAmount - selectedPayable.amountPaid;
        if (pay > remainingDebt) {
            alert(`Nominal pembayaran melebihi sisa utang (${formatIDR(remainingDebt)}).`);
            return;
        }

        setConfirmation({
            isOpen: true,
            title: 'Konfirmasi Pembayaran Utang',
            message: `Cek kembali data pembayaran:\n\nSupplier: ${selectedPayable.supplierName}\nNominal: ${formatIDR(pay)}\nMetode: ${payableRepaymentMethod}\n\nLanjutkan proses pembayaran?`,
            confirmLabel: 'Proses',
            cancelLabel: 'Batal',
            onConfirm: handleRepaymentSupplier,
            type: 'warning'
        });
    };

    const initiateAddCashFlow = () => {
        const amount = parseFloat(cfAmount);
        if (!amount || !cfDesc || !cfCategory) {
            alert("Mohon lengkapi jumlah, kategori, dan keterangan.");
            return;
        }
        if (cfPaymentMethod === PaymentMethod.TRANSFER && !cfBankId) {
            alert("Pilih rekening bank.");
            return;
        }

        setConfirmation({
            isOpen: true,
            title: 'Konfirmasi Catat Kas Manual',
            message: `Cek kembali data kas manual:\n\nTipe: ${cfType === CashFlowType.IN ? 'Uang Masuk' : 'Uang Keluar'}\nKategori: ${cfCategory}\nNominal: ${formatIDR(amount)}\nKeterangan: ${cfDesc}\n\nSimpan catatan ini?`,
            confirmLabel: 'Catat',
            cancelLabel: 'Batal',
            onConfirm: handleAddCashFlow,
            type: 'warning'
        });
    };

    return (
        <div className="space-y-6 animate-fade-in min-h-[101vh]">
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
                            ...(currentUser?.role !== UserRole.CASHIER && currentUser?.role !== UserRole.ADMIN ? [{ id: 'profit_loss', label: 'Laba Rugi' }] : []),
                            ...(currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.SUPERADMIN ? [{ id: 'manual_cash_report', label: 'Kas Manual' }] : [])
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 font-medium text-sm transition-all relative whitespace-nowrap rounded-lg ${activeTab === tab.id ? 'bg-primary shadow text-white' : 'text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExportExcel} className="text-sm flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-2 rounded-lg text-green-700 hover:bg-green-100">
                            <FileSpreadsheet size={16} /> Excel
                        </button>
                        <button onClick={handleExport} className="text-sm flex items-center gap-2 bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                            <Download size={16} /> CSV
                        </button>
                        <button onClick={handleCleanPrint} className="text-sm flex items-center gap-2 bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50">
                            <Printer size={16} /> Print
                        </button>
                        {activeTab === 'purchase_history' && (
                            <button onClick={() => setIsPurchaseModalOpen(true)} className="text-sm flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-primary/90">
                                <Plus size={16} /> Catat Pembelian
                            </button>
                        )}
                    </div>
                </div>

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

                {/* Status Filter for Transaction & Purchase History */}


                {/* Category Filter for Cashflow */}
                {activeTab === 'cashflow' && (
                    <div className="flex flex-wrap items-center gap-3 w-full">
                        <div className="relative w-[180px] flex-shrink-0">
                            <label htmlFor="categoryFilter" className="sr-only">Filter Kategori</label>
                            <select
                                id="categoryFilter"
                                name="categoryFilter"
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-slate-700 pr-10 appearance-none cursor-pointer"
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

                        <div className="relative w-[180px] flex-shrink-0">
                            <label htmlFor="paymentMethodFilter" className="sr-only">Filter Metode Pembayaran</label>
                            <select
                                id="paymentMethodFilter"
                                name="paymentMethodFilter"
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-slate-700 pr-10 appearance-none cursor-pointer"
                                value={paymentMethodFilter}
                                onChange={e => setPaymentMethodFilter(e.target.value)}
                            >
                                <option value="">Semua Metode</option>
                                <option value={PaymentMethod.CASH}>Tunai</option>
                                <option value={PaymentMethod.TRANSFER}>Transfer</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {(currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.SUPERADMIN || currentUser?.role === UserRole.ADMIN) && (
                            <div className="relative w-[180px] flex-shrink-0">
                                <label htmlFor="userFilter" className="sr-only">Filter User</label>
                                <select
                                    id="userFilter"
                                    name="userFilter"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-slate-700 pr-10 appearance-none cursor-pointer"
                                    value={userFilter}
                                    onChange={e => setUserFilter(e.target.value)}
                                >
                                    <option value="">Semua Kasir</option>
                                    {users.filter(u => u.name !== 'Superadmin').map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        <div className="relative flex-1 min-w-[200px]">
                            <label htmlFor="searchCashflow" className="sr-only">Cari Arus Kas</label>
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                id="searchCashflow"
                                name="searchCashflow"
                                type="text"
                                placeholder="Cari kategori atau keterangan..."
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
                )}

                {/* Search Input */}
                {activeTab !== 'profit_loss' && activeTab !== 'cashflow' && (
                    <div className="flex items-center gap-3 w-full">
                        {/* Category Dropdown for Manual Cash Report */}
                        {activeTab === 'manual_cash_report' && (
                            <div className="relative min-w-[200px]">
                                <label htmlFor="categoryFilterManual" className="sr-only">Filter Kategori Manual</label>
                                <select
                                    id="categoryFilterManual"
                                    name="categoryFilterManual"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-slate-700 pr-10 appearance-none cursor-pointer"
                                    value={categoryFilter}
                                    onChange={e => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">Semua Kategori</option>
                                    {Array.from(new Set(
                                        cashFlows
                                            .filter(cf => !cf.referenceId) // Only manual categories
                                            .map(cf => cf.category)
                                    )).sort().map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        <div className="relative w-full max-w-md">
                            <label htmlFor="searchGeneric" className="sr-only">Cari Data</label>
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                id="searchGeneric"
                                name="searchGeneric"
                                type="text"
                                placeholder={
                                    activeTab === 'history' ? 'Cari ID, pelanggan, kasir...' :
                                        activeTab === 'debt_customer' ? 'Cari nama pelanggan...' :
                                            activeTab === 'debt_supplier' ? 'Cari supplier atau keterangan...' :
                                                'Cari kategori atau keterangan...'
                                }
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
                        {(currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.SUPERADMIN || currentUser?.role === UserRole.ADMIN) && (
                            <div className="relative min-w-[200px]">
                                <label htmlFor="userFilterGeneric" className="sr-only">Filter User</label>
                                <select
                                    id="userFilterGeneric"
                                    name="userFilterGeneric"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-slate-700 pr-10 appearance-none cursor-pointer"
                                    value={userFilter}
                                    onChange={e => setUserFilter(e.target.value)}
                                >
                                    <option value="">Semua Kasir</option>
                                    {users.filter(u => u.name !== 'Superadmin').map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* Status Filter for Transaction & Purchase History (Moved here) */}
                        {(activeTab === 'history' || activeTab === 'purchase_history') && (
                            <div className="relative min-w-[180px] w-auto">
                                <label htmlFor="statusFilter" className="sr-only">Filter Status</label>
                                <select
                                    id="statusFilter"
                                    name="statusFilter"
                                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm text-slate-700 pr-10 appearance-none cursor-pointer"
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Semua Status</option>
                                    <option value={PaymentStatus.PAID}>Lunas</option>
                                    <option value={PaymentStatus.PARTIAL}>Sebagian</option>
                                    <option value={PaymentStatus.UNPAID}>Belum Lunas</option>
                                    <option value="RETUR">Retur</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* --- TAB: PROFIT LOSS --- */}
            {
                activeTab === 'profit_loss' && (
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
                                        <span className="text-slate-600">Penjualan Kotor</span>
                                        <span className="font-bold text-slate-800 text-right">{formatIDR(plData.grossRevenue)}</span>
                                    </div>
                                    {plData.totalDiscounts > 0 && (
                                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                            <span className="text-slate-600 pl-4">Diskon Penjualan</span>
                                            <span className="font-bold text-red-500 text-right">({formatIDR(plData.totalDiscounts)})</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <span className="text-slate-600 font-bold">Pendapatan Bersih</span>
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
                )
            }

            {/* --- TAB: MANUAL CASH REPORT (ADMIN/SUPERADMIN ONLY) --- */}
            {
                activeTab === 'manual_cash_report' && (
                    <div className="space-y-6">
                        {(() => {
                            // Filter only manual entries (no referenceId)
                            // Use filteredCashFlows to respect date filter
                            const manualFlows = filteredCashFlows.filter(cf => !cf.referenceId);
                            const totalIn = manualFlows.filter(cf => cf.type === CashFlowType.IN).reduce((sum, cf) => sum + cf.amount, 0);
                            const totalOut = manualFlows.filter(cf => cf.type === CashFlowType.OUT).reduce((sum, cf) => sum + cf.amount, 0);
                            const net = totalIn - totalOut;

                            return (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                            <h3 className="text-slate-500 font-medium mb-2">Total Kas Masuk (Manual)</h3>
                                            <p className="text-2xl font-bold text-green-600">{formatIDR(totalIn)}</p>
                                            <p className="text-xs text-slate-400 mt-1">Dari pencatatan manual</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                            <h3 className="text-slate-500 font-medium mb-2">Total Kas Keluar (Manual)</h3>
                                            <p className="text-2xl font-bold text-red-600">{formatIDR(totalOut)}</p>
                                            <p className="text-xs text-slate-400 mt-1">Dari pencatatan manual</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                            <h3 className="text-slate-500 font-medium mb-2">Selisih (Net)</h3>
                                            <p className={`text-2xl font-bold ${net >= 0 ? 'text-primary' : 'text-red-600'}`}>{formatIDR(net)}</p>
                                            <p className="text-xs text-slate-400 mt-1">Masuk - Keluar</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between">
                                            <span>Rincian Catatan Kas Manual</span>
                                            <span className="text-sm font-normal text-slate-500">{manualFlows.length} item</span>
                                        </div>
                                        {searchQuery && (
                                            <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 text-sm text-primary">
                                                <span className="font-medium">{manualFlows.length}</span> hasil ditemukan untuk "{searchQuery}"
                                            </div>
                                        )}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                                                    <tr>
                                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('date')}>Tanggal <SortIcon column="date" /></th>
                                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('type')}>Tipe <SortIcon column="type" /></th>
                                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('category')}>Kategori <SortIcon column="category" /></th>
                                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('description')}>Keterangan <SortIcon column="description" /></th>
                                                        <th className="p-4 font-medium text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort('amount')}>Jumlah <SortIcon column="amount" /></th>
                                                        <th className="p-4 font-medium text-center">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {manualFlows.length === 0 && (
                                                        <tr>
                                                            <td colSpan={6} className="p-8 text-center text-slate-400">
                                                                Tidak ada data catatan kas manual pada rentang tanggal ini.
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {manualFlows.map(cf => (
                                                        <tr key={cf.id} className="hover:bg-slate-50 group">
                                                            <td className="p-4 text-slate-600">
                                                                <div className="flex flex-col">
                                                                    <span>{new Date(cf.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                                    <span className="text-xs text-slate-400">{new Date(cf.date).toLocaleTimeString('id-ID')}</span>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${cf.type === CashFlowType.IN ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                                    {cf.type === CashFlowType.IN ? 'UANG MASUK' : 'UANG KELUAR'}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 font-medium text-slate-700">{cf.category}</td>
                                                            <td className="p-4 text-slate-600">{cf.description}</td>
                                                            <td className={`p-4 text-right font-bold ${cf.type === CashFlowType.IN ? 'text-green-600' : 'text-red-600'}`}>
                                                                {cf.type === CashFlowType.IN ? '+' : '-'}{formatIDR(cf.amount)}
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteCashFlow(cf.id); }}
                                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )
            }

            {/* --- TAB: HISTORY --- */}
            {
                activeTab === 'history' && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between">
                            <span>Riwayat Transaksi Penjualan</span>
                            <span className="text-primary">Total: {formatIDR(filteredTransactions.reduce((s, t) => s + t.totalAmount, 0))}</span>
                        </div>
                        {searchQuery && (
                            <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 text-sm text-primary">
                                <span className="font-medium">{filteredTransactions.length}</span> hasil ditemukan untuk "{searchQuery}"
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                                    <tr>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('id')}>ID <SortIcon column="id" /></th>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('date')}>Waktu <SortIcon column="date" /></th>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('invoiceNumber')}>Faktur <SortIcon column="invoiceNumber" /></th>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('customerName')}>Pelanggan <SortIcon column="customerName" /></th>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('paymentNote')}>Keterangan <SortIcon column="paymentNote" /></th>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('totalAmount')}>Total <SortIcon column="totalAmount" /></th>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('discountAmount')}>Diskon <SortIcon column="discountAmount" /></th>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('paymentStatus')}>Status <SortIcon column="paymentStatus" /></th>
                                        <th className="p-4 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {visibleTransactions.map(t => (
                                        <tr key={t.id} onClick={() => setDetailTransaction(t)} className="hover:bg-slate-50 cursor-pointer group">
                                            <td className="p-4 font-mono text-xs text-slate-400">#{t.id.substring(0, 6)}</td>
                                            <td className="p-4 text-slate-600">
                                                <div className="flex flex-col">
                                                    <span>{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    <span className="text-xs text-slate-400">{new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-sm text-slate-700">{t.invoiceNumber || '-'}</td>
                                            <td className="p-4 font-medium text-slate-800">{t.customerName}</td>
                                            <td className="p-4 text-slate-600">
                                                {t.type === TransactionType.RETURN && t.originalTransactionId
                                                    ? (() => {
                                                        const original = transactions.find(orig => orig.id === t.originalTransactionId);
                                                        return original?.invoiceNumber
                                                            ? `Retur dari ${original.invoiceNumber}`
                                                            : (t.paymentNote || '-');
                                                    })()
                                                    : (t.paymentNote || '-')
                                                }
                                            </td>
                                            <td className="p-4 text-slate-800">{formatIDR(t.totalAmount)}</td>
                                            <td className="p-4 text-red-600 text-xs font-semibold">{t.discountAmount ? `-${formatIDR(t.discountAmount)}` : '-'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === TransactionType.RETURN
                                                    ? 'bg-purple-100 text-purple-600'
                                                    : t.paymentStatus === 'LUNAS'
                                                        ? 'bg-green-100 text-green-600'
                                                        : t.paymentStatus === 'BELUM_LUNAS'
                                                            ? 'bg-red-100 text-red-600'
                                                            : 'bg-orange-100 text-orange-600'
                                                    }`}>
                                                    {t.type === TransactionType.RETURN ? 'RETUR' : t.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : t.paymentStatus}
                                                    {t.isReturned && t.type !== TransactionType.RETURN ? ' (Ada Retur)' : ''}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); printInvoice(t); }} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 flex items-center gap-1" title="Cetak Nota">
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
                                    {visibleTransactions.length < filteredTransactions.length && (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-slate-400">
                                                <div ref={loadMoreRef}>Loading more...</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {/* --- TAB: CUSTOMER DEBT (PIUTANG) --- */}
            {
                activeTab === 'debt_customer' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between">
                                <span>Daftar Piutang Pelanggan</span>
                                <span className="text-orange-600">Total: {formatIDR(receivables.reduce((s, t) => s + (t.totalAmount - t.amountPaid), 0))}</span>
                            </div>
                            {searchQuery && (
                                <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 text-sm text-primary">
                                    <span className="font-medium">{receivables.length}</span> hasil ditemukan untuk "{searchQuery}"
                                </div>
                            )}
                            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                                {receivables.length === 0 && <div className="p-8 text-center text-slate-400">Tidak ada data piutang.</div>}
                                {visibleReceivables.map(t => {
                                    const remaining = t.totalAmount - t.amountPaid;
                                    return (
                                        <div key={t.id} className={`p-4 flex items-center justify-between cursor-pointer border-l-4 transition-colors ${selectedDebt?.id === t.id ? 'bg-primary/10 border-primary' : 'hover:bg-slate-50 border-transparent'}`} onClick={() => setSelectedDebt(t)}>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{t.customerName}</h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    {t.invoiceNumber && <span className="font-mono text-slate-700 font-bold">{t.invoiceNumber}</span>}
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
                                {visibleReceivables.length < receivables.length && (
                                    <div className="p-4 text-center text-slate-400">
                                        <div ref={loadMoreRef}>Loading more...</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit sticky top-6">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Bayar Piutang</h3>
                            {selectedDebt ? (
                                <div className="space-y-4">
                                    <div className="p-3 bg-primary/10 rounded-lg text-primary text-sm">
                                        <span className="block text-xs text-primary/70 uppercase tracking-wider font-bold mb-1">Pelanggan</span>
                                        <span className="font-bold text-lg">{selectedDebt.customerName}</span>
                                        <div className="text-xs text-primary/80 mt-1 font-mono">
                                            {selectedDebt.invoiceNumber ? `${selectedDebt.invoiceNumber} (Ref: #${selectedDebt.id.substring(0, 6)})` : `Ref: #${selectedDebt.id}`}
                                        </div>
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
                                        <label htmlFor="repaymentAmount" className="text-sm font-medium text-slate-700">Jumlah Bayar</label>
                                        <input
                                            id="repaymentAmount"
                                            name="repaymentAmount"
                                            type="text"
                                            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            value={repaymentAmount}
                                            onChange={e => setRepaymentAmount(numericInput(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="repaymentMethod" className="text-sm font-medium text-slate-700">Metode Bayar</label>
                                        <select
                                            id="repaymentMethod"
                                            name="repaymentMethod"
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
                                            <label htmlFor="repaymentBankId" className="text-sm font-medium text-slate-700">Ke Rekening</label>
                                            <select
                                                id="repaymentBankId"
                                                name="repaymentBankId"
                                                className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg text-sm"
                                                value={repaymentBankId}
                                                onChange={e => setRepaymentBankId(e.target.value)}
                                            >
                                                <option value="">-- Pilih --</option>
                                                {banks.sort((a, b) => a.bankName.localeCompare(b.bankName)).map(b => (
                                                    <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div>
                                        <label htmlFor="repaymentNote" className="text-sm font-medium text-slate-700">Catatan (Opsional)</label>
                                        <input
                                            id="repaymentNote"
                                            name="repaymentNote"
                                            type="text"
                                            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            value={repaymentNote}
                                            onChange={e => setRepaymentNote(e.target.value)}
                                            placeholder="Ket. tambahan"
                                        />
                                    </div>
                                    <button
                                        onClick={initiateRepaymentCustomer}
                                        className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90"
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
                )
            }

            {/* --- TAB: PURCHASE HISTORY --- */}
            {
                activeTab === 'purchase_history' && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between">
                            <span>Riwayat Pembelian Stok</span>
                            <span className="text-indigo-600">Total: {formatIDR(filteredPurchases.reduce((s, p) => s + p.totalAmount, 0))}</span>
                        </div>
                        {searchQuery && (
                            <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 text-sm text-primary">
                                <span className="font-medium">{filteredPurchases.length}</span> hasil ditemukan untuk "{searchQuery}"
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                                    <tr>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('id')}>ID <SortIcon column="id" /></th>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('date')}>Tanggal <SortIcon column="date" /></th>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('invoiceNumber')}>Faktur <SortIcon column="invoiceNumber" /></th>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('supplierName')}>Supplier <SortIcon column="supplierName" /></th>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('description')}>Keterangan <SortIcon column="description" /></th>
                                        <th className="p-4 font-medium">Item</th>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('totalAmount')}>Total <SortIcon column="totalAmount" /></th>
                                        <th className="p-4 font-medium cursor-pointer hover:bg-slate-100" onClick={() => handleSort('paymentStatus')}>Status <SortIcon column="paymentStatus" /></th>
                                        <th className="p-4 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {visiblePurchases.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50 cursor-pointer group" onClick={() => setDetailPurchase(p)}>
                                            <td className="p-4 font-mono text-xs text-slate-400">#{p.id.substring(0, 6)}</td>
                                            <td className="p-4 text-slate-600">
                                                <div className="flex flex-col">
                                                    <span>{new Date(p.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    <span className="text-xs text-slate-400">{new Date(p.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-sm text-slate-700">{p.invoiceNumber || '-'}</td>
                                            <td className="p-4 font-medium text-slate-800">{p.supplierName}</td>
                                            <td className="p-4 text-slate-600">
                                                {p.type === PurchaseType.RETURN && p.originalPurchaseId
                                                    ? (() => {
                                                        const original = purchases.find(orig => orig.id === p.originalPurchaseId);
                                                        return original?.invoiceNumber
                                                            ? `Retur dari ${original.invoiceNumber}`
                                                            : p.description;
                                                    })()
                                                    : p.description
                                                }
                                            </td>
                                            <td className="p-4 text-slate-600">{p.items ? p.items.reduce((sum, i) => sum + i.qty, 0) : 0}</td>
                                            <td className="p-4 text-slate-800">{formatIDR(p.totalAmount)}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${p.type === PurchaseType.RETURN
                                                    ? 'bg-purple-100 text-purple-600'
                                                    : p.paymentStatus === 'LUNAS'
                                                        ? 'bg-green-100 text-green-600'
                                                        : p.paymentStatus === 'SEBAGIAN'
                                                            ? 'bg-orange-100 text-orange-600'
                                                            : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {p.type === PurchaseType.RETURN ? 'RETUR' : p.paymentStatus === 'BELUM_LUNAS' ? 'BELUM LUNAS' : p.paymentStatus}
                                                    {p.isReturned && p.type !== PurchaseType.RETURN ? ' (Ada Retur)' : ''}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); printPurchaseNote(p); }} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1" title="Cetak Nota">
                                                        <Printer size={12} /> Nota
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {visiblePurchases.length < filteredPurchases.length && (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-slate-400">
                                                <div ref={loadMoreRef}>Loading more...</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {/* --- TAB: SUPPLIER DEBT (UTANG) --- */}
            {
                activeTab === 'debt_supplier' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between">
                                <span>Daftar Utang ke Supplier</span>
                                <span className="text-red-600">Total: {formatIDR(payables.reduce((s, p) => s + (p.totalAmount - p.amountPaid), 0))}</span>
                            </div>
                            {searchQuery && (
                                <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 text-sm text-primary">
                                    <span className="font-medium">{payables.length}</span> hasil ditemukan untuk "{searchQuery}"
                                </div>
                            )}
                            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                                {payables.length === 0 && <div className="p-8 text-center text-slate-400">Tidak ada utang ke supplier.</div>}
                                {visiblePayables.map(p => (
                                    <div key={p.id} className={`p-4 cursor-pointer border-l-4 transition-colors ${selectedPayable?.id === p.id ? 'bg-red-50 border-red-500' : 'hover:bg-slate-50 border-transparent'}`} onClick={() => setSelectedPayable(p)}>
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <div className="font-medium text-slate-800">{p.supplierName}</div>
                                                <div className="flex gap-2 items-center">
                                                    {p.invoiceNumber && <span className="font-mono text-xs text-slate-700 font-bold">{p.invoiceNumber}</span>}
                                                    <span className="font-mono text-xs text-slate-400">#{p.id.substring(0, 6)}</span>
                                                </div>
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
                                {visiblePayables.length < payables.length && (
                                    <div className="p-4 text-center text-slate-400">
                                        <div ref={loadMoreRef}>Loading more...</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit sticky top-6">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Bayar Utang Supplier</h3>
                            {selectedPayable ? (
                                <div className="space-y-4">
                                    <div className="p-3 bg-red-50 rounded-lg text-red-800 text-sm">
                                        <span className="block text-xs text-red-400 uppercase tracking-wider font-bold mb-1">Supplier</span>
                                        <span className="font-bold text-lg">{selectedPayable.supplierName}</span>
                                        <div className="text-xs text-red-600 mt-1 font-mono">
                                            {selectedPayable.invoiceNumber ? `${selectedPayable.invoiceNumber} (Ref: #${selectedPayable.id.substring(0, 6)})` : `Ref: #${selectedPayable.id}`}
                                        </div>
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
                                        <label htmlFor="payableRepaymentAmount" className="text-sm font-medium text-slate-700">Jumlah Bayar</label>
                                        <input
                                            id="payableRepaymentAmount"
                                            name="payableRepaymentAmount"
                                            type="text"
                                            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            value={payableRepaymentAmount}
                                            onChange={e => setPayableRepaymentAmount(numericInput(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="payableRepaymentMethod" className="text-sm font-medium text-slate-700">Metode Bayar</label>
                                        <select
                                            id="payableRepaymentMethod"
                                            name="payableRepaymentMethod"
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
                                            <label htmlFor="payableBankId" className="text-sm font-medium text-slate-700">Dari Rekening</label>
                                            <select
                                                id="payableBankId"
                                                name="payableBankId"
                                                className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg text-sm"
                                                value={payableBankId}
                                                onChange={e => setPayableBankId(e.target.value)}
                                            >
                                                <option value="">-- Pilih --</option>
                                                {banks.sort((a, b) => a.bankName.localeCompare(b.bankName)).map(b => (
                                                    <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div>
                                        <label htmlFor="payableNote" className="text-sm font-medium text-slate-700">Catatan</label>
                                        <input
                                            id="payableNote"
                                            name="payableNote"
                                            type="text"
                                            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                            value={payableNote}
                                            onChange={e => setPayableNote(e.target.value)}
                                            placeholder="Ket. tambahan"
                                        />
                                    </div>
                                    <button
                                        onClick={initiateRepaymentSupplier}
                                        className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90"
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
                )
            }

            {/* --- TAB: CASHFLOW --- */}
            {
                activeTab === 'cashflow' && (
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
                                <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 text-sm text-primary">
                                    <span className="font-medium">{filteredCashFlows.length}</span> hasil ditemukan untuk "{searchQuery}"
                                </div>
                            )}
                            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                                {visibleCashFlows.map(cf => {
                                    const refInvoice = (() => {
                                        if (!cf.referenceId) return null;

                                        // Try finding in Transactions
                                        const tx = transactions.find(t => t.id === cf.referenceId);
                                        if (tx) {
                                            // If it's a return, try to find original invoice
                                            if (tx.type === TransactionType.RETURN && tx.originalTransactionId) {
                                                const originalTx = transactions.find(t => t.id === tx.originalTransactionId);
                                                return originalTx?.invoiceNumber ? `${originalTx.invoiceNumber} (Retur)` : tx.invoiceNumber;
                                            }
                                            return tx.invoiceNumber;
                                        }

                                        // Try finding in Purchases
                                        const pur = purchases.find(p => p.id === cf.referenceId);
                                        if (pur) {
                                            if (pur.type === PurchaseType.RETURN && pur.originalPurchaseId) {
                                                const originalPur = purchases.find(p => p.id === pur.originalPurchaseId);
                                                return originalPur?.invoiceNumber ? `${originalPur.invoiceNumber} (Retur)` : pur.invoiceNumber;
                                            }
                                            return pur.invoiceNumber;
                                        }

                                        return null;
                                    })();
                                    return (
                                        <div key={cf.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${cf.type === CashFlowType.IN ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {cf.type === CashFlowType.IN ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">
                                                        {cf.category}
                                                        {refInvoice && <span className="ml-2 text-xs font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">{refInvoice}</span>}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {cf.description}
                                                        {(() => {
                                                            if (cf.bankId) {
                                                                const bank = banks.find(b => b.id === cf.bankId);
                                                                if (bank && !cf.description.includes(bank.accountNumber)) {
                                                                    if (cf.description.toLowerCase().includes(bank.bankName.toLowerCase())) {
                                                                        return <span> - {bank.accountNumber}</span>;
                                                                    }
                                                                    return <span className="text-blue-600"> (via {bank.bankName} - {bank.accountNumber})</span>;
                                                                }
                                                            }
                                                            return null;
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className={`font-bold ${cf.type === CashFlowType.IN ? 'text-green-600' : 'text-red-600'}`}>
                                                        {cf.type === CashFlowType.IN ? '+' : '-'}{formatIDR(cf.amount)}
                                                    </p>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-400">{formatDate(cf.date)}</span>
                                                        <span className="text-[10px] text-slate-300">{new Date(cf.date).toLocaleTimeString('id-ID')}</span>
                                                    </div>
                                                </div>
                                                {(!cf.referenceId || ((cf.category.includes('Pelunasan') || cf.category.includes('Cicilan')) && (currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.SUPERADMIN))) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCashFlow(cf.id);
                                                        }}
                                                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                                                        title={cf.referenceId ? "Hapus Pelunasan (Kembalikan Saldo Utang/Piutang)" : "Hapus Catatan Manual"}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                                {visibleCashFlows.length < filteredCashFlows.length && (
                                    <div className="p-4 text-center text-slate-400">
                                        <div ref={loadMoreRef}>Loading more...</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Catat Kas Manual</h3>
                            <div className="space-y-4">
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                                    <button onClick={() => setCfType(CashFlowType.OUT)} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${cfType === CashFlowType.OUT ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}>Uang Keluar</button>
                                    <button onClick={() => setCfType(CashFlowType.IN)} className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${cfType === CashFlowType.IN ? 'bg-white shadow text-green-600' : 'text-slate-500'}`}>Uang Masuk</button>
                                </div>
                                <label htmlFor="cfAmount" className="sr-only">Jumlah</label>
                                <input
                                    id="cfAmount"
                                    name="cfAmount"
                                    type="text"
                                    placeholder="Jumlah (Rp)"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                                    value={cfAmount}
                                    onChange={e => setCfAmount(numericInput(e.target.value))}
                                />

                                {/* Category Selection */}
                                <label htmlFor="cfCategory" className="sr-only">Kategori</label>
                                <select
                                    id="cfCategory"
                                    name="cfCategory"
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

                                <label htmlFor="cfDesc" className="sr-only">Keterangan</label>
                                <textarea
                                    id="cfDesc"
                                    name="cfDesc"
                                    placeholder="Keterangan (misal: Beli plastik, Bayar listrik)"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm"
                                    rows={3}
                                    value={cfDesc}
                                    onChange={e => setCfDesc(e.target.value)}
                                ></textarea>
                                <div className="grid grid-cols-2 gap-2">
                                    <label htmlFor="cfPaymentMethod" className="sr-only">Metode Pembayaran</label>
                                    <select
                                        id="cfPaymentMethod"
                                        name="cfPaymentMethod"
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
                                        <>
                                            <label htmlFor="cfBankId" className="sr-only">Bank</label>
                                            <select
                                                id="cfBankId"
                                                name="cfBankId"
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm"
                                                value={cfBankId}
                                                onChange={e => setCfBankId(e.target.value)}
                                            >
                                                <option value="">-- Bank --</option>
                                                {banks.sort((a, b) => a.bankName.localeCompare(b.bankName)).map(b => (
                                                    <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber}</option>
                                                ))}
                                            </select>
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={initiateAddCashFlow}
                                    className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90"
                                >
                                    Simpan Catatan
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* DETAIL MODAL */}
            {
                detailTransaction && createPortal(
                    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800">
                                    Detail Transaksi {detailTransaction.invoiceNumber ? `(${detailTransaction.invoiceNumber})` : `#${detailTransaction.id.substring(0, 8)}`}
                                </h3>
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
                                        {(() => {
                                            if (detailTransaction.bankId) {
                                                const bank = banks.find(b => b.id === detailTransaction.bankId);
                                                if (bank) return <span className="block text-xs text-blue-600">via {bank.bankName} {bank.accountNumber}</span>;
                                            }
                                            if (detailTransaction.bankName) return <span className="block text-xs text-blue-600">via {detailTransaction.bankName}</span>;
                                            return null;
                                        })()}
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block text-xs">Status Retur</span>
                                        <span className={`font-medium ${detailTransaction.isReturned ? 'text-purple-600' : 'text-slate-900'}`}>
                                            {detailTransaction.isReturned ? 'Sudah Ada Retur' : '-'}
                                        </span>
                                    </div>
                                </div>

                                <h4 className="font-bold text-sm text-slate-800 mb-2">Barang Dibeli</h4>
                                <div className="border rounded-lg overflow-hidden mb-6">
                                    {detailTransaction.items.map((item, i) => (
                                        <div key={i} className="flex justify-between p-3 border-b last:border-0 text-sm">
                                            <div>
                                                <span className="block font-medium text-slate-700">{item.name}</span>
                                                <span className="text-xs text-slate-500">{item.qty} {item.unit || 'Pcs'} x {formatIDR(item.finalPrice)}</span>
                                            </div>
                                            <span className="font-medium text-slate-800">{formatIDR(item.finalPrice * item.qty)}</span>
                                        </div>
                                    ))}
                                    {(detailTransaction.discountAmount && detailTransaction.discountAmount > 0) && (
                                        <div className="bg-slate-50 p-3 flex justify-between text-red-600 border-b border-slate-200">
                                            <span>Diskon</span>
                                            <span>-{formatIDR(detailTransaction.discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="bg-slate-50 p-3 flex justify-between font-bold text-slate-900">
                                        <span>Total</span>
                                        <span>{formatIDR(detailTransaction.totalAmount)}</span>
                                    </div>
                                </div>

                                {/* Return History (If this is a Sale) */}
                                {transactions.filter(t => t.type === TransactionType.RETURN && t.originalTransactionId === detailTransaction.id).length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-bold text-sm text-slate-800 mb-2">Riwayat Retur</h4>
                                        <div className="bg-orange-50 rounded-lg p-3 space-y-2 text-sm border border-orange-100">
                                            {transactions
                                                .filter(t => t.type === TransactionType.RETURN && t.originalTransactionId === detailTransaction.id)
                                                .map((ret, i) => (
                                                    <div key={i} className="flex justify-between border-b border-orange-200 last:border-0 pb-2">
                                                        <div>
                                                            <div className="flex gap-1 text-xs text-slate-500">
                                                                <span>{new Date(ret.date).toLocaleDateString('id-ID')}</span>
                                                                <span className="font-mono bg-slate-200 px-1 rounded text-[10px]">{new Date(ret.date).toLocaleTimeString('id-ID')}</span>
                                                            </div>
                                                            <span className="text-slate-700 block font-medium">Retur #{ret.id.substring(0, 6)}</span>
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                {ret.items.map((item, idx) => (
                                                                    <div key={idx}>- {item.name} ({item.qty}x)</div>
                                                                ))}
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

                                {/* Original Transaction Info (If this is a Return) */}
                                {detailTransaction.type === TransactionType.RETURN && detailTransaction.originalTransactionId && (
                                    <div className="mb-6">
                                        <h4 className="font-bold text-sm text-slate-800 mb-2">Info Transaksi Induk</h4>
                                        <div className="bg-blue-50 rounded-lg p-3 text-sm border border-blue-100">
                                            {(() => {
                                                const originalTx = transactions.find(t => t.id === detailTransaction.originalTransactionId);
                                                if (originalTx) {
                                                    return (
                                                        <div className="flex justify-between items-center cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors" onClick={() => setDetailTransaction(originalTx)}>
                                                            <div>
                                                                <div className="flex gap-1 text-xs text-slate-500">
                                                                    <span>{new Date(originalTx.date).toLocaleDateString('id-ID')}</span>
                                                                </div>
                                                                <span className="text-slate-700 font-bold block">#{originalTx.id.substring(0, 8)}</span>
                                                                <span className="text-xs text-slate-600">Total: {formatIDR(originalTx.totalAmount)}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-xs bg-white border border-blue-200 px-2 py-1 rounded text-blue-600 flex items-center gap-1">
                                                                    <Eye size={10} /> Lihat
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return <span className="text-slate-500 italic">Transaksi induk tidak ditemukan</span>;
                                            })()}
                                        </div>
                                    </div>
                                )}

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
                                                {(() => {
                                                    if (ph.bankId) {
                                                        const bank = banks.find(b => b.id === ph.bankId);
                                                        if (bank) return <span className="text-[10px] text-blue-600 italic">via {bank.bankName} {bank.accountNumber}</span>;
                                                    }
                                                    if (ph.bankName) return <span className="text-[10px] text-blue-600 italic">via {ph.bankName}</span>;
                                                    return null;
                                                })()}
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
                                    {(() => {
                                        const remaining = detailTransaction.totalAmount - detailTransaction.amountPaid;
                                        if (remaining > 0) {
                                            // Ada piutang / belum lunas
                                            return (
                                                <div className="flex justify-between text-red-600 font-bold">
                                                    <span>Sisa Tagihan</span>
                                                    <span>{formatIDR(remaining)}</span>
                                                </div>
                                            );
                                        } else if (remaining < 0) {
                                            // Ada kembalian (customer bayar lebih)
                                            return (
                                                <div className="flex justify-between text-green-600 font-bold">
                                                    <span>Kembalian</span>
                                                    <span>{formatIDR(Math.abs(remaining))}</span>
                                                </div>
                                            );
                                        }
                                        // remaining === 0, lunas pas
                                        return null;
                                    })()}
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                                {(currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.SUPERADMIN) && (
                                    <button
                                        onClick={async () => {
                                            if (confirm('PERINGATAN: Menghapus transaksi ini akan membatalkan semua perubahan stok, menghapus riwayat pembayaran, dan menghapus arus kas terkait. Tindakan ini tidak dapat dibatalkan. Lanjutkan?')) {
                                                try {
                                                    await StorageService.deleteTransaction(detailTransaction.id);
                                                    setDetailTransaction(null);
                                                    alert('Transaksi berhasil dihapus.');
                                                } catch (e) {
                                                    alert('Gagal menghapus transaksi.');
                                                    console.error(e);
                                                }
                                            }
                                        }}
                                        className="text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Hapus Transaksi (Admin Only)"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <div className="flex justify-end gap-2 ml-auto">
                                    {detailTransaction.type !== TransactionType.RETURN && (
                                        <button
                                            onClick={() => openReturnTxModal(detailTransaction)}
                                            className="bg-orange-50 border border-orange-300 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-100 flex items-center gap-2"
                                        >
                                            <RotateCcw size={16} /> Retur
                                        </button>
                                    )}
                                    <button onClick={() => printTransactionDetail(detailTransaction)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
                                        <Printer size={16} /> Cetak Detail
                                    </button>
                                    <button onClick={() => setDetailTransaction(null)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90">Tutup</button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }

            <ConfirmationModal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmation.onConfirm}
                title={confirmation.title}
                message={confirmation.message}
                confirmLabel={confirmation.confirmLabel}
                cancelLabel={confirmation.cancelLabel}
                type={confirmation.type}
            />

            {/* PURCHASE DETAIL MODAL */}
            {
                detailPurchase && createPortal(
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
                                        <span className="text-slate-500 block text-xs">Kasir</span>
                                        <span className="font-medium text-slate-900">{detailPurchase.userName || '-'}</span>
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
                                                if (bank) return <span className="block text-xs text-blue-600">via {bank.bankName} {bank.accountNumber}</span>;
                                            }
                                            if (detailPurchase.bankName) return <span className="block text-xs text-blue-600">via {detailPurchase.bankName}</span>;
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
                                {purchases.filter(p => p.type === 'RETURN' && (
                                    p.originalPurchaseId === detailPurchase.id ||
                                    p.description.includes(detailPurchase.id) ||
                                    p.description.includes(detailPurchase.id.substring(0, 6))
                                )).length > 0 && (
                                        <div className="mt-6">
                                            <h4 className="font-bold text-sm text-slate-800 mb-2">Riwayat Retur ke Supplier</h4>
                                            <div className="bg-orange-50 rounded-lg p-3 space-y-2 text-sm border border-orange-100">
                                                {purchases
                                                    .filter(p => p.type === 'RETURN' && (
                                                        p.originalPurchaseId === detailPurchase.id ||
                                                        p.description.includes(detailPurchase.id) ||
                                                        p.description.includes(detailPurchase.id.substring(0, 6))
                                                    ))
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
                                {detailPurchase.type === 'RETURN' && (
                                    <div className="mt-6">
                                        <h4 className="font-bold text-sm text-slate-800 mb-2">Info Pembelian Induk</h4>
                                        <div className="bg-blue-50 rounded-lg p-3 text-sm border border-blue-100">
                                            {(() => {
                                                let originalTx = null;

                                                // 1. Try to find by originalPurchaseId (Best)
                                                if (detailPurchase.originalPurchaseId) {
                                                    originalTx = purchases.find(p => p.id === detailPurchase.originalPurchaseId);
                                                }

                                                // 2. Fallback: Extract from description (Legacy)
                                                if (!originalTx) {
                                                    const originalIdMatch = detailPurchase.description.match(/#([a-zA-Z0-9-]+)/);
                                                    const originalId = originalIdMatch ? originalIdMatch[1] : null;
                                                    if (originalId) {
                                                        originalTx = purchases.find(p => p.id === originalId || p.id.startsWith(originalId));
                                                    }
                                                }

                                                if (originalTx) {
                                                    return (
                                                        <div className="flex justify-between items-center cursor-pointer hover:bg-blue-100 p-2 rounded transition-colors" onClick={() => setDetailPurchase(originalTx)}>
                                                            <div>
                                                                <div className="flex gap-1 text-xs text-slate-500">
                                                                    <span>{new Date(originalTx.date).toLocaleDateString('id-ID')}</span>
                                                                </div>
                                                                <span className="text-slate-700 font-bold block">#{originalTx.id.substring(0, 8)}</span>
                                                                <span className="text-xs text-slate-600">Total: {formatIDR(originalTx.totalAmount)}</span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-xs bg-white border border-blue-200 px-2 py-1 rounded text-blue-600 flex items-center gap-1">
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
                                                </div>
                                                <span className="text-slate-700 block">{ph.note || 'Pembayaran'} ({ph.method})</span>
                                                {(() => {
                                                    if (ph.bankId) {
                                                        const bank = banks.find(b => b.id === ph.bankId);
                                                        if (bank) return <span className="text-[10px] text-blue-600 italic">via {bank.bankName} {bank.accountNumber}</span>;
                                                    }
                                                    if (ph.bankName) return <span className="text-[10px] text-blue-600 italic">via {ph.bankName}</span>;
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
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                                {(currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.SUPERADMIN) && (
                                    <button
                                        onClick={async () => {
                                            if (confirm('PERINGATAN: Menghapus pembelian ini akan membatalkan perubahan stok dan menghapus arus kas terkait. Tindakan ini tidak dapat dibatalkan. Lanjutkan?')) {
                                                try {
                                                    await StorageService.deletePurchase(detailPurchase.id);
                                                    setDetailPurchase(null);
                                                    alert('Pembelian berhasil dihapus.');
                                                } catch (e) {
                                                    alert('Gagal menghapus pembelian.');
                                                    console.error(e);
                                                }
                                            }
                                        }}
                                        className="text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Hapus Pembelian (Admin Only)"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <div className="flex justify-end gap-2 ml-auto">
                                    {detailPurchase.type !== PurchaseType.RETURN && (
                                        <button
                                            onClick={() => openReturnPurchaseModal(detailPurchase)}
                                            className="bg-orange-50 border border-orange-300 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-100 flex items-center gap-2"
                                        >
                                            <RotateCcw size={16} /> Retur
                                        </button>
                                    )}
                                    <button onClick={() => printPurchaseDetail(detailPurchase)} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50">
                                        <Printer size={16} /> Cetak Detail
                                    </button>
                                    <button onClick={() => setDetailPurchase(null)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90">Tutup</button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }

            {/* PURCHASE MODAL */}
            {
                isPurchaseModalOpen && createPortal(
                    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800">Catat Pembelian Stok</h3>
                                <button onClick={() => setIsPurchaseModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                            </div>
                            <div className="p-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                                        <select
                                            id="purchaseSupplier"
                                            name="purchaseSupplier"
                                            className="w-full border border-slate-300 p-2 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={purchaseForm.supplierId}
                                            onChange={e => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}
                                        >
                                            <option value="">-- Pilih Supplier --</option>
                                            {suppliers.sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Mode Selection */}
                                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                                        <button
                                            onClick={() => setPurchaseMode('items')}
                                            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${purchaseMode === 'items' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                                        >
                                            Pilih Barang
                                        </button>
                                        <button
                                            onClick={() => setPurchaseMode('manual')}
                                            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${purchaseMode === 'manual' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                                        >
                                            Input Manual
                                        </button>
                                    </div>

                                    {purchaseMode === 'items' ? (
                                        <>
                                            {/* Product Search */}
                                            <div className="relative">
                                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <label htmlFor="purchaseProductSearch" className="sr-only">Cari Barang</label>
                                                <input
                                                    id="purchaseProductSearch"
                                                    name="purchaseProductSearch"
                                                    type="text"
                                                    placeholder="Cari barang untuk dibeli..."
                                                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={purchaseProductSearch}
                                                    onChange={e => setPurchaseProductSearch(e.target.value)}
                                                />
                                                {purchaseProductSearch && (
                                                    <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                                                        {products.filter(p => p.name.toLowerCase().includes(purchaseProductSearch.toLowerCase())).map(p => (
                                                            <div
                                                                key={p.id}
                                                                className="p-2 hover:bg-slate-50 cursor-pointer text-sm flex justify-between"
                                                                onClick={() => {
                                                                    if (!purchaseItems.find(i => i.id === p.id)) {
                                                                        setPurchaseItems([...purchaseItems, { id: p.id, qty: 1, price: p.hpp, name: p.name }]);
                                                                    }
                                                                    setPurchaseProductSearch('');
                                                                }}
                                                            >
                                                                <span>{p.name}</span>
                                                                <div className="text-right">
                                                                    <span className="text-slate-500 text-xs block">Stok: {p.stock}</span>
                                                                    <span className="text-slate-700 font-medium text-xs">HPP: {formatIDR(p.hpp)}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Selected Items List */}
                                            <div className="space-y-3">
                                                {purchaseItems.map((item, idx) => (
                                                    <div key={item.id} className="p-3 border border-slate-200 rounded-lg">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="font-medium text-slate-800 text-sm">{item.name}</div>
                                                            <button onClick={() => setPurchaseItems(purchaseItems.filter((_, i) => i !== idx))} className="text-red-500"><X size={16} /></button>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <div className="flex items-center border border-slate-300 rounded overflow-hidden">
                                                                <button
                                                                    onClick={() => {
                                                                        const newItems = [...purchaseItems];
                                                                        if (newItems[idx].qty > 1) newItems[idx].qty--;
                                                                        setPurchaseItems(newItems);
                                                                    }}
                                                                    className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border-r border-slate-300"
                                                                >-</button>
                                                                <input
                                                                    id={`purchaseItemQty-${idx}`}
                                                                    name={`purchaseItemQty-${idx}`}
                                                                    type="text"
                                                                    aria-label="Jumlah Item"
                                                                    className="w-12 text-center outline-none"
                                                                    value={item.qty}
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value) || 0;
                                                                        const newItems = [...purchaseItems];
                                                                        newItems[idx].qty = val;
                                                                        setPurchaseItems(newItems);
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const newItems = [...purchaseItems];
                                                                        newItems[idx].qty++;
                                                                        setPurchaseItems(newItems);
                                                                    }}
                                                                    className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border-l border-slate-300"
                                                                >+</button>
                                                            </div>
                                                            <span className="text-slate-400">x</span>
                                                            <input
                                                                id={`purchaseItemPrice-${idx}`}
                                                                name={`purchaseItemPrice-${idx}`}
                                                                type="text"
                                                                aria-label="Harga Beli per Satuan"
                                                                className="flex-1 border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                                                                placeholder="Harga Beli (HPP)"
                                                                value={item.price}
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value) || 0; // Allow typing
                                                                    const newItems = [...purchaseItems];
                                                                    newItems[idx].price = val;
                                                                    setPurchaseItems(newItems);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="text-right text-xs font-bold text-slate-700 mt-1">
                                                            Subtotal: {formatIDR(item.qty * item.price)}
                                                        </div>
                                                    </div>
                                                ))}
                                                {purchaseItems.length === 0 && (
                                                    <div className="text-center text-slate-400 py-4 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                                        Belum ada barang dipilih.
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan / Keterangan</label>
                                                <input
                                                    id="purchaseDescriptionItems"
                                                    name="purchaseDescriptionItems"
                                                    type="text"
                                                    className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Contoh: Stok tambahan, kiriman pagi..."
                                                    value={purchaseForm.description}
                                                    onChange={e => setPurchaseForm({ ...purchaseForm, description: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                                <span className="font-bold text-blue-800">Total Belanja</span>
                                                <span className="font-bold text-blue-800 text-lg">
                                                    {formatIDR(purchaseItems.reduce((sum, i) => sum + (i.qty * i.price), 0))}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan Barang</label>
                                                <input
                                                    id="purchaseDescriptionManual"
                                                    name="purchaseDescriptionManual"
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
                                                    id="purchaseAmountManual"
                                                    name="purchaseAmountManual"
                                                    type="text"
                                                    className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={purchaseForm.amount}
                                                    onChange={e => setPurchaseForm({ ...purchaseForm, amount: numericInput(e.target.value) })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="border-t border-slate-200 pt-4 mt-4">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Dibayar (Rp)</label>
                                        <input
                                            id="purchasePaid"
                                            name="purchasePaid"
                                            type="text"
                                            className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="0 jika tempo"
                                            value={purchaseForm.paid}
                                            onChange={e => {
                                                const val = numericInput(e.target.value);
                                                const numVal = parseFloat(val) || 0;

                                                let total = 0;
                                                if (purchaseMode === 'items') {
                                                    total = purchaseItems.reduce((sum, i) => sum + (i.qty * i.price), 0);
                                                } else {
                                                    total = parseFloat(purchaseForm.amount.replace(/[^0-9]/g, '')) || 0;
                                                }

                                                if (numVal > total) {
                                                    alert(`Nominal dibayar tidak boleh melebihi Total Belanja (${formatIDR(total)})`);
                                                    return;
                                                }
                                                setPurchaseForm({ ...purchaseForm, paid: val });
                                            }}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Sisa akan dicatat sebagai utang supplier.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
                                        <select
                                            id="purchasePaymentMethod"
                                            name="purchasePaymentMethod"
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
                                                id="purchaseBankId"
                                                name="purchaseBankId"
                                                className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={purchaseForm.bankId}
                                                onChange={e => setPurchaseForm({ ...purchaseForm, bankId: e.target.value })}
                                            >
                                                <option value="">-- Pilih Rekening --</option>
                                                {banks.sort((a, b) => a.bankName.localeCompare(b.bankName)).map(b => (
                                                    <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                                <button onClick={() => setIsPurchaseModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Batal</button>
                                <button onClick={handlePurchaseSubmit} className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary/90 shadow-lg">
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }

            {/* RETURN TRANSACTION MODAL */}
            {
                isReturnTxModalOpen && createPortal(
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
                                <div className="mt-4">
                                    <label htmlFor="returnTxNote" className="block text-sm font-medium text-slate-700 mb-1">Catatan Retur (Kondisi Fisik, Alasan, dll)</label>
                                    <textarea
                                        id="returnTxNote"
                                        name="returnTxNote"
                                        className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        rows={2}
                                        placeholder="Contoh: Barang rusak, kemasan penyok..."
                                        value={returnTxNote}
                                        onChange={e => setReturnTxNote(e.target.value)}
                                    />
                                </div>
                                {/* Payment Method Selection */}
                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Metode Pengembalian Dana</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="returnTxMethod" className="sr-only">Metode Pengembalian Dana</label>
                                            <select
                                                id="returnTxMethod"
                                                name="returnTxMethod"
                                                className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                value={returnTxMethod}
                                                onChange={e => {
                                                    setReturnTxMethod(e.target.value as PaymentMethod);
                                                    setReturnTxBankId('');
                                                }}
                                            >
                                                <option value={PaymentMethod.CASH}>Tunai</option>
                                                <option value={PaymentMethod.TRANSFER}>Transfer</option>
                                            </select>
                                        </div>
                                        {returnTxMethod === PaymentMethod.TRANSFER && (
                                            <div>
                                                <label htmlFor="returnTxBankId" className="sr-only">Bank</label>
                                                <select
                                                    id="returnTxBankId"
                                                    name="returnTxBankId"
                                                    className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                    value={returnTxBankId}
                                                    onChange={e => setReturnTxBankId(e.target.value)}
                                                >
                                                    <option value="">-- Pilih Bank --</option>
                                                    {banks.sort((a, b) => a.bankName.localeCompare(b.bankName)).map(b => (
                                                        <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
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
                )
            }

            {/* RETURN PURCHASE MODAL */}
            {
                isReturnPurchaseModalOpen && createPortal(
                    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800">Retur Pembelian (Ke Supplier)</h3>
                                <button onClick={() => setIsReturnPurchaseModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                            </div>
                            <div className="p-6 max-h-[70vh] overflow-y-auto">
                                <p className="text-sm text-slate-600 mb-4">Proses pengembalian barang atau dana dari supplier <b>{detailPurchase?.supplierName}</b>.</p>

                                {/* Mode Selection */}
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-6">
                                    <button
                                        onClick={() => setReturnPurchaseMode('items')}
                                        className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${returnPurchaseMode === 'items' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                                    >
                                        Pilih Barang
                                    </button>
                                    <button
                                        onClick={() => setReturnPurchaseMode('manual')}
                                        className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${returnPurchaseMode === 'manual' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                                    >
                                        Nominal Manual
                                    </button>
                                </div>

                                {returnPurchaseMode === 'items' ? (
                                    <div className="space-y-3">
                                        {returnPurchaseItems.map((item, idx) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                                                <div className="flex-1">
                                                    <div className="font-medium text-slate-800">{item.name}</div>
                                                    <div className="text-xs text-slate-500">Maks: {item.maxQty} | Refund/Item: {formatIDR(item.price)}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => {
                                                            const newItems = [...returnPurchaseItems];
                                                            if (newItems[idx].qty > 0) newItems[idx].qty--;
                                                            setReturnPurchaseItems(newItems);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200"
                                                    >-</button>
                                                    <span className="w-8 text-center font-bold">{item.qty}</span>
                                                    <button
                                                        onClick={() => {
                                                            const newItems = [...returnPurchaseItems];
                                                            if (newItems[idx].qty < item.maxQty) newItems[idx].qty++;
                                                            setReturnPurchaseItems(newItems);
                                                        }}
                                                        className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200"
                                                    >+</button>
                                                </div>
                                            </div>
                                        ))}
                                        {returnPurchaseItems.length === 0 && (
                                            <div className="text-center text-slate-400 py-4 text-sm">Tidak ada barang yang dapat diretur.</div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="returnPurchaseManualAmount" className="block text-sm font-medium text-slate-700 mb-1">Nominal Refund (Rp)</label>
                                            <input
                                                id="returnPurchaseManualAmount"
                                                name="returnPurchaseManualAmount"
                                                type="text"
                                                className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                                                value={returnPurchaseManualAmount}
                                                onChange={e => setReturnPurchaseManualAmount(numericInput(e.target.value))}
                                                placeholder="0"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Masukkan jumlah uang yang dikembalikan oleh supplier.</p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <label htmlFor="returnPurchaseNote" className="block text-sm font-medium text-slate-700 mb-1">Catatan Retur (Kondisi Fisik, Alasan, dll)</label>
                                    <textarea
                                        id="returnPurchaseNote"
                                        name="returnPurchaseNote"
                                        className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                                        rows={2}
                                        placeholder="Contoh: Barang rusak, kemasan penyok..."
                                        value={returnPurchaseNote}
                                        onChange={e => setReturnPurchaseNote(e.target.value)}
                                    />
                                </div>

                                {/* Payment Method Selection */}
                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Metode Pengembalian Dana</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="returnPurchaseMethod" className="sr-only">Metode Pengembalian Dana</label>
                                            <select
                                                id="returnPurchaseMethod"
                                                name="returnPurchaseMethod"
                                                className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                                                value={returnPurchaseMethod}
                                                onChange={e => {
                                                    setReturnPurchaseMethod(e.target.value as PaymentMethod);
                                                    setReturnPurchaseBankId('');
                                                }}
                                            >
                                                <option value={PaymentMethod.CASH}>Tunai</option>
                                                <option value={PaymentMethod.TRANSFER}>Transfer</option>
                                            </select>
                                        </div>
                                        {returnPurchaseMethod === PaymentMethod.TRANSFER && (
                                            <div>
                                                <label htmlFor="returnPurchaseBankId" className="sr-only">Bank</label>
                                                <select
                                                    id="returnPurchaseBankId"
                                                    name="returnPurchaseBankId"
                                                    className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                                                    value={returnPurchaseBankId}
                                                    onChange={e => setReturnPurchaseBankId(e.target.value)}
                                                >
                                                    <option value="">-- Pilih Bank --</option>
                                                    {banks.sort((a, b) => a.bankName.localeCompare(b.bankName)).map(b => (
                                                        <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 p-4 bg-green-50 rounded-xl flex justify-between items-center">
                                    <span className="text-green-800 font-medium">Total Refund (Masuk)</span>
                                    <span className="text-green-800 font-bold text-xl">
                                        {returnPurchaseMode === 'items'
                                            ? formatIDR(returnPurchaseItems.reduce((sum, i) => sum + (i.qty * i.price), 0))
                                            : formatIDR(parseFloat(returnPurchaseManualAmount.replace(/[^0-9]/g, '')) || 0)
                                        }
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
                )
            }
        </div >
    );
};