import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  DollarSign, Package, TrendingUp, ChevronRight, 
  Save, Download, Calculator, List, Activity, Sparkles, Building, X, Loader2, AlertCircle, Banknote, ShieldCheck, Info, FileCheck,
  Zap, Search, Filter, ArrowRight, Wand2, CreditCard
} from 'lucide-react';

const Budget = () => {
  const { data, loading } = useData();
  const [activeTab, setActiveTab] = useState('budget');
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const budgetData = [
    { name: 'Jan', revenue: 450000, expenses: 320000, budget: 400000 },
    { name: 'Fév', revenue: 520000, expenses: 380000, budget: 400000 },
    { name: 'Mar', revenue: 480000, expenses: 410000, budget: 450000 },
    { name: 'Avr', revenue: 610000, expenses: 450000, budget: 450000 },
    { name: 'Mai', revenue: 590000, expenses: 420000, budget: 500000 },
    { name: 'Juin', revenue: 680000, expenses: 480000, budget: 500000 },
  ];
  const [assetForm, setAssetForm] = useState({
    name: '', category: 'Matériel de transport', acquisition_date: new Date().toISOString().split('T')[0],
    acquisition_value: '', duration_years: 5, account_id: ''
  });

  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
        const res = await fetch('http://localhost:8000/api/fixed-assets', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(assetForm)
        });
        if (res.ok) {
            setShowAssetModal(false);
            setAssetForm({ name: '', category: 'Matériel de transport', acquisition_date: new Date().toISOString().split('T')[0], acquisition_value: '', duration_years: 5, account_id: '' });
            alert('Immobilisation enregistrée !');
        }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-[400px]"><div className="loader"></div></div>;

  const fmt = (n) => Number(n || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 });

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Gestion Budgétaire & Assets</h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>Pilotage prévisionnel et cycle de vie des immobilisations (Dépréciation Lineaire/Dégressive).</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline"><Save size={18} /> Sauvegarder</button>
          <button className="btn btn-primary" onClick={() => setShowAssetModal(true)}><Package size={20} /> Nouvelle Immobilisation</button>
        </div>
      </div>

      {/* ── Asset Modal ── */}
      {showAssetModal && (
        <div className="modal-overlay-premium" onClick={() => setShowAssetModal(false)}>
          <div className="modal-card-premium" style={{ width: '100%', maxWidth: 900 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)' }}>
              <div className="modal-title" style={{ fontSize: 20, fontWeight: 800 }}>
                <Building size={24} className="text-secondary" />
                <span className="ml-2">Acquisition d'Immobilisation</span>
              </div>
              <button className="modal-close" onClick={() => setShowAssetModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content-wrapper">
              <div className="modal-scrollable">
                <form onSubmit={handleAssetSubmit}>
                  <div className="premium-form-group mb-6">
                    <label className="premium-label">Désignation de l'Asset *</label>
                    <input className="premium-input" placeholder="ex: Serveur Dell PowerEdge" required value={assetForm.name} onChange={e => setAssetForm({...assetForm, name: e.target.value})} />
                  </div>
                  
                  <div className="grid g2 mb-6">
                    <div className="premium-form-group">
                      <label className="premium-label">Catégorie</label>
                      <select className="premium-input" value={assetForm.category} onChange={e => setAssetForm({...assetForm, category: e.target.value})}>
                        <option>Installations Techniques</option>
                        <option>Matériel de transport</option>
                        <option>Matériel informatique</option>
                        <option>Mobilier de bureau</option>
                      </select>
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Date d'Acquisition</label>
                      <input type="date" className="premium-input" required value={assetForm.acquisition_date} onChange={e => setAssetForm({...assetForm, acquisition_date: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid g2">
                    <div className="premium-form-group">
                      <label className="premium-label">Valeur d'Origine (H.T.) *</label>
                      <input type="number" className="premium-input" required value={assetForm.acquisition_value} onChange={e => setAssetForm({...assetForm, acquisition_value: e.target.value})} />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Durée d'Amortissement (Ans)</label>
                      <input type="number" className="premium-input" required value={assetForm.duration_years} onChange={e => setAssetForm({...assetForm, duration_years: e.target.value})} />
                    </div>
                  </div>
                </form>
              </div>

              <div className="side-info-panel">
                <div>
                  <h4 className="premium-label" style={{ marginBottom: 16 }}>Calculateur Dotation</h4>
                  <div className="card glass-panel" style={{ padding: '20px', background: 'var(--primary-glow)' }}>
                    <span className="premium-label" style={{ fontSize: 9 }}>Annuite Estimée</span>
                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary)' }}>
                        {assetForm.acquisition_value && assetForm.duration_years > 0 
                            ? fmt(assetForm.acquisition_value / assetForm.duration_years) 
                            : '0.00'
                        } <small style={{fontSize:12}}>MAD</small>
                    </div>
                    <p style={{ fontSize: 10, marginTop: 8, opacity: 0.8 }}>Taux : {(100/(assetForm.duration_years || 1)).toFixed(0)}% Lineaire</p>
                  </div>
                </div>

                <div className="mt-auto flex-c gap-3">
                  <button className="btn btn-primary w-full" style={{ height: 48 }} onClick={handleAssetSubmit} disabled={saving}>
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
                    <span className="ml-2">Activer l'Asset</span>
                  </button>
                  <button className="btn btn-outline w-full" onClick={() => setShowAssetModal(false)}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <button 
          className={`btn ${activeTab==='budget'?'btn-dark':'btn-outline'}`} 
          onClick={() => setActiveTab('budget')}
          style={{ borderRadius: '100px', fontSize: '12px' }}
        >
          Budget Prévisionnel
        </button>
        <button 
          className={`btn ${activeTab==='assets'?'btn-dark':'btn-outline'}`} 
          onClick={() => setActiveTab('assets')}
          style={{ borderRadius: '100px', fontSize: '12px' }}
        >
          Immobilisations & Amortissements
        </button>
      </div>

      <div className="mt-8">
        {activeTab === 'budget' && (
          <div className="flex flex-col gap-8 zoom-in">
            <div className="card glass-panel" style={{ padding: '32px' }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="premium-font" style={{ fontWeight: 800 }}>Évolution Budget vs Réel</h3>
                        <p className="text-muted" style={{ fontSize: '12px' }}>Consommation des charges d'exploitation (S1 2024)</p>
                    </div>
                    <Activity size={20} className="text-primary" />
                </div>
                <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                    <BarChart data={budgetData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 11}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 11}} />
                        <Tooltip 
                            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '12px' }}
                        />
                        <Legend iconType="circle" />
                        <Bar dataKey="revenue" name="Produits (Optimiste)" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="expense" name="Charges (Réaliste)" fill="var(--danger)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="table-premium-responsive">
                <table className="tbl-premium">
                <thead>
                    <tr>
                    {['Compte', 'Libellé Budgétaire', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'].map(h => (
                        <th key={h}>{h}</th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {[
                    { code: '6111', label: 'Achats marchandises', jan: 15000, feb: 12000, mar: 18000, apr: 15000, mai: 17000, jun: 12000 },
                    { code: '6131', label: 'Fournitures bureau', jan: 2000, feb: 2000, mar: 3000, apr: 2500, mai: 2000, jun: 3500 },
                    { code: '6161', label: 'Loyers local', jan: 8500, feb: 8500, mar: 8500, apr: 8500, mai: 8500, jun: 8500 },
                    { code: '6191', label: 'Rémunérations', jan: 32450, feb: 32450, mar: 32450, apr: 32450, mai: 32450, jun: 32450 },
                    ].map((row, i) => (
                    <tr key={i}>
                        <td className="num-font" style={{ fontWeight: 800, color: 'var(--secondary)' }}>{row.code}</td>
                        <td style={{ fontWeight: 600 }}>{row.label}</td>
                        {['jan', 'feb', 'mar', 'apr', 'mai', 'jun'].map(m => (
                        <td key={m}>
                            <input 
                            type="text" 
                            className="premium-input num-font" 
                            style={{ height: 32, fontSize: 11, background: 'var(--surface-mut)', border: 'none', textAlign: 'right', padding: '4px 8px' }}
                            defaultValue={row[m].toLocaleString()}
                            />
                        </td>
                        ))}
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="grid grid-cols-12 gap-8 zoom-in">
            <div className="table-premium-responsive">
                <table className="tbl-premium">
                  <thead>
                    <tr>
                      <th width="35%">DÉSIGNATION</th>
                      <th width="15%">CATÉGORIE</th>
                      <th width="15%">ACQUISITION</th>
                      <th width="15%">VALEUR BRUTE</th>
                      <th width="20%">V.N.C. ESTIMÉE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.fixed_assets || []).length > 0 ? (data.fixed_assets || []).map(asset => (
                      <tr key={asset.id}>
                        <td>
                            <div className="flex items-center gap-3">
                                <div className="tb-avatar" style={{ background: 'var(--primary-glow)', color: 'var(--primary)', width: 28, height: 28 }}><Building size={14}/></div>
                                <span style={{ fontWeight: 800 }}>{asset.name}</span>
                            </div>
                        </td>
                        <td><span className="badge badge-gray">{asset.category}</span></td>
                        <td className="num-font" style={{ fontSize: 12 }}>{new Date(asset.acquisition_date).toLocaleDateString()}</td>
                        <td className="num-font" style={{ fontWeight: 700 }}>{fmt(asset.acquisition_value)}</td>
                        <td className="num-font" style={{ color: 'var(--primary)', fontWeight: 800 }}>{fmt(asset.acquisition_value * 0.6)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>
                        <AlertCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.2, display: 'block' }} />
                        Aucune immobilisation détectée dans le patrimoine.
                      </td></tr>
                    )}
                  </tbody>
                </table>
            </div>
            
            <div className="col-span-4 card glass-panel" style={{ padding: '32px' }}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="premium-font" style={{ fontWeight: 800 }}>Calculateur Dotations</h3>
                <Sparkles size={18} className="text-secondary" />
              </div>
              <div className="flex flex-col gap-6">
                {(data.fixed_assets || []).map(asset => {
                  const dotationAnnuelle = asset.acquisition_value / asset.duration_years;
                  return (
                    <div key={asset.id} className="p-4 rounded-xl bg-bg border border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span style={{ fontWeight: 800, fontSize: 13 }}>{asset.name}</span>
                        <span className="badge badge-success" style={{ fontSize: 10 }}>{(100/asset.duration_years).toFixed(0)}% Lineaire</span>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary)' }}>
                        {fmt(dotationAnnuelle)} <small style={{ fontSize: 10, color: 'var(--text-dim)' }}>MAD / AN</small>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="btn btn-outline w-full mt-auto">Passer les OD d'amortissement</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;
