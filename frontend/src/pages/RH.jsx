import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { 
  Users, UserPlus, CreditCard, Calendar, 
  Briefcase, DollarSign, Download, Eye, Loader2 
} from 'lucide-react';

const RH = () => {
  const { data, loading, refresh } = useData();
  const [activeTab, setActiveTab] = useState('employees');
  const [generating, setGenerating] = useState(false);

  const handleGeneratePayroll = async () => {
    setGenerating(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/payslips/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ month: 6, year: 2024 }) // Example for June 2024
      });
      if (response.ok) {
        alert('Bulletins de paie générés avec succès !');
        refresh();
      }
    } catch (err) {
      console.error("Error generating payroll:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="layout-container">
      <div className="coa-header">
        <div>
          <h1 className="flex items-center gap-3">
            <Users size={28} className="text-primary" /> RH & Paie
          </h1>
          <p className="text-muted">Gestion du personnel et moteur de paie aux normes marocaines (IR 2024).</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'payroll' && (
            <button className="btn btn-secondary" onClick={handleGeneratePayroll} disabled={generating}>
              {generating ? <Loader2 className="animate-spin" /> : <Calendar size={18} />}
              Calculer la paie (Juin 2024)
            </button>
          )}
          <button className="btn btn-primary">
            <UserPlus size={20} /> Nouveau Salarié
          </button>
        </div>
      </div>

      <div className="tabs mt-6">
        <button 
          className={`tab ${activeTab === 'employees' ? 'active' : ''}`} 
          onClick={() => setActiveTab('employees')}
        >
          Liste des Salariés
        </button>
        <button 
          className={`tab ${activeTab === 'payroll' ? 'active' : ''}`} 
          onClick={() => setActiveTab('payroll')}
        >
          Bulletins de Paie
        </button>
      </div>

      <div className="glass-panel coa-card">
        {activeTab === 'employees' ? (
          <div className="coa-table-wrapper">
            <table className="coa-table">
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Nom Compleat</th>
                  <th>Poste</th>
                  <th>Type contrat</th>
                  <th>CNSS</th>
                  <th>Salaire Base</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.employees.map(emp => (
                  <tr key={emp.id}>
                    <td className="account-code">{emp.matricule}</td>
                    <td className="account-name">{emp.first_name} {emp.last_name}</td>
                    <td>{emp.job_title}</td>
                    <td><span className="badge badge-gray">{emp.contract_type}</span></td>
                    <td>{emp.cnss_number || '-'}</td>
                    <td className="font-bold">{parseFloat(emp.base_salary).toLocaleString()} MAD</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-icon-small"><Briefcase size={14} /></button>
                        <button className="btn-icon-small"><Eye size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="coa-table-wrapper">
            <table className="coa-table">
              <thead>
                <tr>
                  <th>Période</th>
                  <th>Salarié</th>
                  <th>Brut</th>
                  <th>CNSS (4.48%)</th>
                  <th>AMO (2.26%)</th>
                  <th>IR</th>
                  <th>Net à Payer</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.payslips.map(ps => (
                  <tr key={ps.id}>
                    <td className="fw6">{ps.period_name}</td>
                    <td>{ps.employee?.first_name} {ps.employee?.last_name}</td>
                    <td>{parseFloat(ps.brut_salary).toLocaleString()}</td>
                    <td className="text-red">-{parseFloat(ps.cnss_amount).toLocaleString()}</td>
                    <td className="text-red">-{parseFloat(ps.amo_amount).toLocaleString()}</td>
                    <td className="text-red">-{parseFloat(ps.ir_amount).toLocaleString()}</td>
                    <td className="text-green font-bold" style={{fontSize: '15px'}}>{parseFloat(ps.net_salary).toLocaleString()} MAD</td>
                    <td><span className={`badge ${ps.status === 'validé' ? 'badge-green' : 'badge-amber'}`}>{ps.status}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-icon-small text-primary"><Download size={14} /></button>
                        <button className="btn-icon-small"><Eye size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.payslips.length === 0 && (
                  <tr>
                    <td colSpan="9" className="empty-state">Aucun bulletin généré pour cette période.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RH;
