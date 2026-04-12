<?php

namespace App\Repositories\Eloquent;

use App\Models\Account;
use App\Models\Entry;
use App\Repositories\Contracts\AccountingRepositoryInterface;

class AccountingRepository extends EloquentRepository implements AccountingRepositoryInterface
{
    public function __construct(Entry $model)
    {
        parent::__construct($model);
    }

    public function getEntriesByJournal($journalId)
    {
        return $this->model->where('journal_id', $journalId)->with('entry_lines')->get();
    }

    public function findAccountByNumber($number)
    {
        return Account::where('number', $number)->first();
    }
}
