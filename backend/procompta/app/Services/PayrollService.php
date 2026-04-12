<?php

namespace App\Services;

use App\Models\Payslip;
use App\Models\Employee;
use Illuminate\Support\Facades\DB;

class PayrollService
{
    /**
     * Generate payslips for all active employees for a given month/year.
     */
    public function generateMonthlyPayroll($companyId, $month, $year)
    {
        $employees = Employee::where('company_id', $companyId)
            ->where('status', 'actif')
            ->get();

        $generated = [];

        foreach ($employees as $employee) {
            // Check if already exists
            $exists = Payslip::where('employee_id', $employee->id)
                ->whereMonth('created_at', $month)
                ->whereYear('created_at', $year)
                ->exists();

            if (!$exists) {
                $generated[] = $this->createPayslip($employee, $month, $year);
            }
        }

        return $generated;
    }

    protected function createPayslip($employee, $month, $year)
    {
        return DB::transaction(function () use ($employee) {
            $baseSalary = $employee->salary;
            
            // Basic Moroccan calculations (Simulation)
            $cnss = round($baseSalary * 0.0448, 2); // Part salariale
            $amo = round($baseSalary * 0.0226, 2);
            $netSalary = $baseSalary - $cnss - $amo;

            return Payslip::create([
                'employee_id' => $employee->id,
                'company_id' => $employee->company_id,
                'gross_salary' => $baseSalary,
                'net_salary' => $netSalary,
                'cnss' => $cnss,
                'amo' => $amo,
                'status' => 'brouillon',
                'period' => sprintf('%02d/%d', $month, $year),
            ]);
        });
    }
}
