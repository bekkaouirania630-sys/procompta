<?php

namespace App\Repositories\Eloquent;

use App\Models\Product;
use App\Models\StockMovement;
use App\Repositories\Contracts\StockRepositoryInterface;

class StockRepository extends EloquentRepository implements StockRepositoryInterface
{
    public function __construct(Product $model)
    {
        parent::__construct($model);
    }

    public function getProductStock($productId)
    {
        $product = $this->find($productId);
        return $product->stock;
    }

    public function addMovement($productId, array $data)
    {
        $product = $this->find($productId);
        return $product->movements()->create($data);
    }
}
