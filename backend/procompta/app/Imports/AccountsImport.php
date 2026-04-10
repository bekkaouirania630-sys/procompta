<?php

namespace App\Imports;

use App\Models\Account;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Auth;

class AccountsImport implements ToModel, WithHeadingRow
{
    private $companyId;

    public function __construct($companyId)
    {
        $this->companyId = $companyId;
    }

    public function model(array $row)
    {
        // Supporter plusieurs noms de colonnes possibles (Numéro, Numero, number, etc.)
        $number = $row['numero'] ?? $row['numéro'] ?? $row['number'] ?? $row['code'] ?? null;
        $label = $row['intitule'] ?? $row['intitulé'] ?? $row['label'] ?? $row['name'] ?? null;
        
        if (!$number || !$label) {
            return null;
        }

        // Détection automatique du type si non fourni
        $type = $row['type'] ?? $this->detectType($number);

        return Account::updateOrCreate(
            [
                'company_id' => $this->companyId,
                'number' => (string)$number,
            ],
            [
                'label' => $label,
                'type' => $type,
            ]
        );
    }

    private function detectType($number)
    {
        $first = substr($number, 0, 1);
        switch ($first) {
            case '1': return 'passif';
            case '2': return 'actif';
            case '3': return 'actif';
            case '4': return 'passif';
            case '5': return 'actif'; // Trésorerie Débitrice (5141) ou Créditrice (5541) - On met actif par défaut
            case '6': return 'charge';
            case '7': return 'produit';
            default: return 'actif';
        }
    }
}
