<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Journal extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'code'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function entries()
    {
        return $this->hasMany(Entry::class);
    }
}
