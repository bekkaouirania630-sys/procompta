<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\FixedAsset;
use Illuminate\Http\Request;

class FixedAssetController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        return response()->json(FixedAsset::where('company_id', $companyId)->get());
    }

    public function store(Request $request)
    {
        $companyId = $request->user()->company_id;
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'acquisition_date' => 'required|date',
            'acquisition_value' => 'required|numeric',
            'duration_years' => 'required|integer',
            'amortization_method' => 'nullable|string',
            'residual_value' => 'nullable|numeric',
        ]);

        $asset = FixedAsset::create(array_merge($validated, ['company_id' => $companyId]));
        
        return response()->json($asset, 201);
    }

    public function update(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $asset = FixedAsset::where('company_id', $companyId)->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'nullable|string|max:100',
            'acquisition_date' => 'sometimes|required|date',
            'acquisition_value' => 'sometimes|required|numeric',
            'duration_years' => 'sometimes|required|integer',
            'amortization_method' => 'nullable|string',
            'residual_value' => 'nullable|numeric',
        ]);

        $asset->update($validated);
        
        return response()->json($asset);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $asset = FixedAsset::where('company_id', $companyId)->findOrFail($id);
        $asset->delete();
        
        return response()->json(['message' => 'Immobilisation supprimée']);
    }
}
