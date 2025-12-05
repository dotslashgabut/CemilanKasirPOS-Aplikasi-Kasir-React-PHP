import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../hooks/useData';
import { StorageService } from '../services/storage';
import { User, UserRole, StoreSettings, BankAccount, PrinterType } from '../types';
import { Trash2, Plus, User as UserIcon, Shield, ShieldAlert, Edit2, Save, X, Store, Upload, CreditCard, Printer, AlertTriangle, Download, FileSpreadsheet, Settings as SettingsIcon } from 'lucide-react';
import { exportToCSV } from '../utils';
import * as XLSX from 'xlsx';

// Default store settings - defined outside component to avoid recreation
const DEFAULT_STORE_SETTINGS: StoreSettings = {
    name: '', jargon: '', address: '', phone: '', bankAccount: '', footerMessage: '', notes: '',
    showAddress: true, showJargon: true, showBank: true, printerType: '58mm'
};

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'store' | 'users' | 'payments' | 'data'>('store');

    // User State with useData
    const currentUser = JSON.parse(localStorage.getItem('pos_current_user') || '{}') as User;
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    const users = useData(async () => {
        if (isSuperAdmin) {
            return await StorageService.getUsers();
        }
        return [];
    }, [isSuperAdmin], 'users') || [];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [userForm, setUserForm] = useState<Partial<User>>({
        name: '', username: '', password: '', role: UserRole.CASHIER, image: ''
    });

    // Store State
    const loadedSettings = useData(() => StorageService.getStoreSettings(), [], 'storeSettings');
    const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

    useEffect(() => {
        if (loadedSettings) {
            setStoreSettings({
                ...DEFAULT_STORE_SETTINGS,
                ...loadedSettings
            });
        }
    }, [loadedSettings]);

    // Bank State
    const banks = useData(() => StorageService.getBanks(), [], 'banks') || [];
    const [bankForm, setBankForm] = useState<Partial<BankAccount>>({ bankName: '', accountNumber: '', holderName: '' });
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [editingBankId, setEditingBankId] = useState<string | null>(null);

    // --- STORE SETTINGS HANDLERS ---

    const handleSaveStore = async () => {
        try {
            console.log('Saving store settings:', storeSettings);
            await StorageService.saveStoreSettings(storeSettings);
            alert('Pengaturan toko berhasil disimpan!');
        } catch (error: any) {
            console.error("Failed to save store settings:", error);
            alert(`Gagal menyimpan pengaturan toko: ${error.message || 'Terjadi kesalahan'}`);
        }
    };

    // --- BANK MANAGEMENT HANDLERS ---

    const handleOpenBankModal = (bank?: BankAccount) => {
        if (bank) {
            setEditingBankId(bank.id);
            setBankForm({ bankName: bank.bankName, accountNumber: bank.accountNumber, holderName: bank.holderName });
        } else {
            setEditingBankId(null);
            setBankForm({ bankName: '', accountNumber: '', holderName: '' });
        }
        setIsBankModalOpen(true);
    };

    const handleSaveBank = async () => {
        if (!bankForm.bankName || !bankForm.accountNumber) return;
        const payload = { ...bankForm, id: editingBankId || undefined } as BankAccount;
        await StorageService.saveBank(payload);
        setIsBankModalOpen(false);
    };

    const handleDeleteBank = async (id: string) => {
        if (confirm('Hapus data bank/e-wallet ini?')) {
            await StorageService.deleteBank(id);
        }
    };

    const handleExportBankCSV = () => {
        const headers = ['ID', 'Nama Bank/E-Wallet', 'Nomor Rekening', 'Atas Nama'];
        const rows = banks.map(b => [b.id, b.bankName, b.accountNumber, b.holderName]);
        exportToCSV('data-bank.csv', headers, rows);
    };

    const handleExportBankExcel = () => {
        const data = banks.map(b => ({
            'ID': b.id,
            'Nama Bank/E-Wallet': b.bankName,
            'Nomor Rekening': b.accountNumber,
            'Atas Nama': b.holderName
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Bank");

        // Auto-width
        worksheet['!cols'] = [
            { wch: 15 }, // ID
            { wch: 20 }, // Nama Bank
            { wch: 20 }, // No Rek
            { wch: 20 }  // Atas Nama
        ];

        XLSX.writeFile(workbook, `Data_Bank_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrintBank = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const rows = banks.map((b, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${b.bankName}</td>
                <td>${b.accountNumber}</td>
                <td>${b.holderName}</td>
            </tr>
        `).join('');

        const html = `
            <html>
                <head>
                    <title>Data Bank & E-Wallet</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
                        h2 { text-align: center; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h2>Data Bank & E-Wallet</h2>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px">No</th>
                                <th>Nama Bank/E-Wallet</th>
                                <th>Nomor Rekening</th>
                                <th>Atas Nama</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                    <script>window.print();</script>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    // --- USER MANAGEMENT HANDLERS ---

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingId(user.id);
            setUserForm({ name: user.name, username: user.username, password: '', role: user.role, image: user.image });
        } else {
            setEditingId(null);
            setUserForm({ name: '', username: '', password: '', role: UserRole.CASHIER, image: '' });
        }
        setIsModalOpen(true);
    };

    const handleSaveUser = async () => {
        // Validation: Name and Username are always required
        if (!userForm.username || !userForm.name) {
            alert('Nama dan Username wajib diisi');
            return;
        }

        // Validation: Password is required ONLY for new users
        if (!editingId && !userForm.password) {
            alert('Password wajib diisi untuk user baru');
            return;
        }

        const payload = {
            ...userForm,
            id: editingId || undefined
        } as User;

        // If editing and password is empty, remove it from payload to keep existing password
        if (editingId && !userForm.password) {
            delete (payload as any).password;
        }

        try {
            await StorageService.saveUser(payload);
            setIsModalOpen(false);
            setEditingId(null);
            alert('User berhasil disimpan!');
        } catch (error) {
            console.error(error);
            alert('Gagal menyimpan user. Pastikan username belum digunakan.');
        }
    };

    const handleDeleteUser = async (id: string) => {

        const userToDelete = users.find(u => u.id === id);

        if (!userToDelete) return;

        // Only Superadmin can delete users
        if (currentUser.role !== UserRole.SUPERADMIN) {
            alert("Akses ditolak. Hanya Superadmin yang dapat menghapus user.");
            return;
        }

        // 1. Prevent deleting the main Superadmin
        if (userToDelete.username === 'superadmin') {
            alert("User Superadmin Utama tidak dapat dihapus!");
            return;
        }

        // 2. Prevent Self Deletion
        if (currentUser.id === userToDelete.id) {
            alert("Anda tidak dapat menghapus akun sendiri!");
            return;
        }

        if (confirm("Hapus user ini?")) {
            await StorageService.deleteUser(id);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserForm({ ...userForm, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    // --- DATA MANAGEMENT HANDLERS (SUPERADMIN ONLY) ---
    const handleResetProducts = async () => {
        const confirmation = prompt('PERINGATAN: Ini akan menghapus SEMUA data produk!\n\nSemua produk yang Anda input akan HILANG PERMANEN!\nStock akan kembali ke 0.\n\nKetik "HAPUS PRODUK" untuk konfirmasi:');
        if (confirmation === 'HAPUS PRODUK') {
            await StorageService.resetProducts();
            alert('✅ Semua data produk berhasil dihapus!');
            window.location.reload();
        } else {
            alert('❌ Penghapusan dibatalkan.');
        }
    };

    const handleResetTransactions = async () => {
        const confirmation = prompt('PERINGATAN: Ini akan menghapus SEMUA data transaksi penjualan!\n\nKetik "HAPUS TRANSAKSI" untuk konfirmasi:');
        if (confirmation === 'HAPUS TRANSAKSI') {
            await StorageService.resetTransactions();
            alert('✅ Semua data transaksi berhasil dihapus!');
        } else {
            alert('❌ Penghapusan dibatalkan.');
        }
    };

    const handleResetPurchases = async () => {
        const confirmation = prompt('PERINGATAN: Ini akan menghapus SEMUA data pembelian/stok masuk!\n\nKetik "HAPUS PEMBELIAN" untuk konfirmasi:');
        if (confirmation === 'HAPUS PEMBELIAN') {
            await StorageService.resetPurchases();
            alert('✅ Semua data pembelian berhasil dihapus!');
        } else {
            alert('❌ Penghapusan dibatalkan.');
        }
    };

    const handleResetCashFlow = async () => {
        const confirmation = prompt('PERINGATAN: Ini akan menghapus SEMUA data arus kas!\n\nKetik "HAPUS ARUS KAS" untuk konfirmasi:');
        if (confirmation === 'HAPUS ARUS KAS') {
            await StorageService.resetCashFlow();
            alert('✅ Semua data arus kas berhasil dihapus!');
        } else {
            alert('❌ Penghapusan dibatalkan.');
        }
    };

    const handleResetAllFinancial = async () => {
        const confirmation = prompt('⚠️ BAHAYA: Ini akan menghapus SEMUA data keuangan (Transaksi, Pembelian, Arus Kas)!\n\nTindakan ini TIDAK DAPAT DIBATALKAN!\n\nKetik "RESET SEMUA" untuk konfirmasi:');
        if (confirmation === 'RESET SEMUA') {
            const doubleConfirm = confirm('Apakah Anda BENAR-BENAR YAKIN ingin menghapus semua data keuangan?');
            if (doubleConfirm) {
                await StorageService.resetAllFinancialData();
                alert('✅ Semua data keuangan berhasil dihapus!');
                window.location.reload(); // Refresh halaman
            } else {
                alert('❌ Penghapusan dibatalkan.');
            }
        } else {
            alert('❌ Penghapusan dibatalkan.');
        }
    };

    const handleResetMasterData = async () => {
        const confirmation = prompt('⚠️ BAHAYA: Ini akan me-reset SEMUA Master Data (Produk, Kategori, Pelanggan, Supplier) ke default awal!\n\nData yang Anda input akan HILANG PERMANEN!\n\nKetik "RESET MASTER DATA" untuk konfirmasi:');
        if (confirmation === 'RESET MASTER DATA') {
            const doubleConfirm = confirm('Apakah Anda BENAR-BENAR YAKIN ingin me-reset Master Data ke default?');
            if (doubleConfirm) {
                await StorageService.resetMasterData();
                alert('✅ Master Data berhasil di-reset ke default!');
                window.location.reload();
            } else {
                alert('❌ Reset dibatalkan.');
            }
        } else {
            alert('❌ Reset dibatalkan.');
        }
    };

    const handleResetAllData = async () => {
        const confirmation = prompt('🚨 PERINGATAN EKSTRIM 🚨\n\nIni akan menghapus SELURUH DATA dari database:\n• Transaksi Penjualan\n• Pembelian\n• Arus Kas\n• Produk\n• Kategori\n• Pelanggan\n• Supplier\n\nSEMUA DATA AKAN HILANG PERMANEN!\n\nKetik "HAPUS SEMUA DATA" untuk konfirmasi:');
        if (confirmation === 'HAPUS SEMUA DATA') {
            const doubleConfirm = confirm('⚠️ KONFIRMASI KEDUA ⚠️\n\nAnda akan menghapus SELURUH DATA di aplikasi!\nTindakan ini TIDAK DAPAT DIBATALKAN!\n\nLanjutkan?');
            if (doubleConfirm) {
                const tripleConfirm = prompt('KONFIRMASI TERAKHIR!\n\nKetik nama toko Anda untuk konfirmasi penghapusan total data:');
                const storeSettings = await StorageService.getStoreSettings();
                if (tripleConfirm === storeSettings.name) {
                    await StorageService.resetAllData();
                    alert('✅ SEMUA data berhasil dihapus! Aplikasi akan dimuat ulang.');
                    window.location.reload();
                } else {
                    alert('❌ Nama toko tidak cocok. Penghapusan dibatalkan.');
                }
            } else {
                alert('❌ Penghapusan dibatalkan.');
            }
        } else {
            alert('❌ Penghapusan dibatalkan.');
        }
    };





    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <SettingsIcon className="text-slate-600" />
                    Pengaturan
                </h2>
                <p className="text-slate-500 mt-1">Kelola profil toko, metode pembayaran, dan akses pengguna.</p>
            </div>

            <div className="flex gap-4 mb-6 border-b border-slate-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('store')}
                    className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'store' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Profil Toko
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'payments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Bank & E-Wallet
                </button>
                {/* Only Superadmin can see User Management */}
                {isSuperAdmin && (
                    <>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Manajemen User
                        </button>
                        <button
                            onClick={() => setActiveTab('data')}
                            className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'data' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <span className="flex items-center gap-1">
                                <AlertTriangle size={14} />
                                Data Management
                            </span>
                        </button>
                    </>
                )}
            </div>

            {activeTab === 'store' && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in">
                    <div className="flex items-start gap-6 flex-col md:flex-row">
                        <div className="bg-blue-50 p-4 rounded-full">
                            <Store size={48} className="text-blue-600" />
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Toko</label>
                                <input type="text" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={storeSettings.name} onChange={e => setStoreSettings({ ...storeSettings, name: e.target.value })} placeholder="Contoh: Toko Maju Jaya" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Jargon / Slogan</label>
                                <input type="text" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={storeSettings.jargon} onChange={e => setStoreSettings({ ...storeSettings, jargon: e.target.value })} placeholder="Murah, Lengkap, Berkualitas" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
                                <textarea rows={2} className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={storeSettings.address} onChange={e => setStoreSettings({ ...storeSettings, address: e.target.value })}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">No. Telepon</label>
                                <input type="text" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={storeSettings.phone} onChange={e => setStoreSettings({ ...storeSettings, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Info Bank Utama (Di Struk)</label>
                                <textarea rows={3} className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={storeSettings.bankAccount} onChange={e => setStoreSettings({ ...storeSettings, bankAccount: e.target.value })} placeholder="BCA 123xxx an Budi&#10;Mandiri 456xxx an Budi" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Pesan Footer (Struk)</label>
                                <input type="text" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={storeSettings.footerMessage} onChange={e => setStoreSettings({ ...storeSettings, footerMessage: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Tambahan</label>
                                <textarea
                                    rows={3}
                                    className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={storeSettings.notes || ''}
                                    onChange={e => setStoreSettings({ ...storeSettings, notes: e.target.value })}
                                    placeholder="Catatan internal untuk toko (tidak ditampilkan di struk)"
                                ></textarea>
                            </div>

                            <div className="col-span-2 border-t border-slate-100 pt-4">
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Printer size={16} /> Pengaturan Cetak Nota</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Printer / Ukuran Kertas</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => setStoreSettings({ ...storeSettings, printerType: '58mm' })}
                                                className={`p-2 text-sm rounded border transition-colors ${storeSettings.printerType === '58mm' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'} `}
                                            >
                                                Thermal 58mm
                                            </button>
                                            <button
                                                onClick={() => setStoreSettings({ ...storeSettings, printerType: '80mm' })}
                                                className={`p-2 text-sm rounded border transition-colors ${storeSettings.printerType === '80mm' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'} `}
                                            >
                                                Thermal 80mm
                                            </button>
                                            <button
                                                onClick={() => setStoreSettings({ ...storeSettings, printerType: 'A4' })}
                                                className={`p-2 text-sm rounded border transition-colors ${storeSettings.printerType === 'A4' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'} `}
                                            >
                                                DotMatrix / A4
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-6 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={storeSettings.showAddress} onChange={e => setStoreSettings({ ...storeSettings, showAddress: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                                        <span className="text-sm text-slate-700">Tampilkan Alamat</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={storeSettings.showJargon} onChange={e => setStoreSettings({ ...storeSettings, showJargon: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                                        <span className="text-sm text-slate-700">Tampilkan Jargon</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={storeSettings.showBank} onChange={e => setStoreSettings({ ...storeSettings, showBank: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                                        <span className="text-sm text-slate-700">Tampilkan Info Bank</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSaveStore} className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-slate-800 flex items-center gap-2">
                            <Save size={18} /> Simpan Pengaturan
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'payments' && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-slate-800">Daftar Rekening & E-Wallet</h3>
                        <button onClick={() => handleOpenBankModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow">
                            <Plus size={18} /> Tambah Rekening
                        </button>
                    </div>
                    <div className="flex justify-end gap-2 mb-4">
                        <button onClick={handlePrintBank} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 text-sm font-medium">
                            <Printer size={16} /> Print
                        </button>
                        <button onClick={handleExportBankExcel} className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-100 text-sm font-medium">
                            <FileSpreadsheet size={16} /> Excel
                        </button>
                        <button onClick={handleExportBankCSV} className="bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 text-sm font-medium">
                            <Download size={16} /> CSV
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {banks.map(bank => (
                            <div key={bank.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                            <CreditCard size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{bank.bankName}</h4>
                                            <p className="text-sm text-slate-500">{bank.accountNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenBankModal(bank)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDeleteBank(bank.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400 uppercase font-medium">
                                    a.n {bank.holderName}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bank Modal */}
                    {isBankModalOpen && createPortal(
                        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h3 className="font-bold text-slate-800">{editingBankId ? 'Edit Rekening' : 'Tambah Rekening'}</h3>
                                    <button onClick={() => setIsBankModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Bank / E-Wallet</label>
                                        <input type="text" placeholder="Contoh: BCA, GoPay, Dana" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={bankForm.bankName} onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Rekening / HP</label>
                                        <input type="text" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={bankForm.accountNumber} onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Atas Nama</label>
                                        <input type="text" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={bankForm.holderName} onChange={e => setBankForm({ ...bankForm, holderName: e.target.value })} />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button onClick={() => setIsBankModalOpen(false)} className="flex-1 text-slate-500 py-2 text-sm hover:bg-slate-50 rounded-lg">Batal</button>
                                        <button onClick={handleSaveBank} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                                            <Save size={16} /> Simpan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}
                </div>
            )
            }

            {
                activeTab === 'users' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-end mb-4">
                            <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow">
                                <Plus size={18} /> Tambah User
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {users.map(u => (
                                <div key={u.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                                            {u.image ? (
                                                <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center ${u.role === UserRole.OWNER ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'} `}>
                                                    {u.role === UserRole.OWNER ? <ShieldAlert size={24} /> : <UserIcon size={24} />}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{u.name}</h4>
                                            <div className="flex gap-2 text-sm text-slate-500">
                                                <span className="font-mono bg-slate-100 px-2 rounded">@{u.username}</span>
                                                <span>•</span>
                                                <span className="font-medium">
                                                    {u.role === UserRole.SUPERADMIN ? 'Superadmin' :
                                                        u.role === UserRole.OWNER ? 'Pemilik (Admin)' : 'Kasir'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 size={20} />
                                        </button>
                                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* Data Management Tab (SUPERADMIN ONLY) */}
            {
                activeTab === 'data' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Warning Banner */}
                        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-red-900 text-lg mb-1">⚠️ Zona Berbahaya-Superadmin Only</h3>
                                    <p className="text-red-700 text-sm leading-relaxed">
                                        Fitur di halaman ini dapat menghapus data secara permanen dan <strong>TIDAK DAPAT DIBATALKAN</strong>.
                                        Pastikan Anda memahami konsekuensi sebelum melakukan tindakan apapun.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reset Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Reset Products */}
                            <div className="bg-white p-6 rounded-xl border-2 border-green-200 hover:border-green-400 transition-colors">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Trash2 size={24} className="text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-lg">Hapus Data Produk</h4>
                                        <p className="text-sm text-slate-600 mt-1">Menghapus semua produk dan stock kembali ke 0</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleResetProducts}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Trash2 size={18} />
                                    Hapus Produk
                                </button>
                            </div>

                            {/* Reset Transactions */}
                            <div className="bg-white p-6 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-colors">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Trash2 size={24} className="text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-lg">Hapus Data Transaksi</h4>
                                        <p className="text-sm text-slate-600 mt-1">Menghapus semua riwayat penjualan dan piutang pelanggan</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleResetTransactions}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Trash2 size={18} />
                                    Hapus Transaksi
                                </button>
                            </div>

                            {/* Reset Purchases */}
                            <div className="bg-white p-6 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-colors">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Trash2 size={24} className="text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-lg">Hapus Data Pembelian</h4>
                                        <p className="text-sm text-slate-600 mt-1">Menghapus semua riwayat pembelian dan utang supplier</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleResetPurchases}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Trash2 size={18} />
                                    Hapus Pembelian
                                </button>
                            </div>

                            {/* Reset Cash Flow */}
                            <div className="bg-white p-6 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-colors">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Trash2 size={24} className="text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-lg">Hapus Data Arus Kas</h4>
                                        <p className="text-sm text-slate-600 mt-1">Menghapus semua catatan arus kas masuk dan keluar</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleResetCashFlow}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Trash2 size={18} />
                                    Hapus Arus Kas
                                </button>
                            </div>

                            {/* Reset ALL Financial Data */}
                            <div className="bg-white p-6 rounded-xl border-2 border-red-300 hover:border-red-500 transition-colors">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle size={24} className="text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-red-800 text-lg">🔥 Reset SEMUA Data Keuangan</h4>
                                        <p className="text-sm text-red-600 mt-1 font-medium">Menghapus SEMUA transaksi, pembelian, dan arus kas sekaligus!</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleResetAllFinancial}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
                                >
                                    <AlertTriangle size={18} />
                                    RESET SEMUA KEUANGAN
                                </button>
                            </div>

                            {/* Reset Master Data */}
                            <div className="bg-white p-6 rounded-xl border-2 border-blue-300 hover:border-blue-500 transition-colors">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Trash2 size={24} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-blue-800 text-lg">♻️ Reset Master Data</h4>
                                        <p className="text-sm text-blue-600 mt-1 font-medium">Reset Produk, Kategori, Pelanggan & Supplier ke Default (Awal).</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleResetMasterData}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
                                >
                                    <Trash2 size={18} />
                                    RESET MASTER DATA
                                </button>
                            </div>

                            {/* NUCLEAR OPTION: Reset ALL Data */}
                            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border-4 border-red-500 hover:border-red-600 transition-all shadow-lg col-span-full">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                                        <AlertTriangle size={28} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-red-900 text-xl flex items-center gap-2">
                                            🚨 NUCLEAR OPTION: HAPUS SEMUA DATA 🚨
                                        </h4>
                                        <p className="text-sm text-red-700 mt-2 font-bold">
                                            Menghapus SELURUH DATA dari database (Finansial + Master Data)
                                        </p>
                                        <div className="mt-3 bg-white/80 p-3 rounded-lg border border-red-200">
                                            <p className="text-xs text-red-800 font-semibold mb-2">Yang akan dihapus:</p>
                                            <ul className="text-xs text-red-700 space-y-1 list-disc list-inside grid grid-cols-2 gap-1">
                                                <li>Transaksi Penjualan</li>
                                                <li>Produk</li>
                                                <li>Pembelian</li>
                                                <li>Kategori</li>
                                                <li>Arus Kas</li>
                                                <li>Pelanggan</li>
                                                <li>Piutang</li>
                                                <li>Supplier</li>
                                            </ul>
                                        </div>
                                        <div className="mt-2 bg-yellow-100 border border-yellow-400 p-2 rounded text-xs text-yellow-900 font-bold">
                                            ⚠️ HANYA Data User, Bank, dan Store Settings yang TIDAK dihapus
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleResetAllData}
                                    className="w-full bg-gradient-to-r from-red-700 to-pink-700 hover:from-red-800 hover:to-pink-800 text-white py-3.5 rounded-lg font-black text-lg flex items-center justify-center gap-2 transition-all shadow-2xl border-2 border-red-900"
                                >
                                    <AlertTriangle size={22} />
                                    HAPUS SEMUA DATA (TRIPLE CONFIRM)
                                </button>
                            </div>




                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <h4 className="font-bold text-blue-900 text-sm mb-2">ℹ️ Informasi Penting:</h4>
                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                <li>Data yang dihapus <strong>tidak dapat dikembalikan</strong></li>
                                <li>Disarankan untuk <strong>export data</strong> terlebih dahulu sebelum menghapus</li>
                                <li>Data produk, pelanggan, dan supplier <strong>tidak akan terhapus</strong> (Kecuali jika Anda memilih Reset Master Data atau Hapus Semua Data)</li>
                                <li>Hanya <strong>SUPERADMIN</strong> yang dapat mengakses fitur ini</li>
                            </ul>
                        </div>
                    </div>
                )
            }

            {/* User Modal */}
            {
                isModalOpen && createPortal(
                    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800">{editingId ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
                                <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-center mb-4">
                                    <label className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden group">
                                        {userForm.image ? (
                                            <img src={userForm.image} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <Upload className="text-slate-400 group-hover:text-blue-500" />
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                                            Ubah Foto
                                        </div>
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                                    <input type="text" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                    <input type="text" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <input type="password" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder={editingId ? "Kosongkan jika tidak ingin mengubah password" : ""} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Level Akses</label>
                                    <select className="w-full border border-slate-300 p-2 rounded-lg bg-white outline-none" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value as UserRole })}>
                                        <option value={UserRole.CASHIER}>Kasir (POS Only)</option>
                                        <option value={UserRole.OWNER}>Owner (Full Access)</option>
                                        <option value={UserRole.SUPERADMIN}>Superadmin (Unlimited)</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button onClick={() => setIsModalOpen(false)} className="flex-1 text-slate-500 py-2 text-sm hover:bg-slate-50 rounded-lg">Batal</button>
                                    <button onClick={handleSaveUser} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                                        <Save size={16} /> Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }
        </div >
    );
};
