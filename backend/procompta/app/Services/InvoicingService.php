<?php

namespace App\Services;

use App\Repositories\Contracts\InvoicingRepositoryInterface;
use App\Models\Invoice;
use App\Models\InvoiceLine;
use Illuminate\Support\Facades\DB;

class InvoicingService
{
    protected $invoiceRepo;

    public function __construct(InvoicingRepositoryInterface $invoiceRepo)
    {
        $this->invoiceRepo = $invoiceRepo;
    }

    public function createInvoice(array $data)
    {
        return DB::transaction(function () use ($data) {
            $invoice = Invoice::create([
                'number' => $this->generateInvoiceNumber($data['type'] ?? 'facture'),
                'company_id' => auth()->user()->company_id,
                'client_id' => $data['client_id'],
                'date' => $data['date'] ?? now(),
                'due_date' => $data['due_date'] ?? null,
                'type' => $data['type'] ?? 'facture',
                'status' => 'draft',
                'discount' => $data['discount'] ?? 0,
                'tax_rate' => $data['tax_rate'] ?? 20,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                InvoiceLine::create([
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'tax_rate' => $item['tax_rate'] ?? 20,
                ]);
            }

            return $invoice->load('lines');
        });
    }

    public function convertQuoteToInvoice($quoteId)
    {
        $quote = Invoice::where('type', 'quote')->findOrFail($quoteId);

        return DB::transaction(function () use ($quote) {
            $invoice = $quote->replicate();
            $invoice->number = $this->generateInvoiceNumber('facture');
            $invoice->type = 'facture';
            $invoice->status = 'draft';
            $invoice->date = now();
            $invoice->save();

            foreach ($quote->lines as $line) {
                $newLine = $line->replicate();
                $newLine->invoice_id = $invoice->id;
                $newLine->save();
            }

            $quote->update(['status' => 'converted']);

            return $invoice->load('lines');
        });
    }

    protected function generateInvoiceNumber($type)
    {
        $prefix = ($type === 'quote') ? 'QT-' : 'FAC-';
        $count = Invoice::where('type', $type)->count() + 1;
        return $prefix . date('Y') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
