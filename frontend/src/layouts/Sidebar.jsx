import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Users, 
  Briefcase, 
  PieChart, 
  Settings, 
  Package, 
  Banknote, 
  Search, 
  Bell, 
  User,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const SidebarItem = ({ icon: Icon, label, to, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
      ${isActive 
        ? 'bg-primary/10 text-primary shadow-sm' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
    `}
  >
    <Icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''}`} />
    {!collapsed && <span className="font-semibold text-sm premium-font">{label}</span>}
  </NavLink>
);

const SidebarLayer = ({ collapsed }) => {
  const logout = useAuthStore(state => state.logout);

  return (
    <aside className={`bg-[#0F172A] border-r border-slate-800 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} h-screen sticky top-0`}>
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800/50 gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <BookOpen className="text-white w-6 h-6" />
        </div>
        {!collapsed && (
          <span className="text-white font-extrabold text-xl tracking-tight premium-font">
            PRO<span className="text-emerald-500">COMPTA</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {!collapsed && <p className="px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">Menu Principal</p>}
        
        <SidebarItem icon={LayoutDashboard} label="Tableau de bord" to="/dashboard" collapsed={collapsed} />
        
        {!collapsed && <p className="px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-8 mb-4">Comptabilité</p>}
        <SidebarItem icon={BookOpen} label="Plan Comptable" to="/plan-comptable" collapsed={collapsed} />
        <SidebarItem icon={FileText} label="Journaux" to="/journaux" collapsed={collapsed} />
        <SidebarItem icon={PieChart} label="Écritures" to="/comptabilite" collapsed={collapsed} />
        
        {!collapsed && <p className="px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-8 mb-4">Gestion</p>}
        <SidebarItem icon={FileText} label="Facturation" to="/factures" collapsed={collapsed} />
        <SidebarItem icon={Package} label="Stock" to="/stock" collapsed={collapsed} />
        <SidebarItem icon={Banknote} label="Trésorerie" to="/tresorerie" collapsed={collapsed} />
        <SidebarItem icon={Search} label="OCR & Scan" to="/ocr" collapsed={collapsed} />
        
        {!collapsed && <p className="px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-8 mb-4">Social & Reporting</p>}
        <SidebarItem icon={Users} label="RH & Paie" to="/rh" collapsed={collapsed} />
        <SidebarItem icon={ShieldAlert} label="Fiscalité" to="/fiscalite" collapsed={collapsed} />
        <SidebarItem icon={PieChart} label="Reporting" to="/reporting" collapsed={collapsed} />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/50">
        <SidebarItem icon={Settings} label="Paramètres" to="/parametres" collapsed={collapsed} />
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200 mt-2"
        >
          <X className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''}`} />
          {!collapsed && <span className="font-semibold text-sm">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default SidebarLayer;
