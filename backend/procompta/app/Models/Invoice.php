<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

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
