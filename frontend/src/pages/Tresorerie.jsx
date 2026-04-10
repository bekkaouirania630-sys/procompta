import React from 'react';
import { useData } from '../context/DataContext';
import { 
  Landmark, ArrowUpRight, ArrowDownRight, 
  History, CreditCard, Wallet, Download
} from 'lucide-react';

const Tresorerie = () => {
  const { data, loading } = useData();

  // Illustrative treasurer data
  const soldeBanque = 185420;
  const mouvements = [
    { id: 1, date: '2024-06-01', libelle: 'Virement client SARL ABC', debit: 0, credit: 17760, raproche: true },
    { id: 2, date: '2024-06-03', libelle: 'Règlement Maroc Telecom', debit: 3840, credit: 0, raproche: true },
    { id: 3, date: '2024-06-05', libelle: 'Règlement Transport Express', debit: 10500, credit: 0, raproche: true },
    { id: 4, date: '2024-06-07', libelle: 'Virement client BETA SA', debit: 0, credit: 24000, raproche: false },
    { id: 5, date: '2024-06-08', libelle: 'Virement salaires Juin', debit: 32450, credit: 0, raproche: false },
  ];

  return (
    <div className="layout-container">
      <div className="coa-header">
        <div>
          <h1 className="flex items-center gap-3">
            <Landmark size={28} className="text-secondary" /> Gestion de Trésorerie
          </h1>
          <p className="text-muted">Suivi des flux bancaires, caisse et rapprochement bancaire.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary"><Download size={18} /> Relevé Bancaire</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="glass-panel p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-muted text-xs uppercase font-bold mb-1">Solde Banque Principal</div>
              <div className="text-3xl font-bold text-green-500">{soldeBanque.toLocaleString()} MAD</div>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <Wallet size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted">Attijariwafabank — 00778...9988</div>
        </div>
        
        <div className="glass-panel p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-muted text-xs uppercase font-bold mb-1">Encaissements Juin</div>
              <div className="text-3xl font-bold text-blue-500">41,760 MAD</div>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <ArrowUpRight size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted">2 rentrées prévues cette semaine</div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-muted text-xs uppercase font-bold mb-1">Décaissements Juin</div>
              <div className="text-3xl font-bold text-red-500">46,790 MAD</div>
            </div>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <ArrowDownRight size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted">Salaires + Fournisseurs</div>
        </div>
      </div>

      <div className="glass-panel coa-card mt-8">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <History size={18} className="text-primary" /> Derniers Mouvements Bancaires
          </h3>
          <button className="btn btn-outline btn-sm">Pointer les opérations</button>
        </div>
        <div className="coa-table-wrapper">
          <table className="coa-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Libellé de l'opération</th>
                <th>Débit (Sortie)</th>
                <th>Crédit (Entrée)</th>
                <th>Rapproché</th>
              </tr>
            </thead>
            <tbody>
              {mouvements.map(m => (
                <tr key={m.id}>
                  <td>{new Date(m.date).toLocaleDateString()}</td>
                  <td className="account-name">{m.libelle}</td>
                  <td className="text-red-500 font-bold">{m.debit > 0 ? `-${m.debit.toLocaleString()} MAD` : '-'}</td>
                  <td className="text-green-500 font-bold">{m.credit > 0 ? `+${m.credit.toLocaleString()} MAD` : '-'}</td>
                  <td>
                    {m.raproche ? 
                      <span className="badge badge-green">Oui ✓</span> : 
                      <span className="badge badge-amber">En attente</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tresorerie;
