import React from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { ShieldCheck, ArrowRight, Download, Info, Calendar, TrendingUp, DollarSign, FileText } from 'lucide-react';

const Fiscalite = () => {
  const { data, loading } = useData();

  if (loading) return <div className="flex items-center justify-center h-[400px]"><div className="loader"></div></div>;

  const stats = data?.stats || { ca: 0, charges: 0, tvaCollectee: 0, tvaDeductible: 0, resultat: 0 };
  const tvaCollectee = stats.tvaCollectee || 0;
  const tvaDeductible = stats.tvaDeductible || 0;
  const tvaNet = tvaCollectee - tvaDeductible;

  const chartData = [
    { name: 'Collectée (Ventes)', value: tvaCollectee },
    { name: 'Déductible (Achats)', value: tvaDeductible },
  ];

  const COLORS = ['#10B981', '#3B82F6'];

  const fmt = (n) => Number(n || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 });

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Gestion de la T.V.A</h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>Suivi des flux fiscaux et préparation de la déclaration mensuelle (Modèle DGI).</p>
        </div>
        <div className="flex gap-2">
            <button className="btn btn-primary" onClick={() => alert('État EDI généré !')}>
                <Download size={18} /> Télécharger XML (Simpl-TVA)
            </button>
        </div>
      </div>

      {/* ── KPI Jewels ── */}
      <div className="grid g3" style={{ marginBottom: '32px' }}>
        <div className="kpi-jewel">
          <div className="kpi-label">TVA Collectée (Dette)</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{fmt(tvaCollectee)} <span style={{fontSize:14}}>MAD</span></div>
          <div className="kpi-trend text-muted">Sur chiffre d'affaires réalisé</div>
        </div>

        <div className="kpi-jewel">
          <div className="kpi-label">TVA Déductible (Créance)</div>
          <div className="kpi-value" style={{ color: 'var(--secondary)' }}>{fmt(tvaDeductible)} <span style={{fontSize:14}}>MAD</span></div>
          <div className="kpi-trend text-muted">Sur achats et investissements</div>
        </div>

        <div className="kpi-jewel" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="kpi-label">{tvaNet >= 0 ? 'TVA DUE (À Verser)' : 'Crédit de TVA'}</div>
          <div className="kpi-value" style={{ color: 'var(--accent)' }}>{fmt(Math.abs(tvaNet))} <span style={{fontSize:14}}>MAD</span></div>
          <div className="kpi-trend trend-up">
            <TrendingUp size={14}/> Provision financière OK
          </div>
        </div>
      </div>

      <div className="grid g2 mt-8">
        {/* PIE CHART */}
        <div className="card glass-panel" style={{ padding: '32px' }}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="premium-font" style={{ fontWeight: 800 }}>Répartition du Flux Fiscal</h3>
            <div className="badge badge-success">Période : Juin 2024</div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ border: 'none', borderRadius: '12px', background: 'var(--surface)', boxShadow: 'var(--shadow-lg)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HISTORY */}
        <div className="card glass-panel" style={{ padding: '32px' }}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="premium-font" style={{ fontWeight: 800 }}>Historique des Déclarations</h3>
            <button className="btn btn-outline btn-xs">Voir tout</button>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { month: 'Mai 2024', net: 6200, status: 'Payé' },
              { month: 'Avril 2024', net: 4900, status: 'Payé' },
              { month: 'Mars 2024', net: 5000, status: 'Payé' },
              { month: 'Février 2024', net: 3800, status: 'Payé' },
              { month: 'Janvier 2024', net: 4100, status: 'Payé' },
            ].map((item, id) => (
              <div key={id} className="flex justify-between items-center p-4 rounded-xl border border-white/5 bg-bg">
                <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-muted" />
                    <span style={{ fontWeight: 700 }}>{item.month}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-main)' }}>{fmt(item.net)} MAD</span>
                  <span className="badge badge-success" style={{ fontSize: 10 }}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-8" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <FileText size={18} className="text-secondary" />
            <h3 className="premium-font" style={{ fontWeight: 800 }}>Détails par Taux (Prélèvement à la source)</h3>
        </div>
        <div className="tbl-container" style={{ borderRadius: 0, border: 'none' }}>
            <table className="tbl">
                <thead>
                    <tr>
                        <th width="20%">TAX RATE</th>
                        <th style={{ textAlign: 'right' }}>BASE H.T. VENTES</th>
                        <th style={{ textAlign: 'right' }}>TVA COLLECTÉE</th>
                        <th style={{ textAlign: 'right' }}>BASE H.T. ACHATS</th>
                        <th style={{ textAlign: 'right' }}>TVA DÉDUCTIBLE</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span className="badge badge-gray" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>20% Normal</span></td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(stats.ca)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>{fmt(tvaCollectee)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(stats.charges)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--secondary)' }}>{fmt(tvaDeductible)}</td>
                    </tr>
                    <tr style={{ background: 'var(--surface-mut)', fontWeight: 800 }}>
                        <td style={{ textTransform: 'uppercase', fontSize: 11 }}>Calculated Totals</td>
                        <td style={{ textAlign: 'right' }}>—</td>
                        <td style={{ textAlign: 'right', color: 'var(--primary)' }}>{fmt(tvaCollectee)} MAD</td>
                        <td style={{ textAlign: 'right' }}>—</td>
                        <td style={{ textAlign: 'right', color: 'var(--secondary)' }}>{fmt(tvaDeductible)} MAD</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Fiscalite;
