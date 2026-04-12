import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Plus, Search, Filter, Download, Upload, 
  MoreVertical, Edit, Trash2, X, Check, AlertCircle, Loader2,
  Building2, MapPin, Mail, Phone, Globe, Briefcase, Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';

const API = 'http://localhost:8000/api';

const PlanTiers = () => {
  const { data, loading, refresh } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    code: '', name: '', type: 'client', account_id: '',
    ice: '', if: '', rc: '', patente: '', cnss: '',
    address: '', ville: '', phone: '', email: ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');
    const url = editingTier ? `${API}/tiers/${editingTier.id}` : `${API}/tiers`;
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
        refresh();
        resetForm();
      }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression de ce tiers ?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API}/tiers/${id}`, {
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
      const response = await fetch(`${API}/tiers/import`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataBody
      });
      if (response.ok) {
        refresh();
      }
    } catch (err) { console.error(err); }
    setImporting(false);
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
      code: tier.code, name: tier.name, type: tier.type, account_id: tier.account_id || '',
      ice: tier.ice || '', if: tier.if || '', rc: tier.rc || '',
      patente: tier.patente || '', cnss: tier.cnss || '',
      address: tier.address || '', ville: tier.ville || '',
      phone: tier.phone || '', email: tier.email || ''
    });
    setShowModal(true);
  };

  const filteredTiers = (data.tiers || []).filter(t => {
    const matchesSearch = (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="fade-in">
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Référentiel des Tiers</h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>Gestion centralisée des clients, fournisseurs et partenaires institutionnels.</p>
        </div>
        <div className="flex gap-2">
            <button className="btn btn-outline" onClick={() => fileInputRef.current.click()}>
                <Upload size={18} /> {importing ? 'Importation...' : 'Import Excel/CSV'}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImport} hidden accept=".xlsx,.xls,.csv" />
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                <Plus size={18} /> Nouveau Partenaire
            </button>
        </div>
      </div>

      <div className="grid g3" style={{ marginBottom: '32px' }}>
         <div className="kpi-jewel">
            <div className="kpi-label">Base Clients</div>
            <div className="kpi-value">{(data.tiers || []).filter(t=>t.type==='client').length}</div>
            <div className="kpi-trend text-muted">Comptes de classe 34</div>
         </div>
         <div className="kpi-jewel">
            <div className="kpi-label">Base Fournisseurs</div>
            <div className="kpi-value">{(data.tiers || []).filter(t=>t.type==='fournisseur').length}</div>
            <div className="kpi-trend text-muted">Comptes de classe 44</div>
         </div>
         <div className="kpi-jewel" style={{ borderLeft: '4px solid var(--accent)' }}>
            <div className="kpi-label">Identités Fiscales OK</div>
            <div className="kpi-value">{(data.tiers || []).filter(t=>t.ice && t.if).length}</div>
            <div className="kpi-trend text-muted">Conformité DGI à 92%</div>
         </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex gap-3">
                {['all', 'client', 'fournisseur', 'salarie'].map(type => (
                    <button 
                        key={type}
                        className={`btn btn-xs ${filterType === type ? 'btn-dark' : 'btn-outline'}`}
                        style={{ borderRadius: 100, padding: '6px 16px', textTransform: 'capitalize' }}
                        onClick={() => setFilterType(type)}
                    >
                        {type === 'all' ? 'Tous' : type + 's'}
                    </button>
                ))}
            </div>
            <div style={{ position: 'relative', width: 300 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                    className="form-input" 
                    style={{ paddingLeft: 36, borderRadius: 100, height: 36 }}
                    placeholder="Chercher par nom, code ou ICE..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="table-premium-responsive">
            {loading ? (
                <div style={{ padding: 60, textAlign: 'center' }}><Loader2 className="animate-spin mx-auto text-primary" /></div>
            ) : (
                <table className="tbl-premium">
                    <thead>
                        <tr>
                            <th>Identité Partenaire</th>
                            <th>Typologie</th>
                            <th>Compte Collectif</th>
                            <th>Localisation</th>
                            <th>Fisc / Légal</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTiers.map(tier => (
                            <tr key={tier.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="tb-avatar" style={{ 
                                            background: tier.type==='client'?'var(--primary-glow)':'var(--secondary-glow)', 
                                            color: tier.type==='client'?'var(--primary)':'var(--secondary)',
                                            width: 28, height: 28, fontSize: 10
                                        }}>
                                            {tier.name[0]}
                                        </div>
                                        <div className="flex-c">
                                            <span style={{ fontWeight: 800, fontSize: 13 }}>{tier.name}</span>
                                            <span className="num-font" style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>{tier.code}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${tier.type === 'client' ? 'badge-success' : 'badge-warning'}`}>
                                        {tier.type}
                                    </span>
                                </td>
                                <td style={{ fontSize: 12, fontWeight: 600 }}>
                                    {tier.account ? (
                                        <span className="num-font" style={{ color: 'var(--primary)' }}>{tier.account.number}</span>
                                    ) : (
                                        <span className="text-muted">—</span>
                                    )}
                                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{tier.account?.label}</div>
                                </td>
                                <td style={{ fontSize: 13, fontWeight: 500 }}>
                                    <div className="flex items-center" style={{ gap: 4 }}>
                                        <MapPin size={12} className="text-muted"/>
                                        <span>{tier.ville || '-'}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex-c" style={{ gap: 2 }}>
                                        <span className="num-font" style={{ fontSize: 11, fontWeight: 700 }}>{tier.ice || 'ICE Inconnu'}</span>
                                        <span className="num-font" style={{ fontSize: 10, color: 'var(--text-dim)' }}>{tier.if && `IF: ${tier.if}`}</span>
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="flex justify-end gap-2">
                                        <button className="tb-icon-btn" style={{ width: 30, height: 30 }} onClick={() => openEdit(tier)}><Edit size={14} /></button>
                                        <button className="tb-icon-btn" style={{ width: 30, height: 30, color: 'var(--danger)', background: 'var(--danger-glow)' }} onClick={() => handleDelete(tier.id)}><Trash2 size={14} /></button>
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
        <div className="modal-overlay-premium" onClick={() => setShowModal(false)}>
          <div className="modal-card-premium" style={{ width: '100%', maxWidth: 1000 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)' }}>
              <div className="modal-title" style={{ fontSize: 20, fontWeight: 800 }}>
                <Briefcase size={24} className="text-secondary" />
                <span className="ml-2">{editingTier ? 'Mise à jour Dossier Tiers' : 'Ouverture de Compte Tiers'}</span>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content-wrapper">
              <div className="modal-scrollable">
                <form onSubmit={handleSave}>
                  <div className="grid g3 mb-6">
                    <div className="premium-form-group">
                      <label className="premium-label">Code Interne *</label>
                      <input className="premium-input" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="ex: CL001" required />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Raison Sociale / Nom *</label>
                      <input className="premium-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Type de Relation *</label>
                      <select className="premium-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="client">Client</option>
                        <option value="fournisseur">Fournisseur</option>
                        <option value="salarie">Salarié</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid g2 mb-6">
                    <div className="premium-form-group">
                      <label className="premium-label">Compte Collectif Associé</label>
                      <select className="premium-input" value={formData.account_id} onChange={e => setFormData({...formData, account_id: e.target.value})}>
                        <option value="">Sélectionner un compte...</option>
                        {data.accounts.filter(a => a.number.startsWith('34') || a.number.startsWith('44')).map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.number} - {acc.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">E-mail de contact</label>
                      <input className="premium-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>

                  <div style={{ padding: '24px', background: 'var(--surface-mut)', borderRadius: '16px', marginBottom: '32px', border: '1px solid var(--border-light)' }}>
                      <h4 className="premium-label" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--secondary)' }}>
                          <Sparkles size={16}/> Identifiants Fiscaux (DGI Maroc)
                      </h4>
                      <div className="grid g3">
                        <div className="premium-form-group">
                          <label className="premium-label">ICE</label>
                          <input className="premium-input" value={formData.ice} onChange={e => setFormData({...formData, ice: e.target.value})} />
                        </div>
                        <div className="premium-form-group">
                          <label className="premium-label">I.F.</label>
                          <input className="premium-input" value={formData.if} onChange={e => setFormData({...formData, if: e.target.value})} />
                        </div>
                        <div className="premium-form-group">
                          <label className="premium-label">R.C.</label>
                          <input className="premium-input" value={formData.rc} onChange={e => setFormData({...formData, rc: e.target.value})} />
                        </div>
                      </div>
                  </div>

                  <div className="grid g2">
                    <div className="premium-form-group">
                      <label className="premium-label">Téléphone</label>
                      <input className="premium-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Ville</label>
                      <input className="premium-input" value={formData.ville} onChange={e => setFormData({...formData, ville: e.target.value})} />
                    </div>
                  </div>
                </form>
              </div>

              <div className="side-info-panel">
                <div>
                  <h4 className="premium-label" style={{ marginBottom: 16 }}>Score de Conformité</h4>
                  <div className="flex-c gap-4">
                    <div className={`card glass-panel`} style={{ padding: '16px', borderLeft: `4px solid ${formData.ice && formData.if ? 'var(--primary)' : 'var(--warning)'}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        {formData.ice && formData.if ? <Check className="text-primary" size={16}/> : <AlertCircle className="text-warning" size={16}/>}
                        <span style={{ fontWeight: 800, fontSize: 13 }}>{formData.ice && formData.if ? 'Dossier Complet' : 'Dossier Incomplet'}</span>
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>
                        {formData.ice && formData.if 
                            ? 'Les informations fiscales obligatoires sont renseignées.' 
                            : 'ICE et I.F. sont requis pour la déductibilité de la TVA.'}
                      </p>
                    </div>

                    <div className="card glass-panel" style={{ padding: '16px' }}>
                      <span className="premium-label" style={{ fontSize: 9 }}>Compte Comptable</span>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--secondary)', marginTop: 4 }}>
                        {formData.account_id ? data.accounts.find(a => a.id.toString() === formData.account_id.toString())?.number : 'Non assigné'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex-c gap-3">
                  <button className="btn btn-primary w-full" style={{ height: 48 }} onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                    <span className="ml-2">Finaliser le Dossier</span>
                  </button>
                  <button className="btn btn-outline w-full" onClick={() => setShowModal(false)}>Abandonner</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanTiers;
