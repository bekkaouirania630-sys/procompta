<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Entry;
use App\Services\AccountingService;

class EntryController extends Controller
{
    protected $accountingService;

    public function __construct(AccountingService $accountingService)
    {
        $this->accountingService = $accountingService;
    }

    public function index(Request $request)
    {
        // Multitenantable trait handles the company isolation automatically via Global Scope
        return response()->json(
            Entry::with(['entry_lines.account', 'journal'])
                ->orderBy('date', 'desc')
                ->get()
        );
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

        try {
            $entry = $this->accountingService->createEntry($validated);
            return response()->json($entry, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
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
