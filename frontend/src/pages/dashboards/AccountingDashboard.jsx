import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, FileText, AlertCircle, Loader2, Sparkles, Activity, ShieldCheck } from 'lucide-react';

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

  if (loading) return <div className="flex items-center justify-center h-[400px]"><div className="loader"></div></div>;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(value);
  };

  return (
    <div className="fade-in">
      <div className="grid g4" style={{ marginBottom: '32px' }}>
        <div className="kpi-jewel">
          <div className="kpi-label">Chiffre d'Affaires</div>
          <div className="kpi-value">{formatCurrency(stats?.ca_month || 0)}</div>
          <div className="kpi-trend trend-up"><TrendingUp size={14}/> +12.5% vs M-1</div>
        </div>

        <div className="kpi-jewel">
          <div className="kpi-label">Trésorerie Nette</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{formatCurrency(stats?.treasury || 0)}</div>
          <div className="kpi-trend text-muted"><Wallet size={14}/> Disponibilité immédiate</div>
        </div>

        <div className="kpi-jewel">
          <div className="kpi-label">Dettes Fournisseurs</div>
          <div className="kpi-value" style={{ color: 'var(--danger)' }}>{formatCurrency(stats?.payables || 0)}</div>
          <div className="kpi-trend trend-down"><TrendingDown size={14}/> -2% règlement en cours</div>
        </div>

        <div className="kpi-jewel" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="kpi-label">Créances Clients</div>
          <div className="kpi-value" style={{ color: 'var(--accent)' }}>{formatCurrency(stats?.receivables || 0)}</div>
          <div className="kpi-trend text-muted"><Activity size={14}/> En attente de lettrage</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8">
            <div className="card glass-panel" style={{ padding: '32px' }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="premium-font" style={{ fontWeight: 800 }}>Flux de Trésorerie</h3>
                        <p className="text-muted" style={{ fontSize: '12px' }}>Encaissements vs Décaissements (Vision 6 mois)</p>
                    </div>
                    <Sparkles size={20} className="text-secondary" />
                </div>
                <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer>
                    <AreaChart data={stats?.chart_data || []}>
                        <defs>
                        <linearGradient id="colorEnc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDec" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="var(--danger)" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-dim)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                        <Tooltip 
                            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '12px' }}
                        />
                        <Area type="monotone" dataKey="encaisse" name="Encaissements" stroke="var(--primary)" fillOpacity={1} fill="url(#colorEnc)" strokeWidth={3} />
                        <Area type="monotone" dataKey="decaisse" name="Décaissements" stroke="var(--danger)" fillOpacity={1} fill="url(#colorDec)" strokeWidth={3} />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="col-span-4 flex flex-col gap-6">
            <div className="card glass-panel" style={{ padding: '24px' }}>
                <div className="flex items-center gap-3 mb-6">
                    <AlertCircle size={20} className="text-danger" />
                    <h3 className="premium-font" style={{ fontWeight: 800 }}>Anomalies Lettrage</h3>
                </div>
                <div className="flex-c gap-4">
                    <div className="p-3 rounded-lg border border-white/5 bg-bg flex justify-between items-center text-xs">
                        <span className="font-bold">Facture #4410...</span>
                        <span className="badge badge-warning">Écart 0.05 MAD</span>
                    </div>
                </div>
                <button className="btn btn-outline w-full mt-6 btn-xs">Voir l'audit complet</button>
            </div>

            <div className="card glass-panel" style={{ padding: '24px', background: 'var(--secondary-glow)' }}>
                <h3 className="premium-font" style={{ fontWeight: 800, color: 'var(--secondary)' }}>Compliance DGI</h3>
                <p className="text-muted" style={{ fontSize: '11px', margin: '4px 0 16px' }}>État de préparation de la liasse fiscale.</p>
                <div className="flex items-center justify-between">
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>Complétion XML</span>
                    <span style={{ fontWeight: 900 }}>88%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ width: '88%', height: '100%', background: 'var(--secondary)' }}></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;
