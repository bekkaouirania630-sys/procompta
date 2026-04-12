import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, ScanLine,
  Users, Landmark, UserCog, BarChart3,
  Wallet, BookMarked, Settings, LogOut, ChevronLeft,
  ChevronRight, Bell, Search, Building2, ChevronDown,
  Calculator, AlertTriangle, Clock, Info, X, CheckCircle,
  Banknote, Sparkles, History
} from 'lucide-react';

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
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount]     = useState(0);
  const [companies, setCompanies]       = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [user, setUser]                 = useState({ name: 'Chargeant...', role: 'Vérification', avatar: 'U' });
  const notifRef = useRef(null);
  const userRef  = useRef(null);
  const navigate  = useNavigate();
  const location  = useLocation();

  const getHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Accept': 'application/json',
  });

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API}/notifications`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setNotifCount(data.count || 0);
      }
    } catch (e) {}
  };

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
    fetchNotifications();
    fetchCompanies();
    fetchMe();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
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
      {/* ── Sidebar ── */}
      <aside id="sidebar" className={collapsed ? 'collapsed' : ''}>
        <div className="sb-logo">
          <div className="sb-logo-icon">
             <Sparkles size={20} fill="white" />
          </div>
          {!collapsed && (
            <div className="sb-logo-info">
              <div className="sb-logo-text">ProCompta</div>
              <div style={{ color: '#475569', fontSize: '10px', fontWeight: 800 }}>VERSION EXECUTIVE</div>
            </div>
          )}
        </div>

        {!collapsed && (
          <div style={{ padding: '20px 16px 0' }}>
            <div className="glass-panel" style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
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
          <div className="tb-left">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginRight: '12px' }}
            >
              {collapsed ? <ChevronRight size={20}/> : <ChevronLeft size={20}/>}
            </button>
            <div className="tb-breadcrumb">
              <span className="tb-company-name">{currentCompany?.name || 'Sélection...'}</span>
              <span className="tb-sep">/</span>
              <span className="tb-page-name premium-font">{currentMenu.label}</span>
            </div>
          </div>

          <div className="tb-center">
            <div className="tb-search">
              <Search size={16} style={{ color: 'var(--text-dim)' }}/>
              <input type="text" placeholder="Recherche rapide (⌘K)" className="tb-search-input"/>
            </div>
          </div>

          <div className="tb-right">
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button className="tb-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={18}/>
                {notifCount > 0 && (
                  <span style={{
                    position:'absolute', top:'-2px', right:'-2px',
                    background:'var(--danger)', borderRadius:'50%',
                    width:'16px', height:'16px', fontSize:'9px',
                    fontWeight:900, color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    border: '2px solid #fff'
                  }}>
                    {notifCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="glass-panel" style={{
                  position:'absolute', top:'calc(100% + 12px)', right:0,
                  width:'360px', maxHeight:'500px', overflowY:'auto',
                  zIndex:1000, padding: '0'
                }}>
                  <div style={{ padding:'16px', borderBottom:'1px solid var(--border-light)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span className="premium-font" style={{fontWeight:800, fontSize:'14px'}}>Notifications</span>
                    <span className="badge badge-danger">{notifCount} Urgent</span>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding:'40px', textAlign:'center', color:'var(--text-dim)', fontSize:'13px' }}>
                        <CheckCircle size={32} style={{ margin:'0 auto 10px', color: 'var(--primary)', opacity: 0.5 }}/>
                        <div>Aucune notification</div>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="sb-item" style={{ borderRadius: 0, color: 'var(--text-main)', padding: '12px 16px', borderBottom: '1px solid var(--bg)' }} onClick={() => { navigate(notif.link); setNotifOpen(false); }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                            <NotifIcon type={notif.type} icon={notif.icon}/>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '13px' }}>{notif.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{notif.message}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div ref={userRef} className="tb-user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className="tb-avatar">{user.avatar}</div>
              <div style={{ textAlign: 'right', display: collapsed ? 'none' : 'block' }}>
                <div className="tb-user-name">{user.name}</div>
                <div className="tb-user-role">{user.role}</div>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-dim)' }}/>
              
              {userMenuOpen && (
                <div className="glass-panel" style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 200, padding: 8 }}>
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
