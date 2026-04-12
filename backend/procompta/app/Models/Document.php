<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
