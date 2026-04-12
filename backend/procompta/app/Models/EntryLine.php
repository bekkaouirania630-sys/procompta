<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EntryLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'entry_id',
        'account_id',
        'bank_transaction_id',
        'label',
        'debit',
        'credit',
        'is_reconciled'
    ];

    protected $casts = [
        'is_reconciled' => 'boolean',
    ];

    public function bankTransaction()
    {
        return $this->belongsTo(BankTransaction::class);
    }

    public function entry()
    {
        return $this->belongsTo(Entry::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}
