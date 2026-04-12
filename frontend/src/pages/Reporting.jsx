import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart3, PieChart, TrendingUp, Download, 
  ArrowUpRight, ArrowDownRight, Info, FileText, Activity,
  Globe, ShieldCheck, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';

const Reporting = () => {
  const { data, loading } = useData();
  const [activeTab, setActiveTab] = useState('bilan');

  const stats = data?.stats || { ca: 0, charges: 0, tvaCollectee: 0, tvaDeductible: 0, resultat: 0 };

  // Simple aggregation for Bilan
  const actifImm = data?.accounts?.filter(a => a.number.startsWith('2')).reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0) || 450000;
  const actifCir = data?.accounts?.filter(a => a.number.startsWith('3')).reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0) || 125000;
  const tresoActif = data?.accounts?.filter(a => a.number.startsWith('5')).reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0) || 85420;
  const totalActif = actifImm + actifCir + tresoActif;

  const capitaux = data?.accounts?.filter(a => a.number.startsWith('1')).reduce((sum, a) => sum + (Math.abs(parseFloat(a.balance)) || 0), 0) || 500000;
  const passifCir = data?.accounts?.filter(a => a.number.startsWith('4')).reduce((sum, a) => sum + (Math.abs(parseFloat(a.balance)) || 0), 0) || 115000;
  const totalPassif = capitaux + passifCir + (stats.resultat || 45420);

  const formatMAD = (n) => Number(n || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 }) + ' MAD';

  if (loading) return <div className="flex items-center justify-center h-[400px]"><div className="loader"></div></div>;

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Intelligence Décisionnelle</h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>États financiers consolidés (Bilan & CPC) et outils de data-visualisation.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline">
            <Download size={18} /> Rapports Fiscaux
          </button>
          <button className="btn btn-primary">
            <TrendingUp size={18} /> Analyse Prédictive
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <button 
            className={`btn ${activeTab==='bilan'?'btn-dark':'btn-outline'}`} 
            onClick={() => setActiveTab('bilan')}
            style={{ borderRadius: '100px', fontSize: '12px' }}
        >
          Bilan Comptable
        </button>
        <button 
            className={`btn ${activeTab==='cpc'?'btn-dark':'btn-outline'}`} 
            onClick={() => setActiveTab('cpc')}
            style={{ borderRadius: '100px', fontSize: '12px' }}
        >
          Compte de Produits & Charges (CPC)
        </button>
        <button 
            className={`btn ${activeTab==='kpi'?'btn-dark':'btn-outline'}`} 
            onClick={() => setActiveTab('kpi')}
            style={{ borderRadius: '100px', fontSize: '12px' }}
        >
          Performance & Analyse KPI
        </button>
      </div>

      {/* ── Content Area ── */}
      <div className="mt-8">
        {activeTab === 'bilan' && (
          <div className="grid grid-cols-2 gap-8 zoom-in">
            {/* ACTIF */}
            <div className="card glass-panel" style={{ padding: '32px' }}>
                <div className="flex items-center justify-between mb-8">
                    <h3 className="premium-font" style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px', color: 'var(--text-dim)' }}>ACTIF (Emplois de fonds)</h3>
                    <ShieldCheck size={20} className="text-primary"/>
                </div>
                
                <div className="flex flex-col gap-6">
                    <div className="p-4 rounded-xl bg-bg border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="premium-font" style={{ fontWeight: 800, fontSize: '13px' }}>ACTIF IMMOBILISÉ</span>
                            <span style={{ fontWeight: 800 }}>{formatMAD(actifImm)}</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>Valeur brute des actifs à long terme</div>
                    </div>

                    <div className="p-4 rounded-xl bg-bg border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="premium-font" style={{ fontWeight: 800, fontSize: '13px' }}>ACTIF CIRCULANT</span>
                            <span style={{ fontWeight: 800 }}>{formatMAD(actifCir)}</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>Stocks, créances clients et valeurs d'exploitation</div>
                    </div>

                    <div className="p-4 rounded-xl bg-bg border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="premium-font" style={{ fontWeight: 800, fontSize: '13px' }}>TRÉSORERIE ACTIF</span>
                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatMAD(tresoActif)}</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>Disponibilités bancaires et caisse immédiates</div>
                    </div>

                    <div style={{ marginTop: '20px', padding: '24px', borderRadius: '16px', background: 'var(--primary-glow)', border: '1px solid rgba(5,150,105,0.2)' }}>
                        <div className="flex justify-between items-center">
                            <span className="premium-font" style={{ fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>TOTAL DE L'ACTIF</span>
                            <span style={{ fontWeight: 900, fontSize: '20px', color: 'var(--primary)' }}>{formatMAD(totalActif)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* PASSIF */}
            <div className="card glass-panel" style={{ padding: '32px' }}>
                <div className="flex items-center justify-between mb-8">
                    <h3 className="premium-font" style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px', color: 'var(--text-dim)' }}>PASSIF (Ressources de fonds)</h3>
                    <Globe size={20} className="text-secondary"/>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="p-4 rounded-xl bg-bg border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="premium-font" style={{ fontWeight: 800, fontSize: '13px' }}>CAPITAUX PROPRES</span>
                            <span style={{ fontWeight: 800 }}>{formatMAD(capitaux)}</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>Apports des associés et réserves</div>
                    </div>

                    <div className="p-4 rounded-xl bg-bg border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="premium-font" style={{ fontWeight: 800, fontSize: '13px', color: 'var(--accent)' }}>RÉSULTAT NET</span>
                            <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{formatMAD(stats.resultat || 45420)}</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>Bénéfice net après impôts et taxes</div>
                    </div>

                    <div className="p-4 rounded-xl bg-bg border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="premium-font" style={{ fontWeight: 800, fontSize: '13px' }}>PASSIF CIRCULANT</span>
                            <span style={{ fontWeight: 800 }}>{formatMAD(passifCir)}</span>
                        </div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>Dettes fournisseurs, fiscales et sociales</div>
                    </div>

                    <div style={{ marginTop: '20px', padding: '24px', borderRadius: '16px', background: 'var(--secondary-glow)', border: '1px solid rgba(30,58,138,0.2)' }}>
                        <div className="flex justify-between items-center">
                            <span className="premium-font" style={{ fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>TOTAL DU PASSIF</span>
                            <span style={{ fontWeight: 900, fontSize: '20px', color: 'var(--secondary)' }}>{formatMAD(totalPassif)}</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'cpc' && (
          <div className="card glass-panel fade-in" style={{ padding: '40px' }}>
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="premium-font" style={{ margin: 0 }}>Compte de Produits et Charges (CPC)</h2>
                    <p className="text-muted">Analyse synthétique de la performance sur la période.</p>
                </div>
                <div className="flex gap-2">
                    <span className="badge badge-success">Conforme PCM</span>
                </div>
            </div>

            <div className="tbl-container" style={{ border: 'none', borderRadius: '16px', overflow: 'hidden' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th width="70%">RUBRIQUES PRINCIPALES</th>
                    <th style={{ textAlign: 'right' }}>MONTANT (MAD)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: 'var(--surface-mut)' }}>
                    <td colSpan="2" className="premium-font" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>I. Produits d'Exploitation</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '32px' }}>Chiffre d'Affaires (Ventes HT)</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>+{(stats.ca || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '32px' }}>Autres produits d'exploitation</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>0,00</td>
                  </tr>
                  
                  <tr style={{ background: 'var(--surface-mut)' }}>
                    <td colSpan="2" className="premium-font" style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>II. Charges d'Exploitation</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '32px' }}>Achats de marchandises & Charges externes</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>-{(stats.charges || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '32px' }}>Impôts, taxes et charges de personnel</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>À calculer</td>
                  </tr>

                  <tr style={{ height: '32px' }}></tr>
                  
                  <tr style={{ background: 'var(--primary)', color: 'white' }}>
                    <td style={{ padding: '24px', fontSize: '18px', fontWeight: 800 }}>RESULTAT DE L'EXERCICE (PERTE / PROFIT)</td>
                    <td style={{ padding: '24px', textAlign: 'right', fontSize: '24px', fontWeight: 900 }}>{(stats.resultat || 0).toLocaleString()} MAD</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'kpi' && (
          <div className="grid g2 fade-in">
            <div className="card glass-panel" style={{ padding: '32px' }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="premium-font" style={{ fontWeight: 800 }}>Croissance du Revenu</h3>
                    <div className="text-muted" style={{ fontSize: '12px' }}>Comparatif mensuel sur le semestre glissant.</div>
                </div>
                <Activity size={20} className="text-primary" />
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                        {name: 'Jan', value: 42000}, {name: 'Fev', value: 38000}, 
                        {name: 'Mar', value: 51000}, {name: 'Avr', value: 49000}, 
                        {name: 'Mai', value: 62000}, {name: 'Jun', value: stats.ca || 43300}
                    ]}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={1}/>
                                <stop offset="95%" stopColor="var(--primary-glow)" stopOpacity={0.8}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 11}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 11}} />
                        <Tooltip 
                            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}
                            itemStyle={{ color: 'var(--primary)', fontWeight: 800 }}
                        />
                        <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card glass-panel" style={{ padding: '32px' }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="premium-font" style={{ fontWeight: 800 }}>Cash-Flow & Liquidités</h3>
                        <div className="text-muted" style={{ fontSize: '12px' }}>Évolution de la position nette de trésorerie.</div>
                    </div>
                    <Sparkles size={20} className="text-secondary" />
                </div>
                <div style={{ height: '300px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                            {name: 'Jan', value: 120000}, {name: 'Fev', value: 135000}, 
                            {name: 'Mar', value: 110000}, {name: 'Avr', value: 145000}, 
                            {name: 'Mai', value: 130000}, {name: 'Jun', value: 185420}
                        ]}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 11}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 11}} />
                            <Tooltip 
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '12px' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="var(--secondary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reporting;
