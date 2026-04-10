<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entry extends Model
{
    use HasFactory;

    protected $fillable = [
        'journal_id',
        'date',
        'description',
        'status',
        'numero'
    ];

    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    public function entryLines()
    {
        return $this->hasMany(EntryLine::class);
    }
}
