import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useModules';
import { useInvoices, useTiers } from '../hooks/useInvoicing';
import { useJournals } from '../hooks/useAccounting';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, 
  Layers, FileCheck, ArrowUpRight, Plus, X, BookOpen, 
  Loader2, Sparkles, Activity, Calculator 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showFastEntry, setShowFastEntry] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: statsData, isLoading: loadingStats } = useDashboardStats();
  const { data: invoices, isLoading: loadingInvoices } = useInvoices();
  const { data: tiers, isLoading: loadingTiers } = useTiers();
  const { data: journals, isLoading: loadingJournals } = useJournals();

  const loading = loadingStats || loadingInvoices || loadingTiers || loadingJournals;

  if (loading) return <div className="flex items-center justify-center h-full"><span className="loader"></span></div>;

  const stats = statsData || { ca: 0, charges: 0, tvaCollectee: 0, tvaDeductible: 0, resultat: 0 };
  const invoicesList = invoices || [];
  const tiersList = tiers || [];
  const journalsList = journals || [];
  
  const caData = [
    { name: 'Jan', CA: 42000, Charges: 31000 },
    { name: 'Fév', CA: 38000, Charges: 28000 },
    { name: 'Mar', CA: 51000, Charges: 35000 },
    { name: 'Avr', CA: 49000, Charges: 34000 },
    { name: 'Mai', CA: 62000, Charges: 41000 },
    { name: 'Jun', CA: stats.ca || 43300, Charges: stats.charges || 29870 },
  ];

  const tvaData = [
    { name: 'Collectée', value: stats.tvaCollectee || 35400, color: '#3B82F6' },
    { name: 'Déductible', value: stats.tvaDeductible || 12000, color: '#1E3A8A' },
    { name: 'À payer', value: (stats.tvaCollectee - stats.tvaDeductible) || 23400, color: '#6366F1' },
  ];

  const fmt = (n) => Number(n).toLocaleString('fr-MA', { minimumFractionDigits: 2 });

  return (
    <div className="fade-in">
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Vue Panoramique</h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>Exercice Fiscal 2024 · Temps Réel</p>
        </div>
        <div className="flex gap-3">
            <button className="btn btn-outline">Extraire PDF</button>
            <button className="btn btn-primary" onClick={() => setShowFastEntry(true)}>
              <Plus size={18} /> Nouvelle Saisie
            </button>
        </div>
      </div>

      {/* KPI Jewels */}
      <div className="grid g5" style={{ marginBottom: '32px' }}>
        {/* Metric 1: Chiffre d'Affaires */}
        <div className="kpi-jewel kpi-emerald">
          <div className="kpi-label">Chiffre d'Affaires</div>
          <div className="kpi-value">{fmt(stats.ca || 0)} MAD</div>
          <div className="kpi-trend trend-up">
            <TrendingUp size={14}/> Performance brute
          </div>
          <div style={{ position: 'absolute', right: 24, bottom: 24, opacity: 0.1 }}>
             <DollarSign size={40} />
          </div>
        </div>

        {/* Metric 2: Total Dépenses */}
        <div className="kpi-jewel kpi-rose">
          <div className="kpi-label">Total Dépenses</div>
          <div className="kpi-value">{fmt(stats.charges || 0)} MAD</div>
          <div className="kpi-trend trend-down">
            <TrendingDown size={14}/> Charges d'exploitation
          </div>
          <div style={{ position: 'absolute', right: 24, bottom: 24, opacity: 0.1 }}>
             <Activity size={40} />
          </div>
        </div>

        {/* Metric 3: TVA à Déclarer */}
        <div className="kpi-jewel kpi-sky">
          <div className="kpi-label">TVA à Déclarer</div>
          <div className="kpi-value">{fmt(Math.max(0, stats.tvaCollectee - stats.tvaDeductible) || 0)} MAD</div>
          <div className="kpi-trend text-info">
             Position fiscale nette
          </div>
          <div style={{ position: 'absolute', right: 24, bottom: 24, opacity: 0.1 }}>
             <Calculator size={40} />
          </div>
        </div>

        {/* Metric 4: Résultat Net */}
        <div className="kpi-jewel kpi-indigo">
          <div className="kpi-label">Résultat Net</div>
          <div className="kpi-value">{fmt(stats.resultat || 0)} MAD</div>
          <div className="kpi-trend trend-up">
            <Sparkles size={14}/> Bénéfice estimé
          </div>
          <div style={{ position: 'absolute', right: 24, bottom: 24, opacity: 0.1 }}>
             <Layers size={40} />
          </div>
        </div>

        {/* Metric 5: Factures Validées */}
        <div className="kpi-jewel kpi-amber">
          <div className="kpi-label">Factures Validées</div>
          <div className="kpi-value">{invoicesList.filter(f => f.statut === 'validée').length}</div>
          <div className="kpi-trend text-muted">
             {invoicesList.filter(f => f.statut === 'en_attente').length} en attente
          </div>
          <div style={{ position: 'absolute', right: 24, bottom: 24, opacity: 0.1 }}>
             <FileCheck size={40} />
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid g12" style={{ marginBottom: '32px' }}>
        <div className="card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>Analytique CA & Charges</h3>
            <span className="badge badge-success">Mise à jour à l'instant</span>
          </div>
          <div style={{ height: 320, padding: '24px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={caData}>
                <defs>
                  <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 12}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow)' }} 
                   cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="CA" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCA)" />
                <Area type="monotone" dataKey="Charges" stroke="#60A5FA" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="premium-font">Distribution TVA</h3>
          <p className="text-muted" style={{ fontSize: '12px', marginBottom: '20px' }}>Ventilation par catégorie fiscale</p>
          <div style={{ height: 200, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tvaData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {tvaData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
             {tvaData.map(d => (
               <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--surface-mut)', fontSize: '12px' }}>
                 <div className="flex" style={{ gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                    <span style={{ fontWeight: 600 }}>{d.name}</span>
                 </div>
                 <span style={{ fontWeight: 800 }}>{fmt(d.value)} MAD</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Bottom area */}
      <div className="grid g12">
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Journal des Factures</h3>
            <button className="btn btn-outline btn-xs gap-1">Historique Complet <ArrowUpRight size={12}/></button>
          </div>
          <div className="tbl-container" style={{ borderRadius: 0, border: 'none', borderTop: '1px solid var(--border-light)' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Partenaire</th>
                  <th>Total TTC</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {invoicesList.slice(-6).reverse().map(invoice => (
                  <tr key={invoice.id}>
                    <td className="premium-font" style={{ fontWeight: 700, color: 'var(--secondary)' }}>{invoice.numero}</td>
                    <td>{invoice.tier?.name || 'Inconnu'}</td>
                    <td style={{ fontWeight: 800 }}>{fmt(invoice.ttc)} MAD</td>
                    <td>
                      <span className={`badge ${invoice.statut === 'validée' ? 'badge-success' : 'badge-warning'}`}>
                        {invoice.statut}
                      </span>
                    </td>
                    <td className="text-muted">{new Date(invoice.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex-c">
            <div className="card glass-panel" style={{ background: 'linear-gradient(135deg, var(--secondary), var(--primary-dark))', color: '#fff' }}>
                <h3 style={{ color: '#fff', opacity: 0.8, fontSize: '12px', textTransform: 'uppercase' }}>Trésorerie Disponible</h3>
                <div style={{ fontSize: '32px', fontWeight: 800, margin: '8px 0' }}>{fmt(185420)} MAD</div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>BFR: Positif (+45k ce mois)</div>
            </div>
            
            <div className="card">
                <h3 className="premium-font">Alertes Intelligentes</h3>
                <div className="flex-c" style={{ marginTop: '16px' }}>
                    <div className="alert alert-amber">
                        <span className="badge badge-warning">TVA</span>
                        <div style={{ fontSize: '12px' }}>Déclaration à soumettre sous <strong>4 jours</strong>.</div>
                    </div>
                    <div className="alert alert-blue">
                        <span className="badge badge-info">RH</span>
                        <div style={{ fontSize: '12px' }}><strong>12 salariés</strong> en attente de validation de paie.</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* ── Saisie Rapide Modal ── */}
      {showFastEntry && (
        <div className="modal-overlay-premium" onClick={() => setShowFastEntry(false)}>
          <div className="modal-card-premium" style={{ width: '100%', maxWidth: 800 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)' }}>
              <div className="modal-title" style={{ fontSize: 20, fontWeight: 800 }}>
                <Activity size={24} className="text-primary" />
                <span className="ml-2">Saisie Rapide (Trésorerie & Opérations)</span>
              </div>
              <button className="modal-close" onClick={() => setShowFastEntry(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content-wrapper" style={{ gridTemplateColumns: '1fr 280px' }}>
              <div className="modal-scrollable">
                <form onSubmit={e => { e.preventDefault(); navigate('/comptabilite'); }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="premium-form-group mb-6">
                        <label className="premium-label">Type d'opération</label>
                        <select className="premium-input">
                            <option>Paiement Fournisseur (Sortie)</option>
                            <option>Encaissement Client (Entrée)</option>
                            <option>Opération Diverse</option>
                        </select>
                      </div>
                      <div className="premium-form-group mb-6">
                        <label className="premium-label">Montant (MAD) *</label>
                        <input className="premium-input" type="number" placeholder="0.00" required />
                      </div>
                  </div>
                  
                  <div className="premium-form-group mb-6">
                    <label className="premium-label">Compte de contrepartie</label>
                    <select className="premium-input">
                        <option>Choisir un partenaire ou compte...</option>
                        {tiersList.map(t => <option key={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="premium-form-group mb-6">
                        <label className="premium-label">Journal</label>
                        <select className="premium-input">
                            {journalsList.filter(j => j.type === 'tresorerie').map(j => <option key={j.id}>{j.code} - {j.name}</option>)}
                        </select>
                      </div>
                      <div className="premium-form-group mb-6">
                        <label className="premium-label">Date</label>
                        <input className="premium-input" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                  </div>
                  <div className="premium-form-group">
                    <label className="premium-label">Libellé</label>
                    <input className="premium-input" placeholder="Justification de l'opération..." />
                  </div>
                </form>
              </div>

              <div className="side-info-panel" style={{ padding: '24px 20px' }}>
                <div>
                  <h4 className="premium-label" style={{ marginBottom: 12 }}>Pourquoi utiliser la saisie rapide ?</h4>
                  <div className="card glass-panel" style={{ padding: '12px', background: 'var(--primary-glow)', border: 'none' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                      <Sparkles size={14} className="inline mr-1 text-primary"/> Ce formulaire simplifie la saisie des opérations courantes en générant automatiquement l'écriture d'équilibre (Partie double) sur le compte de trésorerie sélectionné.
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex-c gap-3">
                  <button className="btn btn-primary w-full" style={{ height: 48 }} onClick={() => navigate('/comptabilite')}>
                    <BookOpen size={18} />
                    <span className="ml-2">Ouvrir le Journal</span>
                  </button>
                  <button className="btn btn-outline w-full" onClick={() => setShowFastEntry(false)}>Fermer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
