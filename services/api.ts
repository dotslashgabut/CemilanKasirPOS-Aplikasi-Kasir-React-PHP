import { Product, Transaction, User, CashFlow, Category, Customer, Supplier, Purchase, StoreSettings, BankAccount, PaymentStatus } from "../types";
import { generateUUID, toMySQLDate } from "../utils";

const isProd = import.meta.env.PROD;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/php_server/api';

// Get headers with authentication
const getHeaders = () => {
    const currentUser = localStorage.getItem('pos_current_user');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    const token = localStorage.getItem('pos_token');

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// Global request helper to handle Auth & Caching
const request = async (endpoint: string, options: RequestInit = {}, skipAuthRedirect = false) => {
    const url = `${API_URL}${endpoint}`;
    const headers = getHeaders();

    const config = {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
        credentials: 'include' as RequestCredentials, // Enable Cookie Support (F1)
    };

    // Add cache buster for GET requests to prevent stale data
    // (Fixes issue where deleted items still show up)
    let finalUrl = url;
    if (!config.method || config.method === 'GET') {
        const separator = url.includes('?') ? '&' : '?';
        finalUrl = `${url}${separator}_t=${new Date().getTime()}`;
    }

    try {
        const res = await fetch(finalUrl, config);

        // Handle Session Expiry / Unauthorized
        // (Fixes issue where page doesn't reload on session expiry)
        if ((res.status === 401 || res.status === 403) && !skipAuthRedirect) {
            console.warn("Session expired or unauthorized. Redirecting to login...");
            localStorage.removeItem('pos_current_user');
            localStorage.removeItem('pos_token');
            window.location.reload();
            throw new Error('Session expired');
        }

        return res;
    } catch (error) {
        throw error;
    }
};

// Helper to ensure numbers are numbers
const parseNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val) || 0;
    return 0;
};

// Helper to ensure booleans are booleans
const parseBoolean = (val: any): boolean => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val !== 0;
    if (typeof val === 'string') {
        const lower = val.toLowerCase();
        return lower === 'true' || lower === '1';
    }
    return false;
};

const parseProduct = (p: any): Product => ({
    ...p,
    stock: parseNumber(p.stock),
    hpp: parseNumber(p.hpp),
    priceRetail: parseNumber(p.priceRetail),
    priceGeneral: parseNumber(p.priceGeneral),
    priceWholesale: parseNumber(p.priceWholesale),
    pricePromo: p.pricePromo ? parseNumber(p.pricePromo) : undefined
});

const parseTransaction = (t: any): Transaction => ({
    ...t,
    totalAmount: parseNumber(t.totalAmount),
    amountPaid: parseNumber(t.amountPaid),
    change: parseNumber(t.change),
    isReturned: parseBoolean(t.isReturned),
    items: Array.isArray(t.items) ? t.items.map((i: any) => ({
        ...i,
        qty: parseNumber(i.qty),
        finalPrice: parseNumber(i.finalPrice),
        hpp: parseNumber(i.hpp)
    })) : [],
    paymentHistory: Array.isArray(t.paymentHistory) ? t.paymentHistory.map((h: any) => ({
        ...h,
        amount: parseNumber(h.amount)
    })) : []
});

const parsePurchase = (p: any): Purchase => ({
    ...p,
    totalAmount: parseNumber(p.totalAmount),
    amountPaid: parseNumber(p.amountPaid),
    isReturned: parseBoolean(p.isReturned),
    items: Array.isArray(p.items) ? p.items.map((i: any) => ({
        ...i,
        qty: parseNumber(i.qty),
        finalPrice: parseNumber(i.finalPrice)
    })) : [],
    paymentHistory: Array.isArray(p.paymentHistory) ? p.paymentHistory.map((h: any) => ({
        ...h,
        amount: parseNumber(h.amount)
    })) : []
});

const parseCashFlow = (c: any): CashFlow => ({
    ...c,
    amount: parseNumber(c.amount)
});

