<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Invoice extends Model
{
    use HasFactory, BelongsToCompany, Auditable;

    protected $fillable = [
        'company_id',
        'tier_id',
        'numero',
        'type',
        'date',
        'echeance',
        'ht',
        'tva',
        'ttc',
        'statut'
    ];

    public function tier()
    {
        return $this->belongsTo(Tier::class);
    }

    public function invoiceLines()
    {
        return $this->hasMany(InvoiceLine::class);
    }
}
