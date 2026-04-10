<?php

namespace App\Exports;

use App\Models\Tier;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TiersExport implements FromCollection, WithHeadings, WithMapping
{
    protected $companyId;

    public function __construct($companyId)
    {
        $companyId = $companyId;
    }

    public function collection()
    {
        return Tier::where('company_id', $this->companyId)->with('account')->get();
    }

    public function headings(): array
    {
        return [
            'Code',
            'Nom',
            'Type',
            'Compte Collectif',
            'ICE',
            'IF',
            'RC',
            'Patente',
            'CNSS',
            'Adresse',
            'Ville',
            'Téléphone',
            'Email'
        ];
    }

    public function map($tier): array
    {
        return [
            $tier->code,
            $tier->name,
            ucfirst($tier->type),
            $tier->account ? $tier->account->number : '',
            $tier->ice,
            $tier->if,
            $tier->rc,
            $tier->patente,
            $tier->cnss,
            $tier->address,
            $tier->ville,
            $tier->phone,
            $tier->email
        ];
    }
}
