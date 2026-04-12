<?php

namespace App\Models;

use App\Traits\BelongsToCompany;

class Budget extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'account_id',
        'year',
        'jan', 'feb', 'mar', 'apr', 'may', 'jun',
        'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
        'company_id'
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }


}
