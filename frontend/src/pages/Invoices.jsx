import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  FileText, Plus, Search, Filter, CheckCircle, 
  XCircle, Clock, MoreVertical, Download, Eye,
  Trash2, AlertCircle, Loader2, ArrowUpRight, TrendingUp, DollarSign, X
} from 'lucide-react';

const Invoices = () => {
  const { data, loading, refresh } = useData();
  const [activeTab, setActiveTab] = useState('achat');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [newInvoice, setNewInvoice] = useState({
    type: 'achat',
    numero: '',
    tier_id: '',
    date: new Date().toISOString().split('T')[0],
    echeance: '',
    lines: [{ description: '', quantity: 1, price: 0, tva_rate: 20, discount_rate: 0 }],
    is_manual: false,
    ht: 0,
    tva: 0,
    ttc: 0
  });

  const filteredInvoices = useMemo(() => {
    return data.invoices.filter(f => {
      const matchesTab = f.type === activeTab;
      const matchesSearch = f.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (f.tier?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.invoices, activeTab, searchTerm]);

  const filteredTiers = useMemo(() => {
    const tierType = activeTab === 'achat' ? 'fournisseur' : 'client';
    return data.tiers.filter(t => t.type === tierType);
  }, [data.tiers, activeTab]);

  const totals = useMemo(() => {
    let ht = 0;
    let tva = 0;
    newInvoice.lines.forEach(line => {
      const lineHtBrut = (parseFloat(line.quantity) || 0) * (parseFloat(line.price) || 0);
      const lineHtNet = lineHtBrut * (1 - ((parseFloat(line.discount_rate) || 0) / 100));
      const lineTva = lineHtNet * ((parseFloat(line.tva_rate) || 0) / 100);
      ht += lineHtNet;
      tva += lineTva;
    });
    
    return { 
      ht: newInvoice.is_manual ? parseFloat(newInvoice.ht) || 0 : ht, 
      tva: newInvoice.is_manual ? parseFloat(newInvoice.tva) || 0 : tva, 
      ttc: newInvoice.is_manual ? parseFloat(newInvoice.ttc) || 0 : (ht + tva) 
    };
  }, [newInvoice.lines, newInvoice.is_manual, newInvoice.ht, newInvoice.tva, newInvoice.ttc]);

  const handleLineChange = (index, field, value) => {
    const lines = [...newInvoice.lines];
    lines[index][field] = value;
    setNewInvoice({ ...newInvoice, lines });
  };

  const addLine = () => {
    setNewInvoice({
      ...newInvoice,
      lines: [...newInvoice.lines, { description: '', quantity: 1, price: 0, tva_rate: 20, discount_rate: 0 }]
    });
  };

  const removeLine = (index) => {
    if (newInvoice.lines.length > 1) {
      setNewInvoice({
        ...newInvoice,
        lines: newInvoice.lines.filter((_, i) => i !== index)
      });
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      // Nettoyer les données avant envoi
      const payload = {
        ...newInvoice,
        ht: totals.ht,
        tva: totals.tva,
        ttc: totals.ttc
      };

      const response = await fetch('http://localhost:8000/api/invoices', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setIsModalOpen(false);
        refresh();
        setNewInvoice({
          type: activeTab, numero: '', tier_id: '',
          date: new Date().toISOString().split('T')[0], echeance: '',
          lines: [{ description: '', quantity: 1, price: 0, tva_rate: 20, discount_rate: 0 }],
          is_manual: false, ht: 0, tva: 0, ttc: 0
        });
      } else {
        const err = await response.json();
        setError(err.message || 'Erreur lors de la création');
      }
    } catch (err) { setError(err.message); }
    setSubmitting(false);
  };

  const handleValidate = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'validée' })
      });
      if (response.ok) refresh();
    } catch (err) { console.error(err); }
  };

  const fmt = (n) => Number(n || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 });

  if (loading) return <div className="flex items-center justify-center h-[400px]"><div className="loader"></div></div>;

  return (
    <div className="fade-in">
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Gestion Facturation</h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>Suivi des engagements tiers et automatisation comptable.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" onClick={() => setActiveTab(activeTab === 'achat' ? 'vente' : 'achat')}>
             Basculer vers {activeTab === 'achat' ? 'Ventes' : 'Achats'}
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Nouvelle facture
          </button>
        </div>
      </div>

      <div className="grid g3" style={{ marginBottom: '32px' }}>
         <div className="kpi-jewel">
            <div className="kpi-label">Volume {activeTab === 'achat' ? 'Engagé' : 'Réalisé'}</div>
            <div className="kpi-value">{fmt(filteredInvoices.reduce((s,f) => s + f.ttc, 0))} <span style={{fontSize:14}}>MAD</span></div>
            <div className="kpi-trend trend-up">
                <TrendingUp size={14}/> +8% ce mois
            </div>
         </div>
         <div className="kpi-jewel" style={{ borderLeft: '4px solid var(--accent)' }}>
            <div className="kpi-label">Factures non validées</div>
            <div className="kpi-value">{filteredInvoices.filter(f => f.statut === 'en_attente').length}</div>
            <div className="kpi-trend text-muted">Axe de vigilance</div>
         </div>
         <div className="kpi-jewel">
            <div className="kpi-label">Encours {activeTab === 'achat' ? 'Fournisseurs' : 'Clients'}</div>
            <div className="kpi-value">{fmt(filteredInvoices.filter(f => f.statut === 'validée').reduce((s,f) => s + f.ttc, 0))} <span style={{fontSize:14}}>MAD</span></div>
            <div className="kpi-trend text-muted"><DollarSign size={14}/> Validé en compte</div>
         </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
         <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex gap-4">
                <button 
                  className={`btn btn-xs ${activeTab === 'achat' ? 'btn-dark' : 'btn-outline'}`}
                  style={{ borderRadius: 100, padding: '6px 16px' }}
                  onClick={() => setActiveTab('achat')}
                >Achats</button>
                <button 
                  className={`btn btn-xs ${activeTab === 'vente' ? 'btn-dark' : 'btn-outline'}`}
                  style={{ borderRadius: 100, padding: '6px 16px' }}
                  onClick={() => setActiveTab('vente')}
                >Ventes</button>
            </div>
            <div style={{ position: 'relative', width: 280 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                  className="form-input" 
                  style={{ paddingLeft: 36, borderRadius: 100, height: 36, fontSize: 13 }}
                  placeholder="Référence ou tiers..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
         </div>

         <div className="table-premium-responsive">
            <table className="tbl-premium">
              <thead>
                <tr>
                  <th>RÉFÉRENCE</th>
                  <th>PARTENAIRE</th>
                  <th>DATE</th>
                  <th style={{ textAlign: 'right' }}>BASE H.T.</th>
                  <th style={{ textAlign: 'right' }}>TOTAL T.T.C</th>
                  <th style={{ textAlign: 'center' }}>STATUT</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td className="premium-font" style={{ fontWeight: 800, color: 'var(--secondary)' }}>{invoice.numero}</td>
                    <td style={{ fontWeight: 600 }}>{invoice.tier?.name || 'N/A'}</td>
                    <td className="text-muted" style={{ fontSize: 12 }}>{new Date(invoice.date).toLocaleDateString('fr-MA')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(invoice.ht)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>{fmt(invoice.ttc)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${invoice.statut === 'validée' ? 'badge-success' : 'badge-warning'}`}>
                        {invoice.statut}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex justify-end gap-2">
                        {invoice.statut === 'en_attente' && (
                          <button className="btn btn-primary btn-xs" onClick={() => handleValidate(invoice.id)}>Valider</button>
                        )}
                        <button className="tb-icon-btn" style={{ width: 30, height: 30 }}><Eye size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr><td colSpan="7" style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>Aucune pièce trouvée</td></tr>
                )}
              </tbody>
            </table>
         </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay-premium" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card-premium" style={{ width: '100%', maxWidth: 1100 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)' }}>
              <div className="modal-title" style={{ fontSize: 20, fontWeight: 800 }}>
                <FileText size={24} className="text-secondary" />
                <span className="ml-2">Facturation {activeTab === 'achat' ? 'Entrante (Achat)' : 'Sortante (Vente)'}</span>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content-wrapper">
              <div className="modal-scrollable">
                {error && <div className="alert alert-red mb-6">{error}</div>}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Référence Facture</label>
                    <input className="premium-input" placeholder="FA-2024-XXX" value={newInvoice.numero} onChange={e => setNewInvoice({...newInvoice, numero: e.target.value})} />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">{activeTab === 'achat' ? 'Source Fournisseur' : 'Client Cible'}</label>
                    <select className="premium-input" value={newInvoice.tier_id} onChange={e => setNewInvoice({...newInvoice, tier_id: e.target.value})}>
                      <option value="">Sélectionner...</option>
                      {filteredTiers.map(t => <option key={t.id} value={t.id}>{t.code} - {t.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="premium-form-group">
                      <label className="premium-label">Date</label>
                      <input type="date" className="premium-input" value={newInvoice.date} onChange={e => setNewInvoice({...newInvoice, date: e.target.value})} />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Echéance</label>
                      <input type="date" className="premium-input" value={newInvoice.echeance} onChange={e => setNewInvoice({...newInvoice, echeance: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden', borderStyle: 'solid', borderColor: 'var(--border-light)' }}>
                  <div className="table-premium-responsive" style={{ border: 'none' }}>
                    <table className="tbl-premium">
                      <thead>
                        <tr style={{ background: 'var(--surface-mut)' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }} width="35%">Description</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }} width="8%">Qté</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }} width="12%">P.U. HT</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }} width="10%">Remise %</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }} width="10%">TVA %</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }} width="15%">Total HT</th>
                          <th width="5%"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {newInvoice.lines.map((line, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '8px 16px' }}>
                              <input className="premium-input" style={{ padding: '6px 10px', fontSize: 12 }} placeholder="Désignation..." value={line.description} onChange={e => handleLineChange(idx, 'description', e.target.value)} />
                            </td>
                            <td style={{ padding: '8px 8px' }}>
                              <input type="number" className="premium-input text-center" style={{ padding: '6px 5px', fontSize: 12 }} value={line.quantity} onChange={e => handleLineChange(idx, 'quantity', e.target.value)} />
                            </td>
                            <td style={{ padding: '8px 8px' }}>
                              <input type="number" className="premium-input text-right" style={{ padding: '6px 10px', fontSize: 12 }} value={line.price} onChange={e => handleLineChange(idx, 'price', e.target.value)} />
                            </td>
                            <td style={{ padding: '8px 8px' }}>
                              <input type="number" className="premium-input text-center" style={{ padding: '6px 5px', fontSize: 12, color: 'var(--accent)' }} placeholder="0" value={line.discount_rate} onChange={e => handleLineChange(idx, 'discount_rate', e.target.value)} />
                            </td>
                            <td style={{ padding: '8px 8px' }}>
                              <input type="number" className="premium-input text-center" style={{ padding: '6px 5px', fontSize: 12, color: 'var(--primary)' }} placeholder="20" value={line.tva_rate} onChange={e => handleLineChange(idx, 'tva_rate', e.target.value)} />
                            </td>
                            <td style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 700, fontSize: 12 }}>
                              {fmt((line.quantity * line.price) * (1 - (line.discount_rate / 100)))}
                            </td>
                            <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                              <button onClick={() => removeLine(idx)} className="tb-icon-btn" style={{ width: 24, height: 24, border: 'none', background: 'var(--danger-glow)', color: 'var(--danger)' }}><X size={12}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <button className="btn btn-outline btn-xs" onClick={addLine}>+ Ajouter un article</button>
                  </div>
                </div>
              </div>

              <div className="side-info-panel">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="premium-label" style={{ margin: 0 }}>Récapitulatif</h4>
                    <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                      <input type="checkbox" checked={newInvoice.is_manual} onChange={e => {
                        const isManual = e.target.checked;
                        if (isManual) {
                          // Initialize manual values with current calculated ones
                          setNewInvoice({ ...newInvoice, is_manual: isManual, ht: totals.ht, tva: totals.tva, ttc: totals.ttc });
                        } else {
                          setNewInvoice({ ...newInvoice, is_manual: isManual });
                        }
                      }} />
                      Correction Manuelle
                    </label>
                  </div>

                  <div className="flex-c gap-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted">Total H.T.</span>
                      {newInvoice.is_manual ? (
                        <input type="number" className="premium-input text-right" style={{ width: 100, padding: '4px 8px', fontSize: 12 }} value={newInvoice.ht} onChange={e => setNewInvoice({...newInvoice, ht: e.target.value})} />
                      ) : (
                        <span style={{ fontWeight: 700 }}>{fmt(totals.ht)} MAD</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted">Total TVA</span>
                      {newInvoice.is_manual ? (
                        <input type="number" className="premium-input text-right" style={{ width: 100, padding: '4px 8px', fontSize: 12 }} value={newInvoice.tva} onChange={e => setNewInvoice({...newInvoice, tva: e.target.value})} />
                      ) : (
                        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmt(totals.tva)} MAD</span>
                      )}
                    </div>
                    <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0' }} />
                    <div className="flex justify-between items-center">
                      <span className="premium-label" style={{ margin: 0 }}>Total T.T.C</span>
                      {newInvoice.is_manual ? (
                        <input type="number" className="premium-input text-right" style={{ width: 140, padding: '8px 12px', fontSize: 16, fontWeight: 900, color: 'var(--primary)' }} value={newInvoice.ttc} onChange={e => setNewInvoice({...newInvoice, ttc: e.target.value})} />
                      ) : (
                        <span style={{ fontWeight: 900, fontSize: 22, color: 'var(--primary)' }}>{fmt(totals.ttc)} MAD</span>
                      )}
                    </div>
                  </div>
                </div>

                {newInvoice.tier_id && (
                  <div className="card glass-panel" style={{ padding: '16px', background: 'var(--secondary-glow)' }}>
                    <h4 className="premium-label" style={{ marginBottom: 8 }}>Info {activeTab === 'achat' ? 'Fournisseur' : 'Client'}</h4>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{data.tiers.find(t => t.id.toString() === newInvoice.tier_id.toString())?.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>ID: {newInvoice.tier_id}</div>
                  </div>
                )}

                <div className="mt-auto flex-c gap-3">
                  <button className="btn btn-primary w-full" style={{ height: 48 }} onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <Loader2 size={20} className="animate-spin" /> : <ArrowUpRight size={20}/>}
                    <span className="ml-2">{submitting ? 'Validation...' : 'Valider la pièce'}</span>
                  </button>
                  <button className="btn btn-outline w-full" onClick={() => setIsModalOpen(false)}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
