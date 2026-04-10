<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\InvoiceLine;

class InvoiceLineController extends Controller
{
    public function index()
    {
        return response()->json(InvoiceLine::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'description' => 'required|string',
            'quantity' => 'required|numeric|min:1',
            'price' => 'required|numeric|min:0',
        ]);
        $invoiceLine = InvoiceLine::create($validated);
        return response()->json($invoiceLine, 201);
    }

    public function show($id)
    {
        return response()->json(InvoiceLine::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $invoiceLine = InvoiceLine::findOrFail($id);
        $validated = $request->validate([
            'invoice_id' => 'sometimes|required|exists:invoices,id',
            'description' => 'sometimes|required|string',
            'quantity' => 'sometimes|required|numeric|min:1',
            'price' => 'sometimes|required|numeric|min:0',
        ]);
        $invoiceLine->update($validated);
        return response()->json($invoiceLine);
    }

    public function destroy($id)
    {
        $invoiceLine = InvoiceLine::findOrFail($id);
        $invoiceLine->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
