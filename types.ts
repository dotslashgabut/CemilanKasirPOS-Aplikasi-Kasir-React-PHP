export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  OWNER = 'OWNER',
  CASHIER = 'CASHIER'
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  image?: string; // Base64 string
}

export enum PriceType {
  RETAIL = 'ECERAN', // Highest price
  GENERAL = 'UMUM',  // Medium price
  WHOLESALE = 'GROSIR', // Lowest price
  PROMO = 'PROMO' // Promotional price
}

export interface Category {
  id: string;
  name: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  image?: string;
  defaultPriceType?: PriceType; // Default pricing tier for this customer
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address?: string;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string; // Linked to Category
  categoryName: string; // Denormalized for easier display/export
  stock: number;
  hpp: number; // Harga Pokok Penjualan (Cost Price)
  priceRetail: number;
  priceGeneral: number;
  priceWholesale: number;
  pricePromo?: number; // Optional promo price
  image?: string;
}

export interface CartItem extends Product {
  qty: number;
  selectedPriceType: PriceType;
  finalPrice: number;
}

export enum PaymentStatus {
  PAID = 'LUNAS',
  PARTIAL = 'SEBAGIAN',
  UNPAID = 'BELUM_LUNAS'
}

export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  TEMPO = 'TEMPO'
}

export interface BankAccount {
  id: string;
  bankName: string; // e.g. BCA, GoPay, Dana
  accountNumber: string;
  holderName: string;
}

export interface PaymentHistoryItem {
  date: string;
  amount: number;
  method: PaymentMethod;
  bankId?: string; // If transfer
  bankName?: string;
  note?: string;
}

export enum TransactionType {
  SALE = 'SALE',
  RETURN = 'RETURN'
}

export interface Transaction {
  id: string;
  type?: TransactionType; // Default: SALE
  originalTransactionId?: string; // If return
  date: string; // ISO String
  items: CartItem[];
  totalAmount: number;
  amountPaid: number;
  change: number; // Kembalian
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentNote?: string; // New: General note for the transaction
  bankId?: string; // New: If paid via transfer
  bankName?: string; // New: Snapshot of bank name
  customerId?: string; // Optional link to registered customer
  customerName: string; // Required for debt (snapshotted or manual)
  cashierId: string;
  cashierName: string;
  paymentHistory?: PaymentHistoryItem[]; // Track installments
}

export enum PurchaseType {
  PURCHASE = 'PURCHASE',
  RETURN = 'RETURN'
}

// Purchase represents buying stock from suppliers (Utang)
export interface Purchase {
  id: string;
  type?: PurchaseType; // Default: PURCHASE
  date: string;
  supplierId: string;
  supplierName: string;
  description: string; // What was bought
  items?: CartItem[]; // New: Support for itemized purchases/returns
  totalAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  bankId?: string; // New: If paid via transfer
  bankName?: string; // New: Snapshot of bank name
  paymentHistory?: PaymentHistoryItem[];
}

export enum CashFlowType {
  IN = 'MASUK',
  OUT = 'KELUAR'
}

export interface CashFlow {
  id: string;
  date: string;
  type: CashFlowType;
  amount: number;
  category: string; // e.g., "Operasional", "Belanja Modal"
  description: string;
  paymentMethod?: PaymentMethod; // New
  bankId?: string; // New
  bankName?: string; // New
  userId?: string; // New: Track who created this record
  userName?: string; // New
}

export interface DashboardStats {
  totalSalesToday: number;
  totalTransactionsToday: number;
  totalReceivables: number; // Piutang
  lowStockCount: number;
}

export type PrinterType = '58mm' | '80mm' | 'A4';

export interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  bankAccount: string;
  jargon?: string;
  footerMessage?: string;
  notes?: string;
  showAddress?: boolean;
  showPhone?: boolean;
  showJargon?: boolean;
  showBank?: boolean;
  printerType?: PrinterType;
  autoSyncMySQL?: boolean; // Auto sync dari MySQL saat startup
  useMySQLPrimary?: boolean; // Gunakan MySQL sebagai database utama (read dari MySQL)
}

export interface SyncQueueItem {
  id?: number; // Auto-increment
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  table: 'products' | 'categories' | 'customers' | 'suppliers' | 'transactions' | 'purchases' | 'cashflow' | 'users' | 'banks' | 'store_settings';
  dataId: string;
  data: any;
  timestamp: number;
}

// Add updatedAt to all interfaces for sync logic
export interface BaseEntity {
  updatedAt?: string;
}