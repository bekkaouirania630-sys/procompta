<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tier;
use App\Models\Invoice;
use App\Models\Account;
use App\Models\Product;
use App\Models\Employee;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q');
        if (!$query || strlen($query) < 2) {
            return response()->json(['data' => []]);
        }

        $companyId = Auth::user()->company_id;
        $results = [];

        // 1. Serch Tiers
        $tiers = Tier::where('company_id', $companyId)
            ->where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('reference', 'LIKE', "%{$query}%");
            })
            ->take(5)
            ->get()
            ->map(function($t) {
                return [
                    'id' => $t->id,
                    'type' => 'tier',
                    'title' => $t->name,
                    'subtitle' => 'Client / Fournisseur (' . $t->reference . ')',
                    'url' => '/plan-tiers',
                ];
            });
        $results = array_merge($results, $tiers->toArray());

        // 2. Search Invoices
        $invoices = Invoice::where('company_id', $companyId)
            ->where('invoice_number', 'LIKE', "%{$query}%")
            ->take(5)
            ->get()
            ->map(function($i) {
                return [
                    'id' => $i->id,
                    'type' => 'invoice',
                    'title' => 'Facture ' . $i->invoice_number,
                    'subtitle' => 'Montant TTC: ' . $i->total_ttc,
                    'url' => '/facturation',
                ];
            });
        $results = array_merge($results, $invoices->toArray());

        // 3. Search Accounts
        $accounts = Account::where('company_id', $companyId)
            ->where(function($q) use ($query) {
                $q->where('number', 'LIKE', "%{$query}%")
                  ->orWhere('label', 'LIKE', "%{$query}%");
            })
            ->take(5)
            ->get()
            ->map(function($a) {
                return [
                    'id' => $a->id,
                    'type' => 'account',
                    'title' => $a->number . ' - ' . $a->label,
                    'subtitle' => 'Compte Comptable',
                    'url' => '/comptabilite',
                ];
            });
        $results = array_merge($results, $accounts->toArray());

        // 4. Search Products
        $products = Product::where('company_id', $companyId)
            ->where(function($q) use ($query) {
                $q->where('reference', 'LIKE', "%{$query}%")
                  ->orWhere('name', 'LIKE', "%{$query}%");
            })
            ->take(5)
            ->get()
            ->map(function($p) {
                return [
                    'id' => $p->id,
                    'type' => 'product',
                    'title' => $p->name,
                    'subtitle' => 'Stock (' . $p->reference . ')',
                    'url' => '/stock',
                ];
            });
        $results = array_merge($results, $products->toArray());

        // 5. Search Employees
        $employees = Employee::where('company_id', $companyId)
            ->where(function($q) use ($query) {
                $q->where('first_name', 'LIKE', "%{$query}%")
                  ->orWhere('last_name', 'LIKE', "%{$query}%");
            })
            ->take(5)
            ->get()
            ->map(function($e) {
                return [
                    'id' => $e->id,
                    'type' => 'employee',
                    'title' => $e->first_name . ' ' . $e->last_name,
                    'subtitle' => 'Employé (' . $e->registration_number . ')',
                    'url' => '/rh',
                ];
            });
        $results = array_merge($results, $employees->toArray());

        return response()->json(['data' => $results]);
    }
}
