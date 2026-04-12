<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BankTransaction;
use App\Models\EntryLine;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BankReconciliationController extends Controller
{
    /**
     * Get non-reconciled transactions for a specific bank account
     */
    public function unmatchedTransactions(Request $request): JsonResponse
    {
        $request->validate(['bank_account_id' => 'required|exists:bank_accounts,id']);
        
        $transactions = BankTransaction::where('bank_account_id', $request->bank_account_id)
            ->where('is_reconciled', false)
            ->orderBy('date', 'desc')
            ->get();
            
        return response()->json($transactions);
    }

    /**
     * Suggest matching ledger entries for a bank transaction
     */
    public function suggestions(BankTransaction $transaction): JsonResponse
    {
        if ($transaction->is_reconciled) {
            return response()->json(['message' => 'Déjà rapproché'], 400);
        }

        $amount = $transaction->debit > 0 ? $transaction->debit : $transaction->credit;
        $column = $transaction->debit > 0 ? 'debit' : 'credit';

        // Search for lines with exact amount, +/- 7 days
        $suggestions = EntryLine::with('entry')
            ->where('is_reconciled', false)
            ->where($column, $amount)
            ->whereHas('entry', function($q) use ($transaction) {
                $q->whereBetween('date', [
                    $transaction->date->subDays(7)->format('Y-m-d'),
                    $transaction->date->addDays(7)->format('Y-m-d')
                ]);
            })
            ->get();

        return response()->json($suggestions);
    }

    /**
     * Link bank transaction to one or more ledger lines
     */
    public function link(Request $request): JsonResponse
    {
        $request->validate([
            'bank_transaction_id' => 'required|exists:bank_transactions,id',
            'entry_line_ids' => 'required|array',
            'entry_line_ids.*' => 'exists:entry_lines,id'
        ]);

        $transaction = BankTransaction::findOrFail($request->bank_transaction_id);

        DB::transaction(function () use ($transaction, $request) {
            foreach ($request->entry_line_ids as $lineId) {
                $line = EntryLine::findOrFail($lineId);
                $line->update([
                    'bank_transaction_id' => $transaction->id,
                    'is_reconciled' => true
                ]);
            }

            $transaction->update(['is_reconciled' => true]);
        });

        return response()->json([
            'message' => 'Rapprochement effectué avec succès',
            'transaction' => $transaction
        ]);
    }

    /**
     * Simple Auto-Matching Algorithm
     */
    public function autoMatch(Request $request): JsonResponse
    {
        $request->validate(['bank_account_id' => 'required|exists:bank_accounts,id']);

        $unmatched = BankTransaction::where('bank_account_id', $request->bank_account_id)
            ->where('is_reconciled', false)
            ->get();

        $matchCount = 0;

        foreach ($unmatched as $tx) {
            $amount = $tx->debit > 0 ? $tx->debit : $tx->credit;
            $column = $tx->debit > 0 ? 'debit' : 'credit';

            // Find an EXACT match (Amount + Date + No existing reconciliation)
            $found = EntryLine::where('is_reconciled', false)
                ->where($column, $amount)
                ->whereHas('entry', function($q) use ($tx) {
                    $q->where('date', $tx->date->format('Y-m-d'));
                })
                ->first();

            if ($found) {
                DB::transaction(function() use ($tx, $found) {
                    $found->update([
                        'bank_transaction_id' => $tx->id,
                        'is_reconciled' => true
                    ]);
                    $tx->update(['is_reconciled' => true]);
                });
                $matchCount++;
            }
        }

        return response()->json([
            'message' => "Rapprochement automatique terminé : {$matchCount} correspondances trouvées.",
            'matches_found' => $matchCount
        ]);
    }
}
