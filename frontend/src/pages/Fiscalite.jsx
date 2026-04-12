import React, { useState } from 'react';
import { useTvaDeclaration, useCnssDeclaration } from '../hooks/useAccounting';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { ShieldCheck, Download, Calendar, TrendingUp, FileText, Users, AlertCircle, RefreshCcw } from 'lucide-react';
import { formatMAD } from '../utils/formatters';

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const Fiscalite = () => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState('tva');

  const { data: tvaData, isLoading: tvaLoading, refetch: refetchTva } = useTvaDeclaration(selectedMonth, selectedYear);
  const { data: cnssData, isLoading: cnssLoading, refetch: refetchCnss } = useCnssDeclaration(selectedMonth, selectedYear);

  const tvaFacturee = tvaData?.tva_facturee || 0;
  const tvaCharges = tvaData?.tva_recup_charges || 0;
  const tvaImmo = tvaData?.tva_recup_immo || 0;
  const tvaDue = tvaData?.tva_due || 0;
  const creditTva = tvaData?.credit_tva || 0;

  const pieData = [
    { name: 'TVA Facturée', value: tvaFacturee },
    { name: 'TVA Récup. Charges', value: tvaCharges },
    { name: 'TVA Récup. Immo', value: tvaImmo },
  ].filter(d => d.value > 0);
  const COLORS = ['#059669', '#3B82F6', '#F59E0B'];

  const months = [
    'Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
  ];

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>
            Déclarations Fiscales & Sociales
          </h1>
          <p className="text-muted" style={{ fontWeight: 500 }}>
            TVA mensuelle, CNSS et cotisations sociales — données calculées depuis vos écritures comptables.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            className="premium-input"
            style={{ width: 140 }}
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select
            className="premium-input"
            style={{ width: 100 }}
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => { refetchTva(); refetchCnss(); }}>
            <RefreshCcw size={14} /> Actualiser
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {[
          { id: 'tva', label: '📊 Déclaration TVA' },
          { id: 'cnss', label: '👥 Cotisations CNSS/AMO' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '100px', fontSize: '12px' }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TVA TAB ── */}
      {activeTab === 'tva' && (
        <div className="fade-in">
          {tvaLoading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
              Calcul en cours...
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid g3" style={{ marginBottom: '32px' }}>
                <div className="kpi-jewel">
                  <div className="kpi-label">TVA Facturée (4455)</div>
                  <div className="kpi-value" style={{ color: 'var(--primary)' }}>
                    {formatMAD(tvaFacturee)}
                  </div>
                  <div className="kpi-trend text-muted">Sur ventes de la période</div>
                </div>
                <div className="kpi-jewel">
                  <div className="kpi-label">TVA Récupérable</div>
                  <div className="kpi-value" style={{ color: 'var(--secondary)' }}>
                    {formatMAD(tvaCharges + tvaImmo)}
                  </div>
                  <div className="kpi-trend text-muted">Charges + Immobilisations</div>
                </div>
                <div className="kpi-jewel" style={{ borderLeft: `4px solid ${tvaDue > 0 ? 'var(--warning)' : 'var(--success)'}` }}>
                  <div className="kpi-label" style={{ color: tvaDue > 0 ? 'var(--warning)' : 'var(--success)' }}>
                    {tvaDue > 0 ? '⚠️ TVA DUE (À verser DGI)' : '✅ Crédit de TVA'}
                  </div>
                  <div className="kpi-value" style={{ color: tvaDue > 0 ? 'var(--warning)' : 'var(--success)' }}>
                    {formatMAD(tvaDue > 0 ? tvaDue : creditTva)}
                  </div>
                  <div className="kpi-trend">
                    {tvaDue > 0 ? (
                      <span style={{ color: 'var(--danger)' }}>
                        <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                        À déclarer avant le 20 du mois
                      </span>
                    ) : (
                      <span style={{ color: 'var(--success)' }}>Crédit reportable au mois suivant</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid g2">
                {/* Pie Chart */}
                <div className="card" style={{ padding: '32px' }}>
                  <h3 className="premium-font" style={{ fontWeight: 800, marginBottom: 24 }}>
                    Répartition du Flux TVA — {months[selectedMonth - 1]} {selectedYear}
                  </h3>
                  {pieData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
                      Aucune écriture TVA trouvée pour cette période.
                    </div>
                  ) : (
                    <div style={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ border: 'none', borderRadius: '12px', background: 'var(--surface)', boxShadow: 'var(--shadow)' }} formatter={(v) => formatMAD(v)} />
                          <Legend iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Tableau récapitulatif */}
                <div className="card" style={{ padding: '32px' }}>
                  <h3 className="premium-font" style={{ fontWeight: 800, marginBottom: 24 }}>
                    <FileText size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--primary)' }} />
                    Récapitulatif TVA (Taux 20%)
                  </h3>
                  <div className="table-premium-responsive">
                    <table className="tbl-premium">
                      <thead>
                        <tr>
                          <th>Opération</th>
                          <th style={{ textAlign: 'right' }}>Montant (MAD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>TVA Facturée (Compte 4455)</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }} className="num-font">
                            + {formatMAD(tvaFacturee)}
                          </td>
                        </tr>
                        <tr>
                          <td>TVA Récup. sur Charges (34552)</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--secondary)' }} className="num-font">
                            - {formatMAD(tvaCharges)}
                          </td>
                        </tr>
                        <tr>
                          <td>TVA Récup. sur Immob. (34551)</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--secondary)' }} className="num-font">
                            - {formatMAD(tvaImmo)}
                          </td>
                        </tr>
                        <tr style={{ background: 'var(--surface-mut)', fontWeight: 900 }}>
                          <td className="premium-font" style={{ textTransform: 'uppercase', fontSize: 12 }}>
                            {tvaDue > 0 ? '▼ TVA Nette Due' : '▲ Crédit de TVA'}
                          </td>
                          <td style={{ textAlign: 'right', color: tvaDue > 0 ? 'var(--warning)' : 'var(--success)', fontSize: 16 }} className="num-font">
                            {formatMAD(tvaDue > 0 ? tvaDue : creditTva)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CNSS TAB ── */}
      {activeTab === 'cnss' && (
        <div className="fade-in">
          {cnssLoading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
              Calcul en cours...
            </div>
          ) : (
            <>
              <div className="grid g3" style={{ marginBottom: '32px' }}>
                <div className="kpi-jewel">
                  <div className="kpi-label">Salariés Concernés</div>
                  <div className="kpi-value" style={{ color: 'var(--primary)' }}>
                    {cnssData?.nombre_salaries || 0}
                  </div>
                  <div className="kpi-trend text-muted">Bulletins validés</div>
                </div>
                <div className="kpi-jewel">
                  <div className="kpi-label">Masse Salariale Brute</div>
                  <div className="kpi-value" style={{ color: 'var(--text-main)' }}>
                    {formatMAD(cnssData?.masse_salariale_brute || 0)}
                  </div>
                </div>
                <div className="kpi-jewel" style={{ borderLeft: '4px solid var(--secondary)' }}>
                  <div className="kpi-label">Total Cotisations</div>
                  <div className="kpi-value" style={{ color: 'var(--secondary)' }}>
                    {formatMAD((cnssData?.part_patronale || 0) + (cnssData?.part_salariale || 0))}
                  </div>
                  <div className="kpi-trend text-muted">Patronal + Salarial</div>
                </div>
              </div>

              <div className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                  <Users size={20} style={{ color: 'var(--secondary)' }} />
                  <h3 className="premium-font" style={{ fontWeight: 800 }}>
                    Tableau des Cotisations — {months[selectedMonth - 1]} {selectedYear}
                  </h3>
                </div>
                <div className="table-premium-responsive">
                  <table className="tbl-premium">
                    <thead>
                      <tr>
                        <th>Rubrique</th>
                        <th>Taux</th>
                        <th style={{ textAlign: 'right' }}>Partie Patronale</th>
                        <th style={{ textAlign: 'right' }}>Partie Salariale</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>CNSS — Prestations familiales & sociales</td>
                        <td><span className="badge badge-success">~21.09%</span></td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }} className="num-font">
                          {formatMAD(cnssData?.part_patronale || 0)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }} className="num-font">—</td>
                      </tr>
                      <tr>
                        <td>CNSS — Part salariale (retraite)</td>
                        <td><span className="badge badge-warning">4.48%</span></td>
                        <td style={{ textAlign: 'right' }} className="num-font">—</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }} className="num-font">
                          {formatMAD(cnssData?.part_salariale || 0)}
                        </td>
                      </tr>
                      <tr style={{ background: 'var(--surface-mut)', fontWeight: 900 }}>
                        <td className="premium-font" style={{ textTransform: 'uppercase', fontSize: 12 }}>Total à Verser</td>
                        <td>—</td>
                        <td style={{ textAlign: 'right', color: 'var(--secondary)' }} className="num-font">
                          {formatMAD(cnssData?.part_patronale || 0)}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--secondary)' }} className="num-font">
                          {formatMAD(cnssData?.part_salariale || 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--secondary-glow)', borderRadius: 10, border: '1px solid rgba(30,58,138,0.2)', fontSize: 12, color: 'var(--secondary)' }}>
                  <strong>Note :</strong> Ces montants sont calculés automatiquement depuis les bulletins de paie validés du mois. Pour tout ajustement, veuillez valider les bulletins dans le module RH → Paie.
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Fiscalite;
