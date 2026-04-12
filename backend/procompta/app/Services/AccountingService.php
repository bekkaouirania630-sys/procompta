<?php

namespace App\Services;

use App\Repositories\Contracts\AccountingRepositoryInterface;
use App\Models\Entry;
use App\Models\EntryLine;
use Illuminate\Support\Facades\DB;

class AccountingService
{
    protected $accountingRepo;

    public function __construct(AccountingRepositoryInterface $accountingRepo)
    {
        $this->accountingRepo = $accountingRepo;
    }

    public function createEntry(array $data)
    {
        $totalDebit  = collect($data['lines'])->sum('debit');
        $totalCredit = collect($data['lines'])->sum('credit');

        if (abs($totalDebit - $totalCredit) > 0.001) {
            throw new \Exception("L'écriture n'est pas équilibrée (Débit: $totalDebit, Crédit: $totalCredit)");
        }

        return DB::transaction(function () use ($data) {
            $journal = \App\Models\Journal::findOrFail($data['journal_id']);
            $year    = date('Y', strtotime($data['date']));
            $count   = Entry::whereHas('journal', fn($q) => $q->where('code', $journal->code))
                            ->whereYear('date', $year)->count() + 1;
            $numero  = $journal->code . '-' . $year . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);

            $entry = Entry::create([
                'date'        => $data['date'],
                'description' => $data['description'] ?? '',
                'journal_id'  => $data['journal_id'],
                'status'      => $data['status'] ?? 'brouillon',
                'numero'      => $numero,
                'company_id'  => $data['company_id'] ?? auth()->user()->company_id,
            ]);

            foreach ($data['lines'] as $lineData) {
                EntryLine::create([
                    'entry_id'   => $entry->id,
                    'account_id' => $lineData['account_id'],
                    'label'      => $lineData['label'] ?? null,
                    'debit'      => $lineData['debit'],
                    'credit'     => $lineData['credit'],
                ]);
            }

            return $entry->load('entry_lines.account');
        });
    }

    public function getBalance($startDate, $endDate)
    {
        return \App\Models\Account::with(['entryLines' => function($query) use ($startDate, $endDate) {
            $query->whereHas('entry', function($q) use ($startDate, $endDate) {
                $q->whereBetween('date', [$startDate, $endDate]);
            });
        }])->get()->map(function($account) {
            $debit = $account->entryLines->sum('debit');
            $credit = $account->entryLines->sum('credit');
            return [
                'number' => $account->number,
                'label' => $account->label,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $debit - $credit
            ];
        });
    }
}
