<?php

namespace App\Services;

use App\Models\BankTransaction;
use App\Models\EntryLine;
use Illuminate\Support\Facades\DB;

class TreasuryService
{
    /**
     * Auto-match bank transactions with accounting entry lines based on amount and date.
     */
    public function autoMatch($companyId)
    {
        $unmatchedTransactions = BankTransaction::where('company_id', $companyId)
            ->whereNull('reconciled_at')
            ->get();

        $matches = [];

        foreach ($unmatchedTransactions as $transaction) {
            // Find lines with same amount and within a 7-day window
            $match = EntryLine::where('company_id', $companyId)
                ->whereNull('reconciled_at')
                ->where(function($q) use ($transaction) {
                    $q->where('debit', $transaction->amount)
                      ->orWhere('credit', -$transaction->amount);
                })
                ->whereHas('entry', function($q) use ($transaction) {
                    $q->whereBetween('date', [
                        date('Y-m-d', strtotime($transaction->date . ' -7 days')),
                        date('Y-m-d', strtotime($transaction->date . ' +7 days'))
                    ]);
                })
                ->first();

            if ($match) {
                $this->link($transaction->id, $match->id);
                $matches[] = [
                    'transaction_id' => $transaction->id,
                    'entry_line_id' => $match->id
                ];
            }
        }

        return $matches;
    }

    public function link($transactionId, $entryLineId)
    {
        return DB::transaction(function () use ($transactionId, $entryLineId) {
            $transaction = BankTransaction::findOrFail($transactionId);
            $line = EntryLine::findOrFail($entryLineId);

            $now = now();
            $transaction->update(['reconciled_at' => $now]);
            $line->update(['reconciled_at' => $now]);

            return true;
        });
    }
}
