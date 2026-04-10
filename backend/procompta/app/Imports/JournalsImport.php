<?php

namespace App\Imports;

use App\Models\Journal;
use App\Models\Account;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Auth;

class JournalsImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        $companyId = Auth::user()->company_id;

        $accountId = null;
        if (!empty($row['compte_de_contrepartie'])) {
            $account = Account::where('company_id', $companyId)
                              ->where('number', $row['compte_de_contrepartie'])
                              ->first();
            $accountId = $account ? $account->id : null;
        }

        return new Journal([
            'company_id' => $companyId,
            'code'       => $row['code'],
            'name'       => $row['nom'],
            'type'       => strtolower($row['type'] ?? 'od'),
            'account_id' => $accountId,
        ]);
    }
}
