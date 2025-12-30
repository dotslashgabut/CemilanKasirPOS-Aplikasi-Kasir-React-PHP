import { Product, Transaction, User, CashFlow, Category, Customer, Supplier, Purchase, StoreSettings, BankAccount, PaymentStatus } from "../types";
import { generateUUID, toMySQLDate } from "../utils";

const isProd = import.meta.env.PROD;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/php_server/api';

// Get headers (Auth now handled by HttpOnly Cookie)
const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    };
};

// Global request helper to handle Auth & Caching
const request = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_URL}${endpoint}`;
    const headers = getHeaders();

    const config = {
        ...options,
        credentials: 'include' as RequestCredentials, // Send HttpOnly Cookie
        headers: {
            ...headers,
            ...options.headers,
        },
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
        if (res.status === 401 || res.status === 403) {
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
            return { ...defaultSettings, ...settings };
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
        if (!bank.id) bank.id = generateUUID();
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
        if (!category.id) category.id = generateUUID();
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
        if (!product.id) product.id = generateUUID();
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
        const productsWithIds = newProducts.map(p => ({ ...p, id: p.id || generateUUID() }));
        await request('/products/batch', {
            method: 'POST',
            body: JSON.stringify(productsWithIds)
        });
    },

    // Customers
    getCustomers: async (): Promise<Customer[]> => {
        const res = await request('/customers');
        return await res.json();
    },
    saveCustomer: async (cust: Customer) => {
        if (!cust.id) cust.id = generateUUID();
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
        const customersWithIds = newCustomers.map(c => ({ ...c, id: c.id || generateUUID() }));
        const res = await request('/customers/batch', {
            method: 'POST',
            body: JSON.stringify(customersWithIds)
        });
        if (!res.ok) throw new Error('Failed to save customers bulk');
    },

    // Suppliers
    getSuppliers: async (): Promise<Supplier[]> => {
        const res = await request('/suppliers');
        return await res.json();
    },
    saveSupplier: async (sup: Supplier) => {
        if (!sup.id) sup.id = generateUUID();
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
        const suppliersWithIds = newSuppliers.map(s => ({ ...s, id: s.id || generateUUID() }));
        const res = await request('/suppliers/batch', {
            method: 'POST',
            body: JSON.stringify(suppliersWithIds)
        });
        if (!res.ok) throw new Error('Failed to save suppliers bulk');
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
        // 1. Get all transactions to find related returns and original transaction
        const res = await request('/transactions');
        if (!res.ok) throw new Error('Failed to fetch transactions for deletion');
        const transactions = await res.json();
        const transaction = transactions.find((t: any) => t.id === id);

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        const parsedTx = parseTransaction(transaction);

        // --- LOGIC A: RESTORE DEBT (If deleting a RETURN transaction) ---
        if (parsedTx.type === 'RETURN' && parsedTx.originalTransactionId) {
            try {
                const originalTxRaw = transactions.find((t: any) => t.id === parsedTx.originalTransactionId);

                if (originalTxRaw) {
                    const originalTx = parseTransaction(originalTxRaw);

                    // Find "Potong Utang" entry in payment history
                    if (originalTx.paymentHistory && originalTx.paymentHistory.length > 0) {
                        // Match by approximate time (within 5s) or exact date string
                        const historyIndex = originalTx.paymentHistory.findIndex(ph =>
                            ph.note?.includes('Potong Utang') &&
                            (ph.date === parsedTx.date || Math.abs(new Date(ph.date).getTime() - new Date(parsedTx.date).getTime()) < 5000)
                        );

                        if (historyIndex !== -1) {
                            const entryToRemove = originalTx.paymentHistory[historyIndex];
                            console.log(`Reverting debt cut of ${entryToRemove.amount} from transaction ${originalTx.id}`);

                            const newHistory = [...originalTx.paymentHistory];
                            newHistory.splice(historyIndex, 1);

                            const newAmountPaid = originalTx.amountPaid - entryToRemove.amount;
                            const newStatus = newAmountPaid >= originalTx.totalAmount ? PaymentStatus.PAID :
                                (newAmountPaid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID);

                            // Check if other returns exist
                            const otherReturns = transactions.some((t: any) =>
                                t.type === 'RETURN' &&
                                t.originalTransactionId === originalTx.id &&
                                t.id !== parsedTx.id
                            );

                            const updatedOriginalTx = {
                                ...originalTx,
                                amountPaid: newAmountPaid,
                                paymentStatus: newStatus,
                                paymentHistory: newHistory,
                                isReturned: otherReturns
                            };

                            await ApiService.updateTransaction(updatedOriginalTx);
                            console.log("Original transaction debt restored successfully.");
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to restore original transaction debt:", error);
            }
        }

        // --- LOGIC B: CASCADE DELETE (If deleting a SALE transaction) ---
        // Find and delete all RETURN transactions linked to this transaction
        const returnTransactions = transactions.filter((t: any) =>
            t.type === 'RETURN' && t.originalTransactionId === id
        );

        if (returnTransactions.length > 0) {
            console.log(`Found ${returnTransactions.length} return transaction(s) to cascade delete`);

            for (const returnTx of returnTransactions) {
                try {
                    const parsedReturn = parseTransaction(returnTx);

                    // Revert Stock for Return Transaction (Return adds stock, so we subtract it back)
                    if (parsedReturn.items && parsedReturn.items.length > 0) {
                        for (const item of parsedReturn.items) {
                            try {
                                const productRes = await request(`/products/${item.id}`);
                                if (productRes.ok) {
                                    const product = await productRes.json();
                                    const parsedProduct = parseProduct(product);
                                    parsedProduct.stock -= item.qty;
                                    await request(`/products/${parsedProduct.id}`, {
                                        method: 'PUT',
                                        body: JSON.stringify(parsedProduct)
                                    });
                                }
                            } catch (e) {
                                console.warn(`Failed to revert stock for return item ${item.id}`, e);
                            }
                        }
                    }

                    // Delete cashflows related to this return transaction
                    const cfRes = await request('/cashflow');
                    if (cfRes.ok) {
                        const cashflows = await cfRes.json();
                        const returnCfs = cashflows.filter((cf: any) =>
                            cf.description.includes(returnTx.id.substring(0, 6))
                        );
                        for (const cf of returnCfs) {
                            await request(`/cashflow/${cf.id}`, {
                                method: 'DELETE'
                            });
                        }
                    }

                    // Delete the return transaction itself
                    await request(`/transactions/${returnTx.id}`, {
                        method: 'DELETE'
                    });

                    console.log(`Deleted return transaction ${returnTx.id}`);
                } catch (e) {
                    console.error(`Failed to delete return transaction ${returnTx.id}:`, e);
                }
            }
        }

        // --- LOGIC C: REVERT STOCK FOR MAIN TRANSACTION ---
        if (parsedTx.items && parsedTx.items.length > 0) {
            const isReturn = parsedTx.type === 'RETURN';
            for (const item of parsedTx.items) {
                try {
                    const productRes = await request(`/products/${item.id}`);
                    if (productRes.ok) {
                        const product = await productRes.json();
                        const parsedProduct = parseProduct(product);

                        if (isReturn) {
                            parsedProduct.stock -= item.qty; // Return: stock was increased, so subtract
                        } else {
                            parsedProduct.stock += item.qty; // Sale: stock was decreased, so add back
                        }

                        await request(`/products/${parsedProduct.id}`, {
                            method: 'PUT',
                            body: JSON.stringify(parsedProduct)
                        });
                    }
                } catch (e) {
                    console.warn(`Failed to revert stock for transaction item ${item.id}`, e);
                }
            }
        }

        // --- LOGIC D: DELETE RELATED CASHFLOWS ---
        // Handled by Backend (Cascading Delete via referenceId)

        // --- LOGIC E: DELETE TRANSACTION ---
        const deleteRes = await request(`/transactions/${id}`, {
            method: 'DELETE'
        });
        if (!deleteRes.ok) throw new Error('Failed to delete transaction');

        console.log(`Successfully deleted transaction ${id} and all related data`);
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
        // 0. Cascade Delete: Find and delete all returns linked to this purchase
        try {
            const allPurchasesRes = await request('/purchases');
            if (allPurchasesRes.ok) {
                const allPurchases = await allPurchasesRes.json();
                // Find returns that are linked to this purchase via originalPurchaseId OR description (legacy)
                const children = allPurchases.filter((p: any) =>
                    p.originalPurchaseId === id ||
                    (p.type === 'RETURN' && p.description && p.description.includes(id.substring(0, 6)))
                );

                if (children.length > 0) {
                    console.log(`Found ${children.length} return(s) linked to purchase ${id}. Deleting them first...`);
                    for (const child of children) {
                        // Avoid infinite recursion if something is wrong
                        if (child.id === id) continue;

                        console.log(`Cascade deleting return purchase ${child.id}`);
                        await ApiService.deletePurchase(child.id);
                    }
                }
            }
        } catch (e) {
            console.warn("Error during cascade delete check:", e);
            // Continue with main deletion even if cascade check fails (though ideally it shouldn't)
        }

        // 1. Get Purchase to revert stock
        const res = await request('/purchases');
        if (!res.ok) throw new Error('Failed to fetch purchases for deletion');
        const purchases = await res.json();
        const purchase = purchases.find((p: any) => p.id === id);

        if (purchase) {
            const parsedPurchase = parsePurchase(purchase);

            // --- LOGIC A: RESTORE DEBT (If deleting a RETURN purchase) ---
            if (parsedPurchase.type === 'RETURN' && parsedPurchase.originalPurchaseId) {
                try {
                    const originalPurchaseRaw = purchases.find((p: any) => p.id === parsedPurchase.originalPurchaseId);

                    if (originalPurchaseRaw) {
                        const originalPurchase = parsePurchase(originalPurchaseRaw);

                        // Find "Potong Utang" entry in payment history
                        if (originalPurchase.paymentHistory && originalPurchase.paymentHistory.length > 0) {
                            // Match by approximate time (within 5s) or exact date string
                            const historyIndex = originalPurchase.paymentHistory.findIndex(ph =>
                                ph.note?.includes('Potong Utang') &&
                                (ph.date === parsedPurchase.date || Math.abs(new Date(ph.date).getTime() - new Date(parsedPurchase.date).getTime()) < 5000)
                            );

                            if (historyIndex !== -1) {
                                const entryToRemove = originalPurchase.paymentHistory[historyIndex];
                                console.log(`Reverting debt cut of ${entryToRemove.amount} from purchase ${originalPurchase.id}`);

                                const newHistory = [...originalPurchase.paymentHistory];
                                newHistory.splice(historyIndex, 1);

                                const newAmountPaid = originalPurchase.amountPaid - entryToRemove.amount;
                                const newStatus = newAmountPaid >= originalPurchase.totalAmount ? PaymentStatus.PAID :
                                    (newAmountPaid > 0 ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID);

                                // Check if other returns exist
                                const otherReturns = purchases.some((p: any) =>
                                    p.type === 'RETURN' &&
                                    p.originalPurchaseId === originalPurchase.id &&
                                    p.id !== parsedPurchase.id
                                );

                                const updatedOriginalPurchase = {
                                    ...originalPurchase,
                                    amountPaid: newAmountPaid,
                                    paymentStatus: newStatus,
                                    paymentHistory: newHistory,
                                    isReturned: otherReturns
                                };

                                await ApiService.updatePurchase(updatedOriginalPurchase);
                                console.log("Original purchase debt restored successfully.");
                            }
                        }
                    }
                } catch (error) {
                    console.error("Failed to restore original purchase debt:", error);
                }
            }
            // Revert Stock
            if (parsedPurchase.items && parsedPurchase.items.length > 0) {
                const isReturn = parsedPurchase.type === 'RETURN';
                for (const item of parsedPurchase.items) {
                    try {
                        const productRes = await request(`/products/${item.id}`);
                        if (productRes.ok) {
                            const product = await productRes.json();
                            const parsedProduct = parseProduct(product);
                            // Logic reversed from addPurchase
                            if (isReturn) {
                                parsedProduct.stock += item.qty; // Return: stock was decreased, so add back
                            } else {
                                parsedProduct.stock -= item.qty; // Purchase: stock was increased, so subtract
                            }
                            await request(`/products/${parsedProduct.id}`, {
                                method: 'PUT',
                                body: JSON.stringify(parsedProduct)
                            });
                        }
                    } catch (e) {
                        console.warn(`Failed to revert stock for purchase item ${item.id}`, e);
                    }
                }
            }

            // 2. Delete Related CashFlows
            // Handled by Backend (Cascading Delete via referenceId)
            // Legacy cleanup is skipped as description matching is unreliable for purchases
        }

        // 3. Delete Purchase
        const deleteRes = await request(`/purchases/${id}`, {
            method: 'DELETE'
        });
        if (!deleteRes.ok) throw new Error('Failed to delete purchase');
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
            body: JSON.stringify({ ...cf, id: cf.id || generateUUID(), date: formattedDate })
        });
        if (!res.ok) throw new Error('Failed to add cashflow');
    },
    deleteCashFlow: async (id: string) => {
        const res = await request(`/cashflow/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete cashflow');
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
        if (!user.id) user.id = generateUUID();
        const res = await request('/users', {
            method: 'POST',
            body: JSON.stringify(user)
        });
        if (!res.ok) throw new Error('Failed to save user');
    },
    updateUser: async (user: User) => {
        await request(`/users/${user.id}`, {
            method: 'PUT',
            body: JSON.stringify(user)
        });
    },
    deleteUser: async (id: string) => {
        const res = await request(`/users/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete user');
    },

    // Reset Functions
    resetProducts: async () => {
        const products = await ApiService.getProducts();
        for (const product of products) {
            await ApiService.deleteProduct(product.id);
        }
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
        await ApiService.resetMasterData();
    },


    // Authentication
    // Authentication
    login: async (username: string, password: string): Promise<{ user: User }> => {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            credentials: 'include', // Important for setting the cookie
            headers: { 'Content-Type': 'application/json' },
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
            console.error("Logout failed:", e);
        }
        localStorage.removeItem('pos_current_user');
        localStorage.removeItem('pos_token'); // Cleanup legacy
        window.location.reload();
    }
};
