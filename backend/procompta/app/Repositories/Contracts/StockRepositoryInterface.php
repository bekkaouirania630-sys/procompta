<?php

namespace App\Repositories\Contracts;

interface StockRepositoryInterface extends BaseRepositoryInterface
{
    public function getProductStock($productId);
    public function addMovement($productId, array $data);
}
