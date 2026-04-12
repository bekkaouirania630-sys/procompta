<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Company;

class CompanyController extends Controller
{
    public function index()
    {
        return response()->json(Company::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ice' => 'nullable|string|max:255',
            'if' => 'nullable|string|max:255',
            'rc' => 'nullable|string|max:255',
            'patente' => 'nullable|string|max:255',
            'cnss' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|string|email|max:255',
            'ville' => 'nullable|string|max:255',
            'logo' => 'nullable|string|max:255',
            'tva_regime' => 'sometimes|in:mensuel,trimestriel,exoneré',
            'compta_method' => 'sometimes|in:engagement,encaissement',
            'currency' => 'sometimes|string|size:3',
        ]);

        $company = Company::create($validated);
        return response()->json($company, 201);
    }

    public function show($id)
    {
        $company = Company::findOrFail($id);
        return response()->json($company);
    }

    public function update(Request $request, $id)
    {
        $company = Company::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'ice' => 'nullable|string|max:255',
            'if' => 'nullable|string|max:255',
            'rc' => 'nullable|string|max:255',
            'patente' => 'nullable|string|max:255',
            'cnss' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|string|email|max:255',
            'ville' => 'nullable|string|max:255',
            'logo' => 'nullable|string|max:255',
            'tva_regime' => 'sometimes|in:mensuel,trimestriel,exoneré',
            'compta_method' => 'sometimes|in:engagement,encaissement',
            'currency' => 'sometimes|string|size:3',
        ]);

        $company->update($validated);
        return response()->json($company);
    }

    public function destroy($id)
    {
        $company = Company::findOrFail($id);
        $company->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
