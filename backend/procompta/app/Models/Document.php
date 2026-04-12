<?php

namespace App\Models;

use App\Traits\BelongsToCompany;

class Document extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'file_path',
        'type',
        'status'
    ];

    public function ocrResult()
    {
        return $this->hasOne(OcrResult::class);
    }
}
