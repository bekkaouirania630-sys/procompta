import React from 'react';
import { useData } from '../context/DataContext';
import { 
  Building2, Users, Shield, Database, 
  MapPin, Phone, Mail, FileCheck 
} from 'lucide-react';

const Parametres = () => {
  const { data } = useData();

  return (
    <div className="layout-container">
      <div className="coa-header">
        <div>
          <h1 className="flex items-center gap-3">
            <Building2 size={28} className="text-secondary" /> Paramètres du Cabinet
          </h1>
          <p className="text-muted">Configuration de la société, des utilisateurs et du système.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h3 className="mb-6 font-bold flex items-center gap-2">
              <Building2 size={18} className="text-primary" /> Informations de la Société
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Raison Sociale</label>
                <input className="form-input" defaultValue="ALFA SARL" />
              </div>
              <div className="form-group">
                <label className="form-label">ICE</label>
                <input className="form-input" defaultValue="002123456789001" />
              </div>
              <div className="form-group">
                <label className="form-label">Identifiant Fiscal (IF)</label>
                <input className="form-input" defaultValue="12345678" />
              </div>
              <div className="form-group">
                <label className="form-label">Registre de Commerce (RC)</label>
                <input className="form-input" defaultValue="123456" />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Adresse Siège Social</label>
                <input className="form-input" defaultValue="123 Boulevard Mohammed V, Casablanca" />
              </div>
            </div>
            <button className="btn btn-primary mt-6">Sauvegarder les modifications</button>
          </div>

          <div className="glass-panel p-6">
            <h3 className="mb-6 font-bold flex items-center gap-2">
              <FileCheck size={18} className="text-secondary" /> Configuration Comptable & TVA
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Régime de TVA</label>
                <select className="form-select">
                  <option>Mensuel</option>
                  <option>Trimestriel</option>
                  <option disabled>Exonéré</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Méthode de comptabilisation</label>
                <select className="form-select">
                  <option>Encaissements / Décaissements</option>
                  <option>Débits / Crédits (Engagement)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h3 className="mb-6 font-bold flex items-center gap-2">
              <Users size={18} className="text-primary" /> Utilisateurs
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 p-2 bg-white/5 rounded">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">A</div>
                <div>
                  <div className="font-bold text-sm">Administrateur</div>
                  <div className="text-xs text-muted">admin@comptama.ma</div>
                </div>
                <span className="badge badge-green ml-auto">Actif</span>
              </div>
              <button className="btn btn-outline btn-sm w-full">+ Ajouter un utilisateur</button>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="mb-6 font-bold flex items-center gap-2">
              <Database size={18} className="text-amber-500" /> Maintenance & Backup
            </h3>
            <div className="flex flex-col gap-3">
              <button className="btn btn-outline w-full justify-start gap-3">
                <Database size={16} /> Sauvegarde JSON
              </button>
              <button className="btn btn-outline w-full justify-start gap-3 text-red-500">
                <Shield size={16} /> Réinitialiser les données
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parametres;
