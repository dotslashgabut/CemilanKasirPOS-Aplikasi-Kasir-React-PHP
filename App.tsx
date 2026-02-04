import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Loading } from './components/Loading';
import { StorageService } from './services/storage';
import { ApiService } from './services/api';
import { useTheme } from './hooks/useTheme';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const POS = React.lazy(() => import('./pages/POS').then(module => ({ default: module.POS })));
const Products = React.lazy(() => import('./pages/Products').then(module => ({ default: module.Products })));
const Finance = React.lazy(() => import('./pages/Finance').then(module => ({ default: module.Finance })));
const Settings = React.lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const People = React.lazy(() => import('./pages/People').then(module => ({ default: module.People })));
const BarcodeGenerator = React.lazy(() => import('./pages/BarcodeGenerator').then(module => ({ default: module.BarcodeGenerator })));
const SoldItems = React.lazy(() => import('./pages/SoldItems').then(module => ({ default: module.SoldItems })));
const CustomerHistory = React.lazy(() => import('./pages/CustomerHistory').then(module => ({ default: module.CustomerHistory })));
const SupplierHistory = React.lazy(() => import('./pages/SupplierHistory').then(module => ({ default: module.SupplierHistory })));
const TransferHistory = React.lazy(() => import('./pages/TransferHistory').then(module => ({ default: module.TransferHistory })));
const ReturnHistory = React.lazy(() => import('./pages/ReturnHistory').then(module => ({ default: module.ReturnHistory })));
const RealStockCheck = React.lazy(() => import('./pages/RealStockCheck').then(module => ({ default: module.RealStockCheck })));
const About = React.lazy(() => import('./pages/About').then(module => ({ default: module.About })));

import { UserRole, User } from './types';
import { Lock, User as UserIcon, Eye, EyeOff, Palette, Image as ImageIcon } from 'lucide-react';

