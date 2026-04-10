<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Entry;
use App\Models\EntryLine;
use Illuminate\Support\Facades\DB;

class EntryController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        return response()->json(Entry::whereHas('journal', function($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->with(['entryLines.account', 'journal'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'description' => 'nullable|string',
            'journal_id' => 'required|exists:journals,id',
            'lines' => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:accounts,id',
            'lines.*.debit' => 'required|numeric|min:0',
            'lines.*.credit' => 'required|numeric|min:0',
        ]);

        $totalDebit = collect($validated['lines'])->sum('debit');
        $totalCredit = collect($validated['lines'])->sum('credit');

        // Check if balanced
        if (abs($totalDebit - $totalCredit) > 0.001) {
            return response()->json([
                'error' => 'L\'écriture n\'est pas équilibrée.',
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit
            ], 422);
        }

        DB::beginTransaction();
        try {
            $entry = Entry::create([
                'date' => $validated['date'],
                'description' => $validated['description'] ?? '',
                'journal_id' => $validated['journal_id'],
            ]);

            foreach ($validated['lines'] as $lineData) {
                EntryLine::create([
                    'entry_id' => $entry->id,
                    'account_id' => $lineData['account_id'],
                    'debit' => $lineData['debit'],
                    'credit' => $lineData['credit'],
                ]);
            }

            DB::commit();
            return response()->json($entry->load('entryLines'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erreur lors de la création de l\'écriture: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        return response()->json(Entry::with('entryLines')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $entry = Entry::findOrFail($id);
        
        $validated = $request->validate([
            'date' => 'sometimes|required|date',
            'description' => 'nullable|string',
            'journal_id' => 'sometimes|required|exists:journals,id',
        ]);

        $entry->update($validated);
        return response()->json($entry);
    }

    public function destroy($id)
    {
        $entry = Entry::findOrFail($id);
        $entry->entryLines()->delete();
        $entry->delete();
        
        return response()->json(['message' => 'Deleted successfully']);
    }
}
