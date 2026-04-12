import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Users, UserPlus, CreditCard, Calendar, Briefcase,
  Download, Eye, Loader2, X, Edit2, UserX, CheckCircle,
  Clock, AlertCircle, Building, BadgeCheck, TrendingUp, Sparkles, Info
} from 'lucide-react';

const API = 'http://localhost:8000/api';
const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json',
});

const CONTRACT_TYPES = ['CDI', 'CDD', 'Intérimaire', 'Stage', 'Contrat-Aidé'];
const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
];

const fmt = (n) => parseFloat(n || 0).toLocaleString('fr-MA', { minimumFractionDigits: 2 });

const INITIAL_EMPLOYEE = {
  matricule: '', first_name: '', last_name: '', job_title: '',
  contract_type: 'CDI', cnss_number: '', amo_number: '',
  base_salary: '', hire_date: '', email: '', phone: '',
  department: ''
};

export default function RH() {
  const { data, loading, refresh } = useData();
  const [activeTab, setActiveTab]     = useState('employees');
  const [generating, setGenerating]   = useState(false);
  const [saving, setSaving]           = useState(false);

  // Payroll period
  const currentDate = new Date();
  const [payMonth, setPayMonth] = useState(currentDate.getMonth() + 1);
  const [payYear,  setPayYear]  = useState(currentDate.getFullYear());

  // Modals
  const [showNewEmployee, setShowNewEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(null);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(null);
  const [newEmployee, setNewEmployee] = useState(INITIAL_EMPLOYEE);
  const [formError, setFormError] = useState('');

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const res = await fetch(`${API}/employees`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newEmployee),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(Object.values(data.errors || {}).flat().join(' | ') || data.message || 'Erreur');
      } else {
        setShowNewEmployee(false);
        setNewEmployee(INITIAL_EMPLOYEE);
        refresh();
      }
    } catch (e) { setFormError('Erreur réseau'); }
    setSaving(false);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/employees/${showEditEmployee.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(showEditEmployee),
      });
      if (res.ok) {
        setShowEditEmployee(null);
        refresh();
      }
    } catch (e) {}
    setSaving(false);
  };

  const handleDeleteEmployee = async (empId) => {
    if (!window.confirm('Confirmer la désactivation de ce salarié ?')) return;
    await fetch(`${API}/employees/${empId}`, { method: 'DELETE', headers: getHeaders() });
    refresh();
  };

  const handleGeneratePayroll = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API}/payslips/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ month: payMonth, year: payYear }),
      });
      const data = await res.json();
      if (res.ok) refresh();
      else alert(data.message || 'Erreur lors de la génération');
    } catch (err) { console.error(err); }
    setGenerating(false);
  };

  const handleValidatePayslip = async (id) => {
    await fetch(`${API}/payslips/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status: 'validé' }),
    });
    refresh();
  };

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Ressources Humaines</h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>Gestion du capital humain et moteur de paie certifié (Barème 2024).</p>
        </div>
        <div className="flex gap-2 items-center">
            {activeTab === 'payroll' && (
                <div className="flex gap-2 glass-panel" style={{ padding: '4px', borderRadius: '12px' }}>
                    <select className="form-select" style={{ width:'140px', border:'none', background:'transparent' }}
                        value={payMonth} onChange={e => setPayMonth(parseInt(e.target.value))}>
                        {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                    </select>
                    <select className="form-select" style={{ width:'100px', border:'none', background:'transparent' }}
                        value={payYear} onChange={e => setPayYear(parseInt(e.target.value))}>
                        {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            )}
            {activeTab === 'payroll' ? (
                <button className="btn btn-primary" onClick={handleGeneratePayroll} disabled={generating}>
                    {generating ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16}/>}
                    Calculer G.L.P
                </button>
            ) : (
                <button className="btn btn-primary" onClick={() => setShowNewEmployee(true)}>
                    <UserPlus size={16}/> Recruter
                </button>
            )}
        </div>
      </div>

      {/* ── KPI Jewels ── */}
      <div className="grid g3" style={{ marginBottom: '32px' }}>
        <div className="kpi-jewel">
          <div className="kpi-label">Effectif Total</div>
          <div className="kpi-value">{data.employees.length} <span style={{ fontSize: '14px', color:'var(--text-dim)' }}>SALARIÉS</span></div>
          <div className="kpi-trend text-muted">
            <Users size={14}/> {data.employees.filter(e => e.contract_type==='CDI').length} en CDI permanent
          </div>
        </div>

        <div className="kpi-jewel">
          <div className="kpi-label">Masse Salariale / Mois</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>
            {fmt(data.employees.reduce((s, e) => s + parseFloat(e.base_salary || 0), 0))} <span style={{ fontSize: '14px' }}>MAD</span>
          </div>
          <div className="kpi-trend trend-up">
            <TrendingUp size={14}/> Provision Budgétaire OK
          </div>
        </div>

        <div className="kpi-jewel">
          <div className="kpi-label">Bulletins du mois</div>
          <div className="kpi-value">{data.payslips.length} <span style={{ fontSize: '14px', color:'var(--text-dim)' }}>DOCS</span></div>
          <div className="kpi-trend text-muted">
            <BadgeCheck size={14} className="text-success"/> {data.payslips.filter(p => p.status === 'validé').length} validés
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button 
            className={`btn ${activeTab==='employees'?'btn-dark':'btn-outline'}`} 
            onClick={() => setActiveTab('employees')}
            style={{ borderRadius: '100px', fontSize: '12px' }}
        >
          Annuaire du personnel
        </button>
        <button 
            className={`btn ${activeTab==='payroll'?'btn-dark':'btn-outline'}`} 
            onClick={() => setActiveTab('payroll')}
            style={{ borderRadius: '100px', fontSize: '12px' }}
        >
          Gestion de la Paie
        </button>
      </div>

      {/* ── Employees View ── */}
      {activeTab === 'employees' && (
        <div className="card" style={{ padding: 0 }}>
             <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ margin: 0 }}>Personnel Actif</h3>
             </div>
             <div className="table-premium-responsive">
                <table className="tbl-premium">
                    <thead>
                        <tr>
                            <th>Identité</th>
                            <th>Département</th>
                            <th>Poste de travail</th>
                            <th>Type Contrat</th>
                            <th style={{ textAlign: 'right' }}>Salaire Brut (MAD)</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="6" style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin mx-auto text-primary" size={24}/></td></tr>}
                        {!loading && data.employees.length === 0 && (
                            <tr><td colSpan="6" style={{ padding: 60, textAlign: 'center' }} className="text-muted">
                                <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.2, display: 'block' }} />
                                Aucun salarié enregistré dans la base de données.
                            </td></tr>
                        )}
                        {data.employees.map(emp => (
                            <tr key={emp.id}>
                                <td>
                                    <div className="flex" style={{ gap: '12px', alignItems: 'center' }}>
                                        <div className="tb-avatar" style={{ borderRadius: '50%', width: 28, height: 28, fontSize: '10px' }}>{emp.first_name[0]}{emp.last_name[0]}</div>
                                        <div className="flex-c" style={{ gap: '2px' }}>
                                            <span style={{ fontWeight: 700, fontSize: '13px' }}>{emp.first_name} {emp.last_name}</span>
                                            <span className="num-font" style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700 }}>MAT: {emp.matricule}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{emp.department || 'Non spécifié'}</td>
                                <td style={{ fontSize: '13px', fontWeight: 500 }}>{emp.job_title}</td>
                                <td><span className="badge badge-gray">{emp.contract_type}</span></td>
                                <td className="num-font" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>{fmt(emp.base_salary)}</td>
                                <td>
                                    <div className="flex justify-center" style={{ gap: '6px' }}>
                                        <button className="tb-icon-btn" style={{ width: 30, height: 30 }} onClick={() => setShowEmployeeDetail(emp)}><Eye size={14}/></button>
                                        <button className="tb-icon-btn" style={{ width: 30, height: 30 }} onClick={() => setShowEditEmployee({...emp})}><Edit2 size={14}/></button>
                                        <button className="tb-icon-btn" style={{ width: 30, height: 30, color: 'var(--danger)', background: 'var(--danger-glow)' }} onClick={() => handleDeleteEmployee(emp.id)}><UserX size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
      )}

      {/* ── Payroll View ── */}
      {activeTab === 'payroll' && (
        <div className="card" style={{ padding: 0 }}>
             <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>Registre des Bulletins — {payYear}</h3>
                <span className="badge badge-success">Barème 2024 Appliqué</span>
             </div>
             <div className="table-premium-responsive">
                <table className="tbl-premium">
                    <thead>
                        <tr>
                            <th>Période</th>
                            <th>Salarié</th>
                            <th>Base Brut</th>
                            <th>Retenues (Sociales)</th>
                            <th>Impôt (I.R.)</th>
                            <th style={{ textAlign: 'right' }}>Net à Payer</th>
                            <th style={{ textAlign: 'center' }}>Statut</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="8" style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin mx-auto text-primary" size={24}/></td></tr>}
                        {!loading && data.payslips.length === 0 && (
                            <tr><td colSpan="8" style={{ padding: 60, textAlign: 'center' }} className="text-muted">
                                <AlertCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.2, display: 'block' }} />
                                Aucun bulletin de paie généré pour cette session.
                            </td></tr>
                        )}
                        {data.payslips.map(ps => (
                            <tr key={ps.id}>
                                <td style={{ fontWeight: 800, color: 'var(--secondary)' }}>{ps.period_name}</td>
                                <td style={{ fontWeight: 600 }}>{ps.employee?.first_name} {ps.employee?.last_name}</td>
                                <td className="num-font" style={{ fontWeight: 600 }}>{fmt(ps.brut_salary)}</td>
                                <td>
                                    <div className="flex-c" style={{ gap: 2, fontSize: '10px', color: 'var(--danger)', fontWeight: 600 }}>
                                        <span>CNSS: -{fmt(ps.cnss_amount)}</span>
                                        <span>AMO: -{fmt(ps.amo_amount)}</span>
                                    </div>
                                </td>
                                <td className="num-font" style={{ color: 'var(--danger)', fontWeight: 600 }}>-{fmt(ps.ir_amount)}</td>
                                <td className="num-font" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '15px' }}>{fmt(ps.net_salary)} MAD</td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className={`badge ${ps.status==='validé'?'badge-success':'badge-warning'}`}>
                                        {ps.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div className="flex justify-end" style={{ gap: '6px' }}>
                                        {ps.status !== 'validé' && (
                                            <button className="btn btn-primary btn-xs" onClick={() => handleValidatePayslip(ps.id)}>Valider</button>
                                        )}
                                        <button className="tb-icon-btn" style={{ width: 30, height: 30 }}><Download size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
      )}

      {/* ── Modals Redesign ── */}
      {showNewEmployee && (
        <div className="modal-overlay-premium" onClick={() => setShowNewEmployee(false)}>
          <div className="modal-card-premium" style={{ width: '100%', maxWidth: 960 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)' }}>
              <div className="modal-title" style={{ fontSize: 20, fontWeight: 800 }}>
                <UserPlus size={24} className="text-primary" />
                <span className="ml-2">Dossier de Recrutement Salarié</span>
              </div>
              <button className="modal-close" onClick={() => setShowNewEmployee(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content-wrapper">
              <div className="modal-scrollable">
                <form onSubmit={handleCreateEmployee}>
                  {formError && <div className="alert alert-red mb-6">{formError}</div>}
                  
                  <div className="grid g3 mb-6">
                    <div className="premium-form-group">
                      <label className="premium-label">Matricule</label>
                      <input className="premium-input" placeholder="ex: MAT-001" required value={newEmployee.matricule} onChange={e => setNewEmployee({...newEmployee, matricule:e.target.value})} />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Prénom</label>
                      <input className="premium-input" placeholder="Mohammed" required value={newEmployee.first_name} onChange={e => setNewEmployee({...newEmployee, first_name:e.target.value})} />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Nom</label>
                      <input className="premium-input" placeholder="El Idrissi" required value={newEmployee.last_name} onChange={e => setNewEmployee({...newEmployee, last_name:e.target.value})} />
                    </div>
                  </div>

                  <div className="grid g2 mb-6">
                    <div className="premium-form-group">
                      <label className="premium-label">Poste occupé</label>
                      <input className="premium-input" placeholder="Comptable Senior" required value={newEmployee.job_title} onChange={e => setNewEmployee({...newEmployee, job_title:e.target.value})} />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Département</label>
                      <input className="premium-input" placeholder="Finance" value={newEmployee.department} onChange={e => setNewEmployee({...newEmployee, department:e.target.value})} />
                    </div>
                  </div>

                  <div className="grid g2 mb-6">
                    <div className="premium-form-group">
                      <label className="premium-label">Type de Contrat</label>
                      <select className="premium-input" value={newEmployee.contract_type} onChange={e => setNewEmployee({...newEmployee, contract_type:e.target.value})}>
                        {CONTRACT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Salaire Brut de Base (MAD)</label>
                      <input type="number" step="0.01" className="premium-input" required value={newEmployee.base_salary} onChange={e => setNewEmployee({...newEmployee, base_salary:e.target.value})} />
                    </div>
                  </div>

                  <div className="grid g2">
                    <div className="premium-form-group">
                      <label className="premium-label">N° CNSS</label>
                      <input className="premium-input" placeholder="123456789" value={newEmployee.cnss_number} onChange={e => setNewEmployee({...newEmployee, cnss_number:e.target.value})} />
                    </div>
                    <div className="premium-form-group">
                      <label className="premium-label">Date d'embauche</label>
                      <input type="date" className="premium-input" required value={newEmployee.hire_date} onChange={e => setNewEmployee({...newEmployee, hire_date:e.target.value})} />
                    </div>
                  </div>
                </form>
              </div>

              <div className="side-info-panel">
                <div>
                  <h4 className="premium-label" style={{ marginBottom: 16 }}>Estimation Coût Employeur</h4>
                  <div className="flex-c gap-4">
                    <div className="card glass-panel" style={{ padding: '16px', background: 'var(--surface-mut)' }}>
                      <span className="premium-label" style={{ fontSize: 9 }}>Salaire Brut Mensuel</span>
                      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-main)' }}>{fmt(newEmployee.base_salary)} <small>MAD</small></div>
                    </div>
                    <div className="card glass-panel" style={{ padding: '16px', background: 'var(--primary-glow)' }}>
                      <span className="premium-label" style={{ fontSize: 9 }}>Cotisations Patronales (Est.)</span>
                      <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary)' }}>{fmt(newEmployee.base_salary * 0.23)} <small>MAD</small></div>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', fontSize: 11, color: 'var(--text-dim)' }}>
                    <Info size={14} className="inline mr-2" /> Estimation basée sur les taux CNSS & AMO 2024 (Maroc).
                  </div>
                </div>

                <div className="mt-auto flex-c gap-3">
                  <button className="btn btn-primary w-full" style={{ height: 48 }} onClick={handleCreateEmployee} disabled={saving}>
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Briefcase size={20} />}
                    <span className="ml-2">Finaliser le recrutement</span>
                  </button>
                  <button className="btn btn-outline w-full" onClick={() => setShowNewEmployee(false)}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {showEmployeeDetail && (
          <div className="modal-overlay" onClick={() => setShowEmployeeDetail(null)}>
              <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                  <div className="modal-header">
                      <h2 className="modal-title"><Briefcase size={20}/> Fiche Salarié Individuelle</h2>
                      <button className="modal-close" onClick={() => setShowEmployeeDetail(null)}><X size={18}/></button>
                  </div>
                  <div className="modal-body flex-c" style={{ gap: '16px' }}>
                      <div className="flex items-center gap-4">
                          <div className="tb-avatar" style={{ width: 60, height: 60, fontSize: '24px', borderRadius: '14px' }}>{showEmployeeDetail.first_name[0]}</div>
                          <div>
                              <div style={{ fontSize: '18px', fontWeight: 800 }}>{showEmployeeDetail.first_name} {showEmployeeDetail.last_name}</div>
                              <div className="text-muted" style={{ fontWeight: 600 }}>{showEmployeeDetail.job_title}</div>
                          </div>
                      </div>
                      <div style={{ height: 1, background: 'var(--border-light)' }} />
                      <div className="grid g2">
                          <div className="flex-c gap-1">
                              <span className="text-muted" style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Contrat</span>
                              <span style={{ fontWeight: 700 }}>{showEmployeeDetail.contract_type}</span>
                          </div>
                          <div className="flex-c gap-1">
                              <span className="text-muted" style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Embauche</span>
                              <span style={{ fontWeight: 700 }}>{new Date(showEmployeeDetail.hire_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex-c gap-1">
                              <span className="text-muted" style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>CNSS</span>
                              <span style={{ fontWeight: 700 }}>{showEmployeeDetail.cnss_number || '—'}</span>
                          </div>
                          <div className="flex-c gap-1">
                              <span className="text-muted" style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Salaire Brut</span>
                              <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{fmt(showEmployeeDetail.base_salary)} MAD</span>
                          </div>
                      </div>
                  </div>
                  <div className="modal-footer">
                      <button className="btn btn-outline w-full" onClick={() => setShowEmployeeDetail(null)}>Fermer</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
