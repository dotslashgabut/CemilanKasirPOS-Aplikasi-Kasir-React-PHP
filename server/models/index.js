import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    sku: { type: DataTypes.STRING },
    categoryId: { type: DataTypes.STRING },
    categoryName: { type: DataTypes.STRING },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    hpp: { type: DataTypes.FLOAT, defaultValue: 0 },
    priceRetail: { type: DataTypes.FLOAT, defaultValue: 0 },
    priceGeneral: { type: DataTypes.FLOAT, defaultValue: 0 },
    priceWholesale: { type: DataTypes.FLOAT, defaultValue: 0 },
    pricePromo: { type: DataTypes.FLOAT },
    image: { type: DataTypes.TEXT('long') }
});

const Category = sequelize.define('Category', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false }
});

const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    image: { type: DataTypes.TEXT('long') },
    defaultPriceType: { type: DataTypes.STRING }
});

const Supplier = sequelize.define('Supplier', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    image: { type: DataTypes.TEXT('long') }
});

const Transaction = sequelize.define('Transaction', {
    id: { type: DataTypes.STRING, primaryKey: true },
    type: { type: DataTypes.STRING, defaultValue: 'SALE' },
    originalTransactionId: { type: DataTypes.STRING },
    date: { type: DataTypes.DATE },
    items: { type: DataTypes.JSON },
    totalAmount: { type: DataTypes.FLOAT },
    amountPaid: { type: DataTypes.FLOAT },
    change: { type: DataTypes.FLOAT },
    paymentStatus: { type: DataTypes.STRING },
    paymentMethod: { type: DataTypes.STRING },
    paymentNote: { type: DataTypes.STRING },
    bankId: { type: DataTypes.STRING },
    bankName: { type: DataTypes.STRING },
    customerId: { type: DataTypes.STRING },
    customerName: { type: DataTypes.STRING },
    cashierId: { type: DataTypes.STRING },
    cashierName: { type: DataTypes.STRING },
    paymentHistory: { type: DataTypes.JSON }
});

const Purchase = sequelize.define('Purchase', {
    id: { type: DataTypes.STRING, primaryKey: true },
    type: { type: DataTypes.STRING, defaultValue: 'PURCHASE' },
    originalPurchaseId: { type: DataTypes.STRING },
    date: { type: DataTypes.DATE },
    supplierId: { type: DataTypes.STRING },
    supplierName: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    items: { type: DataTypes.JSON },
    totalAmount: { type: DataTypes.FLOAT },
    amountPaid: { type: DataTypes.FLOAT },
    paymentStatus: { type: DataTypes.STRING },
    paymentMethod: { type: DataTypes.STRING },
    bankId: { type: DataTypes.STRING },
    bankName: { type: DataTypes.STRING },
    paymentHistory: { type: DataTypes.JSON }
});

const CashFlow = sequelize.define('CashFlow', {
    id: { type: DataTypes.STRING, primaryKey: true },
    date: { type: DataTypes.DATE },
    type: { type: DataTypes.STRING },
    amount: { type: DataTypes.FLOAT },
    category: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    paymentMethod: { type: DataTypes.STRING },
    bankId: { type: DataTypes.STRING },
    bankName: { type: DataTypes.STRING },
    referenceId: { type: DataTypes.STRING } // To link with Transaction or Purchase ID
});

const User = sequelize.define('User', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    image: { type: DataTypes.TEXT('long') }
});

const BankAccount = sequelize.define('BankAccount', {
    id: { type: DataTypes.STRING, primaryKey: true },
    bankName: { type: DataTypes.STRING },
    accountNumber: { type: DataTypes.STRING },
    holderName: { type: DataTypes.STRING }
});

const StoreSettings = sequelize.define('StoreSettings', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING },
    jargon: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    bankAccount: { type: DataTypes.STRING },
    footerMessage: { type: DataTypes.STRING },
    notes: { type: DataTypes.TEXT },
    showAddress: { type: DataTypes.BOOLEAN },
    showJargon: { type: DataTypes.BOOLEAN },
    showBank: { type: DataTypes.BOOLEAN },
    printerType: { type: DataTypes.STRING }
});

export {
    sequelize,
    Product,
    Category,
    Customer,
    Supplier,
    Transaction,
    Purchase,
    CashFlow,
    User,
    BankAccount,
    StoreSettings
};
