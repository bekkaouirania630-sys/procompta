<?php

namespace App\Exports;

use App\Models\Journal;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class JournalsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $companyId;

    public function __construct($companyId)
    {
        $this->companyId = $companyId;
    }

    public function collection()
    {
        return Journal::where('company_id', $this->companyId)->with('account')->get();
    }

    public function headings(): array
    {
        return [
            'Code',
            'Nom',
            'Type',
            'Compte de Contrepartie'
        ];
    }

    public function map($journal): array
    {
        return [
            $journal->code,
            $journal->name,
            strtoupper($journal->type),
            $journal->account ? $journal->account->number : ''
        ];
    }
}
