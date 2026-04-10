<?php

namespace App\Imports;

use App\Models\Tier;
use App\Models\Account;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Auth;

class TiersImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        $companyId = Auth::user()->company_id;

        // Find account id by number if provided
        $accountId = null;
        if (!empty($row['compte_collectif'])) {
            $account = Account::where('company_id', $companyId)
                              ->where('number', $row['compte_collectif'])
                              ->first();
            $accountId = $account ? $account->id : null;
        }

        return new Tier([
            'company_id' => $companyId,
            'code'       => $row['code'],
            'name'       => $row['nom'],
            'type'       => strtolower($row['type'] ?? 'client'),
            'account_id' => $accountId,
            'ice'        => $row['ice'] ?? null,
            'if'         => $row['if'] ?? null,
            'rc'         => $row['rc'] ?? null,
            'patente'    => $row['patente'] ?? null,
            'cnss'       => $row['cnss'] ?? null,
            'address'    => $row['adresse'] ?? null,
            'ville'      => $row['ville'] ?? null,
            'phone'      => $row['telephone'] ?? null,
            'email'      => $row['email'] ?? null,
        ]);
    }
}
