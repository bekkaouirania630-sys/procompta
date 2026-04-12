<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'description',
        'quantity',
        'price',
        'tva_rate',
        'discount_rate'
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}
