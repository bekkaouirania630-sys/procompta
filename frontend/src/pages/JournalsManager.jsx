import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, Plus, Search, Filter, Download, Upload, 
  Edit, Trash2, X, Check, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';

const API = 'http://localhost:8000/api';

const JournalsManager = () => {
  const { data, loading, refresh } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    code: '', name: '', type: 'od', account_id: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    const url = editingJournal 
      ? `${API}/accounting/journals/${editingJournal.id}`
      : `${API}/accounting/journals`;
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
        refresh();
        resetForm();
      }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression de ce journal ?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API}/accounting/journals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      refresh();
    } catch (err) { console.error(err); }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    const token = localStorage.getItem('token');
    const formDataBody = new FormData();
    formDataBody.append('file', file);

    try {
      const response = await fetch(`${API}/accounting/journals/import`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataBody
      });
      if (response.ok) refresh();
    } catch (err) { console.error(err); }
    setImporting(false);
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

  const getJournalTypeStyle = (type) => {
    switch(type) {
      case 'achat': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' };
      case 'vente': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' };
      case 'banque': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' };
      default: return { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-dim)' };
    }
  };

  return (
    <div className="fade-in">
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Référentiel des Journaux</h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>Structurez vos divisions comptables pour une organisation optimale des écritures.</p>
        </div>
        <div className="flex gap-2">
            <button className="btn btn-outline" onClick={() => fileInputRef.current.click()}>
                <Upload size={18} /> {importing ? 'Importation...' : 'Importer Plan'}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImport} hidden accept=".xlsx,.xls,.csv" />
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                <Plus size={18} /> Nouveau Journal
            </button>
        </div>
      </div>

      <div className="grid g3" style={{ marginBottom: '40px' }}>
         <div className="kpi-jewel">
            <div className="kpi-label">Jouraux Trésorerie</div>
            <div className="kpi-value">{(data.journals || []).filter(j=>['banque', 'caisse'].includes(j.type)).length}</div>
            <div className="kpi-trend text-muted">Comptes de classe 5</div>
         </div>
         <div className="kpi-jewel">
            <div className="kpi-label">Jouraux Exploitation</div>
            <div className="kpi-value">{(data.journals || []).filter(j=>['achat', 'vente'].includes(j.type)).length}</div>
            <div className="kpi-trend text-muted">Flux de production</div>
         </div>
         <div className="kpi-jewel" style={{ borderLeft: '4px solid var(--accent)' }}>
            <div className="kpi-label">Total Divisions</div>
            <div className="kpi-value">{(data.journals || []).length}</div>
            <div className="kpi-trend text-muted">Jouraux centralisateurs</div>
         </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Book size={18} className="text-secondary" />
            <h3 className="premium-font" style={{ fontWeight: 800 }}>Dossier des Codes Journaux</h3>
        </div>
        <div className="tbl-container" style={{ borderRadius: 0, border: 'none' }}>
            {loading ? (
                <div style={{ padding: 60, textAlign: 'center' }}><Loader2 className="animate-spin mx-auto text-primary" /></div>
            ) : (
                <table className="tbl">
                    <thead>
                        <tr>
                            <th width="15%">CODE</th>
                            <th>INTITULÉ DU JOURNAL</th>
                            <th>TYPE / NATURE</th>
                            <th>COMPTE DE CONTREPARTIE</th>
                            <th style={{ textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data.journals || []).map(journal => {
                            const style = getJournalTypeStyle(journal.type);
                            return (
                                <tr key={journal.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="tb-avatar" style={{ background: style.bg, color: style.color, borderRadius: '8px', fontSize: '10px', width: 32, height: 32 }}>
                                                {journal.code.slice(0, 2)}
                                            </div>
                                            <span style={{ fontWeight: 800 }}>{journal.code}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{journal.name}</td>
                                    <td>
                                        <span className={`badge ${['achat','vente'].includes(journal.type)?'badge-success':'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
                                            {journal.type}
                                        </span>
                                    </td>
                                    <td>
                                        {journal.account ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-secondary font-bold" style={{ fontSize: 13 }}>{journal.account.number}</span>
                                                <span className="text-muted" style={{ fontSize: 11 }}>— {journal.account.label}</span>
                                            </div>
                                        ) : <span className="text-muted">—</span>}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="flex justify-end gap-2">
                                            <button className="tb-icon-btn" onClick={() => openEdit(journal)}><Edit size={14} /></button>
                                            <button className="tb-icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(journal.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay-premium" onClick={() => setShowModal(false)}>
          <div className="modal-card-premium" style={{ width: '100%', maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)' }}>
              <div className="modal-title" style={{ fontSize: 20, fontWeight: 800 }}>
                <Sparkles size={24} className="text-primary" />
                <span className="ml-2">{editingJournal ? 'Configuration du Journal' : 'Nouveau Code Journal'}</span>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content-wrapper" style={{ gridTemplateColumns: '1fr 280px' }}>
              <div className="modal-scrollable">
                <form onSubmit={handleSave}>
                  <div className="premium-form-group mb-6">
                    <label className="premium-label">Code Journal *</label>
                    <input className="premium-input" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="ex: BQ01" required />
                    <p className="text-muted" style={{ fontSize: 10, marginTop: 4 }}>Identifiant unique pour les saisies (3 à 6 caractères).</p>
                  </div>
                  <div className="premium-form-group mb-6">
                    <label className="premium-label">Nom du Journal *</label>
                    <input className="premium-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="premium-form-group mb-6">
                    <label className="premium-label">Type / Nature comptable *</label>
                    <select className="premium-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="achat">Journal d'Achats</option>
                      <option value="vente">Journal de Ventes</option>
                      <option value="banque">Banque / Trésorerie</option>
                      <option value="caisse">Caisse</option>
                      <option value="od">Opérations Diverses (OD)</option>
                    </select>
                  </div>

                  {['banque', 'caisse'].includes(formData.type) && (
                    <div className="premium-form-group mb-6 p-4 rounded-xl border border-white/5" style={{ background: 'var(--surface-mut)' }}>
                       <label className="premium-label flex items-center gap-2">
                          <AlertCircle size={14} className="text-secondary"/> Contrepartie automatique
                       </label>
                       <select className="premium-input mt-2" value={formData.account_id} onChange={e => setFormData({...formData, account_id: e.target.value})}>
                          <option value="">Lancer la recherche...</option>
                          {data.accounts.filter(a => a.number.startsWith('5')).map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.number} - {acc.label}</option>
                          ))}
                       </select>
                    </div>
                  )}
                </form>
              </div>

              <div className="side-info-panel" style={{ padding: '24px 20px' }}>
                <div>
                  <h4 className="premium-label" style={{ marginBottom: 12 }}>Aide contextuelle</h4>
                  <div className="card glass-panel" style={{ padding: '12px', background: 'var(--primary-glow)', border: 'none' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                      {formData.type === 'achat' && "Utilisé pour enregistrer les factures fournisseurs et avoirs d'achats."}
                      {formData.type === 'vente' && "Utilisé pour enregistrer les factures clients et avoirs de ventes."}
                      {formData.type === 'banque' && "Nécessite un compte de classe 5 (5141...) pour la contrepartie auto."}
                      {formData.type === 'caisse' && "Utilisé pour les flux de numéraire. Contrepartie compte 5161."}
                      {formData.type === 'od' && "Pour les écritures d'inventaire, de paie ou de régularisation."}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex-c gap-3">
                  <button className="btn btn-primary w-full" style={{ height: 48 }} onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    <span className="ml-2">Enregistrer</span>
                  </button>
                  <button className="btn btn-outline w-full" onClick={() => setShowModal(false)}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalsManager;
