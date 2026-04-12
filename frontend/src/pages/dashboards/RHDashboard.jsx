import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Users, Briefcase, Landmark, UserCheck, Calendar, Loader2, AlertCircle, TrendingUp, Sparkles, Building } from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

const RHDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/dashboard/rh', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des statistiques RH');
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
          <div className="kpi-label">Effectif Actif</div>
          <div className="kpi-value">{stats?.total_employees || 0}</div>
          <div className="kpi-trend text-muted"><Users size={14}/> Ressources Humaines</div>
        </div>

        <div className="kpi-jewel">
          <div className="kpi-label">Masse Salariale / Mois</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{formatCurrency(stats?.payroll_month || 0)}</div>
          <div className="kpi-trend trend-up"><TrendingUp size={14}/> Provision Budgétaire OK</div>
        </div>

        <div className="kpi-jewel">
          <div className="kpi-label">Charges Patronales</div>
          <div className="kpi-value" style={{ color: 'var(--secondary)' }}>{formatCurrency(stats?.cnss_patronale || 0)}</div>
          <div className="kpi-trend text-muted"><Landmark size={14}/> Part CNSS estimée</div>
        </div>

        <div className="kpi-jewel" style={{ borderLeft: '4px solid var(--accent)' }}>
          <div className="kpi-label">Absences / Congés</div>
          <div className="kpi-value" style={{ color: 'var(--accent)' }}>{stats?.pending_leaves || 0}</div>
          <div className="kpi-trend text-muted"><Calendar size={14}/> Demandes en attente</div>
        </div>
      </div>

      <div className="grid g2">
        <div className="card glass-panel" style={{ padding: '32px' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="premium-font" style={{ fontWeight: 800 }}>Masse Salariale par Département</h3>
                <p className="text-muted" style={{ fontSize: '12px' }}>Répartition brute mensuelle (MAD)</p>
            </div>
            <Sparkles size={20} className="text-primary" />
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={stats?.salary_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="dept" stroke="var(--text-dim)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-dim)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{fill: 'rgba(255,255,255,0.02)'}}
                   contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '12px' }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {(stats?.salary_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card glass-panel flex flex-col" style={{ padding: '32px' }}>
            <div className="flex items-center justify-between mb-8">
                <h3 className="premium-font" style={{ fontWeight: 800 }}>Structure des Postes</h3>
                <Briefcase size={20} className="text-secondary" />
            </div>
            <div className="flex-c gap-6">
                <div className="p-4 rounded-xl border border-white/5 bg-bg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="tb-avatar" style={{ borderRadius: 8, background: 'var(--primary-glow)', color: 'var(--primary)' }}><Building size={14}/></div>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>MANAGEMENT</span>
                    </div>
                    <span className="badge badge-success">8% Effectif</span>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-bg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="tb-avatar" style={{ borderRadius: 8, background: 'var(--secondary-glow)', color: 'var(--secondary)' }}><UserCheck size={14}/></div>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>OPERATIONNEL</span>
                    </div>
                    <span className="badge badge-success">72% Effectif</span>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-bg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="tb-avatar" style={{ borderRadius: 8, background: 'var(--bg)', color: 'var(--text-dim)' }}><Calendar size={14}/></div>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>ADMINISTRATION</span>
                    </div>
                    <span className="badge badge-success">20% Effectif</span>
                </div>
            </div>
            <button className="btn btn-primary w-full mt-auto">Rapport Social 2024</button>
        </div>
      </div>
    </div>
  );
};

export default RHDashboard;
