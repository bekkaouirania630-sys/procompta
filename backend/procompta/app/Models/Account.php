<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Account extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'number',
        'label',
        'type'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function entryLines()
    {
        return $this->hasMany(EntryLine::class);
    }
}
