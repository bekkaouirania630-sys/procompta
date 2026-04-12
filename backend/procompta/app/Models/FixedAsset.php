<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToCompany;

class FixedAsset extends Model
{
    use HasFactory, BelongsToCompany;

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


}
