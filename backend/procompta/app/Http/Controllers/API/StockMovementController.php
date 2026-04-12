<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StockMovement;
use App\Services\StockService;

class StockMovementController extends Controller
{
    protected $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    public function index(Request $request)
    {
        $query = StockMovement::with('product')->latest();
        
        if ($request->has('product_id')) {
            $query->where('product_id', $request->query('product_id'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id'  => 'required|exists:products,id',
            'type'        => 'required|in:in,out',
            'quantity'    => 'required|numeric|min:0.01',
            'unit_price'  => 'nullable|numeric|min:0',
            'reference'   => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        try {
            if ($validated['type'] === 'in') {
                $movement = $this->stockService->recordStockEntry(
                    $validated['product_id'],
                    $validated['quantity'],
                    $validated['unit_price'] ?? null,
                    $validated['reference'] ?? null,
                    $validated['description'] ?? null
                );
            } else {
                $movement = $this->stockService->recordStockExit(
                    $validated['product_id'],
                    $validated['quantity'],
                    $validated['reference'] ?? null,
                    $validated['description'] ?? null
                );
            }

            return response()->json($movement, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
