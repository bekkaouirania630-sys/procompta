<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AccountingService;
use App\Models\EntryLine;
use App\Models\Account;
use Illuminate\Support\Facades\DB;

class ReportingController extends Controller
{
    protected $accountingService;

    public function __construct(AccountingService $accountingService)
    {
        $this->accountingService = $accountingService;
    }

    public function balance(Request $request)
    {
        $startDate = $request->query('start_date', date('Y-01-01'));
        $endDate = $request->query('end_date', date('Y-12-31'));

        $balance = $this->accountingService->getBalance($startDate, $endDate);
        
        return response()->json([
            'start_date' => $startDate,
            'end_date' => $endDate,
            'data' => $balance
        ]);
    }

    public function grandLivre(Request $request)
    {
        $startDate = $request->query('start_date', date('Y-01-01'));
        $endDate = $request->query('end_date', date('Y-12-31'));
        $accountNumber = $request->query('account_number');

        $query = Account::with(['entryLines' => function($q) use ($startDate, $endDate) {
            $q->whereHas('entry', function($qe) use ($startDate, $endDate) {
                $qe->whereBetween('date', [$startDate, $endDate])->orderBy('date');
            })->with('entry.journal');
        }]);

        if ($accountNumber) {
            $query->where('number', 'like', $accountNumber . '%');
        }

        $data = $query->get();

        return response()->json($data);
    }

    /**
     * Bilan (Balance Sheet) - Minimal logic for classes 1 to 5
     */
    public function bilan(Request $request)
    {
        $date = $request->query('date', date('Y-12-31'));

        $accounts = Account::whereIn(DB::raw('LEFT(number, 1)'), ['1', '2', '3', '4', '5'])
            ->with(['entryLines' => function($q) use ($date) {
                $q->whereHas('entry', function($qe) use ($date) {
                    $qe->where('date', '<=', $date);
                });
            }])->get();

        $sections = [
            'actif' => $accounts->filter(fn($a) => in_array(substr($a->number, 0, 1), ['2', '3', '5'])),
            'passif' => $accounts->filter(fn($a) => in_array(substr($a->number, 0, 1), ['1', '4'])),
        ];

        return response()->json($sections);
    }

    /**
     * Déclaration de TVA (Calcul sur les débits)
     */
    public function tvaDeclaration(Request $request)
    {
        $month = $request->query('month', date('m'));
        $year = $request->query('year', date('Y'));

        // TVA Factur\u00e9e (4455)
        $tvaFacturee = EntryLine::whereHas('account', fn($q) => $q->where('number', 'like', '4455%'))
            ->whereHas('entry', fn($q) => $q->whereMonth('date', $month)->whereYear('date', $year))
            ->sum('credit');

        // TVA R\u00e9cup\u00e9rable sur Charges (34552)
        $tvaCharges = EntryLine::whereHas('account', fn($q) => $q->where('number', 'like', '34552%'))
            ->whereHas('entry', fn($q) => $q->whereMonth('date', $month)->whereYear('date', $year))
            ->sum('debit');

        // TVA R\u00e9cup\u00e9rable sur Immo (34551)
        $tvaImmo = EntryLine::whereHas('account', fn($q) => $q->where('number', 'like', '34551%'))
            ->whereHas('entry', fn($q) => $q->whereMonth('date', $month)->whereYear('date', $year))
            ->sum('debit');

        return response()->json([
            'periode' => "$month/$year",
            'tva_facturee' => $tvaFacturee,
            'tva_recup_charges' => $tvaCharges,
            'tva_recup_immo' => $tvaImmo,
            'tva_due' => max(0, $tvaFacturee - $tvaCharges - $tvaImmo),
            'credit_tva' => max(0, ($tvaCharges + $tvaImmo) - $tvaFacturee),
        ]);
    }

    /**
     * D\u00e9claration CNSS (Simulation bas\u00e9e sur la paie)
     */
    public function cnssDeclaration(Request $request)
    {
        $month = $request->query('month', date('m'));
        $year = $request->query('year', date('Y'));

        // On r\u00e9cup\u00e8re les bulletins de paie valid\u00e9s (Payslip model assumed from earlier research)
        $payslips = \App\Models\Payslip::whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->where('status', 'validee')
            ->get();

        $totalBrut = $payslips->sum('gross_salary');
        
        return response()->json([
            'periode' => "$month/$year",
            'nombre_salaries' => $payslips->count(),
            'masse_salariale_brute' => $totalBrut,
            'part_patronale' => round($totalBrut * 0.2109, 2), // Taux CNSS patronal approx
            'part_salariale' => round($totalBrut * 0.0448, 2),  // Part salari\u00e9 CNSS
        ]);
    }
}
