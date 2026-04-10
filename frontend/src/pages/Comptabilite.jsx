import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  FileText, Book, Scale, ClipboardList, 
  Search, Calendar, Filter, Plus, 
  Trash2, CheckCircle2, AlertCircle, Edit, Upload, Download, Loader2,
  ChevronRight, ChevronDown
} from 'lucide-react';

export default function Comptabilite() {
  const { data, loading, refresh } = useData();
  const [activeTab, setActiveTab] = useState('journal');
  
  // Filters
  const [selectedJournal, setSelectedJournal] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  // Grand Livre State
  const [glAccountId, setGlAccountId] = useState('');

  // Modal State Entry
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    journal_id: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { account_id: '', label: '', debit: '', credit: '' },
      { account_id: '', label: '', debit: '', credit: '' },
    ]
  });
  const [submitError, setSubmitError] = useState(null);

  // Modal State Account
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountForm, setAccountForm] = useState({ number: '', label: '', type: 'actif' });
  const [accountError, setAccountError] = useState(null);
  const [pcmSearch, setPcmSearch] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef();

  const getSens = (type) => {
    if (type === 'actif' || type === 'charge') return 'D';
    if (type === 'passif' || type === 'produit') return 'C';
    return '';
  };

  const fmt = (n) => Number(n || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 });
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-MA') : '—';

  // --- LOGIC: JOURNAL ---
  const journalEntries = useMemo(() => {
    return data.entries.filter(e => {
      const matchJournal = selectedJournal ? e.journal_id.toString() === selectedJournal : true;
      const matchMonth = selectedMonth ? e.date.startsWith(selectedMonth) : true;
      return matchJournal && matchMonth;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.entries, selectedJournal, selectedMonth]);

  // --- LOGIC: GRAND LIVRE ---
  const grandLivreData = useMemo(() => {
    if (!glAccountId) return [];
    let runningBalance = 0;
    const movements = [];
    data.entries.forEach(entry => {
      entry.entry_lines?.forEach(line => {
        if (line.account_id.toString() === glAccountId) {
          movements.push({
            date: entry.date,
            piece: entry.numero || `E-${entry.id}`,
            libelle: line.label || entry.description,
            debit: parseFloat(line.debit) || 0,
            credit: parseFloat(line.credit) || 0,
          });
        }
      });
    });

    return movements.sort((a, b) => new Date(a.date) - new Date(b.date)).map(m => {
      runningBalance += (m.debit - m.credit);
      return { ...m, balance: runningBalance };
    });
  }, [data.entries, glAccountId]);

  // --- LOGIC: BALANCE ---
  const balanceData = useMemo(() => {
    const accMap = {};
    data.accounts.forEach(acc => {
      accMap[acc.id] = { ...acc, totalDebit: 0, totalCredit: 0 };
    });

    data.entries.forEach(entry => {
      entry.entry_lines?.forEach(line => {
        if (accMap[line.account_id]) {
          accMap[line.account_id].totalDebit += (parseFloat(line.debit) || 0);
          accMap[line.account_id].totalCredit += (parseFloat(line.credit) || 0);
        }
      });
    });

    return Object.values(accMap)
      .filter(a => a.totalDebit > 0 || a.totalCredit > 0)
      .sort((a, b) => a.number.localeCompare(b.number));
  }, [data.accounts, data.entries]);

  // --- LOGIC: HIERARCHICAL PCM (Sage-style) ---
  const pcmGroups = useMemo(() => {
    const classes = [
      { id: '1', label: 'FINANCEMENT PERMANENT' },
      { id: '2', label: 'ACTIF IMMOBILISE' },
      { id: '3', label: 'ACTIF CIRCULANT (HORS TRESORERIE)' },
      { id: '4', label: 'PASSIF CIRCULANT (HORS TRESORERIE)' },
      { id: '5', label: 'TRESORERIE' },
      { id: '6', label: 'COMPTES DE CHARGES' },
      { id: '7', label: 'COMPTES DE PRODUITS' },
    ];
    
    return classes.map(cls => {
      const accounts = data.accounts
        .filter(a => a.number.startsWith(cls.id))
        .filter(a => !pcmSearch || a.number.includes(pcmSearch) || a.label.toLowerCase().includes(pcmSearch.toLowerCase()))
        .sort((a, b) => a.number.localeCompare(b.number));
      return { ...cls, accounts };
    }).filter(g => g.accounts.length > 0 || !pcmSearch);
  }, [data.accounts, pcmSearch]);

  // --- MODAL HANDLERS ENTRY ---
  const handleLineChange = (index, field, value) => {
    const updatedLines = [...newEntry.lines];
    updatedLines[index][field] = value;
    if (field === 'debit' && value > 0) updatedLines[index].credit = '0';
    if (field === 'credit' && value > 0) updatedLines[index].debit = '0';
    setNewEntry({ ...newEntry, lines: updatedLines });
  };

  const totalDebit = newEntry.lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = newEntry.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSubmit = async () => {
    if (!isBalanced) return;
    setSubmitError(null);
    try {
      const resp = await fetch('http://localhost:8000/api/accounting/entries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newEntry,
          lines: newEntry.lines.filter(l => l.account_id && (l.debit > 0 || l.credit > 0))
        })
      });
      if (resp.ok) {
        setIsModalOpen(false);
        refresh();
        setNewEntry({
          journal_id: '', date: new Date().toISOString().split('T')[0], description: '',
          lines: [{ account_id: '', label: '', debit: '', credit: '' }, { account_id: '', label: '', debit: '', credit: '' }]
        });
      } else {
        const err = await resp.json();
        setSubmitError(err.error || 'Erreur lors de la validation');
      }
    } catch (e) { setSubmitError(e.message); }
  };

  // --- MODAL HANDLERS ACCOUNT ---
  const handleAccountEdit = (acc) => {
    setEditingAccount(acc);
    setAccountForm({ number: acc.number, label: acc.label, type: acc.type });
    setIsAccountModalOpen(true);
  };

  const handleAccountSubmit = async () => {
    setAccountError(null);
    const token = localStorage.getItem('token');
    const url = editingAccount 
      ? `http://localhost:8000/api/accounting/accounts/${editingAccount.id}`
      : 'http://localhost:8000/api/accounting/accounts';
    const method = editingAccount ? 'PUT' : 'POST';

    try {
      const resp = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(accountForm)
      });
      if (resp.ok) {
        setIsAccountModalOpen(false);
        setEditingAccount(null);
        setAccountForm({ number: '', label: '', type: 'actif' });
        refresh();
      } else {
        const err = await resp.json();
        setAccountError(err.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (e) { setAccountError(e.message); }
  };

  const handleAccountDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) return;
    const token = localStorage.getItem('token');
    try {
      const resp = await fetch(`http://localhost:8000/api/accounting/accounts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        refresh();
      } else {
        const err = await resp.json();
        alert(err.error || 'Erreur lors de la suppression');
      }
    } catch (e) { alert(e.message); }
  };

  const handleImportPCM = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');

    try {
      const resp = await fetch('http://localhost:8000/api/accounting/accounts/import', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (resp.ok) {
        alert('Plan comptable importé avec succès !');
        refresh();
      } else {
        alert('Erreur lors de l\'importation');
      }
    } catch (err) { alert(err.message); }
    finally { setImporting(false); }
  };

  return (
    <div className="layout-container">
      <div className="coa-header">
        <div>
          <h1 className="flex items-center gap-3">
            <Book size={28} className="text-primary" /> Comptabilité Générale
          </h1>
          <p className="text-muted">Journal, Grand Livre, Balance et Plan Comptable organisé par Classe.</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'pcm' && (
            <>
              <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleImportPCM} />
              <button className="btn btn-outline" onClick={() => fileInputRef.current.click()} disabled={importing}>
                {importing ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                Importer PCM
              </button>
              <button className="btn btn-primary" onClick={() => { setEditingAccount(null); setAccountForm({number:'', label:'', type:'actif'}); setIsAccountModalOpen(true); }}>
                <Plus size={20} /> Nouveau Compte
              </button>
            </>
          )}
          {activeTab === 'journal' && (
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} /> Nouvelle Écriture
            </button>
          )}
        </div>
      </div>

      <div className="tabs mt-8">
        <button className={`tab ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => setActiveTab('journal')}>
          Journal
        </button>
        <button className={`tab ${activeTab === 'grand-livre' ? 'active' : ''}`} onClick={() => setActiveTab('grand-livre')}>
          Grand Livre
        </button>
        <button className={`tab ${activeTab === 'balance' ? 'active' : ''}`} onClick={() => setActiveTab('balance')}>
          Balance
        </button>
        <button className={`tab ${activeTab === 'pcm' ? 'active' : ''}`} onClick={() => setActiveTab('pcm')}>
          Plan Comptable
        </button>
      </div>

      <div className="mt-6">
        {/* JOURNAL TAB */}
        {activeTab === 'journal' && (
          <>
            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2 glass-panel px-3 py-1">
                <Filter size={14} className="text-muted" />
                <select className="form-select border-none bg-transparent text-sm" value={selectedJournal} onChange={e => setSelectedJournal(e.target.value)}>
                  <option value="">Tous les journaux</option>
                  {data.journals.map(j => <option key={j.id} value={j.id}>{j.code} - {j.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 glass-panel px-3 py-1">
                <Calendar size={14} className="text-muted" />
                <input type="month" className="form-input border-none bg-transparent text-sm" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
              </div>
            </div>
            <div className="glass-panel overflow-hidden">
              <table className="coa-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Journal</th>
                    <th>N° Pièce</th>
                    <th>Libellé</th>
                    <th className="text-right">Débit</th>
                    <th className="text-right">Crédit</th>
                  </tr>
                </thead>
                <tbody>
                  {journalEntries.map(entry => (
                    <React.Fragment key={entry.id}>
                      <tr className="bg-white/5">
                        <td className="font-bold">{fmtDate(entry.date)}</td>
                        <td><span className="badge badge-gray">{entry.journal?.code}</span></td>
                        <td className="text-blue-500 font-bold">{entry.numero || `E-${entry.id}`}</td>
                        <td colSpan="3" className="font-bold">{entry.description}</td>
                      </tr>
                      {entry.entry_lines?.map((line, lidx) => (
                        <tr key={`${entry.id}-${lidx}`} className="border-none opacity-80">
                          <td colSpan="3"></td>
                          <td className="pl-6 text-xs italic">{line.account?.number} {line.label || ''}</td>
                          <td className="text-right">{line.debit > 0 ? fmt(line.debit) : '—'}</td>
                          <td className="text-right">{line.credit > 0 ? fmt(line.credit) : '—'}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* GRAND LIVRE TAB */}
        {activeTab === 'grand-livre' && (
          <>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 max-w-md flex items-center gap-2 glass-panel px-3 py-1">
                <Search size={14} className="text-muted" />
                <select className="form-select border-none bg-transparent text-sm w-full" value={glAccountId} onChange={e => setGlAccountId(e.target.value)}>
                  <option value="">Sélectionner un compte...</option>
                  {data.accounts.map(a => <option key={a.id} value={a.id}>{a.number} - {a.label}</option>)}
                </select>
              </div>
            </div>
            {glAccountId ? (
              <div className="glass-panel overflow-hidden">
                <table className="coa-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Pièce</th>
                      <th>Libellé</th>
                      <th className="text-right">Débit</th>
                      <th className="text-right">Crédit</th>
                      <th className="text-right">Solde Cumulé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grandLivreData.map((m, idx) => (
                      <tr key={idx}>
                        <td>{fmtDate(m.date)}</td>
                        <td>{m.piece}</td>
                        <td>{m.libelle}</td>
                        <td className="text-right text-green-500">{m.debit > 0 ? fmt(m.debit) : '—'}</td>
                        <td className="text-right text-red-500">{m.credit > 0 ? fmt(m.credit) : '—'}</td>
                        <td className={`text-right font-bold ${m.balance >= 0 ? 'text-primary' : 'text-amber-500'}`}>
                          {fmt(m.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state p-20 text-center glass-panel">
                <Book className="mx-auto text-muted mb-4" size={48} />
                <p>Veuillez sélectionner un compte pour afficher son Grand Livre.</p>
              </div>
            )}
          </>
        )}

        {/* BALANCE TAB */}
        {activeTab === 'balance' && (
          <div className="glass-panel overflow-hidden">
            <table className="coa-table">
              <thead>
                <tr>
                  <th>N° Compte</th>
                  <th>Intitulé du compte</th>
                  <th className="text-right">Total Débit</th>
                  <th className="text-right">Total Crédit</th>
                  <th className="text-right">Solde Débiteur</th>
                  <th className="text-right">Solde Créditeur</th>
                </tr>
              </thead>
              <tbody>
                {balanceData.map(acc => {
                  const solde = acc.totalDebit - acc.totalCredit;
                  return (
                    <tr key={acc.id}>
                      <td className="font-bold">{acc.number}</td>
                      <td>{acc.label}</td>
                      <td className="text-right">{fmt(acc.totalDebit)}</td>
                      <td className="text-right">{fmt(acc.totalCredit)}</td>
                      <td className="text-right text-primary font-bold">{solde > 0 ? fmt(solde) : '—'}</td>
                      <td className="text-right text-amber-500 font-bold">{solde < 0 ? fmt(Math.abs(solde)) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PCM TAB - PROFESSIONAL DESIGN (SAGE STYLE) */}
        {activeTab === 'pcm' && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 max-w-lg flex items-center gap-3 glass-panel px-4 py-2">
                <Search size={18} className="text-muted" />
                <input 
                  type="text" 
                  className="form-input border-none bg-transparent" 
                  placeholder="Rechercher un compte ou un intitulé..."
                  value={pcmSearch}
                  onChange={e => setPcmSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-hidden">
              <table className="tbl-pro">
                <thead>
                  <tr>
                    <th width="18%">CLASSE</th>
                    <th width="12%">N° COMPTE</th>
                    <th width="45%">LIBELLÉ</th>
                    <th width="15%">TYPE</th>
                    <th width="10%">SENS</th>
                  </tr>
                </thead>
                <tbody>
                  {pcmGroups.map(group => (
                    <React.Fragment key={group.id}>
                      {/* Header Row for Class */}
                      <tr className="row-group-header">
                        <td colSpan="5">
                          Classe {group.id} — {group.label}
                        </td>
                      </tr>
                      
                      {/* Account Rows */}
                      {group.accounts.map(acc => (
                        <tr key={acc.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="text-muted italic text-[11px]">
                            Classe {group.id}
                          </td>
                          <td className="acc-number">
                            {acc.number}
                          </td>
                          <td className="acc-label">
                            {acc.label}
                          </td>
                          <td className="acc-type">
                            {acc.type}
                          </td>
                          <td className="acc-sens">
                            <div className="flex justify-between items-center">
                              {getSens(acc.type)}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="btn-icon-small" onClick={() => handleAccountEdit(acc)} title="Modifier"><Edit size={12}/></button>
                                <button className="btn-icon-small text-red-400" onClick={() => handleAccountDelete(acc.id)} title="Supprimer"><Trash2 size={12}/></button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  {pcmGroups.length === 0 && (
                    <tr><td colSpan="5" className="p-20 text-center text-muted">Aucun compte trouvé</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ENTRY MODAL */}
      {isModalOpen && (/* ... remains same ... */
        <div className="modal-overlay">
          <div className="modal max-w-4xl">
            <div className="modal-header">
              <h2 className="flex items-center gap-2">
                <Plus size={20} className="text-primary" /> Saisie d'une Nouvelle Écriture
              </h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {submitError && (
                <div className="alert alert-red mb-4">
                  <AlertCircle size={18} /> {submitError}
                </div>
              )}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="form-group">
                  <label className="form-label">Journal</label>
                  <select className="form-select" value={newEntry.journal_id} onChange={e => setNewEntry({...newEntry, journal_id: e.target.value})}>
                    <option value="">Choisir un journal...</option>
                    {data.journals.map(j => <option key={j.id} value={j.id}>{j.code} - {j.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Libellé Principal</label>
                  <input className="form-input" placeholder="ex: Facture F2024-001" value={newEntry.description} onChange={e => setNewEntry({...newEntry, description: e.target.value})} />
                </div>
              </div>

              <div className="coa-table-wrapper">
                <table className="coa-table">
                  <thead>
                    <tr>
                      <th width="30%">Compte</th>
                      <th width="35%">Libellé Ligne</th>
                      <th width="15%" className="text-right">Débit</th>
                      <th width="15%" className="text-right">Crédit</th>
                      <th width="5%"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newEntry.lines.map((line, idx) => (
                      <tr key={idx}>
                        <td>
                          <select className="form-select w-full" value={line.account_id} onChange={e => handleLineChange(idx, 'account_id', e.target.value)}>
                            <option value="">Sélectionner...</option>
                            {data.accounts.map(a => <option key={a.id} value={a.id}>{a.number} - {a.label}</option>)}
                          </select>
                        </td>
                        <td>
                          <input className="form-input w-full" value={line.label} onChange={e => handleLineChange(idx, 'label', e.target.value)} />
                        </td>
                        <td>
                          <input type="number" className="form-input w-full text-right" value={line.debit} onChange={e => handleLineChange(idx, 'debit', e.target.value)} />
                        </td>
                        <td>
                          <input type="number" className="form-input w-full text-right" value={line.credit} onChange={e => handleLineChange(idx, 'credit', e.target.value)} />
                        </td>
                        <td>
                          <button className="text-red-500 hover:bg-red-500/10 p-2 rounded" onClick={() => {
                            const lines = newEntry.lines.filter((_, i) => i !== idx);
                            setNewEntry({...newEntry, lines});
                          }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-outline mt-4" onClick={() => setNewEntry({...newEntry, lines: [...newEntry.lines, {account_id:'', label:'', debit:'', credit:''}]})}>
                + Ajouter une ligne
              </button>
            </div>
            <div className="modal-footer flex justify-between items-center border-t border-white/10 pt-6">
              <div className="flex gap-6 items-center">
                <div className="text-sm">
                  <span className="text-muted">Total Débit :</span> <span className="font-bold text-lg">{fmt(totalDebit)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted">Total Crédit :</span> <span className="font-bold text-lg">{fmt(totalCredit)}</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${isBalanced ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {isBalanced ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {isBalanced ? 'Équilibré' : 'Non Équilibré'}
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button className="btn btn-primary" disabled={!isBalanced} onClick={handleSubmit}>Valider l'Écriture</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT MODAL */}
      {isAccountModalOpen && (
        <div className="modal-overlay">
          <div className="modal max-w-md">
            <div className="modal-header">
              <h2 className="flex items-center gap-2">
                {editingAccount ? <Edit size={20} className="text-primary" /> : <Plus size={20} className="text-primary" />}
                {editingAccount ? 'Modifier le Compte' : 'Nouveau Compte PCM'}
              </h2>
              <button className="modal-close" onClick={() => setIsAccountModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {accountError && <div className="alert alert-red mb-4">{accountError}</div>}
              <div className="form-group mb-4">
                <label className="form-label">Numéro de compte</label>
                <input className="form-input" placeholder="ex: 6111" value={accountForm.number} onChange={e => setAccountForm({...accountForm, number: e.target.value})} />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Intitulé du compte</label>
                <input className="form-input" placeholder="ex: Achats de marchandises" value={accountForm.label} onChange={e => setAccountForm({...accountForm, label: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Type de compte</label>
                <select className="form-select" value={accountForm.type} onChange={e => setAccountForm({...accountForm, type: e.target.value})}>
                  <option value="actif">Actif</option>
                  <option value="passif">Passif</option>
                  <option value="charge">Charge</option>
                  <option value="produit">Produit</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsAccountModalOpen(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleAccountSubmit}>
                {editingAccount ? 'Mettre à jour' : 'Créer le compte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
