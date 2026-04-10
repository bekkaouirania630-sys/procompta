import React from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { ShieldCheck, ArrowRight, Download, Info } from 'lucide-react';

const Fiscalite = () => {
  const { data, loading } = useData();

  const stats = data?.stats || { ca: 0, charges: 0, tvaCollectee: 0, tvaDeductible: 0, resultat: 0 };
  const tvaCollectee = stats.tvaCollectee || 0;
  const tvaDeductible = stats.tvaDeductible || 0;
  const tvaNet = tvaCollectee - tvaDeductible;

  const chartData = [
    { name: 'Collectée (Ventes)', value: tvaCollectee },
    { name: 'Déductible (Achats)', value: tvaDeductible },
  ];

  const COLORS = ['#10B981', '#3B82F6'];

  return (
    <div className="layout-container">
      <div className="coa-header">
        <div>
          <h1 className="flex items-center gap-3">
            <ShieldCheck size={28} className="text-primary" /> État de TVA — Juin 2024
          </h1>
          <p className="text-muted">Analyse de la position fiscale et préparation de la déclaration mensuelle.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => alert('Déclaration générée !')}>
            <Download size={18} /> Télécharger la Déclaration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="glass-panel p-6 border-t-4 border-green-500">
          <div className="text-muted text-xs uppercase font-bold mb-1">TVA Collectée</div>
          <div className="text-3xl font-bold">{tvaCollectee.toLocaleString()} MAD</div>
          <div className="text-xs text-muted mt-2">Dette envers l'État sur les ventes</div>
        </div>
        <div className="glass-panel p-6 border-t-4 border-blue-500">
          <div className="text-muted text-xs uppercase font-bold mb-1">TVA Déductible</div>
          <div className="text-3xl font-bold">{tvaDeductible.toLocaleString()} MAD</div>
          <div className="text-xs text-muted mt-2">Créance sur l'État sur les achats</div>
        </div>
        <div className="glass-panel p-6 border-t-4 border-amber-500">
          <div className="text-muted text-xs uppercase font-bold mb-1">{tvaNet >= 0 ? 'TVA à Payer' : 'Crédit de TVA'}</div>
          <div className="text-3xl font-bold text-amber-500">{Math.abs(tvaNet).toLocaleString()} MAD</div>
          <div className="text-xs text-muted mt-2">{tvaNet >= 0 ? 'À verser avant le 20 du mois suivant' : 'À reporter au mois prochain'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="glass-panel p-6">
          <h3 className="mb-6 font-bold">Répartition de la TVA</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="mb-6 font-bold">Historique des Déclarations</h3>
          <div className="flex flex-col gap-3">
            {[
              { month: 'Mai 2024', net: 6200, status: 'Payé' },
              { month: 'Avril 2024', net: 4900, status: 'Payé' },
              { month: 'Mars 2024', net: 5000, status: 'Payé' },
              { month: 'Février 2024', net: 3800, status: 'Payé' },
              { month: 'Janvier 2024', net: 4100, status: 'Payé' },
            ].map((item, id) => (
              <div key={id} className="flex justify-between items-center p-3 border-b border-white/5 bg-white/5 rounded">
                <span className="font-bold">{item.month}</span>
                <div className="flex items-center gap-4">
                  <span className="font-bold">{item.net.toLocaleString()} MAD</span>
                  <span className="badge badge-green">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 mt-8">
        <h3 className="mb-4 font-bold flex items-center gap-2">
          <Info size={18} className="text-primary" /> Détails par Taux
        </h3>
        <div className="coa-table-wrapper">
          <table className="coa-table">
            <thead>
              <tr>
                <th>Taux</th>
                <th>Base HT Ventes</th>
                <th>TVA Collectée</th>
                <th>Base HT Achats</th>
                <th>TVA Déductible</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="badge badge-gray" style={{background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA'}}>20% (Normal)</span></td>
                <td>{(stats.ca || 0).toLocaleString()} MAD</td>
                <td className="text-green-500 font-bold">{tvaCollectee.toLocaleString()}</td>
                <td>{(stats.charges || 0).toLocaleString()} MAD</td>
                <td className="text-blue-500 font-bold">{tvaDeductible.toLocaleString()}</td>
              </tr>
              <tr className="bg-white/5 font-bold">
                <td>TOTAL</td>
                <td>-</td>
                <td className="text-green-500 font-bold">{tvaCollectee.toLocaleString()} MAD</td>
                <td>-</td>
                <td className="text-blue-500 font-bold">{tvaDeductible.toLocaleString()} MAD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Fiscalite;
