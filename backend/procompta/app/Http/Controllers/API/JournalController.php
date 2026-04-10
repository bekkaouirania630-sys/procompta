<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Journal;

class JournalController extends Controller
{
    public function index()
    {
        return response()->json(Journal::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'company_id' => 'required|exists:companies,id',
        ]);
        $journal = Journal::create($validated);
        return response()->json($journal, 201);
    }

    public function show($id)
    {
        return response()->json(Journal::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $journal = Journal::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => 'sometimes|required|string|max:50',
            'company_id' => 'sometimes|required|exists:companies,id',
        ]);
        $journal->update($validated);
        return response()->json($journal);
    }

    public function destroy($id)
    {
        $journal = Journal::findOrFail($id);
        $journal->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
