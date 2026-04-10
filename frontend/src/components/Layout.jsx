import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, ScanLine,
  Users, Landmark, UserCog, BarChart3, TrendingUp,
  Wallet, BookMarked, Settings, LogOut, ChevronLeft,
  ChevronRight, Bell, Search, Building2, ChevronDown,
  Calculator
} from 'lucide-react';

const MENU_SECTIONS = [
  {
    label: 'PRINCIPAL',
    items: [
      { id: 'dashboard',    icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    ]
  },
  {
    label: 'COMPTABILITÉ',
    items: [
      { id: 'comptabilite', icon: BookOpen,         label: 'Saisie & Livres', path: '/comptabilite' },
      { id: 'factures',     icon: FileText,         label: 'Factures',        path: '/factures' },
      { id: 'tresorerie',   icon: Landmark,         label: 'Trésorerie',      path: '/tresorerie' },
      { id: 'budget',       icon: Wallet,           label: 'Budget',          path: '/budget' },
    ]
  },
  {
    label: 'FISCALITÉ & RH',
    items: [
      { id: 'fiscalite',    icon: Calculator,       label: 'Fiscalité TVA',   path: '/fiscalite' },
      { id: 'rh',           icon: UserCog,          label: 'RH & Paie',       path: '/rh' },
    ]
  },
  {
    label: 'OUTILS',
    items: [
      { id: 'ocr',          icon: ScanLine,         label: 'OCR / Import',    path: '/ocr' },
      { id: 'plan-tiers',   icon: Users,            label: 'Plan Tiers',      path: '/plan-tiers' },
      { id: 'reporting',    icon: BarChart3,         label: 'Reporting',       path: '/reporting' },
      { id: 'journaux',     icon: BookMarked,        label: 'Codes Journaux',  path: '/journaux' },
    ]
  },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const allItems = MENU_SECTIONS.flatMap(s => s.items);
  const currentMenu = allItems.find(m => location.pathname.startsWith(m.path)) || allItems[0];

  return (
    <div id="app">
      {/* ── Sidebar ── */}
      <aside id="sidebar" className={collapsed ? 'collapsed' : ''}>
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18"/>
            </svg>
          </div>
          {!collapsed && (
            <div className="sb-logo-info">
              <div className="sb-logo-text">ProCompta</div>
              <div className="sb-logo-sub">ERP Marocain · v2.0</div>
            </div>
          )}
          <button className="sb-toggle" onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Développer' : 'Réduire'}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Company selector */}
        {!collapsed && (
          <div className="sb-company">
            <Building2 size={13} className="sb-company-icon" />
            <select className="sb-company-select" id="societe-select">
              <option>ALFA SARL</option>
              <option>BETA SA</option>
              <option>GAMMA SARLAU</option>
            </select>
            <ChevronDown size={12} className="sb-company-chevron" />
          </div>
        )}

        {/* Navigation sections */}
        <nav className="sb-nav">
          {MENU_SECTIONS.map((section) => (
            <div key={section.label} className="sb-section">
              {!collapsed && <div className="sb-section-label">{section.label}</div>}
              {section.items.map(m => {
                const Icon = m.icon;
                const isActive = location.pathname.startsWith(m.path);
                return (
                  <button
                    key={m.id}
                    className={`sb-item ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(m.path)}
                    title={collapsed ? m.label : undefined}
                  >
                    <span className="sb-item-icon"><Icon size={16} /></span>
                    {!collapsed && <span className="sb-item-label">{m.label}</span>}
                    {!collapsed && isActive && <span className="sb-item-dot" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="sb-footer">
          <button
            className="sb-item"
            onClick={() => navigate('/parametres')}
            title={collapsed ? 'Paramètres' : undefined}
          >
            <span className="sb-item-icon"><Settings size={16} /></span>
            {!collapsed && <span className="sb-item-label">Paramètres</span>}
          </button>
          <button
            className="sb-item sb-item-danger"
            onClick={handleLogout}
            title={collapsed ? 'Déconnexion' : undefined}
          >
            <span className="sb-item-icon"><LogOut size={16} /></span>
            {!collapsed && <span className="sb-item-label">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div id="main">
        {/* Topbar */}
        <header id="topbar">
          <div className="tb-left">
            <div className="tb-breadcrumb">
              <span className="tb-company-name">ALFA SARL</span>
              <span className="tb-sep">/</span>
              <span className="tb-page-name">{currentMenu.label}</span>
            </div>
          </div>

          <div className="tb-center">
            <div className="tb-search">
              <Search size={14} className="tb-search-icon" />
              <input type="text" placeholder="Rechercher..." className="tb-search-input" />
              <kbd className="tb-search-kbd">⌘K</kbd>
            </div>
          </div>

          <div className="tb-right">
            <span className="tb-date">
              {new Date().toLocaleDateString('fr-MA', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <button className="tb-icon-btn" onClick={() => navigate('/factures')} title="Notifications">
              <Bell size={16} />
              <span className="tb-notif-dot" />
            </button>
            <div className="tb-user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className="tb-avatar">A</div>
              {!collapsed && (
                <div className="tb-user-info">
                  <div className="tb-user-name">Admin</div>
                  <div className="tb-user-role">Comptable</div>
                </div>
              )}
              <ChevronDown size={12} className="tb-user-chevron" />
              {userMenuOpen && (
                <div className="tb-user-dropdown">
                  <div className="tb-dropdown-item" onClick={() => navigate('/parametres')}>
                    <Settings size={14} /> Mon profil
                  </div>
                  <div className="tb-dropdown-divider" />
                  <div className="tb-dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={14} /> Déconnexion
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div id="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
