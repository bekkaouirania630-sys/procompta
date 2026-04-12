<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Multitenantable;
use App\Traits\Auditable;

class Product extends Model
{
    use HasFactory, Multitenantable, Auditable;

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'description',
        'category',
        'unit',
        'min_stock',
        'sku',
    ];

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function getStockAttribute()
    {
        $in = $this->movements()->where('type', 'in')->sum('quantity');
        $out = $this->movements()->where('type', 'out')->sum('quantity');
        return $in - $out;
    }
}
