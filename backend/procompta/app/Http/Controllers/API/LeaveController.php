<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LeaveRequest;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            LeaveRequest::with('employee')
                ->orderBy('created_at', 'desc')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'type'        => 'required|string',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'days'        => 'required|numeric|min:0.5',
            'reason'      => 'nullable|string',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $validated['status'] = 'en_attente';

        $leave = LeaveRequest::create($validated);
        return response()->json($leave->load('employee'), 201);
    }

    public function update(Request $request, $id)
    {
        $leave = LeaveRequest::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'sometimes|in:en_attente,approuve,rejete',
            'reason' => 'nullable|string',
        ]);

        $leave->update($validated);
        return response()->json($leave->load('employee'));
    }

    public function destroy($id)
    {
        LeaveRequest::findOrFail($id)->delete();
        return response()->json(['message' => 'Demande de congé supprimée']);
    }
}
