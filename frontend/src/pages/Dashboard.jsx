import React from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

export default function Dashboard() {
  const { data, loading } = useData();

  const stats = data?.stats || { ca: 0, charges: 0, tvaCollectee: 0, tvaDeductible: 0, resultat: 0 };
  const caData = [
    { name: 'Jan', CA: 42000, Charges: 31000 },
    { name: 'Fév', CA: 38000, Charges: 28000 },
    { name: 'Mar', CA: 51000, Charges: 35000 },
    { name: 'Avr', CA: 49000, Charges: 34000 },
    { name: 'Mai', CA: 62000, Charges: 41000 },
    { name: 'Jun', CA: stats.ca || 43300, Charges: stats.charges || 29870 },
  ];

  const tvaData = [
    { name: 'Collectée', value: stats.tvaCollectee || 35400, color: '#1D9E75' },
    { name: 'Déductible', value: stats.tvaDeductible || 12000, color: '#378ADD' },
    { name: 'À payer', value: (stats.tvaCollectee - stats.tvaDeductible) || 23400, color: '#EF9F27' },
  ];

  const fmt = (n) => Number(n).toLocaleString('fr-MA', { minimumFractionDigits: 2 });

  return (
    <>
      <div className="grid g4" style={{ marginBottom: '20px' }}>
        <div className="kpi-card" style={{ borderTopColor: 'var(--green)' }}>
          <div className="kpi-label">Chiffre d'affaires</div>
          <div className="kpi-value">{fmt(stats.ca || 285300)}</div>
          <div className="kpi-sub kpi-up">↑ MAD — Exercice 2024</div>
        </div>
        <div className="kpi-card" style={{ borderTopColor: 'var(--blue)' }}>
           <div className="kpi-label">Résultat net estimé</div>
           <div className="kpi-value">{fmt(stats.resultat || 86430)}</div>
           <div className="kpi-sub kpi-up">↑ Marge {stats.ca ? Math.round(stats.resultat/stats.ca*100) : 30}%</div>
        </div>
        <div className="kpi-card" style={{ borderTopColor: 'var(--amber)' }}>
           <div className="kpi-label">TVA à payer</div>
           <div className="kpi-value">{fmt(Math.max(0, stats.tvaCollectee - stats.tvaDeductible) || 23400)}</div>
           <div className="kpi-sub text-muted">Collectée: {fmt(stats.tvaCollectee || 35400)} | Déduc: {fmt(stats.tvaDeductible || 12000)}</div>
        </div>
        <div className="kpi-card" style={{ borderTopColor: 'var(--red)' }}>
           <div className="kpi-label">Factures en attente</div>
           <div className="kpi-value">{data.invoices.filter(f => f.statut === 'en_attente').length}</div>
           <div className="kpi-sub kpi-down">→ Validation requise</div>
        </div>
      </div>

      <div className="grid g12" style={{ marginBottom: '20px' }}>
        <div className="card">
          <h3>Évolution CA vs Charges — 2024</h3>
          <div style={{ height: 300, marginTop: 20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Legend />
                <Bar dataKey="CA" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Charges" fill="#E24B4A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3>Position TVA</h3>
          <div style={{ height: 200, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tvaData}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tvaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '12px' }}>
            {tvaData.map(d => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text2)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, display: 'inline-block' }}></span>
                  {d.name}
                </span>
                <span className="fw6">{fmt(d.value)} MAD</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid g12">
        <div className="card">
          <div className="section-header">
            <h3 style={{ marginBottom: 0 }}>Dernières factures</h3>
            <button className="btn btn-outline btn-sm">Voir tout</button>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>N°</th><th>Tiers</th><th>Montant TTC</th><th>Statut</th><th>Date</th></tr>
            </thead>
            <tbody>
              {data.invoices.slice(-5).reverse().map(invoice => (
                <tr key={invoice.id}>
                  <td className="text-blue fw6">{invoice.numero}</td>
                  <td>{invoice.tier?.name || 'Tier'}</td>
                  <td className="fw6">{fmt(invoice.ttc)} MAD</td>
                  <td><span className={`badge ${invoice.statut === 'validée' ? 'badge-green' : 'badge-amber'}`}>{invoice.statut}</span></td>
                  <td className="text-muted">{new Date(invoice.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Trésorerie</h3>
          <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Solde banque courant</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--green)', margin: '4px 0' }}>{fmt(185420)} MAD</div>
          <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Attijariwafabank — 0077800...</div>
          
          <h3 style={{marginTop: '20px'}}>Alertes & Notifications</h3>
          <div className="flex-c">
            <div className="alert alert-amber"><span>⚠</span><span>Déclaration TVA — Échéance dans 5 jours</span></div>
            <div className="alert alert-blue"><span>ℹ</span><span>{data.employees.length - data.payslips.filter(p => p.month === 6).length} salariés sans bulletin Juin 2024</span></div>
            <div className="alert alert-red"><span>✕</span><span>Ecriture ACH-2024-003 non équilibrée</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
