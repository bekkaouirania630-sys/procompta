<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'numero',
        'type',
        'date',
        'echeance',
        'ht',
        'tva',
        'ttc',
        'statut'
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function invoiceLines()
    {
        return $this->hasMany(InvoiceLine::class);
    }
}
