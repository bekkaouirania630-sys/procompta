import React, { useState, useEffect, useCallback } from 'react';
import { useData } from '../context/DataContext';
import {
  Building2, Users, Shield, Database,
  FileCheck, Save, Loader2, AlertCircle, CheckCircle2,
  Globe, Cpu, UserCheck, X, Settings, Plus, ChevronRight,
  Trash2
} from 'lucide-react';

const API = 'http://localhost:8000/api';

/* ─── Reusable Field Components ─── */
const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
      {label} {required && <span className="text-emerald-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 focus:bg-white transition-all';

const selectCls = inputCls + ' appearance-none cursor-pointer';

/* ─── Section Card ─── */
const SectionCard = ({ icon: Icon, iconColor, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-4 px-8 pt-8 pb-6 border-b border-slate-50">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-base">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="px-8 py-7">{children}</div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */

const Parametres = () => {
  const { refresh } = useData();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [message, setMessage] = useState(null);
  const [company, setCompany] = useState({
    name: '', ice: '', if: '', rc: '', patente: '', cnss: '',
    address: '', phone: '', email: '', ville: '',
    tva_regime: 'mensuel', compta_method: 'engagement', currency: 'MAD',
  });

  const getHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }), []);

  const fetchCompany = useCallback(async () => {
    const id = localStorage.getItem('company_id');
    if (!id) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/companies/${id}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCompany(prev => ({ ...prev, ...data }));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [getHeaders]);

  useEffect(() => {
    fetchCompany();
    window.addEventListener('company-changed', fetchCompany);
    return () => window.removeEventListener('company-changed', fetchCompany);
  }, [fetchCompany]);

  const handleChange = e => setCompany(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const id = company.id || localStorage.getItem('company_id');
    try {
      const res = await fetch(`${API}/companies/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(company),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès.' });
        refresh();
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: 'error', text: 'Échec de la sauvegarde. Veuillez réessayer.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Serveur injoignable.' });
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading State ── */
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Chargement des paramètres…</p>
      </div>
    );

  /* ════════════════════════════════════════════════ RENDER ════ */
  return (
    <div className="max-w-7xl mx-auto space-y-1 pb-16">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Administration</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-emerald-500">Paramètres</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-[Plus_Jakarta_Sans]">
          Configuration Générale
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gérez l'identité de l'entreprise, les préférences comptables et les accès utilisateurs.
        </p>
      </div>

      {/* ── Alert Banner ── */}
      {message && (
        <div
          className={`flex items-start gap-3 px-5 py-4 rounded-2xl mb-6 text-sm font-medium transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success'
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
          <span>{message.text}</span>
          <button className="ml-auto opacity-60 hover:opacity-100" onClick={() => setMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">

          {/* ════ LEFT COLUMN ════ */}
          <div className="lg:col-span-8 space-y-7">

            {/* Fiche Signalétique */}
            <SectionCard
              icon={Building2}
              iconColor="bg-emerald-50 text-emerald-600"
              title="Fiche Signalétique"
              subtitle="Informations légales et coordonnées officielles"
            >
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <Field label="Dénomination Sociale" required>
                      <input className={inputCls} name="name" value={company.name || ''} onChange={handleChange} required placeholder="Ex: Oriotel SARL" />
                    </Field>
                  </div>

                  <Field label="Identifiant Commun (ICE)">
                    <input className={inputCls + ' font-mono'} name="ice" value={company.ice || ''} onChange={handleChange} placeholder="000000000000000" />
                  </Field>

                  <Field label="Identifiant Fiscal (I.F.)">
                    <input className={inputCls + ' font-mono'} name="if" value={company.if || ''} onChange={handleChange} placeholder="00000000" />
                  </Field>

                  <Field label="Registre Commerce (R.C.)">
                    <input className={inputCls + ' font-mono'} name="rc" value={company.rc || ''} onChange={handleChange} placeholder="RC 123456" />
                  </Field>

                  <Field label="Taxe Professionnelle">
                    <input className={inputCls + ' font-mono'} name="patente" value={company.patente || ''} onChange={handleChange} placeholder="0000000" />
                  </Field>
                </div>

                <hr className="border-slate-100" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <Field label="Adresse du Siège">
                      <input className={inputCls} name="address" value={company.address || ''} onChange={handleChange} placeholder="123, Boulevard Hassan II…" />
                    </Field>
                  </div>

                  <Field label="Ville">
                    <input className={inputCls} name="ville" value={company.ville || ''} onChange={handleChange} placeholder="Casablanca" />
                  </Field>

                  <Field label="Téléphone">
                    <input className={inputCls} name="phone" value={company.phone || ''} onChange={handleChange} placeholder="+212 5 22 …" />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="E-mail Professionnel">
                      <input className={inputCls} type="email" name="email" value={company.email || ''} onChange={handleChange} placeholder="contact@entreprise.ma" />
                    </Field>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Préférences Comptables */}
            <SectionCard
              icon={FileCheck}
              iconColor="bg-blue-50 text-blue-600"
              title="Préférences Comptables"
              subtitle="Régime TVA, méthode de comptabilisation et devise"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Régime T.V.A">
                  <select className={selectCls} name="tva_regime" value={company.tva_regime} onChange={handleChange}>
                    <option value="mensuel">Mensuelle</option>
                    <option value="trimestriel">Trimestrielle</option>
                    <option value="exoneré">Exonération Totale</option>
                  </select>
                </Field>

                <Field label="Méthode Comptable">
                  <select className={selectCls} name="compta_method" value={company.compta_method} onChange={handleChange}>
                    <option value="engagement">Engagement</option>
                    <option value="encaissement">Trésorerie</option>
                  </select>
                </Field>

                <Field label="Devise Principale">
                  <select className={selectCls} name="currency" value={company.currency} onChange={handleChange}>
                    <option value="MAD">MAD — Dirham</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="USD">USD — Dollar</option>
                  </select>
                </Field>
              </div>
            </SectionCard>
          </div>

          {/* ════ RIGHT COLUMN ════ */}
          <div className="lg:col-span-4 space-y-5">

            {/* Save Panel */}
            <div className="bg-slate-900 rounded-2xl p-6 relative overflow-hidden">
              {/* Glow */}
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-emerald-500 opacity-10 rounded-full blur-2xl pointer-events-none" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Sauvegarder</p>
              <h3 className="text-white font-bold text-lg mb-1">Appliquer les changements</h3>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                Cliquez pour synchroniser tous les paramètres de l'organisation.
              </p>
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
            </div>

            {/* Équipe */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">Membres</span>
                </div>
              </div>

              {/* User List */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-purple-400 flex items-center justify-center text-white font-bold text-sm shadow">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">Administrateur</p>
                    <p className="text-xs text-slate-400">Propriétaire · Root</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                    ACTIF
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowUserModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-sm font-semibold hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
              >
                <Plus className="w-4 h-4" /> Ajouter un membre
              </button>
            </div>

            {/* Système */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-800 text-sm">Système</span>
              </div>

              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl text-xs">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Cpu className="w-3.5 h-3.5" /> Version
                  </span>
                  <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
                    v4.0.0-PRO
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl text-xs">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Database className="w-3.5 h-3.5" /> Sauvegardes
                  </span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                    Quotidien ✓
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl text-xs">
                  <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <Globe className="w-3.5 h-3.5" /> API Externe
                  </span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                    Connecté
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {if (window.confirm('Réinitialiser le cache système ?')) {}}}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 hover:border-red-300 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Réinitialiser le cache
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ════ MODAL NOUVEAU MEMBRE ════ */}
      {showUserModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowUserModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

          {/* Card */}
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col md:flex-row"
            onClick={e => e.stopPropagation()}
          >
            {/* Form */}
            <div className="flex-1 p-8">
              <div className="flex items-center justify-between mb-7">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-lg">Nouveau Membre</h2>
                    <p className="text-xs text-slate-400">Inviter un collaborateur</p>
                  </div>
                </div>
                <button
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors md:hidden"
                  onClick={() => setShowUserModal(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <Field label="Nom complet">
                  <input className={inputCls} placeholder="Ex: Yasmine El Fassi" />
                </Field>

                <Field label="E-mail de connexion">
                  <input className={inputCls} type="email" placeholder="yasmine@entreprise.ma" />
                </Field>

                <Field label="Niveau d'autorisation">
                  <select className={selectCls}>
                    <option value="accountant">Expert Comptable</option>
                    <option value="hr">Gestionnaire RH</option>
                    <option value="viewer">Auditeur (Lecture seule)</option>
                    <option value="admin">Administrateur Total</option>
                  </select>
                </Field>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-sm"
                  onClick={() => setShowUserModal(false)}
                >
                  Envoyer l'invitation
                </button>
                <button
                  className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-sm"
                  onClick={() => setShowUserModal(false)}
                >
                  Annuler
                </button>
              </div>
            </div>

            {/* Side Panel */}
            <div className="hidden md:flex flex-col w-56 bg-slate-50 border-l border-slate-100 p-6">
              <button
                className="self-end p-1.5 hover:bg-slate-200 rounded-full text-slate-400 transition-colors mb-6"
                onClick={() => setShowUserModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="mt-auto">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Accès Sécurisé</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  L'invité reçoit un lien de configuration de mot de passe valable <strong>48 heures</strong> par e-mail.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parametres;
