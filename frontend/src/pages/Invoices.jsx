import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  FileText, Plus, Search, Filter, CheckCircle, 
  XCircle, Clock, MoreVertical, Download, Eye,
  Trash2, AlertCircle, Loader2, Scan
} from 'lucide-react';

const Invoices = () => {
  const { data, loading, refresh } = useData();
  const [activeTab, setActiveTab] = useState('achat'); // achat/vente
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [newInvoice, setNewInvoice] = useState({
    type: 'achat',
    numero: '',
    tier_id: '',
    date: new Date().toISOString().split('T')[0],
    echeance: '',
    lines: [
      { description: '', quantity: 1, price: 0, tva_rate: 20 }
    ]
  });

  const filteredInvoices = useMemo(() => {
    return data.invoices.filter(f => {
      const matchesTab = f.type === activeTab;
      const matchesSearch = f.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (f.tier?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.invoices, activeTab, searchTerm]);

  // Filtering Tiers for selection based on tab
  const filteredTiers = useMemo(() => {
    const tierType = activeTab === 'achat' ? 'fournisseur' : 'client';
    return data.tiers.filter(t => t.type === tierType);
  }, [data.tiers, activeTab]);

  const totals = useMemo(() => {
    let ht = 0;
    let tva = 0;
    newInvoice.lines.forEach(line => {
      const lineHt = (parseFloat(line.quantity) || 0) * (parseFloat(line.price) || 0);
      const lineTva = lineHt * ((parseFloat(line.tva_rate) || 0) / 100);
      ht += lineHt;
      tva += lineTva;
    });
    return { ht, tva, ttc: ht + tva };
  }, [newInvoice.lines]);

  const handleLineChange = (index, field, value) => {
    const lines = [...newInvoice.lines];
    lines[index][field] = value;
    setNewInvoice({ ...newInvoice, lines });
  };

  const addLine = () => {
    setNewInvoice({
      ...newInvoice,
      lines: [...newInvoice.lines, { description: '', quantity: 1, price: 0, tva_rate: 20 }]
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
    setError(null);
    setSubmitting(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newInvoice)
      });
      if (response.ok) {
        setIsModalOpen(false);
        refresh();
        setNewInvoice({
          type: activeTab, numero: '', tier_id: '',
          date: new Date().toISOString().split('T')[0], echeance: '',
          lines: [{ description: '', quantity: 1, price: 0, tva_rate: 20 }]
        });
      } else {
        const err = await response.json();
        setError(err.message || 'Erreur lors de la création de la facture');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut: 'validée' })
      });
      if (response.ok) refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const badgeStatus = (status) => {
    const colors = {
      validée: 'badge-green',
      payée: 'badge-green',
      en_attente: 'badge-amber',
      rejetée: 'badge-red'
    };
    return <span className={`badge ${colors[status] || 'badge-gray'}`}>{status}</span>;
  };

  const fmt = (n) => Number(n || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 });

  return (
    <div className="layout-container">
      <div className="coa-header">
        <div>
          <h1 className="flex items-center gap-3">
            <FileText size={28} className="text-primary" /> Gestion des Factures
          </h1>
          <p className="text-muted">Suivi des factures d'achats et de ventes avec comptabilisation automatique.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline">
            <Scan size={18} /> Import OCR
          </button>
          <button className="btn btn-primary" onClick={() => { 
            setNewInvoice({...newInvoice, type: activeTab});
            setIsModalOpen(true); 
          }}>
            <Plus size={20} /> Nouvelle facture
          </button>
        </div>
      </div>

      <div className="tabs mt-8">
        <button className={`tab ${activeTab === 'achat' ? 'active' : ''}`} onClick={() => setActiveTab('achat')}>
          Achats
        </button>
        <button className={`tab ${activeTab === 'vente' ? 'active' : ''}`} onClick={() => setActiveTab('vente')}>
          Ventes
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex-1 max-w-lg flex items-center gap-3 glass-panel px-4 py-2">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            className="form-input border-none bg-transparent" 
            placeholder="Rechercher par numéro ou tier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-hidden">
          <table className="tbl-pro">
            <thead>
              <tr>
                <th width="15%">N° FACTURE</th>
                <th width="20%">{activeTab === 'achat' ? 'FOURNISSEUR' : 'CLIENT'}</th>
                <th width="10%">DATE</th>
                <th width="10%">ÉCHÉANCE</th>
                <th width="10%" className="text-right">HT</th>
                <th width="8%" className="text-right">TVA</th>
                <th width="10%" className="text-right">TTC</th>
                <th width="10%">STATUT</th>
                <th width="12%">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="acc-number">{invoice.numero}</td>
                  <td className="acc-label">{invoice.tier?.name || 'N/A'}</td>
                  <td className="text-muted">{new Date(invoice.date).toLocaleDateString('fr-MA')}</td>
                  <td className="text-muted">{invoice.echeance ? new Date(invoice.echeance).toLocaleDateString('fr-MA') : '—'}</td>
                  <td className="text-right acc-label">{fmt(invoice.ht)}</td>
                  <td className="text-right text-muted">{fmt(invoice.tva)}</td>
                  <td className="text-right font-bold text-primary">{fmt(invoice.ttc)}</td>
                  <td>{badgeStatus(invoice.statut)}</td>
                  <td>
                    <div className="flex gap-2">
                       {invoice.statut === 'en_attente' && (
                         <button className="btn btn-sm btn-primary py-1 px-3" onClick={() => handleValidate(invoice.id)}>
                           Valider
                         </button>
                       )}
                       {invoice.statut === 'en_attente' && (
                         <button className="btn btn-sm btn-danger py-1 px-3">
                           Rejeter
                         </button>
                       )}
                       <button className="btn-icon-small" title="Voir">
                         <Eye size={14} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && !loading && (
                <tr><td colSpan="9" className="p-20 text-center text-muted">Aucune facture trouvée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal max-w-5xl">
            <div className="modal-header">
              <h2 className="flex items-center gap-2">
                <FileText size={20} className="text-primary" /> 
                Nouvelle Facture {activeTab === 'achat' ? 'Fournisseur' : 'Client'}
              </h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-red mb-4"><AlertCircle size={18}/> {error}</div>}
              
              <div className="grid g3 mb-8">
                <div className="form-group">
                  <label className="form-label">Numéro Facture</label>
                  <input 
                    className="form-input" 
                    placeholder="FA-2024-XXXX" 
                    value={newInvoice.numero}
                    onChange={e => setNewInvoice({...newInvoice, numero: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{activeTab === 'achat' ? 'Fournisseur' : 'Client'}</label>
                  <select 
                    className="form-select" 
                    value={newInvoice.tier_id}
                    onChange={e => setNewInvoice({...newInvoice, tier_id: e.target.value})}
                  >
                    <option value="">Sélectionner un tiers...</option>
                    {filteredTiers.map(t => <option key={t.id} value={t.id}>{t.code} - {t.name}</option>)}
                  </select>
                </div>
                <div className="grid g2">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input 
                      type="date" className="form-input" 
                      value={newInvoice.date}
                      onChange={e => setNewInvoice({...newInvoice, date: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Échéance</label>
                    <input 
                      type="date" className="form-input" 
                      value={newInvoice.echeance}
                      onChange={e => setNewInvoice({...newInvoice, echeance: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="divider"></div>
              <h3 className="mb-4">Détails de la facture</h3>
              
              <div className="coa-table-wrapper" style={{maxHeight:'300px'}}>
                <table className="coa-table">
                  <thead>
                    <tr>
                      <th width="40%">Description</th>
                      <th width="10%">Qté</th>
                      <th width="20%">Prix Unitaire (HT)</th>
                      <th width="15%">Taux TVA</th>
                      <th width="10%" className="text-right">Total HT</th>
                      <th width="5%"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newInvoice.lines.map((line, idx) => (
                      <tr key={idx}>
                        <td>
                          <input 
                            className="form-input" 
                            placeholder="Libellé de l'article..." 
                            value={line.description}
                            onChange={e => handleLineChange(idx, 'description', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="form-input text-center" 
                            value={line.quantity}
                            onChange={e => handleLineChange(idx, 'quantity', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" className="form-input" 
                            value={line.price}
                            onChange={e => handleLineChange(idx, 'price', e.target.value)}
                          />
                        </td>
                        <td>
                          <select 
                            className="form-select" 
                            value={line.tva_rate}
                            onChange={e => handleLineChange(idx, 'tva_rate', e.target.value)}
                          >
                            <option value="20">20%</option>
                            <option value="14">14%</option>
                            <option value="10">10%</option>
                            <option value="7">7%</option>
                            <option value="0">0%</option>
                          </select>
                        </td>
                        <td className="text-right font-bold">
                          {fmt(line.quantity * line.price)}
                        </td>
                        <td>
                          <button className="text-red-500 hover:bg-red-50" onClick={() => removeLine(idx)}>
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-outline mt-4" onClick={addLine}>+ Ajouter une ligne</button>
            </div>
            <div className="modal-footer flex justify-between items-center border-t border-white/10 pt-6">
              <div className="flex gap-10">
                <div className="flex flex-col">
                  <span className="text-muted text-[10px] uppercase font-bold">Total HT</span>
                  <span className="text-lg font-bold">{fmt(totals.ht)} MAD</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted text-[10px] uppercase font-bold">Total TVA</span>
                  <span className="text-lg font-bold text-amber-600">{fmt(totals.tva)} MAD</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted text-[10px] uppercase font-bold">Total TTC</span>
                  <span className="text-2xl font-bold text-primary">{fmt(totals.ttc)} MAD</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button 
                  className="btn btn-primary" 
                  disabled={submitting || !newInvoice.numero || !newInvoice.tier_id}
                  onClick={handleSubmit}
                >
                  {submitting ? <Loader2 className="animate-spin" size={18}/> : 'Enregistrer la facture'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
