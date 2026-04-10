import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, Activity, ShieldCheck, Database, Server, Loader2, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/dashboard/admin', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des statistiques admin');
        
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

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="dashboard-grid">
        {/* System Health */}
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
            <Activity size={24} />
          </div>
          <h4>Uptime Système</h4>
          <div className="stat-value">{stats?.uptime || '99.9%'}</div>
          <div className="stat-trend positive">Opérationnel</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
            <Users size={24} />
          </div>
          <h4>Utilisateurs Actifs</h4>
          <div className="stat-value">{stats?.active_users || '0/0'}</div>
          <div className="stat-trend neutral">Sessions enregistrées</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <Server size={24} />
          </div>
          <h4>Charge Serveur</h4>
          <div className="stat-value">{stats?.server_load || '0%'}</div>
          <div className="stat-trend positive">Optimale</div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <Database size={24} />
          </div>
          <h4>Ecritures Totales</h4>
          <div className="stat-value">{stats?.entry_count || '0'}</div>
          <div className="stat-trend neutral">Total base de données</div>
        </div>

        {/* API Performance Placeholder */}
        <div className="glass-panel main-chart" style={{ gridColumn: 'span 4' }}>
          <div className="chart-header">
            <h3>Performance de l'API (ms)</h3>
            <p className="text-muted">Temps de réponse moyen au cours des 12 dernières heures</p>
          </div>
          <div className="flex items-center justify-center p-12 text-muted">
            Données de performance système en cours de collecte...
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '1.5rem' }}>
          <h3>Logs d'Audit Récents</h3>
          <div className="text-center py-8 text-muted">
            Aucun événement d'audit récent à afficher.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

