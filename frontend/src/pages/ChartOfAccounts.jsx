import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Search, Filter, ArrowLeft, Loader2, Sparkles, Building, CheckCircle2, X } from 'lucide-react';
import { useData } from '../context/DataContext';

const ChartOfAccounts = () => {
  const { data, loading, refresh } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ number: '', label: '' });
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('http://localhost:8000/api/accounting/accounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ number: '', label: '' });
        refresh();
      }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const filteredAccounts = (data.accounts || []).filter(account => {
    const matchesSearch = (account.number || '').includes(searchTerm) || (account.label || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'All' || account.number.startsWith(filterClass);
    return matchesSearch && matchesClass;
  });

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <button className="btn btn-outline btn-xs" onClick={() => navigate('/dashboard')} style={{ marginBottom: '12px', borderRadius: 100 }}>
             <ArrowLeft size={14} style={{marginRight: '6px'}} /> Dashboard
          </button>
          <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Référentiel P.C.M</h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>Plan Comptable Marocain (Norme 2024). Gestion des classes et rubriques.</p>
        </div>
        <div className="flex gap-2">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={18} /> Nouveau Compte
            </button>
        </div>
      </div>

      {/* ── Premium Modal ── */}
      {showModal && (
        <div className="modal-overlay-premium" onClick={() => setShowModal(false)}>
          <div className="modal-card-premium" style={{ width: '100%', maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)' }}>
              <div className="modal-title" style={{ fontSize: 20, fontWeight: 800 }}>
                <Sparkles size={24} className="text-primary" />
                <span className="ml-2">Nouveau Compte PCM</span>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content-wrapper" style={{ gridTemplateColumns: '1fr 240px' }}>
              <div className="modal-scrollable">
                <form onSubmit={handleSave}>
                  <div className="premium-form-group mb-6">
                    <label className="premium-label">Numéro de Compte *</label>
                    <input className="premium-input" placeholder="ex: 6111" required value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
                    <p className="text-muted" style={{ fontSize: 10, marginTop: 4 }}>Format numérique (4 à 8 chiffres recommandés).</p>
                  </div>
                  <div className="premium-form-group mb-6">
                    <label className="premium-label">Intitulé du Compte *</label>
                    <input className="premium-input" placeholder="ex: Achats de marchandises" required value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} />
                  </div>
                </form>
              </div>

              <div className="side-info-panel" style={{ padding: '24px 20px' }}>
                <div>
                  <h4 className="premium-label" style={{ marginBottom: 12 }}>Règle de Classe</h4>
                  <div className="card glass-panel" style={{ padding: '12px', background: 'var(--primary-glow)', border: 'none' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                      {formData.number[0] === '6' && "Classe 6 : Charges d'exploitation. Impacte le résultat en diminuant le bénéfice."}
                      {formData.number[0] === '7' && "Classe 7 : Produits d'exploitation. Augmente le bénéfice et le CA."}
                      {formData.number[0] === '1' && "Classe 1 : Financement permanent (Capitaux propres, dettes long terme)."}
                      {formData.number[0] === '2' && "Classe 2 : Actif immobilisé (Investissements durable)."}
                      {formData.number[0] === '3' && "Classe 3 : Actif circulant (Stocks, créances clients)."}
                      {formData.number[0] === '4' && "Classe 4 : Passif circulant (Dettes fournisseurs/sociales)."}
                      {formData.number[0] === '5' && "Classe 5 : Trésorerie (Banque, Caisse)."}
                      {!formData.number && "Saisissez un numéro pour voir l'aide au classement."}
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex-c gap-3">
                  <button className="btn btn-primary w-full" style={{ height: 48 }} onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    <span className="ml-2">Créer le Compte</span>
                  </button>
                  <button className="btn btn-outline w-full" onClick={() => setShowModal(false)}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid g4" style={{ marginBottom: '32px' }}>
         <div className="kpi-jewel">
            <div className="kpi-label">Comptes de Bilan</div>
            <div className="kpi-value">{(data.accounts || []).filter(a=>['1','2','3','4','5'].includes(a.number?.[0])).length}</div>
            <div className="kpi-trend text-muted">Classes 1 à 5</div>
         </div>
         <div className="kpi-jewel">
            <div className="kpi-label">Comptes de Gestion</div>
            <div className="kpi-value">{(data.accounts || []).filter(a=>['6','7'].includes(a.number?.[0])).length}</div>
            <div className="kpi-trend text-muted">Classes 6 & 7</div>
         </div>
         <div className="kpi-jewel">
            <div className="kpi-label">Comptes Spéciaux</div>
            <div className="kpi-value">{(data.accounts || []).filter(a=>a.number?.startsWith('8')).length}</div>
            <div className="kpi-trend text-muted">Classe 8 (Résultats)</div>
         </div>
         <div className="kpi-jewel" style={{ borderLeft: '4px solid var(--primary)' }}>
            <div className="kpi-label">Total Référentiel</div>
            <div className="kpi-value">{(data.accounts || []).length}</div>
            <div className="kpi-trend trend-up"><CheckCircle2 size={14}/> Base de données à jour</div>
         </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div className="flex gap-2 mb-2 sm:mb-0">
                <select 
                    className="form-select" 
                    style={{ height: 36, fontSize: 13, borderRadius: 100, padding: '0 20px', width: 220 }}
                    value={filterClass} 
                    onChange={(e) => setFilterClass(e.target.value)}
                >
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
            <div style={{ position: 'relative', width: 400 }}>
                <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                    className="form-input" 
                    style={{ paddingLeft: 40, borderRadius: 100, height: 38 }}
                    placeholder="Chercher un compte (ex: 6111 ou Achats)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="tbl-container" style={{ borderRadius: 0, border: 'none' }}>
            {loading ? (
                <div style={{ padding: 60, textAlign: 'center' }}><Loader2 className="animate-spin mx-auto text-primary" /></div>
            ) : (
                <table className="tbl">
                    <thead>
                        <tr>
                            <th width="12%">N° COMPTE</th>
                            <th>INTITULÉ (NOM DU COMPTE)</th>
                            <th>CLASSE NATURE</th>
                            <th>STATUT</th>
                            <th style={{ textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAccounts.length > 0 ? (
                            filteredAccounts.map(account => (
                                <tr key={account.id}>
                                    <td style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px' }}>{account.number}</td>
                                    <td style={{ fontWeight: 600 }}>{account.label || account.name}</td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--class-${account.number?.[0]})` || 'var(--primary)' }}></div>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)' }}>Classe {account.number?.[0]}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-success" style={{ fontSize: 10 }}>Certifié PCM</span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="tb-icon-btn"><Search size={14} /></button>
                                        <button className="tb-icon-btn" style={{ marginLeft: 8 }}><Plus size={14} /></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ padding: 100, textAlign: 'center', color: 'var(--text-dim)' }}>Aucun compte ne correspond à votre recherche.</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChartOfAccounts;
