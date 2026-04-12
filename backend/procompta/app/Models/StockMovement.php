<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Multitenantable;
use App\Traits\Auditable;

class StockMovement extends Model
{
    use HasFactory, Multitenantable, Auditable;

    protected $fillable = [
        'company_id',
        'product_id',
        'type',
        'quantity',
        'unit_price',
        'reference',
        'description',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
