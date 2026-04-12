<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Entry extends Model
{
    use HasFactory, BelongsToCompany, Auditable;

    protected $fillable = [
        'company_id',
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

    // snake_case alias for API consistency
    public function entry_lines()
    {
        return $this->hasMany(EntryLine::class);
    }
}
