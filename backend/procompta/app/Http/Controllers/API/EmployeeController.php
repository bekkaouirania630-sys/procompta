<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        return response()->json(Employee::where('company_id', $companyId)->get());
    }

    public function store(Request $request)
    {
        $companyId = $request->user()->company_id;
        
        $validated = $request->validate([
            'matricule' => 'required|string|unique:employees,matricule',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'cin' => 'nullable|string|max:20',
            'cnss_number' => 'nullable|string|max:20',
            'job_title' => 'nullable|string|max:255',
            'base_salary' => 'required|numeric',
            'contract_type' => 'required|in:CDI,CDD,Stage,Consultant',
            'children_count' => 'nullable|integer',
            'family_status' => 'nullable|string',
            'hire_date' => 'nullable|date',
        ]);

        $employee = Employee::create(array_merge($validated, ['company_id' => $companyId]));
        
        return response()->json($employee, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $employee = Employee::where('company_id', $companyId)->findOrFail($id);
        return response()->json($employee);
    }

    public function update(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $employee = Employee::where('company_id', $companyId)->findOrFail($id);

        $validated = $request->validate([
            'matricule' => 'sometimes|required|string|unique:employees,matricule,'.$id,
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'cin' => 'nullable|string|max:20',
            'cnss_number' => 'nullable|string|max:20',
            'job_title' => 'nullable|string|max:255',
            'base_salary' => 'sometimes|required|numeric',
            'contract_type' => 'sometimes|required|in:CDI,CDD,Stage,Consultant',
            'children_count' => 'nullable|integer',
            'family_status' => 'nullable|string',
            'hire_date' => 'nullable|date',
        ]);

        $employee->update($validated);
        
        return response()->json($employee);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $employee = Employee::where('company_id', $companyId)->findOrFail($id);
        $employee->delete();
        
        return response()->json(['message' => 'Employé supprimé avec succès']);
    }
}
