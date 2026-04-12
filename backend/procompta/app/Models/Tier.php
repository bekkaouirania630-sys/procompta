<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToCompany;

class Tier extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'type',
        'account_id',
        'ice',
        'if',
        'rc',
        'patente',
        'cnss',
        'address',
        'ville',
        'phone',
        'email'
    ];



    public function account()
    {
        return $this->belongsTo(Account::class, 'account_id');
    }
}
