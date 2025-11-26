import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Loading } from './components/Loading';
import { StorageService } from './services/storage';
import { ApiService } from './services/api';

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

import { UserRole, User } from './types';
import { Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';

const App: React.FC = () => {
   const [currentPage, setCurrentPage] = useState('dashboard');
   const [currentUser, setCurrentUser] = useState<User | null>(null);
   const [isReady, setIsReady] = useState(false);

   // Login State
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [error, setError] = useState('');

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
         localStorage.setItem('pos_token', token);

         setError('');
         // Reset form
         setUsername('');
         setPassword('');
      } catch (err: any) {
         console.error("Login error:", err);
         setError(err.message || 'Gagal terhubung ke server.');
      }
   };

   const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('pos_current_user');
      localStorage.removeItem('pos_token');
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
         <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl shadow-blue-900/20">
               <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-600/30 rotate-3">
                  <Lock className="text-white w-8 h-8" />
               </div>
               <h1 className="text-2xl font-bold text-slate-800 text-center">Cemilan KasirPOS</h1>
               <p className="text-slate-500 mb-8 text-center text-sm">Silakan login untuk melanjutkan.</p>

               <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                     <label className="block text-xs font-semibold text-slate-600 uppercase mb-1 ml-1">Username</label>
                     <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                           type="text"
                           className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800 font-medium"
                           placeholder="Username"
                           value={username}
                           onChange={e => setUsername(e.target.value)}
                           autoFocus
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-semibold text-slate-600 uppercase mb-1 ml-1">Password</label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                           type={showPassword ? "text" : "password"}
                           className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-800 font-medium"
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

                  <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all transform active:scale-[0.98] shadow-xl shadow-slate-900/20">
                     Masuk Aplikasi
                  </button>
               </form>

               <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-400 mb-2">Default Login (Demo):</p>
                  <div className="inline-flex gap-2 text-xs font-mono bg-slate-100 px-3 py-2 rounded-lg text-slate-600">
                     <span>superadmin / password</span>
                  </div>
               </div>
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
         case 'barcode': return <BarcodeGenerator />;
         case 'settings': return <Settings />;
         case 'sold_items': return <SoldItems currentUser={currentUser} />;
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