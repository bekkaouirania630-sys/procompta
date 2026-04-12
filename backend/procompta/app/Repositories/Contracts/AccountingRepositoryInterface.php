<?php

namespace App\Repositories\Contracts;

interface AccountingRepositoryInterface extends BaseRepositoryInterface
{
    public function getEntriesByJournal($journalId);
    public function findAccountByNumber($number);
}
