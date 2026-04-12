import React, { useState, useMemo, useRef } from 'react';
import {
  useAccounts, useJournals, useEntries,
  useCreateEntry, useUpdateEntry, useUpdateEntryStatus, useDeleteEntry,
  useCreateAccount, useUpdateAccount, useDeleteAccount
} from '../hooks/useAccounting';
import {
  BookOpen, Search, Calendar, Filter, Plus, Trash2,
  CheckCircle2, AlertCircle, Edit, Upload, Loader2,
  ChevronDown, ChevronRight, CheckCheck, Clock,
  MoreVertical, Eye, EyeOff, ArrowUpDown, X,
  TrendingUp, TrendingDown, Layers, Sparkles, AlertTriangle
} from 'lucide-react';

const API = 'http://localhost:8000/api';
const token = () => localStorage.getItem('token');
const headers = () => ({ 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' });

/* ── Helpers ── */
const fmt     = (n) => Number(n || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
const getSens = (type) => {
  if (type === 'actif' || type === 'charge') return 'D';
  if (type === 'passif' || type === 'produit') return 'C';
  return '';
};

/* ── Status badge component ── */
function StatusBadge({ status }) {
  if (status === 'validee') {
    return (
      <span className="badge badge-success" style={{ gap: 6, padding: '4px 12px' }}>
        <CheckCheck size={12} /> validée
      </span>
    );
  }
  return (
    <span className="badge badge-warning" style={{ gap: 6, padding: '4px 12px' }}>
      <Clock size={12} /> brouillon
    </span>
  );
}

/* ── Journal badge ── */
function JournalBadge({ code }) {
  return (
    <span className="badge badge-gray" style={{
      padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800,
      fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em',
      border: '1px solid var(--border-light)',
      background: 'var(--surface-mut)',
      color: 'var(--text-dim)'
    }}>
      {code}
    </span>
  );
}

export default function Comptabilite() {
  const [activeTab, setActiveTab] = useState('journal');

  // React Query Hooks
  const { data: accountsData, isLoading: loadingAccounts } = useAccounts();
  const { data: journalsData, isLoading: loadingJournals } = useJournals();
  const { data: entriesData, isLoading: loadingEntries, refetch: refetchEntries } = useEntries();
  const refetch = refetchEntries; // Keep a reference to refresh for manual syncs if needed

  const accounts = accountsData || [];
  const journals = journalsData || [];
  const entries = entriesData || [];

  const loading = loadingAccounts || loadingJournals || loadingEntries;

  // Mutations
  const createEntryMutation = useCreateEntry();
  const updateEntryMutation = useUpdateEntry();
  const updateEntryStatusMutation = useUpdateEntryStatus();
  const deleteEntryMutation = useDeleteEntry();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  /* ── Journal filters ── */
  const [selectedJournal, setSelectedJournal] = useState('');
  const [selectedMonth,   setSelectedMonth]   = useState(new Date().toISOString().slice(0, 7));
  const [selectedStatus,  setSelectedStatus]  = useState('');
  const [expandedRow,     setExpandedRow]     = useState(null);
  const [actionMenu,      setActionMenu]      = useState(null); // entry id with open menu

  /* ── Grand Livre ── */
  const [glAccountId, setGlAccountId] = useState('');

  /* ── PCM ── */
  const [pcmSearch,  setPcmSearch]  = useState('');
  const [importing,  setImporting]  = useState(false);
  const fileInputRef = useRef();

  /* ── Entry Modal (create / edit) ── */
  const EMPTY_ENTRY = {
    journal_id: '', date: new Date().toISOString().split('T')[0],
    description: '', status: 'brouillon',
    lines: [
      { account_id: '', label: '', debit: '', credit: '' },
      { account_id: '', label: '', debit: '', credit: '' },
    ],
  };
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [editingEntry,  setEditingEntry]  = useState(null);
  const [entryForm,     setEntryForm]     = useState(EMPTY_ENTRY);
  const [submitError,   setSubmitError]   = useState(null);
  const [submitting,    setSubmitting]    = useState(false);

  /* ── Account Modal ── */
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount,     setEditingAccount]     = useState(null);
  const [accountForm,        setAccountForm]        = useState({ number: '', label: '', type: 'actif' });
  const [accountError,       setAccountError]       = useState(null);

  /* ════════════════════ COMPUTED DATA ════════════════════ */

  const journalEntries = useMemo(() => {
    return entries.filter(e => {
      const matchJournal = selectedJournal ? e.journal_id?.toString() === selectedJournal : true;
      const matchMonth   = selectedMonth   ? e.date?.startsWith(selectedMonth)           : true;
      const matchStatus  = selectedStatus  ? e.status === selectedStatus                  : true;
      return matchJournal && matchMonth && matchStatus;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [entries, selectedJournal, selectedMonth, selectedStatus]);

  const grandLivreData = useMemo(() => {
    if (!glAccountId) return [];
    let runningBalance = 0;
    const movements = [];
    entries.forEach(entry => {
      entry.entry_lines?.forEach(line => {
        if (line.account_id?.toString() === glAccountId) {
          movements.push({
            date: entry.date, piece: entry.numero || `E-${entry.id}`,
            libelle: line.label || entry.description,
            debit: parseFloat(line.debit) || 0, credit: parseFloat(line.credit) || 0,
          });
        }
      });
    });
    return movements.sort((a, b) => new Date(a.date) - new Date(b.date)).map(m => {
      runningBalance += (m.debit - m.credit);
      return { ...m, balance: runningBalance };
    });
  }, [entries, glAccountId]);

  const balanceData = useMemo(() => {
    const accMap = {};
    accounts.forEach(acc => { accMap[acc.id] = { ...acc, totalDebit: 0, totalCredit: 0 }; });
    entries.forEach(entry => {
      entry.entry_lines?.forEach(line => {
        if (accMap[line.account_id]) {
          accMap[line.account_id].totalDebit  += parseFloat(line.debit)  || 0;
          accMap[line.account_id].totalCredit += parseFloat(line.credit) || 0;
        }
      });
    });
    return Object.values(accMap).filter(a => a.totalDebit > 0 || a.totalCredit > 0)
                                .sort((a, b) => a.number.localeCompare(b.number));
  }, [accounts, entries]);

  const pcmGroups = useMemo(() => {
    const classes = [
      { id: '1', label: 'FINANCEMENT PERMANENT' }, { id: '2', label: 'ACTIF IMMOBILISÉ' },
      { id: '3', label: 'ACTIF CIRCULANT' },        { id: '4', label: 'PASSIF CIRCULANT' },
      { id: '5', label: 'TRÉSORERIE' },             { id: '6', label: 'COMPTES DE CHARGES' },
      { id: '7', label: 'COMPTES DE PRODUITS' },
    ];
    return classes.map(cls => {
      const accountsList = accounts
        .filter(a => a.number.startsWith(cls.id))
        .filter(a => !pcmSearch || a.number.includes(pcmSearch) || a.label.toLowerCase().includes(pcmSearch.toLowerCase()))
        .sort((a, b) => a.number.localeCompare(b.number));
      return { ...cls, accounts: accountsList };
    }).filter(g => g.accounts.length > 0 || !pcmSearch);
  }, [accounts, pcmSearch]);

  /* ════════════════════ JOURNAL STATS ════════════════════ */
  const journalStats = useMemo(() => {
    const totalDebit  = journalEntries.reduce((s, e) => s + (e.entry_lines?.reduce((ls, l) => ls + (parseFloat(l.debit) || 0), 0) || 0), 0);
    const totalCredit = journalEntries.reduce((s, e) => s + (e.entry_lines?.reduce((ls, l) => ls + (parseFloat(l.credit) || 0), 0) || 0), 0);
    const validées    = journalEntries.filter(e => e.status === 'validee').length;
    const brouillons  = journalEntries.filter(e => e.status === 'brouillon').length;
    return { totalDebit, totalCredit, validées, brouillons, total: journalEntries.length };
  }, [journalEntries]);

  /* ════════════════════ ENTRY MODAL HANDLERS ════════════════════ */

  const openCreateModal = () => {
    setEditingEntry(null);
    setEntryForm(EMPTY_ENTRY);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setEntryForm({
      journal_id: entry.journal_id?.toString() || '',
      date: entry.date,
      description: entry.description || '',
      status: entry.status || 'brouillon',
      lines: entry.entry_lines?.map(l => ({
        account_id: l.account_id?.toString() || '',
        label: l.label || '',
        debit: parseFloat(l.debit) || '',
        credit: parseFloat(l.credit) || '',
      })) || [{ account_id:'', label:'', debit:'', credit:'' }, { account_id:'', label:'', debit:'', credit:'' }],
    });
    setSubmitError(null);
    setActionMenu(null);
    setIsModalOpen(true);
  };

  const handleLineChange = (index, field, value) => {
    const lines = [...entryForm.lines];
    lines[index][field] = value;
    if (field === 'debit'  && parseFloat(value) > 0) lines[index].credit = '';
    if (field === 'credit' && parseFloat(value) > 0) lines[index].debit  = '';
    setEntryForm({ ...entryForm, lines });
  };

  const totalDebit  = entryForm.lines.reduce((s, l) => s + (parseFloat(l.debit)  || 0), 0);
  const totalCredit = entryForm.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const isBalanced  = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSubmit = async () => {
    if (!isBalanced) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const body = {
        ...entryForm,
        lines: entryForm.lines.filter(l => l.account_id && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0)),
      };
      
      if (editingEntry) {
        await updateEntryMutation.mutateAsync({ id: editingEntry.id, ...body });
      } else {
        await createEntryMutation.mutateAsync(body);
      }
      
      setIsModalOpen(false);
      setEditingEntry(null);
      setEntryForm(EMPTY_ENTRY);
    } catch (e) {
      setSubmitError(e.response?.data?.error || e.message || 'Erreur lors de la validation');
    }
    setSubmitting(false);
  };

  /* ════════════════════ STATUS UPDATE ════════════════════ */

  const handleStatusChange = async (entry, newStatus) => {
    setActionMenu(null);
    try {
      await updateEntryStatusMutation.mutateAsync({ id: entry.id, status: newStatus });
    } catch (e) { alert(e.response?.data?.message || e.message); }
  };

  /* ════════════════════ DELETE ════════════════════ */

  const handleDelete = async (id) => {
    setActionMenu(null);
    if (!window.confirm('Supprimer cette écriture et toutes ses lignes ?')) return;
    try {
      await deleteEntryMutation.mutateAsync(id);
    } catch (e) { alert(e.message); }
  };

  /* ════════════════════ ACCOUNT HANDLERS ════════════════════ */

  const handleAccountEdit = (acc) => {
    setEditingAccount(acc);
    setAccountForm({ number: acc.number, label: acc.label, type: acc.type });
    setIsAccountModalOpen(true);
  };

  const handleAccountSubmit = async () => {
    setAccountError(null);
    try {
      if (editingAccount) {
        await updateAccountMutation.mutateAsync({ id: editingAccount.id, ...accountForm });
      } else {
        await createAccountMutation.mutateAsync(accountForm);
      }
      setIsAccountModalOpen(false); setEditingAccount(null);
      setAccountForm({ number: '', label: '', type: 'actif' });
    } catch (e) { 
      setAccountError(e.response?.data?.error || e.message || 'Erreur');
    }
  };

  const handleAccountDelete = async (id) => {
    if (!window.confirm('Supprimer ce compte ?')) return;
    try {
      await deleteAccountMutation.mutateAsync(id);
    } catch (e) { alert(e.message); }
  };

  const handleImportPCM = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImporting(true);
    const formData = new FormData(); formData.append('file', file);
    try {
      const resp = await fetch(`${API}/accounting/accounts/import`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token()}` }, body: formData,
      });
      if (resp.ok) { alert('PCM importé avec succès !'); refetch(); }
      else alert('Erreur lors de l\'importation');
    } catch (err) { alert(err.message); }
    finally { setImporting(false); }
  };

  /* ════════════════════ RENDER ════════════════════ */

  return (
    <div className="fade-in">
      {/* ── Page Header ── */}
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Journal & Grand Livre</h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>
            Opérations comptables certifiées, Balance générale et Plan Comptable Marocain.
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'pcm' && (
            <>
              <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleImportPCM} />
              <button className="btn btn-outline" onClick={() => fileInputRef.current.click()} disabled={importing}>
                {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Importer PCM
              </button>
              <button className="btn btn-primary" onClick={() => { setEditingAccount(null); setAccountForm({ number:'', label:'', type:'actif' }); setIsAccountModalOpen(true); }}>
                <Plus size={18} /> Nouveau Compte
              </button>
            </>
          )}
          {activeTab === 'journal' && (
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> Nouvelle Écriture
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="glass-panel" style={{ display: 'inline-flex', gap: '4px', padding: '6px', borderRadius: '100px', marginBottom: '32px' }}>
        {[
          { id: 'journal',     label: 'Journal Centralisateur' },
          { id: 'grand-livre', label: 'Grand Livre' },
          { id: 'balance',     label: 'Balance de vérification' },
          { id: 'pcm',         label: 'Plan Comptable (PCM)' },
        ].map(t => (
            <button 
                key={t.id} 
                className={`btn btn-xs ${activeTab === t.id ? 'btn-primary shadow-sm' : 'btn-ghost'}`} 
                onClick={() => setActiveTab(t.id)}
                style={{ borderRadius: '100px', fontSize: '12px', padding: '8px 24px', height: '40px' }}
            >
                {t.label}
            </button>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>

        {/* ════════════════════ JOURNAL TAB ════════════════════ */}
        {activeTab === 'journal' && (
          <div>
            {/* ── Filters bar ── */}
            <div style={{ display: 'flex', gap: 12, marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', borderRadius: 100 }}>
                <Filter size={14} style={{ color: 'var(--text-dim)' }} />
                <select className="form-select"
                  style={{ border: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', width: 140 }}
                  value={selectedJournal} onChange={e => setSelectedJournal(e.target.value)}>
                  <option value="">Tous les journaux</option>
                  {journals.map(j => <option key={j.id} value={j.id}>{j.code} — {j.name}</option>)}
                </select>
              </div>
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', borderRadius: 100 }}>
                <Calendar size={14} style={{ color: 'var(--text-dim)' }} />
                <input type="month" style={{ border: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-main)', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
              </div>
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', borderRadius: 100 }}>
                <select style={{ border: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                  <option value="">Tous les statuts</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="validee">Validée</option>
                </select>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                {journalStats.total} Écritures détectées
              </div>
            </div>

            {/* ── KPI Jewels ── */}
            <div className="grid g4" style={{ marginBottom: '32px' }}>
                <div className="kpi-jewel">
                    <div className="kpi-label">Volume Débit Total</div>
                    <div className="kpi-value" style={{ color: 'var(--primary)' }}>{fmt(journalStats.totalDebit)} <span style={{ fontSize: 14 }}>MAD</span></div>
                    <div className="kpi-trend"><TrendingUp size={14}/> Flux entrant centralisé</div>
                </div>
                <div className="kpi-jewel">
                    <div className="kpi-label">Volume Crédit Total</div>
                    <div className="kpi-value" style={{ color: 'var(--secondary)' }}>{fmt(journalStats.totalCredit)} <span style={{ fontSize: 14 }}>MAD</span></div>
                    <div className="kpi-trend"><TrendingDown size={14}/> Flux sortant centralisé</div>
                </div>
                <div className="kpi-jewel">
                    <div className="kpi-label">Écritures Validées</div>
                    <div className="kpi-value" style={{ color: 'var(--success)' }}>{journalStats.validées}</div>
                    <div className="kpi-trend text-success"><CheckCircle2 size={14}/> Certification complète</div>
                </div>
                <div className="kpi-jewel" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <div className="kpi-label">Écritures en Brouillon</div>
                    <div className="kpi-value" style={{ color: 'var(--warning)' }}>{journalStats.brouillons}</div>
                    <div className="kpi-trend text-warning"><Clock size={14}/> Action requise</div>
                </div>
            </div>

            {/* ── Journal Table ── */}
            <div style={{ padding: 0 }}>
              <div className="table-premium-responsive">
                <table className="tbl-premium">
                  <thead>
                    <tr>
                      {['Date', 'Journal', 'N° Pièce', 'Libellé / Description', 'Débit', 'Crédit', 'Statut', ''].map((h, i) => (
                        <th key={i} style={{ textAlign: (i === 4 || i === 5) ? 'right' : (i === 7 ? 'center' : 'left'), minWidth: i === 3 ? 300 : 'auto' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {journalEntries.map(entry => {
                      const entryDebit = entry.entry_lines?.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0) || 0;
                      const entryCredit = entry.entry_lines?.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0) || 0;
                      const isExpanded = expandedRow === entry.id;
                      const isMenuOpen = actionMenu === entry.id;
                      const isValidated = entry.status === 'validee';

                      return (
                        <React.Fragment key={entry.id}>
                          <tr 
                            style={{ background: isExpanded ? 'var(--surface-mut)' : 'transparent', cursor: 'pointer' }}
                            className={isExpanded ? 'active' : ''}
                          >
                            <td style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }} onClick={() => setExpandedRow(isExpanded ? null : entry.id)}>
                              {fmtDate(entry.date)}
                            </td>
                            <td onClick={() => setExpandedRow(isExpanded ? null : entry.id)}>
                              <JournalBadge code={entry.journal?.code} />
                            </td>
                            <td onClick={() => setExpandedRow(isExpanded ? null : entry.id)}>
                              <div className="flex items-center gap-2">
                                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', boxShadow: '0 0 10px var(--primary-glow)' }} />
                                 <span className="num-font" style={{ fontWeight: 800, fontSize: '13px', color: 'var(--text-main)' }}>{entry.numero || `E-${entry.id}`}</span>
                              </div>
                            </td>
                            <td style={{ fontWeight: 500 }} onClick={() => setExpandedRow(isExpanded ? null : entry.id)}>
                              {entry.description}
                            </td>
                            <td className="num-font" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--blue)' }} onClick={() => setExpandedRow(isExpanded ? null : entry.id)}>
                              {fmt(entryDebit)}
                            </td>
                            <td className="num-font" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }} onClick={() => setExpandedRow(isExpanded ? null : entry.id)}>
                              {fmt(entryCredit)}
                            </td>
                            <td onClick={() => setExpandedRow(isExpanded ? null : entry.id)}>
                              <StatusBadge status={entry.status} />
                            </td>
                            <td style={{ textAlign: 'center', position: 'relative' }}>
                              <button
                                className="tb-icon-btn"
                                style={{ width: 30, height: 30 }}
                                onClick={e => { e.stopPropagation(); setActionMenu(isMenuOpen ? null : entry.id); }}
                              >
                                <MoreVertical size={14} />
                              </button>

                              {isMenuOpen && (
                                <div style={{
                                  position: 'absolute', right: 8, top: '100%', zIndex: 300,
                                  background: 'var(--surface-real)', border: '1px solid var(--border)',
                                  borderRadius: 10, boxShadow: 'var(--shadow-lux)',
                                  minWidth: 180, overflow: 'hidden',
                                  animation: 'cardIn 0.12s ease',
                                }} onClick={e => e.stopPropagation()}>
                                  <div style={{ padding: '6px 0' }}>
                                    <button onClick={() => openEditModal(entry)} style={menuItemStyle}>
                                      <Edit size={14} style={{ color: 'var(--blue)' }} /> Modifier l'écriture
                                    </button>
                                    {isValidated ? (
                                      <button onClick={() => handleStatusChange(entry, 'brouillon')} style={menuItemStyle}>
                                        <Clock size={14} style={{ color: 'var(--amber)' }} /> Passer en brouillon
                                      </button>
                                    ) : (
                                      <button onClick={() => handleStatusChange(entry, 'validee')} style={menuItemStyle}>
                                        <CheckCheck size={14} style={{ color: 'var(--primary)' }} /> Valider l'écriture
                                      </button>
                                    )}
                                    <button onClick={() => { setExpandedRow(isExpanded ? null : entry.id); setActionMenu(null); }} style={menuItemStyle}>
                                      {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
                                      {isExpanded ? 'Masquer les lignes' : 'Voir les lignes'}
                                    </button>
                                    <div style={{ height: 1, background: 'var(--border-light)', margin: '4px 0' }} />
                                    <button onClick={() => handleDelete(entry.id)} style={{ ...menuItemStyle, color: 'var(--danger)' }}>
                                      <Trash2 size={14} /> Supprimer
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr>
                              <td colSpan={8} style={{ padding: 0, backgroundColor: 'var(--surface-mut)' }}>
                                <div className="fade-in" style={{ padding: '24px 48px', borderLeft: '4px solid var(--primary)', background: 'linear-gradient(to right, var(--surface-mut), transparent)' }}>
                                  <div className="flex items-center gap-2 mb-4">
                                     <Layers size={14} className="text-primary" />
                                     <span className="premium-font" style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Détail des écritures divisionnaires</span>
                                  </div>
                                  <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                    <table className="tbl-premium" style={{ border: 'none' }}>
                                      <thead style={{ background: 'var(--surface-real)' }}>
                                        <tr>
                                          {['Compte', 'Libellé de ligne', 'Débit', 'Crédit'].map((h, i) => (
                                            <th key={i} style={{
                                              padding: '12px 16px', textAlign: i >= 2 ? 'right' : 'left',
                                              fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                                              color: 'var(--text-dim)', border: 'none'
                                            }}>{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {entry.entry_lines?.map((line, li) => (
                                          <tr key={li} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '14px 16px' }}>
                                              <div className="flex items-center gap-3">
                                                 <span className="num-font" style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '13px' }}>{line.account?.number}</span>
                                                 <span style={{ color: 'var(--text-main)', fontSize: '12px', fontWeight: 500 }}>{line.account?.label}</span>
                                              </div>
                                            </td>
                                            <td style={{ padding: '14px 16px', color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '12px' }}>
                                              {line.label || '—'}
                                            </td>
                                            <td className="num-font" style={{ padding: '14px 16px', textAlign: 'right', color: parseFloat(line.debit) > 0 ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: 800, fontSize: '13px' }}>
                                              {parseFloat(line.debit) > 0 ? fmt(line.debit) : '—'}
                                            </td>
                                            <td className="num-font" style={{ padding: '14px 16px', textAlign: 'right', color: parseFloat(line.credit) > 0 ? 'var(--text-main)' : 'var(--text-dim)', fontWeight: 800, fontSize: '13px' }}>
                                              {parseFloat(line.credit) > 0 ? fmt(line.credit) : '—'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════ GRAND LIVRE TAB ════════════════════ */}
        {activeTab === 'grand-livre' && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="glass-panel" style={{ flex: 1, maxWidth: 440, display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', borderRadius: 100 }}>
                <Search size={14} style={{ color: 'var(--text-dim)' }} />
                <select className="form-select" style={{ border: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', width: '100%' }}
                  value={glAccountId} onChange={e => setGlAccountId(e.target.value)}>
                  <option value="">Sélectionner un compte comptable...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.number} — {a.label}</option>)}
                </select>
              </div>
            </div>

            {glAccountId ? (
              <>
                {/* ── GL Quick Stats ── */}
                <div className="grid g3" style={{ marginBottom: '24px' }}>
                    {(() => {
                        const totalDebit = grandLivreData.reduce((s, m) => s + m.debit, 0);
                        const totalCredit = grandLivreData.reduce((s, m) => s + m.credit, 0);
                        const balance = totalDebit - totalCredit;
                        return (
                            <>
                                <div className="kpi-jewel">
                                    <div className="kpi-label">Mouvements Débit</div>
                                    <div className="kpi-value" style={{ color: 'var(--blue)' }}>{fmt(totalDebit)}</div>
                                </div>
                                <div className="kpi-jewel">
                                    <div className="kpi-label">Mouvements Crédit</div>
                                    <div className="kpi-value" style={{ color: 'var(--primary)' }}>{fmt(totalCredit)}</div>
                                </div>
                                <div className="kpi-jewel" style={{ borderLeft: '4px solid var(--accent)' }}>
                                    <div className="kpi-label">Solde {balance >= 0 ? 'Débiteur' : 'Créditeur'}</div>
                                    <div className="kpi-value" style={{ color: balance >= 0 ? 'var(--blue)' : 'var(--amber)' }}>{fmt(Math.abs(balance))}</div>
                                </div>
                            </>
                        );
                    })()}
                </div>

                <div className="table-premium-responsive">
                  <table className="tbl-premium">
                    <thead>
                      <tr>
                        {['Date', 'Réf. Pièce', 'Libellé de l\'opération', 'Débit', 'Crédit', 'Solde Cumulé'].map((h, i) => (
                          <th key={i} style={{ textAlign: i >= 3 ? 'right' : 'left' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {grandLivreData.map((m, idx) => (
                        <tr key={idx}>
                          <td style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{fmtDate(m.date)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--blue)' }} />
                                <span className="num-font" style={{ fontWeight: 700, fontSize: 11, color: 'var(--blue)' }}>{m.piece}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-main)', fontWeight: 500 }}>{m.libelle}</td>
                          <td className="num-font" style={{ textAlign: 'right', fontSize: 12, color: 'var(--blue)', fontWeight: m.debit > 0 ? 600 : 400 }}>{m.debit > 0 ? fmt(m.debit) : '—'}</td>
                          <td className="num-font" style={{ textAlign: 'right', fontSize: 12, color: 'var(--primary)', fontWeight: m.credit > 0 ? 600 : 400 }}>{m.credit > 0 ? fmt(m.credit) : '—'}</td>
                          <td className="num-font" style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: m.balance >= 0 ? 'var(--blue)' : 'var(--amber)' }}>{fmt(m.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="card glass-panel" style={{ padding: '80px 20px', textAlign: 'center' }}>
                <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.2, display: 'block' }} />
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 4 }}>Grand Livre non initialisé</div>
                <p style={{ fontSize: 13, color: 'var(--text3)', maxWidth: 300, margin: '0 auto' }}>Sélectionnez un compte comptable ci-dessus pour visualiser l'historique détaillé des mouvements.</p>
              </div>
            )}
          </>
        )}

        {/* ════════════════════ BALANCE TAB ════════════════════ */}
        {activeTab === 'balance' && (
          <div className="table-premium-responsive">
            <table className="tbl-premium">
              <thead>
                <tr>
                  {['N° Compte', 'Intitulé du compte', 'Cumul Débit', 'Cumul Crédit', 'Solde Débiteur', 'Solde Créditeur'].map((h, i) => (
                    <th key={i} style={{ textAlign: i >= 2 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {balanceData.map(acc => {
                  const solde = acc.totalDebit - acc.totalCredit;
                  return (
                    <tr key={acc.id}>
                      <td className="num-font" style={{ fontWeight: 700, fontSize: 12, color: 'var(--primary)' }}>{acc.number}</td>
                      <td style={{ color: 'var(--text-main)', fontWeight: 500 }}>{acc.label}</td>
                      <td className="num-font" style={{ textAlign: 'right', fontSize: 12, color: 'var(--text2)' }}>{fmt(acc.totalDebit)}</td>
                      <td className="num-font" style={{ textAlign: 'right', fontSize: 12, color: 'var(--text2)' }}>{fmt(acc.totalCredit)}</td>
                      <td className="num-font" style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>{solde > 0 ? fmt(solde) : '—'}</td>
                      <td className="num-font" style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--amber)' }}>{solde < 0 ? fmt(Math.abs(solde)) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot style={{ background: 'var(--surface-mut)', borderTop: '2px solid var(--border-light)' }}>
                {(() => {
                  const sumDebit = balanceData.reduce((s, a) => s + (a.totalDebit || 0), 0);
                  const sumCredit = balanceData.reduce((s, a) => s + (a.totalCredit || 0), 0);
                  const sumSoldeDeb = balanceData.reduce((s, a) => s + (Math.max(0, a.totalDebit - a.totalCredit)), 0);
                  const sumSoldeCred = balanceData.reduce((s, a) => s + (Math.max(0, a.totalCredit - a.totalDebit)), 0);
                  return (
                    <tr style={{ fontWeight: 800 }}>
                      <td colSpan={2} style={{ padding: '16px', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Totaux de la période</td>
                      <td className="num-font" style={{ textAlign: 'right' }}>{fmt(sumDebit)}</td>
                      <td className="num-font" style={{ textAlign: 'right' }}>{fmt(sumCredit)}</td>
                      <td className="num-font" style={{ textAlign: 'right', color: 'var(--blue)' }}>{fmt(sumSoldeDeb)}</td>
                      <td className="num-font" style={{ textAlign: 'right', color: 'var(--amber)' }}>{fmt(sumSoldeCred)}</td>
                    </tr>
                  );
                })()}
              </tfoot>
            </table>
          </div>
        )}

        {/* ════════════════════ PCM TAB ════════════════════ */}
        {activeTab === 'pcm' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <div className="glass-panel" style={{ flex: 1, maxWidth: 440, display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', borderRadius: 100 }}>
                <Search size={14} style={{ color: 'var(--text-dim)' }} />
                <input type="text" placeholder="Rechercher par numéro ou intitulé de compte..."
                  style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: 'var(--text)', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  value={pcmSearch} onChange={e => setPcmSearch(e.target.value)} />
              </div>
            </div>
            
            <div className="table-premium-responsive">
              <table className="tbl-premium">
                <thead>
                  <tr>
                    <th width="12%">Classe</th>
                    <th width="15%">N° Compte</th>
                    <th width="43%">Désignation / Libellé</th>
                    <th width="15%">Nature</th>
                    <th width="15%">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pcmGroups.map(group => (
                    <React.Fragment key={group.id}>
                      <tr className="row-group-header" style={{ background: 'var(--surface2)', borderLeft: '4px solid var(--primary)' }}>
                        <td colSpan={5} style={{ padding: '12px 20px', fontWeight: 800, color: 'var(--primary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Classe {group.id} — {group.label}
                        </td>
                      </tr>
                      {group.accounts.map(acc => (
                        <tr key={acc.id} className="group" style={{ position: 'relative' }}>
                          <td style={{ color: 'var(--text-dim)', fontSize: 11, fontStyle: 'italic' }}>Cl. {group.id}</td>
                          <td className="acc-number">
                            <span className="num-font" style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-main)' }}>{acc.number}</span>
                          </td>
                          <td className="acc-label">
                            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{acc.label}</span>
                          </td>
                          <td className="acc-type">
                            <span className="badge badge-gray" style={{ textTransform: 'capitalize', fontSize: 10 }}>{acc.type}</span>
                          </td>
                          <td className="acc-sens">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: getSens(acc.type) === 'Débit' ? 'var(--blue)' : 'var(--primary)' }}>{getSens(acc.type)}</span>
                              <div style={{ display: 'flex', gap: 6, opacity: 0 }} className="row-actions">
                                <button className="tb-icon-btn" onClick={() => handleAccountEdit(acc)} title="Modifier" style={{ width: 28, height: 28 }}><Edit size={14} /></button>
                                <button className="tb-icon-btn" onClick={() => handleAccountDelete(acc.id)} title="Supprimer" style={{ width: 28, height: 28, color: 'var(--danger)', background: 'var(--danger-glow)' }}><Trash2 size={14} /></button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  {pcmGroups.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>
                      <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.2, display: 'block' }} />
                      Aucun compte correspondant à votre recherche n'a été trouvé.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════ ENTRY MODAL (Create / Edit) ════════════════════ */}
      {isModalOpen && (
        <div className="modal-overlay-premium" onClick={() => { setIsModalOpen(false); setActionMenu(null); }}>
          <div className="modal-card-premium" style={{ width: '100%', maxWidth: 1080 }} onClick={e => e.stopPropagation()}>
            
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)' }}>
              <div className="modal-title" style={{ fontSize: 20, fontWeight: 800 }}>
                {editingEntry ? <Edit size={24} className="text-secondary" /> : <Plus size={24} className="text-primary" />}
                <span className="ml-2">{editingEntry ? `Modification Écritures` : 'Nouvelle Saisie Comptable'}</span>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content-wrapper">
              {/* Left Side: Form */}
              <div className="modal-scrollable">
                {submitError && (
                  <div className="alert alert-red mb-6"><AlertCircle size={15} /> {submitError}</div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                  <div className="premium-form-group">
                    <label className="premium-label">Journal</label>
                    <select className="premium-input" value={entryForm.journal_id} onChange={e => setEntryForm({ ...entryForm, journal_id: e.target.value })}>
                      <option value="">Choisir...</option>
                      {journals.map(j => <option key={j.id} value={j.id}>{j.code} — {j.name}</option>)}
                    </select>
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Date d'opération</label>
                    <input type="date" className="premium-input px-4" value={entryForm.date} onChange={e => setEntryForm({ ...entryForm, date: e.target.value })} />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Libellé Global (Header)</label>
                    <input className="premium-input px-4" placeholder="ex : Achat Fournitures Bureaux..." value={entryForm.description} onChange={e => setEntryForm({ ...entryForm, description: e.target.value })} />
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Statut</label>
                    <select className="premium-input px-4" value={entryForm.status} onChange={e => setEntryForm({ ...entryForm, status: e.target.value })}>
                      <option value="brouillon">Brouillon</option>
                      <option value="validee">Validée</option>
                    </select>
                  </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden', borderStyle: 'solid', background: '#fff', border: '1px solid var(--border-light)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-mut)' }}>
                        {['Compte Comptable', 'Désignation de la ligne', 'Débit', 'Crédit', ''].map((h, i) => (
                          <th key={i} style={{ padding: '16px', textAlign: i >= 2 && i <= 3 ? 'right' : 'left', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {entryForm.lines.map((line, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }} className="hover:bg-surface-mut/30">
                          <td style={{ padding: '12px 16px', width: '32%' }}>
                            <select className="premium-input italic" style={{ padding: '10px 14px', fontSize: '13px', border: '1px solid transparent', background: 'var(--surface-mut)' }} value={line.account_id} onChange={e => handleLineChange(idx, 'account_id', e.target.value)}>
                              <option value="">Chercher compte...</option>
                              {accounts.map(a => <option key={a.id} value={a.id}>{a.number} — {a.label}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <input className="premium-input" style={{ padding: '10px 14px', fontSize: '13px', border: '1px solid transparent' }} placeholder="Commentaire..." value={line.label} onChange={e => handleLineChange(idx, 'label', e.target.value)} />
                          </td>
                          <td style={{ padding: '12px 16px', width: '15%' }}>
                            <input type="number" className="premium-input num-font" style={{ padding: '10px 14px', fontSize: '14px', textAlign: 'right', fontWeight: 800, color: 'var(--secondary)' }} placeholder="0.00" value={line.debit} onChange={e => handleLineChange(idx, 'debit', e.target.value)} />
                          </td>
                          <td style={{ padding: '12px 16px', width: '15%' }}>
                            <input type="number" className="premium-input num-font" style={{ padding: '10px 14px', fontSize: '14px', textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }} placeholder="0.00" value={line.credit} onChange={e => handleLineChange(idx, 'credit', e.target.value)} />
                          </td>
                          <td style={{ padding: '12px 16px', width: '50px', textAlign: 'center' }}>
                            {entryForm.lines.length > 2 && (
                               <button onClick={() => setEntryForm({ ...entryForm, lines: entryForm.lines.filter((_,i) => i !== idx) })} className="tb-icon-btn text-danger hover:bg-danger-glow" style={{ width: 32, height: 32 }}>
                                 <Trash2 size={14} />
                               </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: '20px', background: 'var(--surface-mut)' }}>
                    <button className="btn btn-outline btn-sm bg-white" style={{ borderRadius: '8px' }} onClick={() => setEntryForm({ ...entryForm, lines: [...entryForm.lines, { account_id:'', label:'', debit:'', credit:'' }] })}>
                      <Plus size={16} /> Ajouter une imputation
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Info Panel */}
              <div className="side-info-panel" style={{ background: 'var(--surface-mut)', borderLeft: '1px solid var(--border-light)' }}>
                <div className="flex flex-col gap-6">
                  <div>
                    <h4 className="premium-font mb-4" style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>Récapitulatif financier</h4>
                    <div className="flex flex-col gap-3">
                      <div className="card" style={{ padding: '16px', background: '#fff', border: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>Total Débit</span>
                        <div className="num-font" style={{ fontSize: '20px', fontWeight: 900, color: 'var(--secondary)' }}>{fmt(totalDebit)}</div>
                      </div>
                      <div className="card" style={{ padding: '16px', background: '#fff', border: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase' }}>Total Crédit</span>
                        <div className="num-font" style={{ fontSize: '20px', fontWeight: 900, color: 'var(--primary)' }}>{fmt(totalCredit)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                      <div className={`card ${isBalanced ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-danger/10 border-danger/20'}`} style={{ padding: '24px', textAlign: 'center', transition: 'all 0.3s' }}>
                          {isBalanced ? <CheckCheck size={32} className="mx-auto mb-2 text-white" /> : <AlertTriangle size={32} className="mx-auto mb-2 text-danger" />}
                          <div style={{ fontWeight: 900, fontSize: '14px', color: isBalanced ? '#fff' : 'var(--danger)', textTransform: 'uppercase' }}>
                            {isBalanced ? 'Équilibre OK' : 'Déséquilibre'}
                          </div>
                          {!isBalanced && (
                             <p className="num-font" style={{ fontSize: '11px', marginTop: '8px', color: 'var(--danger)', fontWeight: 700 }}>
                               Écart: {fmt(Math.abs(totalDebit - totalCredit))} MAD
                             </p>
                          )}
                      </div>
                      
                      <button className="btn btn-primary w-full mt-6" style={{ height: '52px', borderRadius: '12px' }} disabled={!isBalanced || submitting} onClick={handleSubmit}>
                          {submitting ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                          <span className="ml-3 font-bold">{editingEntry ? 'Mettre à jour' : 'Enregistrer l\'écriture'}</span>
                      </button>
                      <button className="btn btn-ghost w-full mt-3 text-dim" onClick={() => setIsModalOpen(false)}>Annuler</button>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-border-light text-center">
                   <div className="flex items-center justify-center gap-2 text-muted">
                      <Sparkles size={14} />
                      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Assist v2.0</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ ACCOUNT MODAL ════════════════════ */}
      {isAccountModalOpen && (
        <div className="modal-overlay-premium" onClick={() => setIsAccountModalOpen(false)}>
          <div className="modal-card-premium" style={{ width: '100%', maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)' }}>
              <div className="modal-title" style={{ fontSize: 20, fontWeight: 800 }}>
                {editingAccount ? <Edit size={24} className="text-secondary" /> : <Plus size={24} className="text-primary" />}
                <span className="ml-2">{editingAccount ? 'Modifier le Compte' : 'Nouveau Compte PCM'}</span>
              </div>
              <button className="modal-close" onClick={() => setIsAccountModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content-wrapper" style={{ gridTemplateColumns: '1fr 240px' }}>
              <div className="modal-scrollable">
                <form onSubmit={e => { e.preventDefault(); handleAccountSubmit(); }}>
                  {accountError && <div className="alert alert-red mb-4"><AlertCircle size={15}/> {accountError}</div>}
                  <div className="premium-form-group mb-6">
                    <label className="premium-label">Numéro de compte *</label>
                    <input className="premium-input" placeholder="ex: 6111" required value={accountForm.number} onChange={e => setAccountForm({ ...accountForm, number: e.target.value })} />
                    <p className="text-muted" style={{ fontSize: 10, marginTop: 4 }}>Format numérique (4 à 8 chiffres recommandés).</p>
                  </div>
                  <div className="premium-form-group mb-6">
                    <label className="premium-label">Intitulé du Compte *</label>
                    <input className="premium-input" placeholder="ex: Achats de marchandises" required value={accountForm.label} onChange={e => setAccountForm({ ...accountForm, label: e.target.value })} />
                  </div>
                  <div className="premium-form-group mb-6">
                    <label className="premium-label">Type de compte</label>
                    <select className="premium-input" value={accountForm.type} onChange={e => setAccountForm({ ...accountForm, type: e.target.value })}>
                      <option value="actif">Actif (Classe 2, 3)</option>
                      <option value="passif">Passif (Classe 1, 4)</option>
                      <option value="charge">Charge (Classe 6)</option>
                      <option value="produit">Produit (Classe 7)</option>
                    </select>
                  </div>
                </form>
              </div>

              <div className="side-info-panel" style={{ padding: '24px 20px' }}>
                <div>
                  <h4 className="premium-label" style={{ marginBottom: 12 }}>Règle de Classe</h4>
                  <div className="card glass-panel" style={{ padding: '12px', background: 'var(--primary-glow)', border: 'none' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                      {accountForm.number?.[0] === '6' && "Classe 6 : Charges d'exploitation. Impacte le résultat en diminuant le bénéfice."}
                      {accountForm.number?.[0] === '7' && "Classe 7 : Produits d'exploitation. Augmente le bénéfice et le CA."}
                      {accountForm.number?.[0] === '1' && "Classe 1 : Financement permanent (Capitaux propres, dettes long terme)."}
                      {accountForm.number?.[0] === '2' && "Classe 2 : Actif immobilisé (Investissements durable)."}
                      {accountForm.number?.[0] === '3' && "Classe 3 : Actif circulant (Stocks, créances clients)."}
                      {accountForm.number?.[0] === '4' && "Classe 4 : Passif circulant (Dettes fournisseurs/sociales)."}
                      {accountForm.number?.[0] === '5' && "Classe 5 : Trésorerie (Banque, Caisse)."}
                      {!accountForm.number && "Saisissez un numéro pour voir l'aide."}
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex-c gap-3">
                  <button className="btn btn-primary w-full" style={{ height: 48 }} onClick={handleAccountSubmit}>
                    {editingAccount ? <Edit size={18} /> : <Plus size={18} />}
                    <span className="ml-2">{editingAccount ? 'Mettre à jour' : 'Créer Compte'}</span>
                  </button>
                  <button className="btn btn-outline w-full" onClick={() => setIsAccountModalOpen(false)}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Close menus on click outside ── */}
      {actionMenu && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }} onClick={() => setActionMenu(null)} />
      )}

      <style>{`
        .tbl-pro tr.group:hover .row-actions { opacity: 1 !important; }
        .row-actions { transition: opacity 0.15s; }
        @keyframes dropdownIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ── Shared menu item style ── */
const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 9,
  width: '100%', padding: '9px 14px',
  background: 'transparent', border: 'none',
  fontSize: 13, fontWeight: 500, color: 'var(--text2)',
  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  textAlign: 'left', transition: 'background 0.12s',
};
