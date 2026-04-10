<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;

class InvoiceController extends Controller
{
    public function index()
    {
        return response()->json(Invoice::with('invoiceLines')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'date' => 'required|date',
            'total' => 'required|numeric|min:0',
        ]);
        $invoice = Invoice::create($validated);
        return response()->json($invoice, 201);
    }

    public function show($id)
    {
        return response()->json(Invoice::with('invoiceLines')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        $validated = $request->validate([
            'client_id' => 'sometimes|required|exists:clients,id',
            'date' => 'sometimes|required|date',
            'total' => 'sometimes|required|numeric|min:0',
        ]);
        $invoice->update($validated);
        return response()->json($invoice);
    }

    public function destroy($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->invoiceLines()->delete();
        $invoice->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
