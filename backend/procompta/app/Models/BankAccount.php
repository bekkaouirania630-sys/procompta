<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\BelongsToCompany;

class BankAccount extends Model
{
    use BelongsToCompany;
    protected $fillable = [
        'company_id', 'name', 'bank_name', 'account_number',
        'rib', 'opening_balance', 'current_balance', 'currency', 'type', 'is_active'
    ];

    protected $casts = [
        'opening_balance' => 'float',
        'current_balance' => 'float',
        'is_active' => 'boolean',
    ];



    public function transactions(): HasMany
    {
        return $this->hasMany(BankTransaction::class);
    }

    /**
     * Recalculate current balance from opening_balance + transactions
     */
    public function recalculateBalance(): void
    {
        $totalCredits = $this->transactions()->sum('credit');
        $totalDebits  = $this->transactions()->sum('debit');
        $this->current_balance = $this->opening_balance + $totalCredits - $totalDebits;
        $this->save();
    }
}
