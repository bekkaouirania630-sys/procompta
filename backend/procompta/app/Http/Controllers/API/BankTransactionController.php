<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BankAccount;
use App\Models\BankTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BankTransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BankTransaction::with('bankAccount');

        if ($request->has('bank_account_id')) {
            $query->where('bank_account_id', $request->bank_account_id);
        }

        $transactions = $query->orderBy('date', 'desc')->get();
        return response()->json($transactions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'date'            => 'required|date',
            'label'           => 'required|string|max:500',
            'debit'           => 'nullable|numeric|min:0',
            'credit'          => 'nullable|numeric|min:0',
            'reference'       => 'nullable|string|max:100',
            'category'        => 'nullable|string|max:100',
        ]);

        $transaction = DB::transaction(function () use ($validated) {
            $tx = BankTransaction::create($validated);
            $tx->bankAccount->recalculateBalance();
            return $tx;
        });

        return response()->json($transaction, 201);
    }

    public function update(Request $request, BankTransaction $bankTransaction): JsonResponse
    {
        $validated = $request->validate([
            'date'      => 'sometimes|date',
            'label'     => 'sometimes|string|max:500',
            'debit'     => 'nullable|numeric|min:0',
            'credit'    => 'nullable|numeric|min:0',
            'reference' => 'nullable|string|max:100',
            'category'  => 'nullable|string|max:100',
        ]);

        DB::transaction(function () use ($bankTransaction, $validated) {
            $bankTransaction->update($validated);
            $bankTransaction->bankAccount->recalculateBalance();
        });

        return response()->json($bankTransaction);
    }

    public function destroy(BankTransaction $bankTransaction): JsonResponse
    {
        $account = $bankTransaction->bankAccount;
        $bankTransaction->delete();
        $account->recalculateBalance();
        return response()->json(['message' => 'Mouvement supprimé']);
    }

    /**
     * Toggle reconciliation status for a transaction
     */
    public function reconcile(BankTransaction $bankTransaction): JsonResponse
    {
        $bankTransaction->is_reconciled = !$bankTransaction->is_reconciled;
        $bankTransaction->save();
        return response()->json($bankTransaction);
    }

    /**
     * Import bank transactions from CSV file
     * Expected columns: date, label/libelle, debit, credit
     */
    public function importCsv(Request $request): JsonResponse
    {
        $request->validate([
            'bank_account_id' => 'required|exists:bank_accounts,id',
            'file'            => 'required|file|mimes:csv,txt|max:5120',
        ]);

        $file    = $request->file('file');
        $account = BankAccount::findOrFail($request->bank_account_id);
        $handle  = fopen($file->getPathname(), 'r');
        $headers = fgetcsv($handle, 0, ';') ?: fgetcsv($handle, 0, ',');
        
        // Normalize headers
        $headers = array_map(fn($h) => strtolower(trim($h)), $headers ?? []);

        $imported = 0;
        $errors   = [];

        DB::transaction(function () use ($handle, $headers, $account, &$imported, &$errors) {
            $separator = in_array('date', $headers) ? null : ';';

            while (($row = fgetcsv($handle, 0, $separator ?? ';')) !== false) {
                if (count($row) < 3) continue;

                // Build associative row
                $data = array_combine($headers, array_slice($row, 0, count($headers)));

                $date   = $data['date']    ?? null;
                $label  = $data['libelle'] ?? $data['label'] ?? $data['description'] ?? 'Importé CSV';
                $debit  = (float) str_replace([' ', ','], ['', '.'], $data['debit']  ?? '0');
                $credit = (float) str_replace([' ', ','], ['', '.'], $data['credit'] ?? '0');

                if (!$date) continue;

                try {
                    BankTransaction::create([
                        'bank_account_id' => $account->id,
                        'date'            => date('Y-m-d', strtotime($date)),
                        'label'           => $label,
                        'debit'           => max(0, $debit),
                        'credit'          => max(0, $credit),
                    ]);
                    $imported++;
                } catch (\Throwable $e) {
                    $errors[] = $e->getMessage();
                }
            }

            $account->recalculateBalance();
        });

        fclose($handle);

        return response()->json([
            'imported' => $imported,
            'errors'   => $errors,
            'message'  => "{$imported} mouvements importés avec succès.",
        ]);
    }
}
