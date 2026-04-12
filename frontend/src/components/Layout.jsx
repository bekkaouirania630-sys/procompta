import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, ScanLine,
  Users, Landmark, UserCog, BarChart3,
  Wallet, BookMarked, Settings, LogOut, ChevronLeft,
  ChevronRight, Bell, Search, Building2, ChevronDown,
  Calculator, Info, X, CheckCircle,
  Sparkles, History, Package, AlertTriangle, Menu
} from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';
import GlobalSearch from './GlobalSearch';

const API = 'http://localhost:8000/api';

const MENU_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { id: 'dashboard',    icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { id: 'comptabilite', icon: BookOpen,         label: 'Saisie & Livres', path: '/comptabilite' },
      { id: 'factures',     icon: FileText,         label: 'Facturation',     path: '/factures' },
      { id: 'stock',        icon: Package,          label: 'Stock',           path: '/stock' },
      { id: 'tresorerie',   icon: Landmark,         label: 'Trésorerie',      path: '/tresorerie' },
      { id: 'budget',       icon: Wallet,           label: 'Budgets',         path: '/budget' },
    ]
  },
  {
    label: 'Expertise',
    items: [
      { id: 'fiscalite',    icon: Calculator,       label: 'Fiscalité / TVA', path: '/fiscalite' },
      { id: 'rh',           icon: UserCog,          label: 'RH & Paie',       path: '/rh' },
      { id: 'ocr',          icon: ScanLine,         label: 'Intelligence OCR', path: '/ocr' },
    ]
  },
  {
    label: 'Ressources',
    items: [
      { id: 'plan-tiers',   icon: Users,            label: 'Plan Tiers',      path: '/plan-tiers' },
      { id: 'reporting',    icon: BarChart3,         label: 'Analytique',      path: '/reporting' },
      { id: 'journaux',     icon: BookMarked,        label: 'Codes Journaux',  path: '/journaux' },
    ]
  },
  {
    label: 'Sécurité',
    items: [
      { id: 'audit-log',    icon: History,           label: 'Journal d\'Audit', path: '/audit-log' },
    ]
  },
];

const NotifIcon = ({ type, icon }) => {
  if (icon === 'invoice' || type === 'warning')
    return <AlertTriangle size={14} className="text-warning" />;
  if (icon === 'tva')
    return <Calculator size={14} className="text-info" />;
  return <Info size={14} style={{ color: 'var(--primary)' }} />;
};

export default function Layout() {
  const [collapsed, setCollapsed]       = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [companies, setCompanies]       = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [user, setUser]                 = useState({ name: 'Chargeant...', role: 'Vérification', avatar: 'U' });
  const notifRef = useRef(null);
  const userRef  = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Accept': 'application/json',
  });


  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${API}/companies`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        setCompanies(arr);
        if (arr.length > 0 && !currentCompany) setCurrentCompany(arr[0]);
      }
    } catch (e) {}
  };

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API}/auth/me`, { headers: getHeaders() });
      if (res.ok) {
        const me = await res.json();
        setUser({
          name: me.name || 'Admin',
          role: me.role?.name || 'Administrateur',
          avatar: (me.name || 'A').charAt(0).toUpperCase(),
        });
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchCompanies();
    fetchMe();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const allItems = MENU_SECTIONS.flatMap(s => s.items).concat([
    { id: 'parametres', icon: Settings, label: 'Paramètres', path: '/parametres' }
  ]);
  const currentMenu = allItems.find(m => location.pathname.startsWith(m.path)) || { label: 'Système' };

  return (
    <div id="app">
      {/* Overlay pour la version mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside id="sidebar" className={`${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sb-logo">
          <div className="sb-logo-icon">
             <Sparkles size={20} fill="white" />
          </div>
          {!collapsed && (
            <div className="sb-logo-info">
              <div className="sb-logo-text">ProCompta</div>
              <div style={{ color: '#60A5FA', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em' }}>VERSION EXECUTIVE</div>
            </div>
          )}
        </div>

        {!collapsed && (
          <div style={{ padding: '20px 16px 0' }}>
            <div className="glass-panel" style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={12} style={{ color: '#64748B' }}/>
                <select
                  style={{
                    background: 'transparent', border: 'none', color: '#CBD5E1', fontSize: '11px', fontWeight: 700, width: '100%', outline: 'none', cursor: 'pointer'
                  }}
                  id="societe-select"
                  value={currentCompany?.id || ''}
                  onChange={e => {
                    const found = companies.find(c => String(c.id) === e.target.value);
                    setCurrentCompany(found || null);
                    localStorage.setItem('company_id', e.target.value);
                    window.dispatchEvent(new Event('company-changed'));
                  }}
                >
                  {companies.map(c => <option key={c.id} value={c.id} style={{ background: '#0F172A' }}>{c.name}</option>)}
                </select>
                <ChevronDown size={10} style={{ color: '#64748B' }}/>
              </div>
            </div>
          </div>
        )}

        <nav className="sb-nav">
          {MENU_SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed && <div className="sb-section-label">{section.label}</div>}
              {section.items.map(m => {
                const Icon = m.icon;
                const isActive = location.pathname.startsWith(m.path);
                return (
                  <button
                    key={m.id}
                    className={`sb-item ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(m.path)}
                  >
                    <span className="sb-item-icon"><Icon size={18}/></span>
                    {!collapsed && <span>{m.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button className={`sb-item ${location.pathname==='/parametres'?'active':''}`} onClick={() => navigate('/parametres')}>
            <span className="sb-item-icon"><Settings size={18}/></span>
            {!collapsed && <span>Paramètres</span>}
          </button>
          <button className="sb-item" onClick={handleLogout} style={{ color: '#EF4444' }}>
            <span className="sb-item-icon"><LogOut size={18}/></span>
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div id="main">
        <header id="topbar">
          <div className="tb-left flex items-center gap-2">
            <button 
              className="md:hidden text-muted hover:text-main"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:block"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginRight: '12px' }}
            >
              {collapsed ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
            </button>
            <div className="tb-breadcrumb hidden sm:block">
              <span className="tb-company-name">{currentCompany?.name || 'Sélection...'}</span>
              <span className="tb-sep">/</span>
              <span className="tb-page-name premium-font">{currentMenu.label}</span>
            </div>
          </div>

          <div className="tb-center flex-1 sm:flex-none">
            <GlobalSearch />
          </div>

          <div className="tb-right flex items-center gap-3">
            <div ref={notifRef} className="relative">
              <button className="tb-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={18}/>
              </button>
              <NotificationsDropdown open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            <div ref={userRef} className="tb-user flex items-center gap-2 cursor-pointer" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className="tb-avatar shadow-sm hover:ring-2 hover:ring-primary/20 transition-all">{user.avatar}</div>
              <ChevronDown size={14} className="text-dim opacity-50" />
              
              {userMenuOpen && (
                <div className="glass-panel absolute right-0 top-full mt-3 w-56 p-2 z-50">
                  <div className="px-3 py-2 border-bottom mb-2">
                    <div className="font-bold text-main truncate">{user.name}</div>
                    <div className="text-[10px] font-bold text-muted uppercase tracking-wider">{user.role}</div>
                  </div>
                  <button className="sb-item" style={{ color: 'var(--text-main)' }} onClick={() => navigate('/parametres')}>
                    <UserCog size={14}/> Profil
                  </button>
                  <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }}/>
                  <button className="sb-item" style={{ color: 'var(--danger)' }} onClick={handleLogout}>
                    <LogOut size={14}/> Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main id="content" className="fade-in">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
