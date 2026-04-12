<?php

namespace App\Models;

use App\Traits\BelongsToCompany;

class Payslip extends Model
{
    use HasFactory, BelongsToCompany;

    protected $fillable = [
        'employee_id',
        'period_name',
        'month',
        'year',
        'brut_salary',
        'net_salary',
        'cnss_amount',
        'amo_amount',
        'ir_amount',
        'status',
        'company_id'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }


}
