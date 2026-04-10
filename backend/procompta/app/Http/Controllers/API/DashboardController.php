<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Entry;
use App\Models\EntryLine;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getAccountingStats(Request $request)
    {
        $companyId = $request->user()->company_id;

        // 1. Chiffre d'Affaires (Current Month) - Class 7
        $caMonth = DB::table('entry_lines')
            ->join('accounts', 'entry_lines.account_id', '=', 'accounts.id')
            ->join('entries', 'entry_lines.entry_id', '=', 'entries.id')
            ->where('accounts.company_id', $companyId)
            ->where('accounts.number', 'like', '7%')
            ->whereMonth('entries.date', Carbon::now()->month)
            ->whereYear('entries.date', Carbon::now()->year)
            ->sum(DB::raw('credit - debit'));

        // 2. Trésorerie - Class 51
        $treasury = DB::table('entry_lines')
            ->join('accounts', 'entry_lines.account_id', '=', 'accounts.id')
            ->where('accounts.company_id', $companyId)
            ->where('accounts.number', 'like', '51%')
            ->sum(DB::raw('debit - credit'));

        // 3. Dettes Fournisseurs - 4411
        $payables = DB::table('entry_lines')
            ->join('accounts', 'entry_lines.account_id', '=', 'accounts.id')
            ->where('accounts.company_id', $companyId)
            ->where('accounts.number', '4411')
            ->sum(DB::raw('credit - debit'));

        // 4. Créances Clients - 3421
        $receivables = DB::table('entry_lines')
            ->join('accounts', 'entry_lines.account_id', '=', 'accounts.id')
            ->where('accounts.company_id', $companyId)
            ->where('accounts.number', '3421')
            ->sum(DB::raw('debit - credit'));

        // 5. Chart Data (Last 6 months)
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            
            $encaisse = DB::table('entry_lines')
                ->join('accounts', 'entry_lines.account_id', '=', 'accounts.id')
                ->join('entries', 'entry_lines.entry_id', '=', 'entries.id')
                ->where('accounts.company_id', $companyId)
                ->where('accounts.number', 'like', '51%') // Bank/Caisse
                ->whereMonth('entries.date', $month->month)
                ->whereYear('entries.date', $month->year)
                ->sum('debit');

            $decaisse = DB::table('entry_lines')
                ->join('accounts', 'entry_lines.account_id', '=', 'accounts.id')
                ->join('entries', 'entry_lines.entry_id', '=', 'entries.id')
                ->where('accounts.company_id', $companyId)
                ->where('accounts.number', 'like', '51%')
                ->whereMonth('entries.date', $month->month)
                ->whereYear('entries.date', $month->year)
                ->sum('credit');

            $chartData[] = [
                'name' => $month->translatedFormat('M'),
                'encaisse' => (float)$encaisse,
                'decaisse' => (float)$decaisse,
            ];
        }

        return response()->json([
            'ca_month' => (float)$caMonth,
            'treasury' => (float)$treasury,
            'payables' => (float)$payables,
            'receivables' => (float)$receivables,
            'chart_data' => $chartData
        ]);
    }

    public function getAdminStats(Request $request)
    {
        $companyId = $request->user()->company_id;

        $userCount = User::where('company_id', $companyId)->count();
        $entryCount = Entry::whereHas('journal', function($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->count();

        return response()->json([
            'uptime' => '99.99%',
            'active_users' => "$userCount / 20",
            'server_load' => '12%',
            'backup_status' => 'Réussi',
            'entry_count' => $entryCount
        ]);
    }

    public function getRHStats(Request $request)
    {
        $companyId = $request->user()->company_id;

        // Current app uses User model as employee placeholder or doesn't have employees yet
        $employeeCount = User::where('company_id', $companyId)->count();

        return response()->json([
            'total_employees' => $employeeCount,
            'payroll_month' => 0.0,
            'cnss_patronale' => 0.0,
            'pending_leaves' => 0,
            'salary_distribution' => [],
            'recent_employees' => []
        ]);
    }
}