export const ApiService = {
    // Store Settings
    getStoreSettings: async (): Promise<StoreSettings> => {
        const defaultSettings: StoreSettings = {
            name: 'Cemilan KasirPOS Nusantara', jargon: '', address: '', phone: '', bankAccount: '', footerMessage: '', notes: '',
            showAddress: true, showJargon: true, showBank: true, printerType: '58mm',
            autoSyncMySQL: false, useMySQLPrimary: false
        };

        try {
            // Cache buster is now handled by request()
            const res = await request('/store_settings/settings');
            if (!res.ok) return defaultSettings;
            const settings = await res.json();

            // Fix boolean parsing issues (PHP returns 0/1 or "0"/"1" often)
            return {
                ...defaultSettings,
                ...settings,
                showAddress: settings.showAddress !== undefined ? parseBoolean(settings.showAddress) : defaultSettings.showAddress,
                showJargon: settings.showJargon !== undefined ? parseBoolean(settings.showJargon) : defaultSettings.showJargon,
                showBank: settings.showBank !== undefined ? parseBoolean(settings.showBank) : defaultSettings.showBank,
                autoSyncMySQL: settings.autoSyncMySQL !== undefined ? parseBoolean(settings.autoSyncMySQL) : defaultSettings.autoSyncMySQL,
                useMySQLPrimary: settings.useMySQLPrimary !== undefined ? parseBoolean(settings.useMySQLPrimary) : defaultSettings.useMySQLPrimary
            };
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            return defaultSettings;
        }
    },
    saveStoreSettings: async (settings: StoreSettings) => {
        const payload = { ...settings, id: 'settings' };

        // Try to update first
        const res = await request('/store_settings/settings', {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        // If not found (404), create new record
        if (res.status === 404) {
            const createRes = await request('/store_settings', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            if (!createRes.ok) {
                const err = await createRes.json();
                throw new Error(err.error || 'Failed to create store settings');
            }
        } else if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed to update store settings');
        }
    },

    // Banks
    getBanks: async (): Promise<BankAccount[]> => {
        const res = await request('/banks');
        return await res.json();
    },
    saveBank: async (bank: BankAccount) => {
        // if (!bank.id) bank.id = generateUUID(); // Handled by backend (F3)
        const res = await request('/banks', {
            method: 'POST',
            body: JSON.stringify(bank)
        });
        if (!res.ok) throw new Error('Failed to save bank');
    },
    updateBank: async (bank: BankAccount) => {
        await request(`/banks/${bank.id}`, {
            method: 'PUT',
            body: JSON.stringify(bank)
        });
    },
    deleteBank: async (id: string) => {
        const res = await request(`/banks/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete bank');
    },

    // Categories
    getCategories: async (): Promise<Category[]> => {
        const res = await request('/categories');
        return await res.json();
    },
    saveCategory: async (category: Category) => {
        // if (!category.id) category.id = generateUUID(); // Handled by backend (F3)
        const res = await request('/categories', {
            method: 'POST',
            body: JSON.stringify(category)
        });
        if (!res.ok) throw new Error('Failed to save category');
    },
    updateCategory: async (category: Category) => {
        await request(`/categories/${category.id}`, {
            method: 'PUT',
            body: JSON.stringify(category)
        });
    },
    deleteCategory: async (id: string) => {
        const res = await request(`/categories/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete category');
    },

    // Products
    getProducts: async (): Promise<Product[]> => {
        const res = await request('/products');
        const data = await res.json();
        return data.map(parseProduct);
    },
    saveProduct: async (product: Product) => {
        // if (!product.id) product.id = generateUUID(); // Handled by backend (F3)
        const res = await request('/products', {
            method: 'POST',
            body: JSON.stringify(product)
        });
        if (!res.ok) throw new Error('Failed to save product');
    },
    updateProduct: async (product: Product) => {
        await request(`/products/${product.id}`, {
            method: 'PUT',
            body: JSON.stringify(product)
        });
    },
    deleteProduct: async (id: string) => {
        const res = await request(`/products/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete product');
    },
    saveProductsBulk: async (newProducts: Product[]) => {
        // const productsWithIds = newProducts.map(p => ({ ...p, id: p.id || generateUUID() })); // Handled by backend
        const productsWithIds = newProducts;
        const res = await request('/products/batch', {
            method: 'POST',
            body: JSON.stringify(productsWithIds)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to save products bulk');
        }
    },

    // Customers
    getCustomers: async (): Promise<Customer[]> => {
        const res = await request('/customers');
        return await res.json();
    },
    saveCustomer: async (cust: Customer) => {
        // if (!cust.id) cust.id = generateUUID(); // Handled by backend (F3)
        const res = await request('/customers', {
            method: 'POST',
            body: JSON.stringify(cust)
        });
        if (!res.ok) throw new Error('Failed to save customer');
    },
    updateCustomer: async (cust: Customer) => {
        await request(`/customers/${cust.id}`, {
            method: 'PUT',
            body: JSON.stringify(cust)
        });
    },
    deleteCustomer: async (id: string) => {
        const res = await request(`/customers/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete customer');
    },
    saveCustomersBulk: async (newCustomers: Customer[]) => {
        // const customersWithIds = newCustomers.map(c => ({ ...c, id: c.id || generateUUID() }));
        const customersWithIds = newCustomers;
        const res = await request('/customers/batch', {
            method: 'POST',
            body: JSON.stringify(customersWithIds)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to save customers bulk');
        }
    },

    // Suppliers
    getSuppliers: async (): Promise<Supplier[]> => {
        const res = await request('/suppliers');
        return await res.json();
    },
    saveSupplier: async (sup: Supplier) => {
        // if (!sup.id) sup.id = generateUUID(); // Handled by backend (F3)
        const res = await request('/suppliers', {
            method: 'POST',
            body: JSON.stringify(sup)
        });
        if (!res.ok) throw new Error('Failed to save supplier');
    },
    updateSupplier: async (sup: Supplier) => {
        await request(`/suppliers/${sup.id}`, {
            method: 'PUT',
            body: JSON.stringify(sup)
        });
    },
    deleteSupplier: async (id: string) => {
        const res = await request(`/suppliers/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete supplier');
    },
    saveSuppliersBulk: async (newSuppliers: Supplier[]) => {
        // const suppliersWithIds = newSuppliers.map(s => ({ ...s, id: s.id || generateUUID() }));
        const suppliersWithIds = newSuppliers;
        const res = await request('/suppliers/batch', {
            method: 'POST',
            body: JSON.stringify(suppliersWithIds)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || err.message || 'Failed to save suppliers bulk');
        }
    },

    // Transactions (Sales)
    getTransactions: async (): Promise<Transaction[]> => {
        const res = await request('/transactions');
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(parseTransaction);
    },
    addTransaction: async (transaction: Transaction) => {
        // Convert ISO date to MySQL format
        const formattedDate = toMySQLDate(new Date(transaction.date));

        if (!transaction.paymentHistory && transaction.amountPaid > 0) {
            transaction.paymentHistory = [{
                date: transaction.date,
                amount: transaction.amountPaid,
                method: transaction.paymentMethod,
                bankId: transaction.bankId,
                bankName: transaction.bankName,
                note: transaction.paymentNote || 'Pembayaran Awal'
            }];
        }

        // Also convert dates in payment history
        if (transaction.paymentHistory && transaction.paymentHistory.length > 0) {
            transaction.paymentHistory = transaction.paymentHistory.map(ph => ({
                ...ph,
                date: toMySQLDate(new Date(ph.date))
            }));
        }

        const res = await request('/transactions', {
            method: 'POST',
            body: JSON.stringify({ ...transaction, date: formattedDate })
        });
        if (!res.ok) throw new Error('Failed to add transaction');
        return await res.json();
    },
    updateTransaction: async (transaction: Transaction) => {
        // Convert ISO date to MySQL format
        const formattedDate = toMySQLDate(new Date(transaction.date));

        // Also convert dates in payment history
        if (transaction.paymentHistory && transaction.paymentHistory.length > 0) {
            transaction.paymentHistory = transaction.paymentHistory.map(ph => ({
                ...ph,
                date: toMySQLDate(new Date(ph.date))
            }));
        }

        const res = await request(`/transactions/${transaction.id}`, {
            method: 'PUT',
            body: JSON.stringify({ ...transaction, date: formattedDate })
        });
        if (!res.ok) throw new Error('Failed to update transaction');
    },
    deleteTransaction: async (id: string) => {
        const res = await request(`/transactions/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete transaction');
        console.log(`Successfully deleted transaction ${id}`);
    },

    // Purchases (Stock In)
    getPurchases: async (): Promise<Purchase[]> => {
        const res = await request('/purchases');
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(parsePurchase);
    },
    addPurchase: async (purchase: Purchase) => {
        // Convert ISO date to MySQL format
        const formattedDate = toMySQLDate(new Date(purchase.date));

        if (!purchase.paymentHistory && purchase.amountPaid > 0) {
            purchase.paymentHistory = [{
                date: purchase.date,
                amount: purchase.amountPaid,
                method: purchase.paymentMethod,
                bankId: purchase.bankId,
                bankName: purchase.bankName,
                note: 'Pembayaran Awal'
            }];
        }

        // Also convert dates in payment history
        if (purchase.paymentHistory && purchase.paymentHistory.length > 0) {
            purchase.paymentHistory = purchase.paymentHistory.map(ph => ({
                ...ph,
                date: toMySQLDate(new Date(ph.date))
            }));
        }

        const res = await request('/purchases', {
            method: 'POST',
            body: JSON.stringify({ ...purchase, date: formattedDate })
        });
        if (!res.ok) throw new Error('Failed to add purchase');
    },
    updatePurchase: async (purchase: Purchase) => {
        // Convert ISO date to MySQL format
        const formattedDate = toMySQLDate(new Date(purchase.date));

        // Also convert dates in payment history
        if (purchase.paymentHistory && purchase.paymentHistory.length > 0) {
            purchase.paymentHistory = purchase.paymentHistory.map(ph => ({
                ...ph,
                date: toMySQLDate(new Date(ph.date))
            }));
        }

        const res = await request(`/purchases/${purchase.id}`, {
            method: 'PUT',
            body: JSON.stringify({ ...purchase, date: formattedDate })
        });
        if (!res.ok) throw new Error('Failed to update purchase');
    },
    deletePurchase: async (id: string) => {
        const res = await request(`/purchases/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete purchase');
        console.log(`Successfully deleted purchase ${id}`);
    },

    // Cash Flow
    getCashFlow: async (): Promise<CashFlow[]> => {
        const res = await request('/cashflow');
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(parseCashFlow);
    },
    addCashFlow: async (cf: CashFlow) => {
        const formattedDate = toMySQLDate(new Date(cf.date));
        const res = await request('/cashflow', {
            method: 'POST',
            body: JSON.stringify({ ...cf, date: formattedDate }) // ID generated by backend if missing
        });
        if (!res.ok) throw new Error('Failed to add cashflow');
    },
    deleteCashFlow: async (id: string) => {
        // 1. Get the cashflow to be deleted
        const res = await request('/cashflow');
        if (!res.ok) throw new Error('Failed to fetch cashflows');
        const cashflows = await res.json();
        const cf = cashflows.find((c: any) => c.id === id);

        if (!cf) throw new Error('Cashflow not found');

        const parsedCf = parseCashFlow(cf);

        // 2. Check if it is a Repayment (Pelunasan)
        if (parsedCf.referenceId && (parsedCf.category.includes('Pelunasan') || parsedCf.category.includes('Cicilan'))) {
            if (parsedCf.category.includes('Piutang') || parsedCf.category.includes('Pelanggan')) {
                // Handle Transaction (Receivable)
                try {
                    const txRes = await request(`/transactions/${parsedCf.referenceId}`);
                    if (txRes.ok) {
                        const tx = await txRes.json();
                        const parsedTx = parseTransaction(tx);

                        // Revert amountPaid
                        const newPaid = Math.max(0, parsedTx.amountPaid - parsedCf.amount);
                        const newStatus = newPaid >= parsedTx.totalAmount ? PaymentStatus.PAID : (newPaid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID);

                        // Remove from paymentHistory
                        let newHistory = parsedTx.paymentHistory || [];
                        const historyIndex = newHistory.findIndex(ph =>
                            Math.abs(ph.amount - parsedCf.amount) < 1 &&
                            (Math.abs(new Date(ph.date).getTime() - new Date(parsedCf.date).getTime()) < 60000) // 1 minute tolerance
                        );

                        if (historyIndex !== -1) {
                            newHistory.splice(historyIndex, 1);
                        }

                        const updatedTx = {
                            ...parsedTx,
                            amountPaid: newPaid,
                            paymentStatus: newStatus,
                            paymentHistory: newHistory
                        };

                        await ApiService.updateTransaction(updatedTx);
                        console.log("Reverted transaction payment linked to cashflow");
                    }
                } catch (e) {
                    console.error("Failed to revert transaction payment:", e);
                }
            } else if (parsedCf.category.includes('Utang') || parsedCf.category.includes('Supplier')) {
                // Handle Purchase (Payable)
                try {
                    const purRes = await request(`/purchases/${parsedCf.referenceId}`);
                    if (purRes.ok) {
                        const pur = await purRes.json();
                        const parsedPur = parsePurchase(pur);

                        // Revert amountPaid
                        const newPaid = Math.max(0, parsedPur.amountPaid - parsedCf.amount);
                        const newStatus = newPaid >= parsedPur.totalAmount ? PaymentStatus.PAID : (newPaid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID);

                        // Remove from paymentHistory
                        let newHistory = parsedPur.paymentHistory || [];
                        const historyIndex = newHistory.findIndex(ph =>
                            Math.abs(ph.amount - parsedCf.amount) < 1 &&
                            (Math.abs(new Date(ph.date).getTime() - new Date(parsedCf.date).getTime()) < 60000)
                        );

                        if (historyIndex !== -1) {
                            newHistory.splice(historyIndex, 1);
                        }

                        const updatedPur = {
                            ...parsedPur,
                            amountPaid: newPaid,
                            paymentStatus: newStatus,
                            paymentHistory: newHistory
                        };

                        await ApiService.updatePurchase(updatedPur);
                        console.log("Reverted purchase payment linked to cashflow");
                    }
                } catch (e) {
                    console.error("Failed to revert purchase payment:", e);
                }
            }
        }

        const delRes = await request(`/cashflow/${id}`, { method: 'DELETE' });
        if (!delRes.ok) throw new Error('Failed to delete cashflow');
    },

    // Users
    getUsers: async (): Promise<User[]> => {
        try {
            const res = await request('/users');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            console.error("Fetch users failed:", e);
            throw e;
        }
    },
    saveUser: async (user: User) => {
        // if (!user.id) user.id = generateUUID();
        const res = await request('/users', {
            method: 'POST',
            body: JSON.stringify(user)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to save user');
        }
    },
    updateUser: async (user: User) => {
        const res = await request(`/users/${user.id}`, {
            method: 'PUT',
            body: JSON.stringify(user)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update user');
        }
    },
    deleteUser: async (id: string) => {
        const res = await request(`/users/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete user');
    },

    // Reset Functions
    resetProducts: async () => {
        // Also reset stock adjustments to avoid orphaned data
        try {
            await ApiService.resetStockAdjustments();
        } catch (e) {
            console.error("Failed to reset stock adjustments during products reset", e);
        }

        const products = await ApiService.getProducts();
        for (const product of products) {
            await ApiService.deleteProduct(product.id);
        }
    },

    // Stock Adjustments
    getStockAdjustments: async (): Promise<any[]> => {
        const res = await request('/stock_adjustments');
        if (!res.ok) return [];
        return await res.json();
    },
    addStockAdjustment: async (adjustment: any) => {
        const formattedDate = toMySQLDate(new Date(adjustment.date));
        const res = await request('/stock_adjustments', {
            method: 'POST',
            body: JSON.stringify({ ...adjustment, date: formattedDate })
        });
        if (!res.ok) throw new Error('Failed to add stock adjustment');
    },
    resetStockAdjustments: async () => {
        const res = await request('/stock_adjustments/reset', {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to reset stock adjustments');
    },
    resetTransactions: async () => {
        const transactions = await ApiService.getTransactions();
        for (const tx of transactions) {
            try {
                await ApiService.deleteTransaction(tx.id);
            } catch (e) {
                console.error(`Failed to delete transaction ${tx.id} during reset`, e);
            }
        }
    },
    resetPurchases: async () => {
        const purchases = await ApiService.getPurchases();
        for (const purchase of purchases) {
            try {
                await ApiService.deletePurchase(purchase.id);
            } catch (e) {
                console.error(`Failed to delete purchase ${purchase.id} during reset`, e);
            }
        }
    },
    resetCashFlow: async () => {
        const cashflows = await ApiService.getCashFlow();
        for (const cf of cashflows) {
            await request(`/cashflow/${cf.id}`, {
                method: 'DELETE'
            });
        }
    },
    resetAllFinancialData: async () => {
        // Reset all financial data
        // Note: Order matters? 
        // deleteTransaction handles its own cashflow and stock
        // deletePurchase handles its own cashflow and stock
        // So we should run them, then clean up any remaining cashflow
        await ApiService.resetTransactions();
        await ApiService.resetPurchases();
        await ApiService.resetStockAdjustments();
        await ApiService.resetCashFlow();
    },
    resetMasterData: async () => {
        // Delete all master data

        // Products
        const products = await ApiService.getProducts();
        for (const p of products) await ApiService.deleteProduct(p.id);

        // Categories
        const categories = await ApiService.getCategories();
        for (const c of categories) await ApiService.deleteCategory(c.id);

        // Customers
        const customers = await ApiService.getCustomers();
        for (const c of customers) await ApiService.deleteCustomer(c.id);

        // Suppliers
        const suppliers = await ApiService.getSuppliers();
        for (const s of suppliers) await ApiService.deleteSupplier(s.id);
    },
    resetAllData: async () => {
        // Nuclear option: Reset EVERYTHING (Financial + Master Data)
        await ApiService.resetAllFinancialData();
        // Explicitly call resetStockAdjustments again just in case, though covered by above
        // resetAllFinancialData already calls it.
        await ApiService.resetMasterData();
    },


    // Authentication
    login: async (username: string, password: string): Promise<{ token: string, user: User }> => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Enable Cookie support
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            const text = await res.text();
            let errorMessage = 'Login failed';
            try {
                const err = JSON.parse(text);
                errorMessage = err.error || errorMessage;
            } catch (e) {
                if (text) errorMessage = text;
            }
            throw new Error(errorMessage);
        }

        return await res.json();
    },

    logout: async () => {
        try {
            await request('/logout', { method: 'POST' });
        } catch (e) {
            console.error("Logout failed", e);
        }
    },

    getMe: async (): Promise<User> => {
        const res = await request('/auth/me', {}, true);
        if (!res.ok) throw new Error('Not authenticated');
        return await res.json();
    }
};
