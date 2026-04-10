<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Account;
use App\Imports\AccountsImport;
use Maatwebsite\Excel\Facades\Excel;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id;
        return response()->json(Account::where('company_id', $companyId)->orderBy('number')->get());
    }

    public function store(Request $request)
    {
        $companyId = $request->user()->company_id;
        
        $validated = $request->validate([
            'number' => 'required|string|max:255',
            'label' => 'required|string|max:255',
            'type' => 'required|string|in:actif,passif,charge,produit',
        ]);

        $account = Account::create(array_merge($validated, ['company_id' => $companyId]));
        return response()->json($account, 201);
    }

    public function show($id)
    {
        $account = Account::findOrFail($id);
        $this->authorizeAccess($account);
        return response()->json($account);
    }

    public function update(Request $request, $id)
    {
        $account = Account::findOrFail($id);
        $this->authorizeAccess($account);

        $validated = $request->validate([
            'number' => 'sometimes|required|string|max:255',
            'label' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|in:actif,passif,charge,produit',
        ]);

        $account->update($validated);
        return response()->json($account);
    }

    public function destroy($id)
    {
        $account = Account::findOrFail($id);
        $this->authorizeAccess($account);

        // Bloquer la suppression si des écritures existent
        if ($account->entryLines()->exists()) {
            return response()->json([
                'error' => 'Impossible de supprimer un compte utilisé dans des écritures comptables.'
            ], 422);
        }

        $account->delete();
        return response()->json(['message' => 'Compte supprimé avec succès']);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        $companyId = $request->user()->company_id;
        Excel::import(new AccountsImport($companyId), $request->file('file'));

        return response()->json(['message' => 'Importation du plan comptable réussie.']);
    }

    private function authorizeAccess(Account $account)
    {
        if ($account->company_id !== auth()->user()->company_id) {
            abort(403, 'Accès non autorisé.');
        }
    }
}
