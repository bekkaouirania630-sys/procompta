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
        })->with(['entry_lines.account', 'journal'])->orderBy('date', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'               => 'required|date',
            'description'        => 'nullable|string',
            'journal_id'         => 'required|exists:journals,id',
            'status'             => 'nullable|in:brouillon,validee',
            'lines'              => 'required|array|min:2',
            'lines.*.account_id' => 'required|exists:accounts,id',
            'lines.*.label'      => 'nullable|string',
            'lines.*.debit'      => 'required|numeric|min:0',
            'lines.*.credit'     => 'required|numeric|min:0',
        ]);

        $totalDebit  = collect($validated['lines'])->sum('debit');
        $totalCredit = collect($validated['lines'])->sum('credit');

        if (abs($totalDebit - $totalCredit) > 0.001) {
            return response()->json([
                'error'        => 'L\'écriture n\'est pas équilibrée.',
                'total_debit'  => $totalDebit,
                'total_credit' => $totalCredit,
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Auto-generate piece number: JOURNAL-YYYY-NNN
            $journal = \App\Models\Journal::findOrFail($validated['journal_id']);
            $year    = date('Y', strtotime($validated['date']));
            $count   = Entry::whereHas('journal', fn($q) => $q->where('code', $journal->code))
                            ->whereYear('date', $year)->count() + 1;
            $numero  = $journal->code . '-' . $year . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);

            $entry = Entry::create([
                'date'        => $validated['date'],
                'description' => $validated['description'] ?? '',
                'journal_id'  => $validated['journal_id'],
                'status'      => $validated['status'] ?? 'brouillon',
                'numero'      => $numero,
            ]);

            foreach ($validated['lines'] as $lineData) {
                EntryLine::create([
                    'entry_id'   => $entry->id,
                    'account_id' => $lineData['account_id'],
                    'label'      => $lineData['label'] ?? null,
                    'debit'      => $lineData['debit'],
                    'credit'     => $lineData['credit'],
                ]);
            }

            DB::commit();
            return response()->json($entry->load(['entry_lines.account', 'journal']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erreur: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        return response()->json(Entry::with(['entry_lines.account', 'journal'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $entry = Entry::findOrFail($id);

        $validated = $request->validate([
            'date'        => 'sometimes|required|date',
            'description' => 'nullable|string',
            'journal_id'  => 'sometimes|required|exists:journals,id',
            'status'      => 'sometimes|in:brouillon,validee',
        ]);

        $entry->update($validated);
        return response()->json($entry->load(['entry_lines.account', 'journal']));
    }

    public function updateStatus(Request $request, $id)
    {
        $entry = Entry::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:brouillon,validee',
        ]);
        $entry->update(['status' => $validated['status']]);
        return response()->json($entry->load(['entry_lines.account', 'journal']));
    }

    public function destroy($id)
    {
        $entry = Entry::findOrFail($id);
        $entry->entry_lines()->delete();
        $entry->delete();
        return response()->json(['message' => 'Supprimé avec succès']);
    }
}
