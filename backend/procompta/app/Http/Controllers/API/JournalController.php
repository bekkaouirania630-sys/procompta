<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Journal;
use App\Exports\JournalsExport;
use App\Imports\JournalsImport;
use Maatwebsite\Excel\Facades\Excel;

class JournalController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        return response()->json(Journal::where('company_id', $companyId)->with('company')->get());
    }

    public function store(Request $request)
    {
        $companyId = $request->user()->company_id;
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'type' => 'required|in:achat,vente,banque,caisse,od',
            'account_id' => 'nullable|exists:accounts,id',
        ]);

        $journal = Journal::create(array_merge($validated, ['company_id' => $companyId]));
        
        return response()->json($journal, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $journal = Journal::where('company_id', $companyId)->findOrFail($id);
        return response()->json($journal);
    }

    public function update(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $journal = Journal::where('company_id', $companyId)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50',
            'type' => 'sometimes|required|in:achat,vente,banque,caisse,od',
            'account_id' => 'nullable|exists:accounts,id',
        ]);

        $journal->update($validated);
        
        return response()->json($journal);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $journal = Journal::where('company_id', $companyId)->findOrFail($id);
        $journal->delete();
        
        return response()->json(['message' => 'Journal supprimé avec succès']);
    }

    public function export(Request $request) 
    {
        $companyId = $request->user()->company_id;
        return Excel::download(new JournalsExport($companyId), 'journaux.xlsx');
    }

    public function import(Request $request) 
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        Excel::import(new JournalsImport, $request->file('file'));

        return response()->json(['message' => 'Import réussi']);
    }
}
