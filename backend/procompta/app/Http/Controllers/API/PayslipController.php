<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Payslip;
use Illuminate\Http\Request;

class PayslipController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        return response()->json(Payslip::where('company_id', $companyId)->with('employee')->get());
    }

    public function generate(Request $request)
    {
        $companyId = $request->user()->company_id;
        $month = $request->month; // 1-12
        $year = $request->year;
        
        $employees = Employee::where('company_id', $companyId)->get();
        $generatedCount = 0;

        foreach ($employees as $employee) {
            // Empêcher les doublons pour le même employé/mois/année
            $exists = Payslip::where('employee_id', $employee->id)
                ->where('month', $month)
                ->where('year', $year)
                ->exists();
                
            if ($exists) continue;

            $data = $this->calculatePayroll($employee);
            
            Payslip::create([
                'employee_id' => $employee->id,
                'period_name' => $this->getMonthName($month) . " " . $year,
                'month' => $month,
                'year' => $year,
                'brut_salary' => $data['brut'],
                'net_salary' => $data['net'],
                'cnss_amount' => $data['cnss'],
                'amo_amount' => $data['amo'],
                'ir_amount' => $data['ir'],
                'status' => 'brouillon',
                'company_id' => $companyId
            ]);
            
            $generatedCount++;
        }

        return response()->json(['message' => "$generatedCount bulletins générés avec succès"]);
    }

    private function calculatePayroll($employee)
    {
        $brut = $employee->base_salary;
        
        // Taux Marocains Standards
        $cnss = min($brut, 6000) * 0.0448;
        $amo = $brut * 0.0226;
        
        // IR Barème 2024 (Annuel)
        $revImp = ($brut - $cnss - $amo) * 12 - 3600;
        $irAnnuel = 0;

        if ($revImp > 180000) {
            $irAnnuel = 44000 + ($revImp - 180000) * 0.38;
        } else if ($revImp > 80000) {
            $irAnnuel = 10000 + ($revImp - 80000) * 0.34;
        } else if ($revImp > 60000) {
            $irAnnuel = 4000 + ($revImp - 60000) * 0.30;
        } else if ($revImp > 50000) {
            $irAnnuel = 2000 + ($revImp - 50000) * 0.20;
        } else if ($revImp > 30000) {
            $irAnnuel = ($revImp - 30000) * 0.10;
        }

        // Déductions famille (30 MAD par enfant p/m -> 360 annuel)
        $dedEnf = min($employee->children_count * 360, 1080);
        $ir = max(0, ($irAnnuel - $dedEnf) / 12);
        
        $net = $brut - $cnss - $amo - $ir;

        return [
            'brut' => $brut,
            'cnss' => round($cnss, 2),
            'amo' => round($amo, 2),
            'ir' => round($ir, 2),
            'net' => round($net, 2)
        ];
    }

    private function getMonthName($month)
    {
        $months = [
            1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril', 5 => 'Mai', 6 => 'Juin',
            7 => 'Juillet', 8 => 'Août', 9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
        ];
        return $months[$month] ?? 'Inconnu';
    }

    public function updateStatus(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $payslip = Payslip::where('company_id', $companyId)->findOrFail($id);
        
        $payslip->update(['status' => $request->status]);
        
        // TODO: Générer écritures comptables automatique si status = validé
        
        return response()->json($payslip);
    }
}
