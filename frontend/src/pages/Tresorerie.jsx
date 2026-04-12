import React, { useState, useEffect, useRef } from 'react';
import {
  Landmark, ArrowUpRight, ArrowDownRight,
  History, Wallet, Download, Plus, Upload,
  X, CheckCircle, Clock, Building2, RefreshCw,
  AlertCircle, Loader2, Banknote, ShieldCheck, Info, FileCheck,
  Zap, Search, Filter, ArrowRight, Sparkles, Wand2, CreditCard
} from 'lucide-react';
import { useData } from '../context/DataContext';

const API = 'http://localhost:8000/api';
const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Accept': 'application/json',
});

const fmt = (n) => parseFloat(n || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 });

export default function Tresorerie() {
  const { refresh } = useData();
  const [summary, setSummary]           = useState(null);
  const [accounts, setAccounts]         = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [txLoading, setTxLoading]       = useState(false);

  // Reconciliation States
  const [isReconciling, setIsReconciling] = useState(false);
  const [matchingTx, setMatchingTx]       = useState(null);
  const [suggestions, setSuggestions]     = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [autoMatching, setAutoMatching]   = useState(false);

  // Modals
  const [showAddAccount, setShowAddAccount]   = useState(false);
  const [showAddTx, setShowAddTx]             = useState(false);
  const [showImportCsv, setShowImportCsv]     = useState(false);
  const [csvFile, setCsvFile]                 = useState(null);
  const [importing, setImporting]             = useState(false);
  const fileInputRef = useRef(null);

  const [newAccount, setNewAccount] = useState({
    name: '', bank_name: '', account_number: '', rib: '',
    opening_balance: 0, currency: 'MAD', type: 'banque'
  });
  const [newTx, setNewTx] = useState({
    bank_account_id: '', date: new Date().toISOString().slice(0,10),
    label: '', debit: '', credit: '', reference: ''
  });

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API}/bank-accounts/summary`, { headers: getHeaders() });
      const data = await res.json();
      setSummary(data);
      setAccounts(data.accounts || []);
      if (!selectedAccount && data.accounts?.length > 0) {
        setSelectedAccount(data.accounts[0]);
      }
    } catch (e) { console.error(e); }
  };

  const fetchTransactions = async (accountId) => {
    if (!accountId) return;
    setTxLoading(true);
    try {
      const res = await fetch(`${API}/bank-accounts/${accountId}/transactions`, { headers: getHeaders() });
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setTxLoading(false);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchSummary();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (selectedAccount) fetchTransactions(selectedAccount.id);
  }, [selectedAccount]);

  const handleReconcile = async (tx) => {
    if (isReconciling) {
        setMatchingTx(tx);
        fetchSuggestions(tx.id);
        return;
    }
    // Legacy simple toggle if not in advanced mode
    await fetch(`${API}/bank-transactions/${tx.id}/reconcile`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    fetchTransactions(selectedAccount.id);
    refresh();
  };

  const fetchSuggestions = async (txId) => {
      setSuggestLoading(true);
      try {
          const res = await fetch(`${API}/bank-reconciliation/suggestions/${txId}`, { headers: getHeaders() });
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); }
      setSuggestLoading(false);
  };

  const handleLink = async (lineId) => {
      if (!matchingTx) return;
      const res = await fetch(`${API}/bank-reconciliation/link`, {
          method: 'POST',
          headers: { ...getHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
              bank_transaction_id: matchingTx.id,
              entry_line_ids: [lineId]
          })
      });
      if (res.ok) {
          setMatchingTx(null);
          setSuggestions([]);
          fetchTransactions(selectedAccount.id);
          fetchSummary();
          refresh();
      }
  };

  const handleAutoMatch = async () => {
      if (!selectedAccount) return;
      setAutoMatching(true);
      try {
          const res = await fetch(`${API}/bank-reconciliation/auto-match`, {
              method: 'POST',
              headers: { ...getHeaders(), 'Content-Type': 'application/json' },
              body: JSON.stringify({ bank_account_id: selectedAccount.id })
          });
          const data = await res.json();
          alert(data.message);
          fetchTransactions(selectedAccount.id);
          fetchSummary();
          refresh();
      } catch (e) { console.error(e); }
      setAutoMatching(false);
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/bank-accounts`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(newAccount),
    });
    if (res.ok) {
      setShowAddAccount(false);
      setNewAccount({ name:'', bank_name:'', account_number:'', rib:'', opening_balance:0, currency:'MAD', type:'banque' });
      fetchSummary();
      refresh();
    }
  };

  const handleAddTx = async (e) => {
    e.preventDefault();
    const body = { ...newTx, bank_account_id: selectedAccount?.id };
    const res = await fetch(`${API}/bank-transactions`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setShowAddTx(false);
      setNewTx({ bank_account_id:'', date: new Date().toISOString().slice(0,10), label:'', debit:'', credit:'', reference:'' });
      fetchTransactions(selectedAccount.id);
      fetchSummary();
      refresh();
    }
  };

  const handleImportCsv = async (e) => {
    e.preventDefault();
    if (!csvFile || !selectedAccount) return;
    setImporting(true);
    const form = new FormData();
    form.append('file', csvFile);
    form.append('bank_account_id', selectedAccount.id);
    const res = await fetch(`${API}/bank-transactions/import-csv`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: form,
    });
    setImporting(false);
    if (res.ok) {
        setShowImportCsv(false);
        setCsvFile(null);
        fetchTransactions(selectedAccount.id);
        fetchSummary();
        refresh();
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="loader"></div></div>;

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Gestion de Trésorerie</h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>Contrôle des flux financiers et rapprochement bancaire intelligent.</p>
        </div>
        <div className="flex gap-3">
          <button className={`btn ${isReconciling ? 'btn-primary shadow-lg shadow-primary/20' : 'btn-outline'}`} onClick={() => setIsReconciling(!isReconciling)}>
            <ShieldCheck size={16} /> {isReconciling ? 'Mode Rapprochement Actif' : 'Activer le Rapprochement'}
          </button>
          <button className="btn btn-outline" onClick={() => setShowImportCsv(true)}>
            <Upload size={16} /> Importer Relevé
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddAccount(true)}>
            <Plus size={16} /> Ajouter un compte
          </button>
        </div>
      </div>

      {/* ── KPI Jewels ── */}
      <div className="grid g3" style={{ marginBottom: '32px' }}>
        <div className="kpi-jewel">
          <div className="kpi-label">Disponibilités Totales</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{fmt(summary?.total_banque)} MAD</div>
          <div className="kpi-trend text-muted">
            <Landmark size={14}/> {accounts.length} comptes actifs
          </div>
        </div>

        <div className="kpi-jewel">
          <div className="kpi-label">Rapprochement Global</div>
          <div className="kpi-value">
            {transactions.length > 0 ? Math.round((transactions.filter(t=>t.is_reconciled).length / transactions.length) * 100) : 0}%
          </div>
          <div className="kpi-trend text-muted">
            <CheckCircle size={14}/> {transactions.filter(t=>t.is_reconciled).length} / {transactions.length} lignes
          </div>
        </div>

        <div className="kpi-jewel">
          <div className="kpi-label">Décaissements / Mois</div>
          <div className="kpi-value">{fmt(summary?.decaissements)} MAD</div>
          <div className="kpi-trend trend-down">
            <ArrowDownRight size={14}/> Flux sortant maîtrisé
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* mes comptes & caisses */}
        <div className={`col-span-12 ${matchingTx ? 'lg:col-span-3' : 'lg:col-span-3'} flex flex-col gap-4`}>
            <h3 className="premium-font" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Mes Comptes & Caisses</h3>
            <div className="flex flex-col gap-3">
              {accounts.map(acc => (
                  <div 
                      key={acc.id}
                      onClick={() => setSelectedAccount(acc)}
                      className={`card transition-all duration-300 ${selectedAccount?.id === acc.id ? 'ring-2 ring-primary/20 shadow-lg shadow-primary/10' : 'hover:border-primary/30'}`}
                      style={{ 
                          cursor: 'pointer', 
                          padding: '16px 20px',
                          borderLeft: selectedAccount?.id === acc.id ? '4px solid var(--primary)' : '1px solid var(--border-light)',
                          background: selectedAccount?.id === acc.id ? 'var(--primary-glow)' : '#fff'
                      }}
                  >
                      <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col gap-1">
                              <span className="premium-font" style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)' }}>{acc.name}</span>
                              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase' }}>{acc.bank_name || 'Caisse Centrale'}</span>
                          </div>
                          <div style={{ color: acc.type === 'banque' ? 'var(--primary)' : 'var(--accent)' }}>
                              {acc.type === 'banque' ? <Landmark size={18}/> : <Banknote size={18}/>}
                          </div>
                      </div>
                      <div className="num-font" style={{ fontSize: '18px', fontWeight: 800, color: acc.current_balance >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {fmt(acc.current_balance)} <span style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-dim)' }}>{acc.currency}</span>
                      </div>
                  </div>
              ))}
            </div>
            
            <button className="btn btn-outline w-full py-3" onClick={() => setShowAddAccount(true)}>
                <Plus size={16}/> Nouveau Compte
            </button>
        </div>

        {/* flux bancaire (transactions) */}
        <div className={`col-span-12 ${matchingTx ? 'lg:col-span-5' : 'lg:col-span-9'}`}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header separate from Scrollable Table */}
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-mut)' }}>
                    <div>
                        <h3 className="premium-font" style={{ margin: 0, fontSize: '18px' }}>Flux Bancaire {isReconciling && <span className="badge badge-primary ml-2">Assistant IA</span>}</h3>
                        <p className="text-muted" style={{ fontSize: '12px', fontWeight: 500 }}>{selectedAccount?.name} — {selectedAccount?.account_number}</p>
                    </div>
                    <div className="flex gap-2">
                        {isReconciling && (
                            <button className="btn btn-primary btn-xs px-3" onClick={handleAutoMatch} disabled={autoMatching}>
                                {autoMatching ? <Loader2 size={12} className="animate-spin"/> : <Wand2 size={12}/>} Matching Auto
                            </button>
                        )}
                        <button className="btn btn-outline btn-xs" onClick={() => setShowAddTx(true)}>+ Ajouter</button>
                        <button className="btn btn-outline btn-xs" onClick={() => fetchTransactions(selectedAccount?.id)} disabled={txLoading}>
                            {txLoading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12}/>}
                        </button>
                    </div>
                </div>

                {/* Table Content Area */}
                <div className="table-premium-responsive" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
                    <table className="tbl-premium">
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr>
                                <th>Date</th>
                                <th>Libellé / Opération</th>
                                <th>Référence</th>
                                <th style={{ textAlign: 'right' }}>Débit (-)</th>
                                <th style={{ textAlign: 'right' }}>Crédit (+)</th>
                                <th style={{ textAlign: 'center' }}>Lettrage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {txLoading && <tr><td colSpan="6" style={{ padding: 60, textAlign: 'center' }}><Loader2 className="animate-spin mx-auto text-primary" size={32}/></td></tr>}
                            {!txLoading && transactions.length === 0 && (
                                <tr><td colSpan="6" style={{ padding: 80, textAlign: 'center' }} className="text-muted">
                                    <div className="opacity-20 mb-4"><CreditCard size={48} className="mx-auto" /></div>
                                    <div className="premium-font font-bold">Aucun mouvement détecté</div>
                                    <div className="text-xs uppercase tracking-widest mt-1">Sélectionnez un autre compte ou importez un relevé</div>
                                </td></tr>
                            )}
                            {transactions.map(tx => (
                                <tr 
                                  key={tx.id} 
                                  onClick={() => isReconciling && handleReconcile(tx)}
                                  className={`transition-colors ${matchingTx?.id === tx.id ? 'bg-primary-glow/50' : ''}`}
                                  style={{ 
                                    cursor: isReconciling ? 'pointer' : 'default',
                                    opacity: matchingTx && matchingTx.id !== tx.id ? 0.3 : 1
                                  }}
                                >
                                    <td className="num-font" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{new Date(tx.date).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{tx.label}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Manuel • PIÈCE N-001</div>
                                    </td>
                                    <td className="num-font" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{tx.reference || '—'}</td>
                                    <td className="num-font" style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 800 }}>{tx.debit > 0 ? fmt(tx.debit) : '—'}</td>
                                    <td className="num-font" style={{ textAlign: 'right', color: 'var(--primary)', fontWeight: 800 }}>{tx.credit > 0 ? fmt(tx.credit) : '—'}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {tx.is_reconciled ? (
                                            <div className="flex items-center justify-center text-success"><ShieldCheck size={16}/></div>
                                        ) : (
                                            <span className="badge badge-gray opacity-50">Pending</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* matching results / suggestions box (4 columns) */}
        {matchingTx && (
            <div className="col-span-12 lg:col-span-4 fade-in">
                <div className="card glass-panel h-full" style={{ borderColor: 'var(--primary)', background: 'var(--surface-real)' }}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20"><Sparkles size={24}/></div>
                            <div>
                                <h3 className="premium-font" style={{ margin: 0, fontSize: '16px' }}>Matching Assisté</h3>
                                <p className="text-muted" style={{ fontSize: '11px' }}>Algorithme de rapprochement</p>
                            </div>
                        </div>
                        <button className="tb-icon-btn" onClick={() => setMatchingTx(null)}><X size={18}/></button>
                    </div>

                    <div className="p-5 rounded-2xl border border-primary/20 bg-primary-glow/30 mb-8">
                        <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2" style={{ opacity: 0.6 }}>Analyse du flux</div>
                        <div className="flex justify-between items-center">
                            <div className="premium-font truncate" style={{ fontWeight: 800, fontSize: '15px', maxWidth: '150px' }}>{matchingTx.label}</div>
                            <div className="num-font" style={{ fontWeight: 900, fontSize: '18px', color: matchingTx.debit > 0 ? 'var(--danger)' : 'var(--primary)' }}>
                                {fmt(matchingTx.debit > 0 ? matchingTx.debit : matchingTx.credit)} <small style={{ fontSize: '10px' }}>MAD</small>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="premium-font" style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>Suggestions de lettrage</span>
                            <div className="h-[1px] flex-1 bg-border-light"></div>
                        </div>

                        {suggestLoading ? (
                            <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={32}/></div>
                        ) : suggestions.length === 0 ? (
                            <div className="py-12 text-center">
                                <AlertCircle className="mx-auto mb-3 opacity-20 text-danger" size={48}/>
                                <p className="text-muted" style={{ fontSize: '13px' }}>Aucun écart nul trouvé.</p>
                                <button className="btn btn-outline btn-xs mt-4">Saisie Manuelle</button>
                            </div>
                        ) : suggestions.map(s => (
                            <div key={s.id} className="card hover:border-primary transition-all group" style={{ padding: '16px', background: '#fff' }}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="premium-font truncate" style={{ fontWeight: 800, fontSize: '14px' }}>{s.label}</div>
                                        <div className="text-[10px] text-muted font-bold uppercase tracking-wider">Écr. {s.entry?.numero} • {new Date(s.entry?.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="num-font" style={{ fontWeight: 900, color: 'var(--text-main)' }}>{fmt(s.debit || s.credit)}</div>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="badge badge-gray border-none text-[9px] uppercase tracking-widest">{s.account_id} - Tiers</span>
                                    <button className="btn btn-primary btn-xs px-4" onClick={() => handleLink(s.id)}>
                                        Valider <ArrowRight size={12}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* ── Modals Redesign ── */}
      {showAddAccount && (
        <div className="modal-overlay-premium" onClick={() => setShowAddAccount(false)}>
          <div className="modal-card-premium" style={{ width: '100%', maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)' }}>
              <div className="modal-title" style={{ fontSize: 20, fontWeight: 800 }}>
                <Landmark size={24} className="text-primary" />
                <span className="ml-2">Nouveau Moyen de Paiement</span>
              </div>
              <button className="modal-close" onClick={() => setShowAddAccount(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content-wrapper" style={{ gridTemplateColumns: '1fr 280px' }}>
              <div className="modal-scrollable">
                <form onSubmit={handleAddAccount}>
                  <div className="grid g2 mb-6">
                    <div className="premium-form-group">
                      <label className="premium-label">Type de compte</label>
                      <select className="premium-input" value={newAccount.type} onChange={e => setNewAccount({...newAccount, type: e.target.value})}>
                        <option value="banque">Bancaire</option>
                        <option value="caisse">Caisse / Espèces</option>
                      </select>
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Devise</label>
                      <select className="premium-input" value={newAccount.currency} onChange={e => setNewAccount({...newAccount, currency: e.target.value})}>
                        <option value="MAD">Dirham (MAD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>
                  </div>
                  <div className="premium-form-group mb-6">
                    <label className="premium-label">Dénomination du compte *</label>
                    <input className="premium-input" placeholder="ex: Attijari Principal" required value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} />
                  </div>
                  {newAccount.type === 'banque' && (
                    <div className="grid g2">
                      <div className="premium-form-group">
                        <label className="premium-label">Établissement</label>
                        <input className="premium-input" placeholder="ex: CIH Bank" value={newAccount.bank_name} onChange={e => setNewAccount({...newAccount, bank_name: e.target.value})} />
                      </div>
                      <div className="premium-form-group">
                        <label className="premium-label">N° de compte</label>
                        <input className="premium-input" placeholder="24 chiffres" value={newAccount.account_number} onChange={e => setNewAccount({...newAccount, account_number: e.target.value})} />
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className="side-info-panel" style={{ padding: '24px 20px' }}>
                <div>
                  <h4 className="premium-label" style={{ marginBottom: 12 }}>Sécurité & Conformité</h4>
                  <div className="card glass-panel" style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.05)', border: 'none' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                      <ShieldCheck size={14} className="inline mr-1 text-primary"/> Les coordonnées bancaires sont chiffrées. Assurez-vous que le RIB est correct pour les virements EDI.
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex-c gap-3">
                  <button className="btn btn-primary w-full" style={{ height: 48 }} onClick={handleAddAccount}>
                    <CheckCircle size={18} />
                    <span className="ml-2">Créer le Compte</span>
                  </button>
                  <button className="btn btn-outline w-full" onClick={() => setShowAddAccount(false)}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddTx && (
        <div className="modal-overlay-premium" onClick={() => setShowAddTx(false)}>
          <div className="modal-card-premium" style={{ width: '100%', maxWidth: 850 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)' }}>
              <div className="modal-title" style={{ fontSize: 20, fontWeight: 800 }}>
                <Banknote size={24} className="text-secondary" />
                <span className="ml-2">Enregistrer une opération</span>
              </div>
              <button className="modal-close" onClick={() => setShowAddTx(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content-wrapper">
              <div className="modal-scrollable">
                <form onSubmit={handleAddTx}>
                  <div className="grid g2 mb-6">
                    <div className="premium-form-group">
                      <label className="premium-label">Date d'opération</label>
                      <input type="date" className="premium-input" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} required />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Pièce / Référence</label>
                      <input className="premium-input" placeholder="VIR-001..." value={newTx.reference} onChange={e => setNewTx({...newTx, reference: e.target.value})} />
                    </div>
                  </div>
                  <div className="premium-form-group mb-6">
                    <label className="premium-label">Libellé de l'opération *</label>
                    <input className="premium-input" placeholder="Détail du mouvement..." required value={newTx.label} onChange={e => setNewTx({...newTx, label: e.target.value})} />
                  </div>
                  <div className="grid g2">
                    <div className="premium-form-group">
                      <label className="premium-label">Débit (Sortie)</label>
                      <input type="number" step="0.01" className="premium-input" placeholder="0.00" value={newTx.debit} onChange={e => setNewTx({...newTx, debit: e.target.value, credit: ''})} />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Crédit (Entrée)</label>
                      <input type="number" step="0.01" className="premium-input" placeholder="0.00" value={newTx.credit} onChange={e => setNewTx({...newTx, credit: e.target.value, debit: ''})} />
                    </div>
                  </div>
                </form>
              </div>

              <div className="side-info-panel">
                <div>
                  <h4 className="premium-label" style={{ marginBottom: 12 }}>Impact Trésorerie</h4>
                  <div className="card glass-panel" style={{ padding: '16px', background: 'var(--surface-mut)' }}>
                    <span className="premium-label" style={{ fontSize: 9 }}>Compte impacté</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>{selectedAccount?.name}</div>
                  </div>
                  <div className="card glass-panel mt-4" style={{ padding: '16px', background: newTx.debit ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)', border: 'none' }}>
                    <span className="premium-label" style={{ fontSize: 9 }}>Variation Solde (Est.)</span>
                    <div style={{ fontSize: 18, fontWeight: 900, color: newTx.debit ? 'var(--danger)' : 'var(--success)' }}>
                      {newTx.debit ? '-' : '+'}{fmt(newTx.debit || newTx.credit || 0)} <small>MAD</small>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex-c gap-3">
                  <button className="btn btn-primary w-full" style={{ height: 48 }} onClick={handleAddTx}>
                    <Zap size={18} />
                    <span className="ml-2">Enregistrer</span>
                  </button>
                  <button className="btn btn-outline w-full" onClick={() => setShowAddTx(false)}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal Redesign */}
      {showImportCsv && (
          <div className="modal-overlay" onClick={() => setShowImportCsv(false)}>
              <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                  <div className="modal-header">
                      <h2 className="modal-title"><Upload size={20}/> Importation Intégrée</h2>
                      <button className="modal-close" onClick={() => setShowImportCsv(false)}><X size={18}/></button>
                  </div>
                  <form onSubmit={handleImportCsv}>
                      <div className="modal-body">
                          <div className="alert alert-blue" style={{ marginBottom: '20px' }}>
                               <Info size={16}/>
                               <div style={{ fontSize: '12px' }}>Format attendu : <code>date;libelle;debit;credit</code>. Utilisez le point-virgule comme séparateur.</div>
                          </div>
                          <div className="form-group">
                              <label className="form-label">Sélectionner le fichier CSV</label>
                              <input type="file" ref={fileInputRef} onChange={e => setCsvFile(e.target.files[0])} style={{ display: 'none' }} />
                              <div 
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed var(--border-light)',
                                    borderRadius: '12px',
                                    padding: '32px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: csvFile ? 'var(--primary-glow)' : 'var(--bg)'
                                }}
                              >
                                {csvFile ? (
                                    <div className="flex-c items-center">
                                        <FileCheck size={32} className="text-primary"/>
                                        <span style={{ fontWeight: 700, marginTop: '8px' }}>{csvFile.name}</span>
                                    </div>
                                ) : (
                                    <div className="flex-c items-center">
                                        <Upload size={32} style={{ opacity: 0.3 }}/>
                                        <span className="text-muted" style={{ fontSize: '12px', marginTop: '8px' }}>Cliquez pour parcourir vos fichiers</span>
                                    </div>
                                )}
                              </div>
                          </div>
                      </div>
                      <div className="modal-footer">
                          <button type="button" className="btn btn-outline" onClick={() => setShowImportCsv(false)}>Annuler</button>
                          <button type="submit" className="btn btn-primary" disabled={!csvFile || importing}>
                              {importing ? <Loader2 size={16} className="animate-spin" /> : 'Lancer l\'importation'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
