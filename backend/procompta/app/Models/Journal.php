<?php

namespace App\Models;

use App\Traits\BelongsToCompany;

class Journal extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'name',
        'code',
        'type',
        'account_id'
    ];



    public function entries()
    {
        return $this->hasMany(Entry::class);
    }
}
