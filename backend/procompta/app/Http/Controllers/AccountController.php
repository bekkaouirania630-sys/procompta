<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function index()
    {
        $user = auth('api')->user();
        if(!$user) return response()->json(['error' => 'Unauthorized'], 401);

        $accounts = Account::where('company_id', $user->company_id)->get();
        return response()->json($accounts);
    }

    public function store(Request $request)
    {
        $user = auth('api')->user();
        $validated = $request->validate([
            'code' => 'required|string|max:20',
            'name' => 'required|string',
            'class' => 'nullable|integer|between:1,8',
            'is_active' => 'boolean'
        ]);

        $validated['company_id'] = $user->company_id;

        $account = Account::create($validated);
        return response()->json($account, 201);
    }
}
