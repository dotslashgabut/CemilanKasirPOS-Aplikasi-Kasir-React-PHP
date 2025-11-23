import { Category, Product, Customer, Supplier } from "../types";
import { generateUUID } from "../utils";

export const DUMMY_CATEGORIES: Category[] = [
    { id: generateUUID(), name: 'Snack Pedas' },
    { id: generateUUID(), name: 'Snack Manis' },
    { id: generateUUID(), name: 'Kerupuk & Kemplang' },
    { id: generateUUID(), name: 'Minuman' },
    { id: generateUUID(), name: 'Bahan Kue' }
];

export const DUMMY_SUPPLIERS: Supplier[] = [
    { id: generateUUID(), name: 'Agen Jaya Makmur', address: 'Jl. Pasar Baru No. 10', phone: '081234567890' },
    { id: generateUUID(), name: 'Distributor Snack Berkah', address: 'Jl. Industri Raya No. 88', phone: '081987654321' },
    { id: generateUUID(), name: 'Toko Sumber Rejeki', address: 'Jl. Merdeka No. 45', phone: '081345678901' }
];

export const DUMMY_CUSTOMERS: Customer[] = [
    { id: generateUUID(), name: 'Pelanggan Umum', phone: '-', address: '-', type: 'RETAIL' },
    { id: generateUUID(), name: 'Warung Bu Siti', phone: '085678901234', address: 'Jl. Kampung Melayu', type: 'WHOLESALE' },
    { id: generateUUID(), name: 'Toko Kelontong Pak Budi', phone: '081298765432', address: 'Jl. Raya Bogor', type: 'WHOLESALE' },
    { id: generateUUID(), name: 'Kantin Sekolah SD 01', phone: '087712345678', address: 'Jl. Pendidikan', type: 'WHOLESALE' }
];

export const DUMMY_PRODUCTS: Product[] = [
    {
        id: generateUUID(),
        sku: '8991001001001',
        name: 'Keripik Singkong Pedas 250g',
        categoryId: DUMMY_CATEGORIES[0].id, // Snack Pedas
        stock: 50,
        hpp: 10000,
        priceRetail: 15000,
        priceGeneral: 14000,
        priceWholesale: 12500,
        unit: 'pcs'
    },
    {
        id: generateUUID(),
        sku: '8991001001002',
        name: 'Basreng Pedas Daun Jeruk 100g',
        categoryId: DUMMY_CATEGORIES[0].id, // Snack Pedas
        stock: 100,
        hpp: 5000,
        priceRetail: 8000,
        priceGeneral: 7500,
        priceWholesale: 6500,
        unit: 'pcs'
    },
    {
        id: generateUUID(),
        sku: '8991001002001',
        name: 'Sus Coklat Lumer 250g',
        categoryId: DUMMY_CATEGORIES[1].id, // Snack Manis
        stock: 30,
        hpp: 18000,
        priceRetail: 25000,
        priceGeneral: 24000,
        priceWholesale: 22000,
        unit: 'toples'
    },
    {
        id: generateUUID(),
        sku: '8991001002002',
        name: 'Gemblong Gula Merah',
        categoryId: DUMMY_CATEGORIES[1].id, // Snack Manis
        stock: 20,
        hpp: 2000,
        priceRetail: 3500,
        priceGeneral: 3000,
        priceWholesale: 2500,
        unit: 'pcs'
    },
    {
        id: generateUUID(),
        sku: '8991001003001',
        name: 'Kerupuk Kulit Sapi Asli',
        categoryId: DUMMY_CATEGORIES[2].id, // Kerupuk
        stock: 40,
        hpp: 12000,
        priceRetail: 18000,
        priceGeneral: 17000,
        priceWholesale: 15000,
        unit: 'bks'
    },
    {
        id: generateUUID(),
        sku: '8991001003002',
        name: 'Kemplang Ikan Tenggiri',
        categoryId: DUMMY_CATEGORIES[2].id, // Kerupuk
        stock: 25,
        hpp: 25000,
        priceRetail: 35000,
        priceGeneral: 33000,
        priceWholesale: 30000,
        unit: 'bks'
    },
    {
        id: generateUUID(),
        sku: '8991001004001',
        name: 'Es Teh Manis Jumbo',
        categoryId: DUMMY_CATEGORIES[3].id, // Minuman
        stock: 100,
        hpp: 1500,
        priceRetail: 3000,
        priceGeneral: 3000,
        priceWholesale: 2500,
        unit: 'cup'
    },
    {
        id: generateUUID(),
        sku: '8991001004002',
        name: 'Air Mineral 600ml',
        categoryId: DUMMY_CATEGORIES[3].id, // Minuman
        stock: 48,
        hpp: 2000,
        priceRetail: 4000,
        priceGeneral: 3500,
        priceWholesale: 3000,
        unit: 'btl'
    }
];
