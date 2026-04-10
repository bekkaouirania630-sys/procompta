<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tier;
use Illuminate\Http\Request;
use App\Exports\TiersExport;
use App\Imports\TiersImport;
use Maatwebsite\Excel\Facades\Excel;

class TierController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        $query = Tier::where('company_id', $companyId);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        return response()->json($query->with('account')->get());
    }

    public function store(Request $request)
    {
        $companyId = $request->user()->company_id;
        
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:tiers,code',
            'name' => 'required|string|max:255',
            'type' => 'required|in:client,fournisseur,salarie,autre',
            'account_id' => 'nullable|exists:accounts,id',
            'ice' => 'nullable|string|max:50',
            'if' => 'nullable|string|max:50',
            'rc' => 'nullable|string|max:50',
            'patente' => 'nullable|string|max:50',
            'cnss' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'ville' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        $tier = Tier::create(array_merge($validated, ['company_id' => $companyId]));
        
        return response()->json($tier->load('account'), 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $tier = Tier::where('company_id', $companyId)->findOrFail($id);
        return response()->json($tier->load('account'));
    }

    public function update(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $tier = Tier::where('company_id', $companyId)->findOrFail($id);
        
        $validated = $request->validate([
            'code' => 'sometimes|required|string|max:20|unique:tiers,code,'.$id,
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:client,fournisseur,salarie,autre',
            'account_id' => 'nullable|exists:accounts,id',
            'ice' => 'nullable|string|max:50',
            'if' => 'nullable|string|max:50',
            'rc' => 'nullable|string|max:50',
            'patente' => 'nullable|string|max:50',
            'cnss' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'ville' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        $tier->update($validated);
        
        return response()->json($tier->load('account'));
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $tier = Tier::where('company_id', $companyId)->findOrFail($id);
        $tier->delete();
        
        return response()->json(['message' => 'Tier supprimé avec succès']);
    }

    public function export(Request $request) 
    {
        $companyId = $request->user()->company_id;
        return Excel::download(new TiersExport($companyId), 'tiers.xlsx');
    }

    public function import(Request $request) 
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        Excel::import(new TiersImport, $request->file('file'));

        return response()->json(['message' => 'Import réussi']);
    }
}
