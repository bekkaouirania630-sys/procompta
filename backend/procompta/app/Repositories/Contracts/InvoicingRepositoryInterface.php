<?php

namespace App\Repositories\Contracts;

interface InvoicingRepositoryInterface extends BaseRepositoryInterface
{
    public function getInvoicesByClient($clientId);
    public function getInvoicesByStatus($status);
}
