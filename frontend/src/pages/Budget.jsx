import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  DollarSign, Package, TrendingUp, ChevronRight, 
  Save, Download, Calculator, List 
} from 'lucide-react';

const Budget = () => {
  const { data, loading, refresh } = useData();
  const [activeTab, setActiveTab] = useState('budget');

  const budgetData = [
    { name: 'Jan', revenue: 45000, expense: 31000 },
    { name: 'Feb', revenue: 48000, expense: 28000 },
    { name: 'Mar', revenue: 52000, expense: 35000 },
    { name: 'Apr', revenue: 50000, expense: 34000 },
    { name: 'May', revenue: 55000, expense: 41000 },
    { name: 'Jun', revenue: 60000, expense: data.stats.charges || 36500 },
  ];

  return (
    <div className="layout-container">
      <div className="coa-header">
        <div>
          <h1 className="flex items-center gap-3">
            <DollarSign size={28} className="text-primary" /> Budget & Immobilisations
          </h1>
          <p className="text-muted">Suivi budgétaire prévisionnel et amortissement des immobilisations.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary"><Save size={18} /> Sauvegarder</button>
          <button className="btn btn-primary"><Package size={20} /> Nouvelle Immo</button>
        </div>
      </div>

      <div className="tabs mt-6">
        <button 
          className={`tab ${activeTab === 'budget' ? 'active' : ''}`} 
          onClick={() => setActiveTab('budget')}
        >
          Budget Prévisionnel
        </button>
        <button 
          className={`tab ${activeTab === 'assets' ? 'active' : ''}`} 
          onClick={() => setActiveTab('assets')}
        >
          Immobilisations & Amortissements
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'budget' && (
          <div className="flex flex-col gap-6">
            <div className="glass-panel p-6">
              <h3 className="mb-6 font-bold">Évolution Budget vs Réel (1er Semestre 2024)</h3>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip contentStyle={{background: '#111', border: '1px solid #333'}} />
                    <Legend />
                    <Bar dataKey="revenue" name="Produits (Prévus)" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Charges (Prévues)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel">
              <div className="coa-table-wrapper">
                <table className="coa-table">
                  <thead>
                    <tr>
                      <th>Compte</th>
                      <th>Libellé</th>
                      <th>Jan</th>
                      <th>Fév</th>
                      <th>Mar</th>
                      <th>Avr</th>
                      <th>Mai</th>
                      <th>Juin</th>
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
                        <td className="account-code">{row.code}</td>
                        <td className="account-name">{row.label}</td>
                        {['jan', 'feb', 'mar', 'apr', 'mai', 'jun'].map(m => (
                          <td key={m} className="p-2">
                            <input 
                              type="number" 
                              className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white" 
                              defaultValue={row[m]}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 glass-panel">
              <h3 className="p-6 font-bold flex items-center gap-2">
                <List size={18} className="text-primary" /> Inventaire des Immobilisations
              </h3>
              <div className="coa-table-wrapper">
                <table className="coa-table">
                  <thead>
                    <tr>
                      <th>Désignation</th>
                      <th>Catégorie</th>
                      <th>Date Acq.</th>
                      <th>Valeur</th>
                      <th>Durée</th>
                      <th>VNC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.fixed_assets.length > 0 ? data.fixed_assets.map(asset => (
                      <tr key={asset.id}>
                        <td className="account-name">{asset.name}</td>
                        <td><span className="badge badge-blue">{asset.category}</span></td>
                        <td>{new Date(asset.acquisition_date).toLocaleDateString()}</td>
                        <td className="font-bold">{parseFloat(asset.acquisition_value).toLocaleString()} MAD</td>
                        <td>{asset.duration_years} ans</td>
                        <td className="text-green-500 font-bold">{parseFloat(asset.acquisition_value * 0.6).toLocaleString()} MAD</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="6" className="empty-state">Aucune immobilisation enregistrée.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="glass-panel p-6">
              <h3 className="mb-6 font-bold flex items-center gap-2">
                <Calculator size={18} className="text-secondary" /> Dotations Annuelles
              </h3>
              <div className="flex flex-col gap-4">
                {data.fixed_assets.map(asset => {
                  const dotationAnnuelle = asset.acquisition_value / asset.duration_years;
                  return (
                    <div key={asset.id} className="p-4 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm">{asset.name}</span>
                        <span className="text-xs text-muted">Amort: {(100/asset.duration_years).toFixed(1)}%</span>
                      </div>
                      <div className="text-xl font-bold text-primary">
                        {dotationAnnuelle.toLocaleString()} <small>MAD / an</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;
