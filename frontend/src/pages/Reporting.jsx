import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart3, PieChart, TrendingUp, Download, 
  ArrowUpRight, ArrowDownRight, Info
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';

const Reporting = () => {
  const { data, loading } = useData();
  const [activeTab, setActiveTab] = useState('bilan');

  const stats = data?.stats || { ca: 0, charges: 0, tvaCollectee: 0, tvaDeductible: 0, resultat: 0 };

  // Simple aggregation for Bilan (PCM Classes 1-5)
  const actifImm = data?.accounts?.filter(a => a.number.startsWith('2')).reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0) || 450000;
  const actifCir = data?.accounts?.filter(a => a.number.startsWith('3')).reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0) || 125000;
  const tresoActif = data?.accounts?.filter(a => a.number.startsWith('5')).reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0) || 85420;
  const totalActif = actifImm + actifCir + tresoActif;

  const capitaux = data?.accounts?.filter(a => a.number.startsWith('1')).reduce((sum, a) => sum + (Math.abs(parseFloat(a.balance)) || 0), 0) || 500000;
  const passifCir = data?.accounts?.filter(a => a.number.startsWith('4')).reduce((sum, a) => sum + (Math.abs(parseFloat(a.balance)) || 0), 0) || 115000;
  const totalPassif = capitaux + passifCir + (stats.resultat || 45420);

  const formatMAD = (n) => n.toLocaleString('fr-MA') + ' MAD';

  return (
    <div className="layout-container">
      <div className="coa-header">
        <div>
          <h1 className="flex items-center gap-3">
            <BarChart3 size={28} className="text-primary" /> États Financiers
          </h1>
          <p className="text-muted">Bilan, CPC et Analyse de performance générés en temps réel.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary">
            <Download size={18} /> Exporter PDF
          </button>
        </div>
      </div>

      <div className="tabs mt-6">
        <button className={`tab ${activeTab === 'bilan' ? 'active' : ''}`} onClick={() => setActiveTab('bilan')}>Bilan</button>
        <button className={`tab ${activeTab === 'cpc' ? 'active' : ''}`} onClick={() => setActiveTab('cpc')}>CPC (P&L)</button>
        <button className={`tab ${activeTab === 'kpi' ? 'active' : ''}`} onClick={() => setActiveTab('kpi')}>Analyse KPI</button>
      </div>

      <div className="mt-6">
        {activeTab === 'bilan' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="glass-panel p-6">
              <h3 className="text-center font-bold border-bottom pb-3 mb-4">ACTIF (Emplois)</h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between border-b border-white/5 pb-2 bg-white/5 p-2 rounded">
                  <span className="font-bold text-muted">ACTIF IMMOBILISÉ</span>
                  <span className="font-bold">{formatMAD(actifImm)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Immobilisations corporelles</span>
                  <span>{formatMAD(actifImm)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 bg-white/5 p-2 rounded">
                  <span className="font-bold text-muted">ACTIF CIRCULANT</span>
                  <span className="font-bold">{formatMAD(actifCir)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Stocks / Clients</span>
                  <span>{formatMAD(actifCir)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 bg-white/5 p-2 rounded">
                  <span className="font-bold text-muted">TRÉSORERIE ACTIF</span>
                  <span className="font-bold">{formatMAD(tresoActif)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Banque & Caisse</span>
                  <span>{formatMAD(tresoActif)}</span>
                </div>
                <div className="flex justify-between mt-6 p-4 border-t-2 border-primary font-bold text-lg">
                  <span>TOTAL ACTIF</span>
                  <span className="text-primary">{formatMAD(totalActif)}</span>
                </div>
              </div>
            </div>
            
            <div className="glass-panel p-6">
              <h3 className="text-center font-bold border-bottom pb-3 mb-4">PASSIF (Ressources)</h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between border-b border-white/5 pb-2 bg-white/5 p-2 rounded">
                  <span className="font-bold text-muted">FINANCEMENT PERMANENT</span>
                  <span className="font-bold">{formatMAD(capitaux + (data.stats.resultat || 0))}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Capital Social</span>
                  <span>{formatMAD(capitaux)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Résultat Net</span>
                  <span className="text-green-500">{formatMAD(data.stats.resultat || 45420)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 bg-white/5 p-2 rounded">
                  <span className="font-bold text-muted">PASSIF CIRCULANT</span>
                  <span className="font-bold">{formatMAD(passifCir)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span>Fournisseurs & Taxes</span>
                  <span>{formatMAD(passifCir)}</span>
                </div>
                <div className="flex justify-between mt-auto pt-4 pb-2 bg-white/5 p-2 rounded text-muted">
                  <span className="font-bold">TRÉSORERIE PASSIF</span>
                  <span className="font-bold">0 MAD</span>
                </div>
                <div className="flex justify-between mt-6 p-4 border-t-2 border-secondary font-bold text-lg">
                  <span>TOTAL PASSIF</span>
                  <span className="text-secondary">{formatMAD(totalPassif)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cpc' && (
          <div className="glass-panel p-6">
            <h2 className="text-center font-bold mb-6">Compte de Produits et Charges (CPC)</h2>
            <div className="coa-table-wrapper">
              <table className="coa-table">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-lg">Rubrique</th>
                    <th className="text-lg text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-green-500/10"><td colSpan="2" className="font-bold text-green-500">PRODUITS D'EXPLOITATION</td></tr>
                  <tr><td>Ventes de marchandises et services (Classe 7)</td><td className="text-right font-bold text-green-500">+{(stats.ca || 0).toLocaleString()} MAD</td></tr>
                  <tr className="bg-red-500/10"><td colSpan="2" className="font-bold text-red-500">CHARGES D'EXPLOITATION</td></tr>
                  <tr><td>Achats et charges externes (Classe 6)</td><td className="text-right font-bold text-red-500">-{(stats.charges || 0).toLocaleString()} MAD</td></tr>
                  <tr className="bg-white/10 font-bold text-xl">
                    <td className="p-6">RÉSULTAT NET (PROFIT / PERTE)</td>
                    <td className="text-right p-6 text-primary">{(stats.resultat || 0).toLocaleString()} MAD</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'kpi' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="glass-panel p-6">
              <h3 className="mb-4">Évolution Chiffre d'Affaires</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  {name: 'Jan', value: 42000}, {name: 'Feb', value: 38000}, 
                  {name: 'Mar', value: 51000}, {name: 'Apr', value: 49000}, 
                  {name: 'May', value: 62000}, {name: 'Jun', value: stats.ca || 43300}
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip contentStyle={{background: '#111', border: '1px solid #333'}} />
                  <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-panel p-6">
              <h3 className="mb-4">Position Bancaire</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  {name: 'Jan', value: 120000}, {name: 'Feb', value: 135000}, 
                  {name: 'Mar', value: 110000}, {name: 'Apr', value: 145000}, 
                  {name: 'May', value: 130000}, {name: 'Jun', value: 185420}
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip contentStyle={{background: '#111', border: '1px solid #333'}} />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reporting;
