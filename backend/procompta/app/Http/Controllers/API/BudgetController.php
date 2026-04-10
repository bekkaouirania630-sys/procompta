<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        $year = $request->query('year', date('Y'));
        
        return response()->json(Budget::where('company_id', $companyId)
            ->where('year', $year)
            ->with('account')
            ->get());
    }

    public function store(Request $request)
    {
        $companyId = $request->user()->company_id;
        
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'year' => 'required|integer',
            'jan' => 'nullable|numeric',
            'feb' => 'nullable|numeric',
            'mar' => 'nullable|numeric',
            'apr' => 'nullable|numeric',
            'may' => 'nullable|numeric',
            'jun' => 'nullable|numeric',
            'jul' => 'nullable|numeric',
            'aug' => 'nullable|numeric',
            'sep' => 'nullable|numeric',
            'oct' => 'nullable|numeric',
            'nov' => 'nullable|numeric',
            'dec' => 'nullable|numeric',
        ]);

        $budget = Budget::updateOrCreate(
            [
                'account_id' => $validated['account_id'],
                'year' => $validated['year'],
                'company_id' => $companyId
            ],
            $validated
        );
        
        return response()->json($budget, 200);
    }
}
