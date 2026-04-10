import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Plus, Search, Filter, Download, Upload, 
  MoreVertical, Edit, Trash2, X, Check, AlertCircle, Loader2 
} from 'lucide-react';

const PlanTiers = () => {
  const [tiers, setTiers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'client',
    account_id: '',
    ice: '',
    if: '',
    rc: '',
    patente: '',
    cnss: '',
    address: '',
    ville: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [tiersRes, accountsRes] = await Promise.all([
        fetch('http://localhost:8000/api/tiers', {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        }),
        fetch('http://localhost:8000/api/accounting/accounts', {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        })
      ]);

      const tiersData = await tiersRes.json();
      const accountsData = await accountsRes.json();
      
      setTiers(Array.isArray(tiersData) ? tiersData : []);
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setTiers([]);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingTier 
      ? `http://localhost:8000/api/tiers/${editingTier.id}`
      : 'http://localhost:8000/api/tiers';
    const method = editingTier ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        fetchData();
        resetForm();
      }
    } catch (err) {
      console.error('Error saving tier:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce tiers ?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8000/api/tiers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting tier:', err);
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/tiers/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plan_tiers.xlsx';
      a.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const token = localStorage.getItem('token');
    const formDataBody = new FormData();
    formDataBody.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/tiers/import', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataBody
      });
      if (response.ok) {
        alert('Importation réussie');
        fetchData();
      }
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '', name: '', type: 'client', account_id: '',
      ice: '', if: '', rc: '', patente: '', cnss: '',
      address: '', ville: '', phone: '', email: ''
    });
    setEditingTier(null);
  };

  const openEdit = (tier) => {
    setEditingTier(tier);
    setFormData({
      code: tier.code,
      name: tier.name,
      type: tier.type,
      account_id: tier.account_id || '',
      ice: tier.ice || '',
      if: tier.if || '',
      rc: tier.rc || '',
      patente: tier.patente || '',
      cnss: tier.cnss || '',
      address: tier.address || '',
      ville: tier.ville || '',
      phone: tier.phone || '',
      email: tier.email || ''
    });
    setShowModal(true);
  };

  const filteredTiers = tiers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="layout-container">
      <div className="coa-header">
        <div>
          <h1 className="flex items-center gap-3">
            <Users size={28} className="text-primary" /> Plan des Tiers
          </h1>
          <p className="text-muted">Gérez vos comptes clients, fournisseurs et autres tiers façon Sage.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={18} /> Exporter
          </button>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current.click()}>
            <Upload size={18} /> {importing ? 'Importation...' : 'Importer'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            style={{ display: 'none' }} 
            accept=".xlsx,.xls,.csv" 
          />
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={20} /> Nouveau Tiers
          </button>
        </div>
      </div>

      <div className="glass-panel coa-card mt-6">
        <div className="coa-toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher par nom ou code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-dropdown">
            <Filter size={18} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">Tous les types</option>
              <option value="client">Clients</option>
              <option value="fournisseur">Fournisseurs</option>
              <option value="salarie">Salariés</option>
              <option value="autre">Autres</option>
            </select>
          </div>
        </div>

        <div className="coa-table-wrapper">
          {loading ? (
            <div className="loading-state">
              <Loader2 className="animate-spin" /> Chargement des tiers...
            </div>
          ) : (
            <table className="coa-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Intitulé</th>
                  <th>Type</th>
                  <th>Compte Collectif</th>
                  <th>Ville</th>
                  <th>ICE</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filteredTiers) && filteredTiers.map(tier => (
                  <tr key={tier.id}>
                    <td className="account-code">{tier.code}</td>
                    <td className="account-name font-bold">{tier.name}</td>
                    <td>
                      <span className={`badge badge-${tier.type}`}>
                        {tier.type === 'client' ? 'Client' : 
                         tier.type === 'fournisseur' ? 'Fournisseur' : 
                         tier.type === 'salarie' ? 'Salarié' : 'Autre'}
                      </span>
                    </td>
                    <td>{tier.account ? `${tier.account.number} - ${tier.account.label}` : '-'}</td>
                    <td>{tier.ville || '-'}</td>
                    <td><small className="text-muted">{tier.ice || '-'}</small></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-icon-small" onClick={() => openEdit(tier)} title="Modifier">
                          <Edit size={14} />
                        </button>
                        <button className="btn-icon-small text-red-500" onClick={() => handleDelete(tier.id)} title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>{editingTier ? 'Modifier le Tiers' : 'Ajouter un nouveau Tiers'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="modal-body grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Code Tiers *</label>
                <input 
                  type="text" 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="ex: CL001"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Nom / Raison Sociale *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Type de Tiers *</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="client">Client</option>
                  <option value="fournisseur">Fournisseur</option>
                  <option value="salarie">Salarié</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label>Compte Collectif</label>
                <select value={formData.account_id} onChange={e => setFormData({...formData, account_id: e.target.value})}>
                  <option value="">Sélectionner un compte...</option>
                  {accounts.filter(a => [34, 44].includes(Math.floor(parseInt(a.number)/100))).map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.number} - {acc.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 border-t border-white/5 pt-4 mt-2">
                <h4 className="text-sm font-bold text-primary mb-3">Identifiants Professionnels (Maroc)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <label>ICE</label>
                    <input type="text" value={formData.ice} onChange={e => setFormData({...formData, ice: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>IF</label>
                    <input type="text" value={formData.if} onChange={e => setFormData({...formData, if: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>RC</label>
                    <input type="text" value={formData.rc} onChange={e => setFormData({...formData, rc: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="col-span-2 border-t border-white/5 pt-4 mt-2">
                <h4 className="text-sm font-bold text-primary mb-3">Contact & Localisation</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Ville</label>
                    <input type="text" value={formData.ville} onChange={e => setFormData({...formData, ville: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Adresse</label>
                    <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows="2" />
                  </div>
                </div>
              </div>

              <div className="col-span-2 modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">
                  {editingTier ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          background: #111827;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 24px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          color: #94A3B8;
          margin-bottom: 6px;
        }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 8px 12px;
          color: white;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }
        .badge-client { background: rgba(59, 130, 246, 0.2); color: #3B82F6; }
        .badge-fournisseur { background: rgba(139, 92, 246, 0.2); color: #8B5CF6; }
        .badge-salarie { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .badge-autre { background: rgba(148, 163, 184, 0.2); color: #94A3B8; }
        .btn-icon-small {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #94A3B8;
        }
        .btn-icon-small:hover { background: rgba(255,255,255,0.1); color: white; }
      `}</style>
    </div>
  );
};

export default PlanTiers;
