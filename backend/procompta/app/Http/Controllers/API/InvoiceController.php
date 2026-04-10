<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\InvoiceLine;
use App\Models\Journal;
use App\Models\Entry;
use App\Models\EntryLine;
use App\Models\Account;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        return response()->json(Invoice::where('company_id', $companyId)->with('tier')->get());
    }

    public function store(Request $request)
    {
        $companyId = $request->user()->company_id;
        
        $validated = $request->validate([
            'type' => 'required|in:achat,vente',
            'numero' => 'required|string',
            'tier_id' => 'required|exists:tiers,id',
            'date' => 'required|date',
            'echeance' => 'nullable|date',
            'lines' => 'required|array|min:1',
            'lines.*.description' => 'required|string',
            'lines.*.quantity' => 'required|numeric|min:1',
            'lines.*.price' => 'required|numeric|min:0',
            'lines.*.tva_rate' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $companyId) {
            $ht = 0;
            $tva = 0;

            foreach ($validated['lines'] as $line) {
                $lineHt = $line['quantity'] * $line['price'];
                $lineTva = $lineHt * ($line['tva_rate'] / 100);
                $ht += $lineHt;
                $tva += $lineTva;
            }

            $invoice = Invoice::create([
                'company_id' => $companyId,
                'tier_id' => $validated['tier_id'],
                'numero' => $validated['numero'],
                'type' => $validated['type'],
                'date' => $validated['date'],
                'echeance' => $validated['echeance'],
                'ht' => $ht,
                'tva' => $tva,
                'ttc' => $ht + $tva,
                'statut' => 'en_attente',
            ]);

            foreach ($validated['lines'] as $lineData) {
                $invoice->invoiceLines()->create([
                    'description' => $lineData['description'],
                    'quantity' => $lineData['quantity'],
                    'price' => $lineData['price'],
                ]);
            }

            return response()->json($invoice->load('tier', 'invoiceLines'), 201);
        });
    }

    public function show(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        return response()->json(Invoice::where('company_id', $companyId)->with('invoiceLines', 'tier')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $invoice = Invoice::where('company_id', $companyId)->findOrFail($id);
        
        $oldStatus = $invoice->statut;
        
        $validated = $request->validate([
            'statut' => 'sometimes|string|in:brouillon,en_attente,validée,payée,rejetée',
            'notes' => 'nullable|string',
        ]);

        $invoice->update($validated);

        // Déclencher la comptabilisation automatique si passage à 'validée'
        if ($oldStatus !== 'validée' && $invoice->statut === 'validée') {
            $this->generateAccountingEntry($invoice);
        }

        return response()->json($invoice);
    }

    private function generateAccountingEntry(Invoice $invoice)
    {
        DB::transaction(function () use ($invoice) {
            $companyId = $invoice->company_id;
            
            // 1. Trouver ou créer le journal approprié (ACH pour achat, VTE pour vente)
            $journalCode = $invoice->type === 'achat' ? 'ACH' : 'VTE';
            $journal = Journal::firstOrCreate(
                ['code' => $journalCode, 'company_id' => $companyId],
                ['name' => $invoice->type === 'achat' ? 'Journal des Achats' : 'Journal des Ventes', 'type' => $invoice->type]
            );

            // 2. Créer l'entête de l'écriture
            $entry = Entry::create([
                'journal_id' => $journal->id,
                'company_id' => $companyId,
                'date' => $invoice->date,
                'numero' => $invoice->numero,
                'libelle' => ($invoice->type === 'achat' ? 'Achat - ' : 'Vente - ') . $invoice->numero,
                'statut' => 'validée'
            ]);

            // 3. Créer les lignes d'écriture (PCM Marocain)
            if ($invoice->type === 'vente') {
                // Débit Client (3421)
                $accClient = Account::firstOrCreate(['number' => '3421', 'company_id' => $companyId], ['label' => 'Clients']);
                EntryLine::create([
                    'entry_id' => $entry->id,
                    'account_id' => $accClient->id,
                    'libelle' => 'Client - ' . ($invoice->tier->name ?? 'DIVERS'),
                    'debit' => $invoice->ttc,
                    'credit' => 0
                ]);

                // Crédit Ventes (7111)
                $accVente = Account::firstOrCreate(['number' => '7111', 'company_id' => $companyId], ['label' => 'Ventes de marchandises']);
                EntryLine::create([
                    'entry_id' => $entry->id,
                    'account_id' => $accVente->id,
                    'libelle' => 'Vente HT',
                    'debit' => 0,
                    'credit' => $invoice->ht
                ]);

                // Crédit TVA Facturée (4455)
                if ($invoice->tva > 0) {
                    $accTva = Account::firstOrCreate(['number' => '4455', 'company_id' => $companyId], ['label' => 'État - TVA facturée']);
                    EntryLine::create([
                        'entry_id' => $entry->id,
                        'account_id' => $accTva->id,
                        'libelle' => 'TVA Facturée',
                        'debit' => 0,
                        'credit' => $invoice->tva
                    ]);
                }
            } else {
                // Achat
                // Débit Achats (6111)
                $accAchat = Account::firstOrCreate(['number' => '6111', 'company_id' => $companyId], ['label' => 'Achats de matières']);
                EntryLine::create([
                    'entry_id' => $entry->id,
                    'account_id' => $accAchat->id,
                    'libelle' => 'Achat HT',
                    'debit' => $invoice->ht,
                    'credit' => 0
                ]);

                // Débit TVA Récupérable (3455)
                if ($invoice->tva > 0) {
                    $accTva = Account::firstOrCreate(['number' => '3455', 'company_id' => $companyId], ['label' => 'État - TVA récupérable']);
                    EntryLine::create([
                        'entry_id' => $entry->id,
                        'account_id' => $accTva->id,
                        'libelle' => 'TVA Récupérable',
                        'debit' => $invoice->tva,
                        'credit' => 0
                    ]);
                }

                // Crédit Fournisseur (4411)
                $accFourn = Account::firstOrCreate(['number' => '4411', 'company_id' => $companyId], ['label' => 'Fournisseurs']);
                EntryLine::create([
                    'entry_id' => $entry->id,
                    'account_id' => $accFourn->id,
                    'libelle' => 'Fournisseur - ' . ($invoice->tier->name ?? 'DIVERS'),
                    'debit' => 0,
                    'credit' => $invoice->ttc
                ]);
            }
        });
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $invoice = Invoice::where('company_id', $companyId)->findOrFail($id);
        $invoice->delete();
        return response()->json(['message' => 'Facture supprimée']);
    }
}
