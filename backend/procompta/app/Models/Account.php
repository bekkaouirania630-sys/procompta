<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasFactory;

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
