import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Plus, Search, Filter, Download, Upload, 
  Edit, Trash2, X, Check, Loader2 
} from 'lucide-react';

const JournalsManager = () => {
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'od',
    account_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [journalsRes, accountsRes] = await Promise.all([
        fetch('http://localhost:8000/api/accounting/journals', {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        }),
        fetch('http://localhost:8000/api/accounting/accounts', {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        })
      ]);

      const journalsData = await journalsRes.json();
      const accountsData = await accountsRes.json();
      
      setJournals(Array.isArray(journalsData) ? journalsData : []);
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setJournals([]);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingJournal 
      ? `http://localhost:8000/api/accounting/journals/${editingJournal.id}`
      : 'http://localhost:8000/api/accounting/journals';
    const method = editingJournal ? 'PUT' : 'POST';

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
      console.error('Error saving journal:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce journal ?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8000/api/accounting/journals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Error deleting journal:', err);
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/accounting/journals/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'codes_journaux.xlsx';
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
      const response = await fetch('http://localhost:8000/api/accounting/journals/import', {
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
    setFormData({ code: '', name: '', type: 'od', account_id: '' });
    setEditingJournal(null);
  };

  const openEdit = (journal) => {
    setEditingJournal(journal);
    setFormData({
      code: journal.code,
      name: journal.name,
      type: journal.type || 'od',
      account_id: journal.account_id || ''
    });
    setShowModal(true);
  };

  const getJournalTypeLabel = (type) => {
    const types = {
      achat: 'Achats',
      vente: 'Ventes',
      banque: 'Banque',
      caisse: 'Caisse',
      od: 'Opérations Diverses'
    };
    return types[type] || type;
  };

  return (
    <div className="layout-container">
      <div className="coa-header">
        <div>
          <h1 className="flex items-center gap-3">
            <Book size={28} className="text-secondary" /> Codes Journaux
          </h1>
          <p className="text-muted">Configurez vos journaux comptables et leurs comptes de contrepartie.</p>
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
            <Plus size={20} /> Nouveau Journal
          </button>
        </div>
      </div>

      <div className="glass-panel coa-card mt-6">
        <div className="coa-table-wrapper">
          {loading ? (
            <div className="loading-state">
              <Loader2 className="animate-spin" /> Chargement des journaux...
            </div>
          ) : (
            <table className="coa-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Intitulé du Journal</th>
                  <th>Type</th>
                  <th>Compte de Contrepartie</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(journals) && journals.map(journal => (
                  <tr key={journal.id}>
                    <td className="account-code text-primary font-bold">{journal.code}</td>
                    <td className="account-name">{journal.name}</td>
                    <td>
                      <span className={`badge badge-${journal.type}`}>
                        {getJournalTypeLabel(journal.type)}
                      </span>
                    </td>
                    <td>
                      {journal.account_id ? 
                        `${accounts.find(a => a.id === journal.account_id)?.number || ''} - ${accounts.find(a => a.id === journal.account_id)?.label || ''}` 
                        : 'Aucun'}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-icon-small" onClick={() => openEdit(journal)}>
                          <Edit size={14} />
                        </button>
                        <button className="btn-icon-small text-red-500" onClick={() => handleDelete(journal.id)}>
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
          <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingJournal ? 'Modifier le Journal' : 'Ajouter un Journal'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="modal-body flex flex-col gap-4">
              <div className="form-group">
                <label>Code Journal *</label>
                <input 
                  type="text" 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="ex: ACH"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Intitulé *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Type de Journal *</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="achat">Achats</option>
                  <option value="vente">Ventes</option>
                  <option value="banque">Banque</option>
                  <option value="caisse">Caisse</option>
                  <option value="od">Opérations Diverses</option>
                </select>
              </div>

              {['banque', 'caisse'].includes(formData.type) && (
                <div className="form-group">
                  <label>Compte de Contrepartie (Trésorerie)</label>
                  <select value={formData.account_id} onChange={e => setFormData({...formData, account_id: e.target.value})}>
                    <option value="">Sélectionner un compte...</option>
                    {accounts.filter(a => a.number.startsWith('5')).map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.number} - {acc.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">
                  {editingJournal ? 'Mettre à jour' : 'Enregistrer'}
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
        .form-group input, .form-group select {
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
        .badge-achat { background: rgba(239, 68, 68, 0.2); color: #EF4444; }
        .badge-vente { background: rgba(16, 185, 129, 0.2); color: #10B981; }
        .badge-banque { background: rgba(59, 130, 246, 0.2); color: #3B82F6; }
        .badge-caisse { background: rgba(245, 158, 11, 0.2); color: #F59E0B; }
        .badge-od { background: rgba(148, 163, 184, 0.2); color: #94A3B8; }
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

export default JournalsManager;
