<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'name', 'ice', 'if', 'rc', 'patente', 'cnss', 'address', 
        'phone', 'email', 'ville', 'logo', 'tva_regime', 
        'compta_method', 'currency'
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }

    public function journals()
    {
        return $this->hasMany(Journal::class);
    }
}
