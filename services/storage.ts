import { Product, Transaction, User, CashFlow, Category, Customer, Supplier, Purchase, StoreSettings, BankAccount, SyncQueueItem } from "../types";
import { ApiService } from "./api";

// Simple Event Bus for Data Changes
// Simple Event Bus for Data Changes
type ChangeListener = (entity?: string) => void;
const listeners: ChangeListener[] = [];

const notifyListeners = (entity?: string) => {
  listeners.forEach(l => l(entity));
};

export const subscribeToChanges = (listener: ChangeListener) => {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
};

export const StorageService = {
  init: async () => {
    // No initialization needed for direct API usage
    console.log("StorageService initialized in Fully MySQL mode");
  },

  addToSyncQueue: async (table: SyncQueueItem['table'], action: SyncQueueItem['action'], dataId: string, data: any) => {
    // No local sync queue in fully MySQL mode
    console.warn("Sync queue not supported in Fully MySQL mode");
  },

  // Store Settings
  getStoreSettings: async (): Promise<StoreSettings> => {
    return await ApiService.getStoreSettings();
  },
  saveStoreSettings: async (settings: StoreSettings) => {
    await ApiService.saveStoreSettings(settings);
    notifyListeners('settings');
  },

  // Banks
  getBanks: async (): Promise<BankAccount[]> => {
    return await ApiService.getBanks();
  },
  saveBank: async (bank: BankAccount) => {
    if (!bank.id) await ApiService.saveBank(bank);
    else await ApiService.updateBank(bank);
    notifyListeners('banks');
  },
  deleteBank: async (id: string) => {
    await ApiService.deleteBank(id);
    notifyListeners('banks');
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    return await ApiService.getCategories();
  },
  saveCategory: async (category: Category) => {
    if (!category.id) await ApiService.saveCategory(category);
    else await ApiService.updateCategory(category);
    notifyListeners('categories');
  },
  deleteCategory: async (id: string) => {
    await ApiService.deleteCategory(id);
    notifyListeners('categories');
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    return await ApiService.getProducts();
  },
  saveProduct: async (product: Product) => {
    if (!product.id) await ApiService.saveProduct(product);
    else await ApiService.updateProduct(product);
    notifyListeners('products');
  },
  deleteProduct: async (id: string) => {
    await ApiService.deleteProduct(id);
    notifyListeners('products');
  },
  saveProductsBulk: async (newProducts: Product[]) => {
    await ApiService.saveProductsBulk(newProducts);
    notifyListeners('products');
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    return await ApiService.getCustomers();
  },
  saveCustomer: async (cust: Customer) => {
    if (!cust.id) await ApiService.saveCustomer(cust);
    else await ApiService.updateCustomer(cust);
    notifyListeners('customers');
  },
  deleteCustomer: async (id: string) => {
    await ApiService.deleteCustomer(id);
    notifyListeners('customers');
  },
  saveCustomersBulk: async (newCustomers: Customer[]) => {
    await ApiService.saveCustomersBulk(newCustomers);
    notifyListeners('customers');
  },

  // Suppliers
  getSuppliers: async (): Promise<Supplier[]> => {
    return await ApiService.getSuppliers();
  },
  saveSupplier: async (sup: Supplier) => {
    if (!sup.id) await ApiService.saveSupplier(sup);
    else await ApiService.updateSupplier(sup);
    notifyListeners('suppliers');
  },
  deleteSupplier: async (id: string) => {
    await ApiService.deleteSupplier(id);
    notifyListeners('suppliers');
  },
  saveSuppliersBulk: async (newSuppliers: Supplier[]) => {
    await ApiService.saveSuppliersBulk(newSuppliers);
    notifyListeners('suppliers');
  },

  // Transactions (Sales)
  getTransactions: async (): Promise<Transaction[]> => {
    return await ApiService.getTransactions();
  },
  addTransaction: async (transaction: Transaction): Promise<Transaction> => {
    const savedTransaction = await ApiService.addTransaction(transaction);
    notifyListeners('transactions');
    // Transactions also affect products (stock) and cashflow
    notifyListeners('products');
    notifyListeners('cashflow');
    return savedTransaction;
  },
  updateTransaction: async (transaction: Transaction) => {
    await ApiService.updateTransaction(transaction);
    notifyListeners('transactions');
    notifyListeners('products');
    notifyListeners('cashflow');
  },
  deleteTransaction: async (id: string) => {
    await ApiService.deleteTransaction(id);
    notifyListeners('transactions');
    notifyListeners('products');
    notifyListeners('cashflow');
  },

  // Purchases (Stock In)
  getPurchases: async (): Promise<Purchase[]> => {
    return await ApiService.getPurchases();
  },
  addPurchase: async (purchase: Purchase) => {
    await ApiService.addPurchase(purchase);
    notifyListeners('purchases');
    notifyListeners('products');
    notifyListeners('cashflow');
  },
  updatePurchase: async (purchase: Purchase) => {
    await ApiService.updatePurchase(purchase);
    notifyListeners('purchases');
    notifyListeners('products');
    notifyListeners('cashflow');
  },
  deletePurchase: async (id: string) => {
    await ApiService.deletePurchase(id);
    notifyListeners('purchases');
    notifyListeners('products');
    notifyListeners('cashflow');
  },

  // Cash Flow
  getCashFlow: async (): Promise<CashFlow[]> => {
    return await ApiService.getCashFlow();
  },
  addCashFlow: async (cf: CashFlow) => {
    await ApiService.addCashFlow(cf);
    notifyListeners('cashflow');
  },
  deleteCashFlow: async (id: string) => {
    await ApiService.deleteCashFlow(id);
    notifyListeners('cashflow');
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    return await ApiService.getUsers();
  },
  saveUser: async (user: User) => {
    if (!user.id) await ApiService.saveUser(user);
    else await ApiService.updateUser(user);
    notifyListeners('users');
  },
  deleteUser: async (id: string) => {
    await ApiService.deleteUser(id);
    notifyListeners('users');
  },

  // Reset Functions (SUPERADMIN ONLY)
  resetProducts: async () => {
    await ApiService.resetProducts();
    notifyListeners('products');
  },
  resetTransactions: async () => {
    await ApiService.resetTransactions();
    notifyListeners('transactions');
    notifyListeners('products');
    notifyListeners('cashflow');
  },
  resetPurchases: async () => {
    await ApiService.resetPurchases();
    notifyListeners('purchases');
    notifyListeners('products');
    notifyListeners('cashflow');
  },
  resetCashFlow: async () => {
    await ApiService.resetCashFlow();
    notifyListeners('cashflow');
  },
  resetAllFinancialData: async () => {
    await ApiService.resetAllFinancialData();
    notifyListeners('transactions');
    notifyListeners('purchases');
    notifyListeners('cashflow');
    notifyListeners('products');
  },
  resetMasterData: async () => {
    await ApiService.resetMasterData();
    notifyListeners('products');
    notifyListeners('categories');
    notifyListeners('customers');
    notifyListeners('suppliers');
  },
  resetAllData: async () => {
    await ApiService.resetAllData();
    notifyListeners(); // All changed
  },

};