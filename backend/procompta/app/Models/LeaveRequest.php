<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Multitenantable;
use App\Traits\Auditable;

class LeaveRequest extends Model
{
    use HasFactory, Multitenantable, Auditable;

    protected $fillable = [
        'company_id',
        'employee_id',
        'type',
        'start_date',
        'end_date',
        'days',
        'status',
        'reason',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
