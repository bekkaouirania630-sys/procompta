import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Users, Briefcase, Landmark, UserCheck, Calendar, Loader2, AlertCircle } from 'lucide-react';

const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981'];

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
        {/* HR Metrics */}
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
            <Users size={24} />
          </div>
          <h4>Effectif Total</h4>
          <div className="stat-value">{stats?.total_employees || 0}</div>
          <div className="stat-trend positive">Salariés actifs</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
            <Landmark size={24} />
          </div>
          <h4>Masse Salariale / Mois</h4>
          <div className="stat-value">{formatCurrency(stats?.payroll_month || 0)}</div>
          <div className="stat-trend neutral">Période en cours</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
            <UserCheck size={24} />
          </div>
          <h4>CNSS (Part Patronale)</h4>
          <div className="stat-value">{formatCurrency(stats?.cnss_patronale || 0)}</div>
          <div className="stat-trend negative">Donnée réelle</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <Calendar size={24} />
          </div>
          <h4>Congés / Absences</h4>
          <div className="stat-value">{stats?.pending_leaves || 0}</div>
          <div className="stat-trend warning">Demandes en attente</div>
        </div>

        {/* Salary Distribution */}
        <div className="glass-panel main-chart" style={{ gridColumn: 'span 2' }}>
          <div className="chart-header">
            <h3>Répartition Salariale par Département</h3>
            <p className="text-muted">Dépenses mensuelles (MAD)</p>
          </div>
          <div style={{ width: '100%', height: 300, marginTop: '2rem' }}>
            <ResponsiveContainer>
              <BarChart data={stats?.salary_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="dept" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {(stats?.salary_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee List placeholder */}
        <div className="glass-panel" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
          <h3>Liste des Salariés (Récents)</h3>
          <div className="flex items-center justify-center p-12 text-muted">
            Aucun salarié enregistré pour le moment.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RHDashboard;

