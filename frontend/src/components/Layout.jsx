import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const MENU = [
  { id: 'dashboard',   icon: '◉', label: 'Tableau de bord', path: '/dashboard' },
  { id: 'comptabilite',icon: '📒', label: 'Comptabilité', path: '/comptabilite' },
  { id: 'factures',    icon: '📄', label: 'Factures', path: '/factures' },
  { id: 'ocr',         icon: '🔍', label: 'OCR / Import', path: '/ocr' },
  { id: 'clients',     icon: '👤', label: 'Clients', path: '/clients' },
  { id: 'fournisseurs',icon: '🏭', label: 'Fournisseurs', path: '/fournisseurs' },
  { id: 'tresorerie',  icon: '🏦', label: 'Trésorerie', path: '/tresorerie' },
  { id: 'parametres',  icon: '⚙️', label: 'Paramètres', path: '/parametres' },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const currentMenu = MENU.find(m => location.pathname.includes(m.path)) || MENU[0];

  return (
    <div id="app">
      <aside id="sidebar" className={collapsed ? 'collapsed' : ''}>
        <div className="sb-logo" onClick={() => setCollapsed(!collapsed)}>
          <div className="sb-logo-icon">C</div>
          {!collapsed && (
            <div className="sb-collapsed-hide">
              <div className="sb-logo-text">ComptaMA</div>
              <div className="sb-logo-sub">PCM · IA · OCR</div>
            </div>
          )}
        </div>
        
        <div className="sb-societe sb-collapsed-hide" style={{ display: collapsed ? 'none' : 'block' }}>
          <select id="societe-select">
            <option>ALFA SARL</option>
            <option>BETA SA</option>
          </select>
        </div>

        <nav className="sb-nav">
          {MENU.map(m => (
            <button
              key={m.id}
              className={`sb-item ${location.pathname.includes(m.path) ? 'active' : ''}`}
              onClick={() => navigate(m.path)}
            >
              <span className="icon">{m.icon}</span>
              {!collapsed && <span className="sb-collapsed-hide">{m.label}</span>}
            </button>
          ))}
          <div style={{flex: 1}}></div>
          <button className="sb-item" onClick={handleLogout} style={{marginTop: 'auto', borderTop: '1px solid #1e1e1e'}}>
            <span className="icon">🚪</span>
            {!collapsed && <span className="sb-collapsed-hide">Déconnexion</span>}
          </button>
        </nav>
        <button className="sb-collapse" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '▶' : '◀'}
        </button>
      </aside>

      <div id="main">
        <header id="topbar">
          <div>
            <span className="tb-title">{currentMenu.label}</span>
            <span style={{ color: 'var(--text3)', margin: '0 8px' }}>—</span>
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>ALFA SARL</span>
          </div>
          <div className="tb-right">
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
              {new Date().toLocaleDateString('fr-MA')}
            </span>
            <span className="tb-badge" onClick={() => navigate('/factures')}>
              3 en attente
            </span>
            <div className="tb-avatar" title="Mon Profil">A</div>
          </div>
        </header>

        <div id="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
