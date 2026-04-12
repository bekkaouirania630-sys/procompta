<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Services\StockService;

class ProductController extends Controller
{
    protected $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    public function index()
    {
        $products = Product::all()->map(function ($product) {
            $product->stock = $product->stock; // triggers accessor
            return $product;
        });
        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:products,code',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'unit' => 'nullable|string',
            'min_stock' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string',
        ]);

        $validated['company_id'] = $request->user()->company_id;
        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    public function show($id)
    {
        $product = Product::with('movements')->findOrFail($id);
        $product->stock = $product->stock;
        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $validated = $request->validate([
            'code' => 'sometimes|string|unique:products,code,' . $id,
            'name' => 'sometimes|string',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'unit' => 'nullable|string',
            'min_stock' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string',
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    public function destroy($id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Produit supprimé']);
    }
}
