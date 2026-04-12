import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Users, Activity, ShieldCheck, Database, Server, Loader2, AlertCircle, Cpu, Zap, Search } from 'lucide-react';

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

  if (loading) return <div className="flex items-center justify-center h-[400px]"><div className="loader"></div></div>;

  return (
    <div className="fade-in">
      <div className="grid g4" style={{ marginBottom: '32px' }}>
        <div className="kpi-jewel">
          <div className="kpi-label">Uptime Système</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{stats?.uptime || '99.9%'}</div>
          <div className="kpi-trend text-muted"><Server size={14}/> Node : Srv-Prod-01</div>
        </div>

        <div className="kpi-jewel">
          <div className="kpi-label">Utilisateurs Actifs</div>
          <div className="kpi-value">{stats?.active_users || '0/0'}</div>
          <div className="kpi-trend text-muted"><Users size={14}/> Sessions concurrentes</div>
        </div>

        <div className="kpi-jewel">
          <div className="kpi-label">Charge CPU</div>
          <div className="kpi-value" style={{ color: 'var(--accent)' }}>{stats?.server_load || '0%'}</div>
          <div className="kpi-trend text-muted"><Cpu size={14}/> Latence : 24ms</div>
        </div>

        <div className="kpi-jewel" style={{ borderLeft: '4px solid var(--secondary)' }}>
          <div className="kpi-label">Volume Données</div>
          <div className="kpi-value" style={{ color: 'var(--secondary)' }}>{stats?.entry_count || '0'}</div>
          <div className="kpi-trend text-muted"><Database size={14}/> Ecritures SQL</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8">
            <div className="card glass-panel" style={{ padding: '32px' }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="premium-font" style={{ fontWeight: 800 }}>Performance de l'Infrastructure</h3>
                        <p className="text-muted" style={{ fontSize: '11px' }}>Temps de réponse moyen (Global API Latency)</p>
                    </div>
                    <Zap size={20} className="text-accent" />
                </div>
                <div style={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer>
                        <AreaChart data={[
                            {name: '00:00', value: 45}, {name: '04:00', value: 32},
                            {name: '08:00', value: 120}, {name: '12:00', value: 95},
                            {name: '16:00', value: 140}, {name: '20:00', value: 85}
                        ]}>
                            <defs>
                                <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 10}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-dim)', fontSize: 10}} tickFormatter={(v)=>`${v}ms`} />
                            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: '12px' }} />
                            <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorLat)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="col-span-4">
            <div className="card glass-panel h-full" style={{ padding: '24px' }}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="premium-font" style={{ fontWeight: 800 }}>Derniers Audits</h3>
                    <ShieldCheck size={18} className="text-primary" />
                </div>
                <div className="flex-c gap-4">
                    <div className="p-3 rounded-xl border border-white/5 bg-bg">
                        <div style={{ fontSize: '11px', fontWeight: 800 }}>ADMIN LOGIN</div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>IP: 192.168.1.1 — Il y a 5 min</div>
                    </div>
                    <div className="p-3 rounded-xl border border-white/5 bg-bg">
                        <div style={{ fontSize: '11px', fontWeight: 800 }}>DB BACKUP</div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>Succès — Il y a 2h</div>
                    </div>
                    <div className="p-3 rounded-xl border border-white/5 bg-bg">
                        <div style={{ fontSize: '11px', fontWeight: 800 }}>USER_UPDATE</div>
                        <div className="text-muted" style={{ fontSize: '10px' }}>ID: 442 — Il y a 4h</div>
                    </div>
                </div>
                <button className="btn btn-outline w-full mt-8">Journal de sécurité</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
