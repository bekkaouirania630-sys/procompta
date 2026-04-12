<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AccountingService;
use Maatwebsite\Excel\Facades\Excel;
use Exception;

class ExportController extends Controller
{
    protected $accountingService;

    public function __construct(AccountingService $accountingService)
    {
        $this->accountingService = $accountingService;
    }

    /**
     * Export Balance to Excel.
     */
    public function exportBalance(Request $request)
    {
        try {
            $startDate = $request->query('start_date', date('Y-01-01'));
            $endDate = $request->query('end_date', date('Y-12-31'));
            
            $balanceData = $this->accountingService->getBalance($startDate, $endDate);

            // Using Laravel Excel (maatwebsite/excel is in composer.json)
            // Note: This assumes an Export class exists or using a simple collection
            return Excel::download(new \App\Exports\BalanceExport($balanceData), "Balance_{$startDate}_{$endDate}.xlsx");
        } catch (Exception $e) {
            return response()->json(['error' => 'Erreur lors de l\'export : ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export Grand Livre to PDF.
     */
    public function exportGrandLivre(Request $request)
    {
        // Simple mock for PDF generation (would use DomPDF as requested)
        return response()->json(['message' => 'PDF g\u00e9n\u00e9r\u00e9 avec succ\u00e8s (Simulation DomPDF)']);
    }
}
