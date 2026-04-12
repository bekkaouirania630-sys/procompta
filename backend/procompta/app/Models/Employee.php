<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Employee extends Model
{
    use HasFactory, BelongsToCompany, Auditable;

    protected $fillable = [
        'matricule',
        'first_name',
        'last_name',
        'cin',
        'cnss_number',
        'job_title',
        'base_salary',
        'contract_type',
        'children_count',
        'family_status',
        'hire_date',
        'company_id'
    ];



    public function payslips()
    {
        return $this->hasMany(Payslip::class);
    }
}
