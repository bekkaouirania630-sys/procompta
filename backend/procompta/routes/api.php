<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Nouveaux contrôleurs API
use App\Http\Controllers\API\CompanyController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\AccountController;
use App\Http\Controllers\API\JournalController;
use App\Http\Controllers\API\EntryController;
use App\Http\Controllers\API\EntryLineController;
use App\Http\Controllers\API\TierController;
use App\Http\Controllers\API\InvoiceController;
use App\Http\Controllers\API\InvoiceLineController;
use App\Http\Controllers\API\DocumentController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\EmployeeController;
use App\Http\Controllers\API\PayslipController;
use App\Http\Controllers\API\FixedAssetController;
use App\Http\Controllers\API\BudgetController;
use App\Http\Controllers\API\BankAccountController;
use App\Http\Controllers\API\BankTransactionController;
use App\Http\Controllers\API\BankReconciliationController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\AuditController;

Route::group([
    'prefix' => 'auth'
], function ($router) {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

// AJOUT DU MIDDLEWARE AUTH SANCTUM
Route::middleware('auth:sanctum')->group(function () {
    
    // Entités Administratives
    Route::apiResource('companies', CompanyController::class);
    Route::apiResource('roles', RoleController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('audits', AuditController::class)->only(['index']);
    
    // Comptabilité
    Route::prefix('accounting')->group(function () {
        Route::post('accounts/import', [AccountController::class, 'import']);
        Route::apiResource('accounts', AccountController::class);
        Route::get('journals/export', [JournalController::class, 'export']);
        Route::post('journals/import', [JournalController::class, 'import']);
        Route::apiResource('journals', JournalController::class);
        Route::apiResource('entries', EntryController::class);
        Route::patch('entries/{id}/status', [EntryController::class, 'updateStatus']);
        Route::apiResource('entry-lines', EntryLineController::class);
    });

    // Facturation / Tiers
    Route::get('tiers/export', [TierController::class, 'export']);
    Route::post('tiers/import', [TierController::class, 'import']);
    Route::apiResource('tiers', TierController::class);
    Route::apiResource('invoices', InvoiceController::class);
    Route::apiResource('invoice-lines', InvoiceLineController::class);
    
    // Documents métiers
    Route::apiResource('documents', DocumentController::class);

    // Dashboard
    Route::get('dashboard/accounting', [DashboardController::class, 'getAccountingStats']);
    Route::get('dashboard/admin', [DashboardController::class, 'getAdminStats']);
    Route::get('dashboard/rh', [DashboardController::class, 'getRHStats']);

    // RH & Paie
    Route::apiResource('employees', EmployeeController::class);
    Route::get('payslips', [PayslipController::class, 'index']);
    Route::post('payslips/generate', [PayslipController::class, 'generate']);
    Route::patch('payslips/{id}/status', [PayslipController::class, 'updateStatus']);

    // Budget & Assets
    Route::apiResource('fixed-assets', FixedAssetController::class);
    Route::apiResource('budgets', BudgetController::class);

    // Trésorerie
    Route::get('bank-accounts/summary', [BankAccountController::class, 'summary']);
    Route::get('bank-accounts/{bankAccount}/transactions', [BankAccountController::class, 'transactions']);
    Route::apiResource('bank-accounts', BankAccountController::class);
    Route::post('bank-transactions/import-csv', [BankTransactionController::class, 'importCsv']);
    Route::patch('bank-transactions/{bankTransaction}/reconcile', [BankTransactionController::class, 'reconcile']);
    
    // Rapprochement Bancaire Avancé
    Route::prefix('bank-reconciliation')->group(function () {
        Route::get('unmatched', [BankReconciliationController::class, 'unmatchedTransactions']);
        Route::get('suggestions/{transaction}', [BankReconciliationController::class, 'suggestions']);
        Route::post('link', [BankReconciliationController::class, 'link']);
        Route::post('auto-match', [BankReconciliationController::class, 'autoMatch']);
    });
    
    Route::apiResource('bank-transactions', BankTransactionController::class);

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index']);

    // OCR & Documents
    Route::prefix('ocr')->group(function () {
        Route::get('documents', [\App\Http\Controllers\API\OcrController::class, 'index']);
        Route::post('upload', [\App\Http\Controllers\API\OcrController::class, 'store']);
        Route::post('analyze', [\App\Http\Controllers\API\OcrController::class, 'analyze']);
        Route::get('documents/{id}', [\App\Http\Controllers\API\OcrController::class, 'show']);
        Route::delete('documents/{id}', [\App\Http\Controllers\API\OcrController::class, 'destroy']);
    });

});
