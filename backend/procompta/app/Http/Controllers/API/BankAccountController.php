<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\BankTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BankAccountController extends Controller
{
    public function index(): JsonResponse
    {
        $accounts = BankAccount::with('transactions')->get();
        return response()->json($accounts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'      => 'nullable|exists:companies,id',
            'name'            => 'required|string|max:255',
            'bank_name'       => 'nullable|string|max:255',
            'account_number'  => 'nullable|string|max:50',
            'rib'             => 'nullable|string|max:30',
            'opening_balance' => 'nullable|numeric',
            'currency'        => 'nullable|string|size:3',
            'type'            => 'required|in:banque,caisse',
        ]);

        $validated['current_balance'] = $validated['opening_balance'] ?? 0;
        $account = BankAccount::create($validated);
        return response()->json($account, 201);
    }

    public function show(BankAccount $bankAccount): JsonResponse
    {
        return response()->json($bankAccount->load('transactions'));
    }

    public function update(Request $request, BankAccount $bankAccount): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'bank_name'       => 'nullable|string|max:255',
            'account_number'  => 'nullable|string|max:50',
            'rib'             => 'nullable|string|max:30',
            'opening_balance' => 'nullable|numeric',
            'currency'        => 'nullable|string|size:3',
            'type'            => 'sometimes|in:banque,caisse',
            'is_active'       => 'sometimes|boolean',
        ]);

        $bankAccount->update($validated);
        return response()->json($bankAccount);
    }

    public function destroy(BankAccount $bankAccount): JsonResponse
    {
        $bankAccount->delete();
        return response()->json(['message' => 'Compte supprimé']);
    }

    /**
     * Get all transactions for a specific account
     */
    public function transactions(BankAccount $bankAccount): JsonResponse
    {
        $transactions = $bankAccount->transactions()
            ->orderBy('date', 'desc')
            ->get();
        return response()->json($transactions);
    }

    /**
     * Get treasury summary (bank balance, cash balance, monthly flows)
     */
    public function summary(): JsonResponse
    {
        $accounts = BankAccount::where('is_active', true)->get();
        $totalBanque = $accounts->where('type', 'banque')->sum('current_balance');
        $totalCaisse = $accounts->where('type', 'caisse')->sum('current_balance');

        $month = now()->month;
        $year  = now()->year;

        $encaissements = BankTransaction::whereMonth('date', $month)
            ->whereYear('date', $year)
            ->sum('credit');
        $decaissements = BankTransaction::whereMonth('date', $month)
            ->whereYear('date', $year)
            ->sum('debit');

        return response()->json([
            'total_banque'    => $totalBanque,
            'total_caisse'    => $totalCaisse,
            'encaissements'   => $encaissements,
            'decaissements'   => $decaissements,
            'solde_net'       => $encaissements - $decaissements,
            'accounts'        => $accounts,
        ]);
    }
}
