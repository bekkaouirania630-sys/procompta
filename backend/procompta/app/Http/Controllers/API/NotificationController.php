<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class NotificationController extends Controller
{
    /**
     * Returns a list of system notifications/alerts
     */
    public function index(): JsonResponse
    {
        $notifications = [];

        // 1. Overdue invoices (status != paid and due_date < today)
        $overdueInvoices = Invoice::where('status', '!=', 'payée')
            ->whereNotNull('due_date')
            ->where('due_date', '<', now()->toDateString())
            ->get();

        foreach ($overdueInvoices as $invoice) {
            $daysOverdue = Carbon::parse($invoice->due_date)->diffInDays(now());
            $notifications[] = [
                'id'       => 'inv-' . $invoice->id,
                'type'     => 'warning',
                'icon'     => 'invoice',
                'title'    => 'Facture en retard',
                'message'  => "Facture #{$invoice->number} — {$invoice->tier?->name} — {$daysOverdue}j de retard",
                'amount'   => $invoice->total_ttc,
                'link'     => '/factures',
                'created_at' => $invoice->due_date,
            ];
        }

        // 2. TVA Reminder — due around 20th of each month
        $today    = now();
        $dayOfMonth = (int) $today->format('d');
        if ($dayOfMonth >= 10 && $dayOfMonth <= 20) {
            $daysLeft = 20 - $dayOfMonth;
            $notifications[] = [
                'id'       => 'tva-' . $today->format('Ym'),
                'type'     => 'info',
                'icon'     => 'tva',
                'title'    => 'Déclaration TVA',
                'message'  => "La déclaration TVA du mois doit être envoyée dans {$daysLeft} jour(s).",
                'amount'   => null,
                'link'     => '/fiscalite',
                'created_at' => now()->toDateString(),
            ];
        }

        // 3. Invoices due in the next 7 days
        $soonDue = Invoice::where('status', '!=', 'payée')
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [now()->toDateString(), now()->addDays(7)->toDateString()])
            ->get();

        foreach ($soonDue as $invoice) {
            $daysLeft = Carbon::parse($invoice->due_date)->diffInDays(now());
            $notifications[] = [
                'id'      => 'soon-' . $invoice->id,
                'type'    => 'info',
                'icon'    => 'clock',
                'title'   => 'Échéance proche',
                'message' => "Facture #{$invoice->number} — {$invoice->tier?->name} — expire dans {$daysLeft}j",
                'amount'  => $invoice->total_ttc,
                'link'    => '/factures',
                'created_at' => $invoice->due_date,
            ];
        }

        // Sort by date desc and return
        usort($notifications, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));

        return response()->json([
            'count'         => count($notifications),
            'notifications' => $notifications,
        ]);
    }
}
