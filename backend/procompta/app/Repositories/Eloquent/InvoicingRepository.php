<?php

namespace App\Repositories\Eloquent;

use App\Models\Invoice;
use App\Repositories\Contracts\InvoicingRepositoryInterface;

class InvoicingRepository extends EloquentRepository implements InvoicingRepositoryInterface
{
    public function __construct(Invoice $model)
    {
        parent::__construct($model);
    }

    public function getInvoicesByClient($clientId)
    {
        return $this->model->where('client_id', $clientId)->get();
    }

    public function getInvoicesByStatus($status)
    {
        return $this->model->where('status', $status)->get();
    }
}
