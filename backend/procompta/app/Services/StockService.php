<?php

namespace App\Services;

use App\Repositories\Contracts\StockRepositoryInterface;

class StockService
{
    protected $stockRepo;

    public function __construct(StockRepositoryInterface $stockRepo)
    {
        $this->stockRepo = $stockRepo;
    }

    public function recordStockEntry($productId, $quantity, $unitPrice = null, $reference = null, $description = null)
    {
        return $this->stockRepo->addMovement($productId, [
            'type' => 'in',
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'reference' => $reference,
            'description' => $description,
        ]);
    }

    public function recordStockExit($productId, $quantity, $reference = null, $description = null)
    {
        $currentStock = $this->stockRepo->getProductStock($productId);
        
        if ($currentStock < $quantity) {
            throw new \Exception("Stock insuffisant pour ce produit.");
        }

        return $this->stockRepo->addMovement($productId, [
            'type' => 'out',
            'quantity' => $quantity,
            'reference' => $reference,
            'description' => $description,
        ]);
    }

    public function getInventoryValuation()
    {
        $products = $this->stockRepo->all();
        $valuation = 0;

        foreach ($products as $product) {
            // Valuation based on last unit price (simple average for now, can be improved to FIFO)
            $lastEntry = $product->movements()->where('type', 'in')->latest()->first();
            $price = $lastEntry ? $lastEntry->unit_price : 0;
            $valuation += $product->stock * $price;
        }

        return $valuation;
    }
}
