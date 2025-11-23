import { Product, Transaction, User, CashFlow, Category, Customer, Supplier, Purchase, StoreSettings, BankAccount, SyncQueueItem } from "../types";
import { ApiService } from "./api";

// Simple Event Bus for Data Changes
type ChangeListener = () => void;
const listeners: ChangeListener[] = [];

const notifyListeners = () => {
  listeners.forEach(l => l());
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
    notifyListeners();
  },

  // Banks
  getBanks: async (): Promise<BankAccount[]> => {
    return await ApiService.getBanks();
  },
  saveBank: async (bank: BankAccount) => {
    if (!bank.id) await ApiService.saveBank(bank);
    else await ApiService.updateBank(bank);
    notifyListeners();
  },
  deleteBank: async (id: string) => {
    await ApiService.deleteBank(id);
    notifyListeners();
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    return await ApiService.getCategories();
  },
  saveCategory: async (category: Category) => {
    if (!category.id) await ApiService.saveCategory(category);
    else await ApiService.updateCategory(category);
    notifyListeners();
  },
  deleteCategory: async (id: string) => {
    await ApiService.deleteCategory(id);
    notifyListeners();
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    return await ApiService.getProducts();
  },
  saveProduct: async (product: Product) => {
    if (!product.id) await ApiService.saveProduct(product);
    else await ApiService.updateProduct(product);
    notifyListeners();
  },
  deleteProduct: async (id: string) => {
    await ApiService.deleteProduct(id);
    notifyListeners();
  },
  saveProductsBulk: async (newProducts: Product[]) => {
    await ApiService.saveProductsBulk(newProducts);
    notifyListeners();
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    return await ApiService.getCustomers();
  },
  saveCustomer: async (cust: Customer) => {
    if (!cust.id) await ApiService.saveCustomer(cust);
    else await ApiService.updateCustomer(cust);
    notifyListeners();
  },
  deleteCustomer: async (id: string) => {
    await ApiService.deleteCustomer(id);
    notifyListeners();
  },

  // Suppliers
  getSuppliers: async (): Promise<Supplier[]> => {
    return await ApiService.getSuppliers();
  },
  saveSupplier: async (sup: Supplier) => {
    if (!sup.id) await ApiService.saveSupplier(sup);
    else await ApiService.updateSupplier(sup);
    notifyListeners();
  },
  deleteSupplier: async (id: string) => {
    await ApiService.deleteSupplier(id);
    notifyListeners();
  },

  // Transactions (Sales)
  getTransactions: async (): Promise<Transaction[]> => {
    return await ApiService.getTransactions();
  },
  addTransaction: async (transaction: Transaction) => {
    await ApiService.addTransaction(transaction);
    notifyListeners();
  },
  updateTransaction: async (transaction: Transaction) => {
    await ApiService.updateTransaction(transaction);
    notifyListeners();
  },

  // Purchases (Stock In)
  getPurchases: async (): Promise<Purchase[]> => {
    return await ApiService.getPurchases();
  },
  addPurchase: async (purchase: Purchase) => {
    await ApiService.addPurchase(purchase);
    notifyListeners();
  },
  updatePurchase: async (purchase: Purchase) => {
    await ApiService.updatePurchase(purchase);
    notifyListeners();
  },

  // Cash Flow
  getCashFlow: async (): Promise<CashFlow[]> => {
    return await ApiService.getCashFlow();
  },
  addCashFlow: async (cf: CashFlow) => {
    await ApiService.addCashFlow(cf);
    notifyListeners();
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    return await ApiService.getUsers();
  },
  saveUser: async (user: User) => {
    if (!user.id) await ApiService.saveUser(user);
    else await ApiService.updateUser(user);
    notifyListeners();
  },
  deleteUser: async (id: string) => {
    await ApiService.deleteUser(id);
    notifyListeners();
  },

  // Reset Functions (SUPERADMIN ONLY)
  resetProducts: async () => {
    await ApiService.resetProducts();
    notifyListeners();
  },
  resetTransactions: async () => {
    await ApiService.resetTransactions();
    notifyListeners();
  },
  resetPurchases: async () => {
    await ApiService.resetPurchases();
    notifyListeners();
  },
  resetCashFlow: async () => {
    await ApiService.resetCashFlow();
    notifyListeners();
  },
  resetAllFinancialData: async () => {
    await ApiService.resetAllFinancialData();
    notifyListeners();
  },
  resetMasterData: async () => {
    await ApiService.resetMasterData();
    notifyListeners();
  },
  resetAllData: async () => {
    await ApiService.resetAllData();
    notifyListeners();
  },

};