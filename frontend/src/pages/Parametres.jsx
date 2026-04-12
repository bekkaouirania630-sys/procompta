import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  Building2, Users, Shield, Database, 
  MapPin, Phone, Mail, FileCheck, Save, Loader2, AlertCircle, Info, Trash2,
  Sparkles, Globe, Cpu, UserCheck, X
} from 'lucide-react';

const API = 'http://localhost:8000/api';

const Parametres = () => {
    const { refresh } = useData();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [message, setMessage] = useState(null);
    const [company, setCompany] = useState({
        name: '', ice: '', if: '', rc: '', patente: '', cnss: '',
        address: '', phone: '', email: '', ville: '',
        tva_regime: 'mensuel', compta_method: 'engagement', currency: 'MAD'
    });

    const getHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    });

    const fetchCompany = async () => {
        const companyId = localStorage.getItem('company_id');
        if (!companyId) { setLoading(false); return; }
        try {
            const res = await fetch(`${API}/companies/${companyId}`, { headers: getHeaders() });
            if (res.ok) {
                const data = await res.json();
                setCompany(prev => ({ ...prev, ...data }));
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchCompany();
        const handleIdChange = () => fetchCompany();
        window.addEventListener('company-changed', handleIdChange);
        return () => window.removeEventListener('company-changed', handleIdChange);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCompany(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        const companyId = company.id || localStorage.getItem('company_id');
        try {
            const res = await fetch(`${API}/companies/${companyId}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(company)
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Paramètres système synchronisés.' });
                refresh();
            } else {
                setMessage({ type: 'error', text: 'Échec de la synchronisation.' });
            }
        } catch (e) { setMessage({ type: 'error', text: 'Serveur injoignable.' }); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="flex items-center justify-center h-[400px]"><div className="loader"></div></div>;

    return (
        <div className="fade-in">
            {/* ── Header ── */}
            <div className="section-header" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Espace Configuration</h1>
                    <p className="text-muted" style={{ fontWeight: 500 }}>Paramètres de l'organisation, identité fiscale et accès utilisateurs.</p>
                </div>
                {message && (
                    <div className={`p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${
                        message.type === 'success' ? 'bg-primary-glow text-primary border border-primary/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                        {message.type === 'success' ? <Info size={16} /> : <AlertCircle size={16} />}
                        <span className="text-sm font-bold">{message.text}</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-12 gap-8 pb-12">
                <div className="col-span-8 flex flex-col gap-8">
                    {/* Identity Section */}
                    <div className="card glass-panel" style={{ padding: '32px' }}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="premium-font" style={{ fontWeight: 800 }}>Fiche Signalétique Société</h3>
                            <Building2 size={20} className="text-primary" />
                        </div>
                        <div className="grid g2 mb-6">
                            <div className="form-group">
                                <label className="form-label">Dénomination Sociale *</label>
                                <input className="form-input" name="name" value={company.name || ''} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Identifiant Commun (ICE)</label>
                                <input className="form-input" name="ice" value={company.ice || ''} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="grid g3 mb-6">
                            <div className="form-group">
                                <label className="form-label">I.F. (DGI)</label>
                                <input className="form-input" name="if" value={company.if || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">R.C. (Tribunal)</label>
                                <input className="form-input" name="rc" value={company.rc || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Taxe Professionnelle</label>
                                <input className="form-input" name="patente" value={company.patente || ''} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group mb-6">
                            <label className="form-label">Adresse du Siège</label>
                            <input className="form-input" name="address" value={company.address || ''} onChange={handleChange} />
                        </div>
                        <div className="grid g3">
                            <div className="form-group">
                                <label className="form-label">Ville</label>
                                <input className="form-input" name="ville" value={company.ville || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Téléphone</label>
                                <input className="form-input" name="phone" value={company.phone || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">E-mail Professionnel</label>
                                <input className="form-input" name="email" value={company.email || ''} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Accounting Config */}
                    <div className="card glass-panel" style={{ padding: '32px' }}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="premium-font" style={{ fontWeight: 800 }}>Préférences Comptables</h3>
                            <FileCheck size={20} className="text-secondary" />
                        </div>
                        <div className="grid g3">
                            <div className="form-group">
                                <label className="form-label">Régime T.V.A</label>
                                <select className="form-select" name="tva_regime" value={company.tva_regime} onChange={handleChange}>
                                    <option value="mensuel">Déclaration Mensuelle</option>
                                    <option value="trimestriel">Déclaration Trimestrielle</option>
                                    <option value="exoneré">Exonération Totale</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Méthode de Calcul</label>
                                <select className="form-select" name="compta_method" value={company.compta_method} onChange={handleChange}>
                                    <option value="engagement">Comptabilité d'Engagement</option>
                                    <option value="encaissement">Comptabilité de Trésorerie</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Devise Référence</label>
                                <select className="form-select" name="currency" value={company.currency} onChange={handleChange}>
                                    <option value="MAD">MAD — Dirham Marocain</option>
                                    <option value="EUR">EUR — Euro</option>
                                    <option value="USD">USD — Dollar</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-4 flex flex-col gap-8">
                    {/* User Management */}
                    <div className="card glass-panel" style={{ padding: '24px' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="premium-font" style={{ fontWeight: 800 }}>Utilisateurs</h3>
                            <Users size={18} className="text-primary" />
                        </div>
                        <div className="flex-c gap-4">
                            <div className="p-4 rounded-xl border border-white/5 bg-bg flex items-center justify-between hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="tb-avatar" style={{ background: 'var(--primary)', color: 'white', fontWeight: 900 }}>A</div>
                                    <div className="flex-c">
                                        <span style={{ fontSize: 13, fontWeight: 800 }}>Admin Srv</span>
                                        <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Droits : Root</span>
                                    </div>
                                </div>
                                <span className="badge badge-success">Online</span>
                            </div>
                            <button type="button" className="btn btn-outline btn-xs w-full py-3" onClick={() => setShowUserModal(true)}>+ Nouvel Accès Personnel</button>
                        </div>
                    </div>

                    {/* ── User Modal ── */}
                    {showUserModal && (
                        <div className="modal-overlay-premium" onClick={() => setShowUserModal(false)}>
                            <div className="modal-card-premium" style={{ width: '100%', maxWidth: 750 }} onClick={e => e.stopPropagation()}>
                                <div className="modal-header" style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)' }}>
                                    <div className="modal-title" style={{ fontSize: 20, fontWeight: 800 }}>
                                        <UserCheck size={24} className="text-primary" />
                                        <span className="ml-2">Nouveau Collaborateur</span>
                                    </div>
                                    <button className="modal-close" onClick={() => setShowUserModal(false)}><X size={20} /></button>
                                </div>

                                <div className="modal-content-wrapper" style={{ gridTemplateColumns: '1fr 260px' }}>
                                    <div className="modal-scrollable">
                                        <div className="premium-form-group mb-6">
                                            <label className="premium-label">Nom complet</label>
                                            <input className="premium-input" placeholder="ex: Omar Benjelloun" />
                                        </div>
                                        <div className="premium-form-group mb-6">
                                            <label className="premium-label">E-mail de connexion</label>
                                            <input className="premium-input" type="email" placeholder="omar@bo.ma" />
                                        </div>
                                        <div className="premium-form-group mb-6">
                                            <label className="premium-label">Rôle / Privilèges</label>
                                            <select className="premium-input">
                                                <option value="accountant">Comptable (Saisie + Validation)</option>
                                                <option value="hr">Gestionnaire RH</option>
                                                <option value="viewer">Consultation uniquement</option>
                                                <option value="admin">Administrateur Système</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="side-info-panel" style={{ padding: '24px 20px' }}>
                                        <div>
                                            <h4 className="premium-label" style={{ marginBottom: 12 }}>Sécurité des Accès</h4>
                                            <div className="card glass-panel" style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.05)', border: 'none' }}>
                                                <p style={{ fontSize: 11, color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                                                    <Shield size={14} className="inline mr-1 text-primary"/> Le nouvel utilisateur recevra une invitation par e-mail pour configurer son mot de passe.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-auto flex-c gap-3">
                                            <button className="btn btn-primary w-full" style={{ height: 48 }} onClick={() => setShowUserModal(false)}>
                                                <Users size={18} />
                                                <span className="ml-2">Créer l'accès</span>
                                            </button>
                                            <button className="btn btn-outline w-full" onClick={() => setShowUserModal(false)}>Annuler</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Infrastructure */}
                    <div className="card glass-panel" style={{ padding: '24px' }}>
                        <h3 className="premium-font mb-6" style={{ fontWeight: 800 }}>Système & Assets</h3>
                        <div className="flex-c gap-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-bg/50 text-xs border border-white/5">
                                <div className="flex items-center gap-2"><Cpu size={14} className="text-muted"/> Version App</div>
                                <span className="font-bold">v3.4.2-LXR</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-bg/50 text-xs border border-white/5">
                                <div className="flex items-center gap-2"><Database size={14} className="text-muted"/> Backup Plan</div>
                                <span className="font-bold text-secondary">Quotidien OK</span>
                            </div>
                        </div>
                        <button type="button" className="btn btn-outline btn-xs w-full mt-6 flex items-center justify-center gap-2">
                            <Globe size={14}/> Accès API Externe
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button type="submit" className="btn btn-primary w-full py-4 flex items-center justify-center gap-3" disabled={saving}>
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            <span style={{ fontWeight: 800 }}>Propager les changements</span>
                        </button>
                        <button type="button" className="btn btn-outline w-full text-danger border-danger/20" onClick={()=>alert("Confirm reset?")}>
                            <Trash2 size={16}/> Wipe Database Cache
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Parametres;
