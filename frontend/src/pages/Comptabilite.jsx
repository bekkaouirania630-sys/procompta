import React, { useState, useEffect } from 'react';

export default function Comptabilite() {
  const [activeTab, setActiveTab] = useState('journal');
  const [entries, setEntries] = useState([]);
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    journal_id: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { account_id: '', label: '', debit: '', credit: '' },
      { account_id: '', label: '', debit: '', credit: '' },
      { account_id: '', label: '', debit: '', credit: '' },
    ]
  });
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetchEntries();
    fetchJournals();
    fetchAccounts();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/api/accounting/entries', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (resp.ok) {
        setEntries(await resp.json());
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchJournals = async () => {
    try {
      const resp = await fetch('http://localhost:8000/api/accounting/journals', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Accept': 'application/json' }
      });
      if (resp.ok) setJournals(await resp.json());
    } catch (e) { console.error(e); }
  };

  const fetchAccounts = async () => {
    try {
      const resp = await fetch('http://localhost:8000/api/accounting/accounts', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Accept': 'application/json' }
      });
      if (resp.ok) setAccounts(await resp.json());
    } catch (e) { console.error(e); }
  };

  const fmtDate = (d) => {
    if(!d) return '—';
    const parts = d.split('-');
    if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return new Date(d).toLocaleDateString('fr-MA');
  };
  
  const fmt = (n) => Number(n).toLocaleString('fr-MA', { minimumFractionDigits: 2 });

  const filteredEntries = selectedJournal 
    ? entries.filter(e => e.journal && e.journal.id.toString() === selectedJournal) 
    : entries;

  // New Entry Logic
  const handleAddLine = () => {
    setNewEntry(prev => ({
      ...prev,
      lines: [...prev.lines, { account_id: '', label: '', debit: '', credit: '' }]
    }));
  };

  const handleLineChange = (index, field, value) => {
    const updatedLines = [...newEntry.lines];
    updatedLines[index][field] = value;
    
    // Auto-balance logic: if typing debit, empty credit, and vice-versa
    if (field === 'debit') updatedLines[index].credit = value ? '0' : '';
    if (field === 'credit') updatedLines[index].debit = value ? '0' : '';
    
    setNewEntry({ ...newEntry, lines: updatedLines });
  };

  const handleRemoveLine = (index) => {
    const updatedLines = newEntry.lines.filter((_, i) => i !== index);
    setNewEntry({ ...newEntry, lines: updatedLines });
  };

  const totalDebit = newEntry.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredit = newEntry.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!newEntry.journal_id) { setSubmitError('Veuillez sélectionner un journal.'); return; }
    if (!isBalanced) { setSubmitError('L\'écriture n\'est pas équilibrée (Total Débit doit être égal au Total Crédit).'); return; }

    const cleanLines = newEntry.lines.filter(l => l.account_id && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0)).map(l => ({
      account_id: l.account_id,
      label: l.label,
      debit: parseFloat(l.debit) || 0,
      credit: parseFloat(l.credit) || 0,
    }));

    if (cleanLines.length < 2) { setSubmitError('Il faut au moins deux lignes d\'écriture.'); return; }

    try {
      const resp = await fetch('http://localhost:8000/api/accounting/entries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          journal_id: newEntry.journal_id,
          date: newEntry.date,
          description: newEntry.description,
          lines: cleanLines
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || errorData.message || 'Erreur lors de la sauvegarde');
      }

      setIsModalOpen(false);
      fetchEntries(); // Refresh
      setNewEntry({
        journal_id: '', date: new Date().toISOString().split('T')[0], description: '',
        lines: [{ account_id: '', label: '', debit: '', credit: '' }, { account_id: '', label: '', debit: '', credit: '' }, { account_id: '', label: '', debit: '', credit: '' }]
      });
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  return (
    <>
      <div className="section-header">
        <div>
          <h2 style={{ marginBottom: 0 }}>Comptabilité Générale</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Nouvelle écriture</button>
      </div>

      <div className="tabs" id="compta-tabs">
        <button className={`tab ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => setActiveTab('journal')}>Journal</button>
        <button className={`tab ${activeTab === 'grand-livre' ? 'active' : ''}`} onClick={() => setActiveTab('grand-livre')}>Grand Livre</button>
        <button className={`tab ${activeTab === 'balance' ? 'active' : ''}`} onClick={() => setActiveTab('balance')}>Balance</button>
        <button className={`tab ${activeTab === 'pcm' ? 'active' : ''}`} onClick={() => setActiveTab('pcm')}>Plan Comptable</button>
      </div>

      {activeTab === 'journal' && (
        <>
          <div className="flex" style={{ marginBottom: '14px' }}>
            <select className="form-select" style={{ width: '200px' }} value={selectedJournal} onChange={(e) => setSelectedJournal(e.target.value)}>
              <option value="">Tous les journaux</option>
              {journals.map(j => (
                <option key={j.id} value={j.id}>{j.code} — {j.name}</option>
              ))}
            </select>
            <input type="month" className="form-input" defaultValue="2024-06" style={{ width: '160px' }} />
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>N° PIÈCE</th>
                  <th>DATE</th>
                  <th>JOURNAL</th>
                  <th>LIBELLÉ</th>
                  <th>DÉBIT</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="5" className="text-center" style={{ padding: '24px' }}>Chargement...</td></tr>}
                {!loading && filteredEntries.length === 0 && (
                  <tr><td colSpan="5" className="empty"><div className="empty-icon">📂</div>Aucune écriture trouvée</td></tr>
                )}
                {filteredEntries.map(e => {
                  const totD = e.entry_lines?.reduce((sum, l) => sum + parseFloat(l.debit), 0) || 0;
                  return (
                    <tr key={e.id}>
                      <td className="text-blue fw6" style={{ cursor: 'pointer' }}>{e.numero || '-'}</td>
                      <td>{fmtDate(e.date)}</td>
                      <td><span className="badge badge-gray" style={{textTransform:'uppercase'}}>{e.journal?.code || 'GEN'}</span></td>
                      <td>{e.description}</td>
                      <td className="fw6">{fmt(totD)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Nouvelle Écriture */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', background: '#FAFAF7' }}>
            <div className="modal-header" style={{ padding: '24px 32px 16px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '22px', margin: 0, color: '#111' }}>Nouvelle écriture</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)} style={{ fontSize: '24px', color: '#999' }}>✕</button>
            </div>
            
            <div className="modal-body" style={{ padding: '24px 32px', background: '#FFFFFF' }}>
              {submitError && <div className="alert alert-red" style={{ marginBottom: '16px' }}><span>✕</span><span>{submitError}</span></div>}
              
              <div className="grid g2" style={{ gap: '24px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#6B6860', fontSize: '13px', marginBottom: '2px' }}>Journal</label>
                  <select className="form-select" style={{ background: '#FAFAF7', borderColor: '#E8E4DB', height: '42px' }} value={newEntry.journal_id} onChange={(e) => setNewEntry({...newEntry, journal_id: e.target.value})}>
                    {journals.map(j => (
                      <option key={j.id} value={j.id}>{j.code} — {j.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#6B6860', fontSize: '13px', marginBottom: '2px' }}>Date pièce</label>
                  <input type="date" className="form-input" style={{ background: '#FAFAF7', borderColor: '#E8E4DB', height: '42px' }} value={newEntry.date} onChange={(e) => setNewEntry({...newEntry, date: e.target.value})} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label className="form-label" style={{ color: '#6B6860', fontSize: '13px', marginBottom: '2px' }}>Libellé</label>
                <input className="form-input" style={{ background: '#FAFAF7', borderColor: '#E8E4DB', height: '42px' }} placeholder="Libellé de l'écriture" value={newEntry.description} onChange={(e) => setNewEntry({...newEntry, description: e.target.value})} />
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#111' }}>Lignes d'écriture</h3>
              
              {newEntry.lines.map((line, idx) => (
                <div key={idx} className="flex" style={{ gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                  <select className="form-select" style={{ flex: '1.5', background: '#FFFFFF', borderColor: '#E8E4DB', height: '42px' }} value={line.account_id} onChange={(e) => handleLineChange(idx, 'account_id', e.target.value)}>
                    <option value="">Compte PCM...</option>
                    <optgroup label="Comptes Généraux">
                      {accounts.filter(a => !['3421', '4411'].includes(a.number)).map(a => (
                        <option key={a.id} value={a.id}>{a.number} — {a.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Comptes Tiers (Clients & Fournisseurs)">
                      {accounts.filter(a => ['3421', '4411'].includes(a.number)).map(a => (
                        <option key={a.id} value={a.id}>{a.number} — {a.label}</option>
                      ))}
                    </optgroup>
                  </select>
                  <input className="form-input" style={{ flex: '1.5', background: '#FFFFFF', borderColor: '#E8E4DB', height: '42px' }} placeholder="Libellé ligne" value={line.label} onChange={(e) => handleLineChange(idx, 'label', e.target.value)} />
                  <input type="number" step="0.01" className="form-input" style={{ flex: '1', background: '#FFFFFF', borderColor: '#E8E4DB', height: '42px' }} placeholder="Débit" value={line.debit} onChange={(e) => handleLineChange(idx, 'debit', e.target.value)} />
                  <input type="number" step="0.01" className="form-input" style={{ flex: '1', background: '#FFFFFF', borderColor: '#E8E4DB', height: '42px' }} placeholder="Crédit" value={line.credit} onChange={(e) => handleLineChange(idx, 'credit', e.target.value)} />
                  <button className="btn btn-outline" style={{ height: '42px', width: '42px', padding: 0, border: 'none', color: '#A32D2D', flexShrink: 0 }} onClick={() => handleRemoveLine(idx)}>✕</button>
                </div>
              ))}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <div style={{ color: '#A8A49C', fontSize: '13px' }}>
                  Débit: <span style={{ color: '#111' }}>{fmt(totalDebit)}</span> | Crédit: <span style={{ color: '#111' }}>{fmt(totalCredit)}</span>
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{ padding: '24px 32px', background: '#FFFFFF', borderTop: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-outline" style={{ border: 'none', color: 'var(--green)', fontWeight: 600 }} onClick={handleAddLine}>+ Ajouter une ligne</button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-outline" style={{ background: '#FFFFFF', borderColor: '#D4CFC4', color: '#111' }} onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button className="btn btn-primary" style={{ padding: '9px 24px' }} onClick={handleSubmit} disabled={!isBalanced && totalDebit > 0}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'journal' && (
        <div className="card empty">
          <div className="empty-icon">🚧</div>
          <h3>En cours de développement</h3>
          <p>L'onglet {activeTab} sera disponible prochainement.</p>
        </div>
      )}
    </>
  );
}
