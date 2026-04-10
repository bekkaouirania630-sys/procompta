<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FixedAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'acquisition_date',
        'acquisition_value',
        'duration_years',
        'amortization_method',
        'residual_value',
        'company_id'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
