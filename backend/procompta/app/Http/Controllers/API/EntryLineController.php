<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EntryLine;

class EntryLineController extends Controller
{
    public function index()
    {
        return response()->json(EntryLine::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'entry_id' => 'required|exists:entries,id',
            'account_id' => 'required|exists:accounts,id',
            'debit' => 'required|numeric|min:0',
            'credit' => 'required|numeric|min:0',
        ]);
        $entryLine = EntryLine::create($validated);
        return response()->json($entryLine, 201);
    }

    public function show($id)
    {
        return response()->json(EntryLine::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $entryLine = EntryLine::findOrFail($id);
        $validated = $request->validate([
            'entry_id' => 'sometimes|required|exists:entries,id',
            'account_id' => 'sometimes|required|exists:accounts,id',
            'debit' => 'sometimes|required|numeric|min:0',
            'credit' => 'sometimes|required|numeric|min:0',
        ]);
        $entryLine->update($validated);
        return response()->json($entryLine);
    }

    public function destroy($id)
    {
        $entryLine = EntryLine::findOrFail($id);
        $entryLine->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
