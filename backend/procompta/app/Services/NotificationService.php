<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\EntryLine;
use App\Models\Notification;
use Carbon\Carbon;

class NotificationService
{
    /**
     * Scan for critical events and generate notifications.
     */
    public function generateAlerts($companyId)
    {
        $alerts = [];

        // 1. Check for unpaid invoices (Late payments)
        $lateInvoices = Invoice::where('company_id', $companyId)
            ->where('type', 'facture')
            ->where('status', '!=', 'paid')
            ->where('due_date', '<', now())
            ->get();

        foreach ($lateInvoices as $invoice) {
            $alerts[] = $this->notify($companyId, 'Paiement en retard', "La facture {$invoice->number} est en retard (Due le {$invoice->due_date}).");
        }

        // 2. Check for VAT proximity (If month is ending)
        if (date('d') > 20) {
            $alerts[] = $this->notify($companyId, 'Échéance TVA', "N'oubliez pas de valider votre déclaration de TVA avant la fin du mois.");
        }

        return $alerts;
    }

    protected function notify($companyId, $type, $message)
    {
        // Simple notification creation logic (assumes a Notification model exists)
        return \App\Models\Notification::create([
            'company_id' => $companyId,
            'type' => $type,
            'message' => $message,
            'is_read' => false,
        ]);
    }
}
