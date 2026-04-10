import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Search, Filter, ArrowLeft } from 'lucide-react';
import './ChartOfAccounts.css';

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/accounting/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch accounts');
      
      const data = await response.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.code.includes(searchTerm) || account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || account.class === parseInt(filterClass);
    return matchesSearch && matchesClass;
  });

  return (
    <div className="layout-container">
      <div className="coa-main-content">
        <div className="coa-header">
          <div>
            <button className="btn-icon" onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem', background: 'transparent', color: '#CBD5E1', border: '1px solid #334155' }}>
               <ArrowLeft size={16} style={{marginRight: '8px'}} /> Retour au Dashboard
            </button>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={28} className="text-primary" /> Plan Comptable
            </h1>
            <p className="text-muted">Gestion du plan comptable marocain, classes et comptes divisionnaires.</p>
          </div>
          <button className="btn btn-primary">
            <Plus size={20} /> Nouveau Compte
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="glass-panel coa-card">
          <div className="coa-toolbar">
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Rechercher un compte par numéro ou nom..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-dropdown">
              <Filter size={18} />
              <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                <option value="All">Toutes les classes</option>
                <option value="1">Classe 1 (Financement)</option>
                <option value="2">Classe 2 (Actif Immobilisé)</option>
                <option value="3">Classe 3 (Actif Circulant)</option>
                <option value="4">Classe 4 (Passif Circulant)</option>
                <option value="5">Classe 5 (Trésorerie)</option>
                <option value="6">Classe 6 (Charges)</option>
                <option value="7">Classe 7 (Produits)</option>
                <option value="8">Classe 8 (Résultats)</option>
              </select>
            </div>
          </div>

          <div className="coa-table-wrapper">
            {loading ? (
              <div className="loading-state">Chargement des comptes...</div>
            ) : (
              <table className="coa-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Intitulé</th>
                    <th>Classe</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map(account => (
                      <tr key={account.id}>
                        <td className="account-code">{account.code}</td>
                        <td className="account-name">{account.name}</td>
                        <td><span className="badge badge-class">Classe {account.class}</span></td>
                        <td>
                          {account.is_active ? 
                           <span className="badge badge-success">Actif</span> : 
                           <span className="badge badge-danger">Inactif</span>}
                        </td>
                        <td>
                          <button className="btn-link">Modifier</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-state">Aucun compte trouvé.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartOfAccounts;
