import React from 'react';
import { Search, Bell, User, Menu, ChevronRight, Globe } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCompanyStore from '../store/useCompanyStore';

const Topbar = ({ toggleSidebar }) => {
  const user = useAuthStore(state => state.user);
  const currentCompany = useCompanyStore(state => state.currentCompany);

  return (
    <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar}
          className="p-2.5 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 rounded-xl transition-all text-slate-600 lg:hidden focus:ring-4 focus:ring-primary/10"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
            <span className="opacity-80">ERP Intelligent</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <span className="text-primary">{currentCompany?.name || 'Ma Société'}</span>
          </div>
          <h1 className="text-slate-800 font-display font-extrabold text-xl tracking-tight">Tableau de bord</h1>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="hidden md:flex items-center gap-3 bg-slate-50/80 px-4 py-2.5 rounded-xl w-80 border border-slate-200/60 focus-within:bg-white focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 transition-all group">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher une facture, un compte..." 
            className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-600 placeholder:text-slate-400"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1.5">
          <button className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white z-10"></span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></span>
          </button>
          
          <button className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">
            <Globe className="w-5 h-5" />
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-5 border-l border-slate-200/60 cursor-pointer group">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-slate-800 font-bold text-sm tracking-tight">{user?.name || 'Administrateur'}</span>
            <span className="text-primary text-[11px] font-semibold mt-0.5">Expert Comptable</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20 group-hover:shadow-primary/30 group-hover:-translate-y-0.5 transition-all">
            {user?.name?.[0] || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
