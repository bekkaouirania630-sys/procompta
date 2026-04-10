<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Account;

class AccountController extends Controller
{
    public function index()
    {
        return response()->json(Account::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|string|max:255',
            'label' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'company_id' => 'required|exists:companies,id',
        ]);
        $account = Account::create($validated);
        return response()->json($account, 201);
    }

    public function show($id)
    {
        return response()->json(Account::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $account = Account::findOrFail($id);
        $validated = $request->validate([
            'number' => 'sometimes|required|string|max:255',
            'label' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:50',
            'company_id' => 'sometimes|required|exists:companies,id',
        ]);
        $account->update($validated);
        return response()->json($account);
    }

    public function destroy($id)
    {
        $account = Account::findOrFail($id);
        $account->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
