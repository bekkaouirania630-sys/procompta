import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, FileText, AlertCircle, Loader2 } from 'lucide-react';

const AccountingDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/dashboard/accounting', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 text-center text-red-500">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(value);
  };

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="dashboard-grid">
        {/* KPI Cards */}
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
            <TrendingUp size={24} />
          </div>
          <h4>Chiffre d'Affaires (Mois)</h4>
          <div className="stat-value">{formatCurrency(stats?.ca_month || 0)}</div>
          <div className="stat-trend positive">Réel basé sur écritures</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <Wallet size={24} />
          </div>
          <h4>Trésorerie Actuelle</h4>
          <div className="stat-value">{formatCurrency(stats?.treasury || 0)}</div>
          <div className="stat-trend neutral">Solde consolidé</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
            <TrendingDown size={24} />
          </div>
          <h4>Dettes Fournisseurs</h4>
          <div className="stat-value">{formatCurrency(stats?.payables || 0)}</div>
          <div className="stat-trend negative">Comptes 4411</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <AlertCircle size={24} />
          </div>
          <h4>Créances Clients</h4>
          <div className="stat-value">{formatCurrency(stats?.receivables || 0)}</div>
          <div className="stat-trend warning">Comptes 3421</div>
        </div>

        {/* Chart */}
        <div className="glass-panel main-chart" style={{ gridColumn: 'span 3' }}>
          <div className="chart-header">
            <h3>Flux Encaissements / Décaissements</h3>
            <p className="text-muted">Évolution mensuelle des flux de trésorerie</p>
          </div>
          <div style={{ width: '100%', height: 300, marginTop: '2rem' }}>
            <ResponsiveContainer>
              <AreaChart data={stats?.chart_data || []}>
                <defs>
                  <linearGradient id="colorEnc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="encaisse" name="Encaissements" stroke="#3B82F6" fillOpacity={1} fill="url(#colorEnc)" strokeWidth={3} />
                <Area type="monotone" dataKey="decaisse" name="Décaissements" stroke="#EF4444" fillOpacity={1} fill="url(#colorDec)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Sidebar in Grid (Placeholder for real alerts) */}
        <div className="glass-panel alerts-box">
          <h3>Alertes Factures</h3>
          <div className="alerts-list">
            <p className="text-muted text-center py-8">Aucune alerte pour le moment</p>
          </div>
          <button className="btn btn-primary w-full mt-4">Voir Tout</button>
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;

