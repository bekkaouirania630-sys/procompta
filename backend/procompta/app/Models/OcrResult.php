<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OcrResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'extracted_data',
        'is_verified'
    ];

    protected $casts = [
        'extracted_data' => 'array',
        'is_verified' => 'boolean'
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }
}
