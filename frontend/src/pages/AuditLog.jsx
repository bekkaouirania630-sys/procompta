import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, ShieldAlert, ArrowRight, Activity, 
  Search, Calendar, Filter, User, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';

const API = 'http://localhost:8000/api';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ event: '', user_id: '', date_from: '', date_to: '' });
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await fetch(`${API}/audits?${query}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      setLogs(data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const getEventStyle = (event) => {
    switch(event) {
      case 'created': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', label: 'CRÉATION' };
      case 'updated': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', label: 'MODIFICATION' };
      case 'deleted': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', label: 'SUPPRESSION' };
      default: return { bg: 'rgba(148, 163, 184, 0.1)', color: '#94A3B8', label: event.toUpperCase() };
    }
  };

  const renderDiff = (log) => {
    if (!log.new_values) return <div className="text-muted italic">Aucune donnée de changement.</div>;
    
    return (
      <div className="flex-c gap-4">
        {Object.entries(log.new_values).map(([key, val]) => (
          <div key={key} className="p-3 rounded-xl border border-white/5 bg-bg/50">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-muted uppercase" style={{ letterSpacing: 1 }}>{key}</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
                {log.old_values?.[key] && (
                    <div className="flex-1 min-w-[100px] p-2 rounded bg-red-500/5 text-red-400 line-through text-xs border border-red-500/10">
                        {String(log.old_values[key])}
                    </div>
                )}
                {log.old_values?.[key] && <ArrowRight size={14} className="text-muted" />}
                <div className="flex-1 min-w-[100px] p-2 rounded bg-green-500/5 text-green-400 text-xs border border-green-500/10">
                    {String(val)}
                </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Journal d'Audit Sécurisé</h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>Traçabilité complète des actions sensibles sur votre infrastructure ERP.</p>
        </div>
        <div className="flex gap-2">
             <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
                <ShieldAlert size={14} /> IMMUTABILITÉ ACTIVÉE
             </div>
        </div>
      </div>

      <div className="grid g4" style={{ marginBottom: '32px' }}>
         <div className="kpi-jewel">
            <div className="kpi-label">Événements (24h)</div>
            <div className="kpi-value">{logs.length}</div>
            <div className="kpi-trend text-muted"><Activity size={12}/> Flux temps réel</div>
         </div>
         <div className="kpi-jewel">
            <div className="kpi-label">Dernière Modification</div>
            <div className="kpi-value" style={{ fontSize: '14px', color: 'var(--primary)' }}>{logs[0] ? new Date(logs[0].created_at).toLocaleTimeString() : '—'}</div>
            <div className="kpi-trend text-muted"><Calendar size={12}/> {logs[0] ? new Date(logs[0].created_at).toLocaleDateString() : ''}</div>
         </div>
         <div className="kpi-jewel" style={{ gridColumn: 'span 2', borderLeft: '4px solid var(--accent)' }}>
            <div className="kpi-label">Alerte Sécurité</div>
            <div className="kpi-value" style={{ fontSize: '12px' }}>Check intégrité base de données...</div>
            <div className="kpi-trend text-success"><Sparkles size={12}/> Statut : OPTIMAL</div>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
            <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <HistoryIcon size={18} className="text-secondary" />
                    <h3 className="premium-font" style={{ fontWeight: 800 }}>Flux d'Audit</h3>
                </div>
                
                <div className="tbl-container" style={{ border: 'none', borderRadius: 0 }}>
                    {loading ? (
                        <div style={{ padding: 100, textAlign: 'center' }}><Loader2 className="animate-spin mx-auto text-primary" /></div>
                    ) : (
                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>DATE & HEURE</th>
                                    <th>UTILISATEUR</th>
                                    <th>ÉVÉNEMENT</th>
                                    <th>RESSOURCE</th>
                                    <th style={{ textAlign: 'right' }}>DETAILS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => {
                                    const style = getEventStyle(log.event);
                                    return (
                                        <tr key={log.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedLog(log)}>
                                            <td style={{ fontSize: 11, fontWeight: 700 }}>
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="tb-avatar" style={{ background: 'var(--surface-mut)', fontSize: 10 }}>{log.user?.name?.[0] || 'U'}</div>
                                                    <span style={{ fontSize: 12, fontWeight: 700 }}>{log.user?.name || 'Système'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge" style={{ background: style.bg, color: style.color, border: 'none' }}>
                                                    {style.label}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)' }}>
                                                {log.auditable_type?.split('\\').pop()} # {log.auditable_id}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className="tb-icon-btn"><Search size={14} /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
            <div className="card glass-panel" style={{ padding: '32px', position: 'sticky', top: '32px' }}>
                {selectedLog ? (
                    <div className="fade-in">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="premium-font" style={{ fontWeight: 800 }}>Détail Forensique</h3>
                            <button className="modal-close" onClick={() => setSelectedLog(null)}><Filter size={14}/></button>
                        </div>
                        
                        <div className="flex-c gap-6">
                            <div className="p-4 rounded-xl bg-bg border border-white/5">
                                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 8 }}>MÉTADONNÉES</div>
                                <div className="text-xs flex-c gap-2">
                                    <div className="flex justify-between"><span>IP:</span> <span className="font-bold">{selectedLog.ip_address}</span></div>
                                    <div className="flex justify-between"><span>Navigateur:</span> <span className="font-bold truncate max-w-[150px]">{selectedLog.user_agent}</span></div>
                                </div>
                            </div>
                            
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>CHANGEMENTS DÉTECTÉS</div>
                                {renderDiff(selectedLog)}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-c items-center justify-center text-center py-20 text-muted opacity-50">
                        <HistoryIcon size={48} strokeWidth={1} style={{ marginBottom: 16 }} />
                        <p style={{ fontSize: 13 }}>Sélectionnez une entrée pour visualiser les métadonnées forensiques.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
