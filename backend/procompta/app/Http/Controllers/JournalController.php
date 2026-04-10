<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    public function index()
    {
        $user = auth('api')->user();
        if(!$user) return response()->json(['error' => 'Unauthorized'], 401);

        $journals = Journal::where('company_id', $user->company_id)->get();
        return response()->json($journals);
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();
        $validated = $request->validate([
            'code' => 'required|string|max:10',
            'name' => 'required|string',
            'type' => 'required|string|in:achat,vente,tresorerie,general',
        ]);

        $validated['company_id'] = $user->company_id;

        $journal = Journal::create($validated);
        return response()->json($journal, 201);
    }
}