const App: React.FC = () => {
   useTheme(); // Initialize Theme
   const [currentPage, setCurrentPage] = useState('dashboard');
   const [currentUser, setCurrentUser] = useState<User | null>(null);
   const [isReady, setIsReady] = useState(false);

   // Login State
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState('');

   // Login Interface Preferences
   const fileInputRef = React.useRef<HTMLInputElement>(null);
   const [activeBgMode, setActiveBgMode] = useState<'preset' | 'custom'>(() => {
      return (localStorage.getItem('pos_login_bg_mode') as 'preset' | 'custom') || 'preset';
   });

   const [customBg, setCustomBg] = useState<string | null>(() => localStorage.getItem('pos_login_custom_bg'));

   const [loginBgIndex, setLoginBgIndex] = useState(() => {
      const saved = localStorage.getItem('pos_login_bg_index');
      return saved ? parseInt(saved, 10) : 0;
   });

   const bgOptions = [
      { class: 'bg-gradient-to-br from-primary to-slate-800', name: 'Match Theme' },
      { class: 'bg-gradient-to-br from-orange-400 to-rose-400', name: 'Sunset Warmth' },
      { class: 'bg-gradient-to-br from-blue-500 to-cyan-400', name: 'Ocean Bright' },
      { class: 'bg-gradient-to-br from-indigo-500 to-purple-500', name: 'Royal Amethyst' },
      { class: 'bg-gradient-to-br from-teal-400 to-emerald-400', name: 'Tropical Mint' },
      { class: 'bg-gradient-to-r from-fuchsia-500 to-pink-500', name: 'Bery Smoothie' },
      { class: 'bg-gradient-to-tr from-green-300 via-blue-500 to-purple-600', name: 'Aurora Borealis' },
   ];

   const getBackgroundClass = () => {
      if (activeBgMode === 'custom' && customBg) return 'bg-slate-900'; // Fallback bg color
      return bgOptions[loginBgIndex].class;
   };

   const getBackgroundStyle = () => {
      if (activeBgMode === 'custom' && customBg) {
         return { backgroundImage: `url(${customBg})`, backgroundSize: 'cover', backgroundPosition: 'center' };
      }
      return {};
   };

   const cycleLoginBackground = () => {
      // Switch back to preset mode if customized, otherwise cycle presets
      if (activeBgMode === 'custom') {
         setActiveBgMode('preset');
         localStorage.setItem('pos_login_bg_mode', 'preset');
      } else {
         const nextIndex = (loginBgIndex + 1) % bgOptions.length;
         setLoginBgIndex(nextIndex);
         localStorage.setItem('pos_login_bg_index', nextIndex.toString());
      }
   };

   const handleBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
         if (file.size > 2.5 * 1024 * 1024) { // 2.5MB limit
            alert("Ukuran gambar terlalu besar (Maks 2.5MB). Harap gunakan gambar yang lebih kecil.");
            return;
         }

         const reader = new FileReader();
         reader.onloadend = () => {
            const base64 = reader.result as string;
            setCustomBg(base64);
            setActiveBgMode('custom');
            localStorage.setItem('pos_login_custom_bg', base64);
            localStorage.setItem('pos_login_bg_mode', 'custom');
         };
         reader.readAsDataURL(file);
      }
   };

   // Initialize mock database on load
   useEffect(() => {
      const init = async () => {
         // Step 1: Check if this is first time access (browser baru)
         const isMigrated = localStorage.getItem('pos_migrated_to_idb');
         const isFirstAccess = !isMigrated;

         // Step 2: If first access, try to sync from MySQL FIRST before seeding default data
         if (isFirstAccess) {
            console.log('🆕 First time access detected.');
            // Mark as migrated to prevent seeding default data
            localStorage.setItem('pos_migrated_to_idb', 'true');
         }

         // Step 3: Initialize storage
         await StorageService.init();


         // Step 5: Check session
         const savedUser = localStorage.getItem('pos_current_user');
         if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
         }

         // Security: Verify session with backend
         try {
            const user = await ApiService.getMe();
            setCurrentUser(user);
            localStorage.setItem('pos_current_user', JSON.stringify(user));
         } catch (e) {
            // If backend validation fails, clear the insecure local storage
            console.warn("Session validation failed:", e);
            setCurrentUser(null);
            localStorage.removeItem('pos_current_user');
            localStorage.removeItem('pos_token');
         }

         setIsReady(true);
      };
      init();
   }, []);

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         const { token, user } = await ApiService.login(username, password);

         setCurrentUser(user);
         localStorage.setItem('pos_current_user', JSON.stringify(user));
         setCurrentUser(user);
         localStorage.setItem('pos_current_user', JSON.stringify(user));
         // Token is now handled by HttpOnly Cookie (F1)
         // localStorage.setItem('pos_token', token);

         setError('');
         // Reset form
         setUsername('');
         setPassword('');
      } catch (err: any) {
         console.error("Login error:", err);
         setError(err.message || 'Gagal terhubung ke server.');
      }
   };

   const handleLogout = async () => {
      await ApiService.logout(); // Call backend to clear cookie (F1)
      setCurrentUser(null);
      localStorage.removeItem('pos_current_user');
      localStorage.removeItem('pos_token'); // Clear legacy if exists
      setCurrentPage('dashboard');
   };

   if (!isReady) {
      return (
         <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
         </div>
      );
   }

   if (!currentUser) {
      return (
         <div
            className={`min-h-screen ${getBackgroundClass()} flex items-center justify-center p-4 transition-all duration-500 ease-in-out relative`}
            style={getBackgroundStyle()}
         >
            {/* Background Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
               <input
                  id="bgUpload"
                  name="bgUpload"
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleBgUpload}
               />

               <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all"
                  title="Upload Custom Image (JPG/PNG)"
               >
                  <ImageIcon size={20} />
               </button>

               <button
                  onClick={cycleLoginBackground}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all"
                  title={activeBgMode === 'custom' ? 'Switch to Presets' : `Change Preset (${bgOptions[loginBgIndex].name})`}
               >
                  <Palette size={20} />
               </button>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 w-full max-w-sm shadow-2xl shadow-black/20">
               <div className="w-16 h-16 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/30 rotate-3">
                  <img src="/favicon.svg" alt="Logo" className="w-8 h-8 filter brightness-0 invert" />
               </div>
               <h1 className="text-2xl font-bold text-slate-800 text-center">CemilanKasirPOS</h1>
               <p className="text-slate-500 mb-8 text-center text-sm">Silakan login untuk melanjutkan.</p>

               <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                     <label htmlFor="username" className="block text-xs font-semibold text-slate-600 uppercase mb-1 ml-1">Username</label>
                     <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                           id="username"
                           name="username"
                           type="text"
                           autoComplete="username"
                           className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800 font-medium"
                           placeholder="Username"
                           value={username}
                           onChange={e => setUsername(e.target.value)}
                           autoFocus
                        />
                     </div>
                  </div>

                  <div>
                     <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase mb-1 ml-1">Password</label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                           id="password"
                           name="password"
                           type={showPassword ? "text" : "password"}
                           autoComplete="current-password"
                           className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800 font-medium"
                           placeholder="••••••••"
                           value={password}
                           onChange={e => setPassword(e.target.value)}
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                           {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                  </div>

                  {error && (
                     <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {error}
                     </div>
                  )}

                  <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-hover transition-all transform active:scale-[0.98] shadow-xl shadow-primary/20">
                     Masuk Aplikasi
                  </button>
               </form>
            </div>
         </div>
      );
   }

   const renderPage = () => {
      switch (currentPage) {
         case 'dashboard': return <Dashboard />;
         case 'pos': return <POS />;
         case 'products': return <Products />;
         case 'transactions': return <Finance currentUser={currentUser} defaultTab="history" />;
         case 'people': return <People />;
         case 'finance': return <Finance currentUser={currentUser} defaultTab="cashflow" />;
         case 'customer_history': return <CustomerHistory currentUser={currentUser} />;
         case 'supplier_history': return <SupplierHistory currentUser={currentUser} />;
         case 'transfer_history': return <TransferHistory currentUser={currentUser} />;
         case 'return_history': return <ReturnHistory currentUser={currentUser} />;
         case 'real_stock_check': return <RealStockCheck currentUser={currentUser} />;
         case 'barcode': return <BarcodeGenerator />;
         case 'settings':
            // Prevent ADMIN from accessing settings
            if (currentUser?.role === UserRole.ADMIN) return <Dashboard />;
            return <Settings />;
         case 'sold_items': return <SoldItems currentUser={currentUser} />;
         case 'about': return <About />;
         default: return <Dashboard />;
      }
   };

   return (
      <Layout
         activePage={currentPage}
         onNavigate={setCurrentPage}
         userRole={currentUser.role}
         onLogout={handleLogout}
      >
         <React.Suspense fallback={<Loading />}>
            {renderPage()}
         </React.Suspense>
      </Layout>
   );
};

export default App;