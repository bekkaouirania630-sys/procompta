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
use App\Http\Controllers\API\ClientController;
use App\Http\Controllers\API\InvoiceController;
use App\Http\Controllers\API\InvoiceLineController;
use App\Http\Controllers\API\DocumentController;
use App\Http\Controllers\API\DashboardController;

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
    
    // Comptabilité
    Route::prefix('accounting')->group(function () {
        Route::apiResource('accounts', AccountController::class);
        Route::apiResource('journals', JournalController::class);
        Route::apiResource('entries', EntryController::class);
        Route::apiResource('entry-lines', EntryLineController::class);
    });

    // Facturation
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('invoices', InvoiceController::class);
    Route::apiResource('invoice-lines', InvoiceLineController::class);
    
    // Documents métiers
    Route::apiResource('documents', DocumentController::class);

    // Dashboard
    Route::get('dashboard/accounting', [DashboardController::class, 'getAccountingStats']);
    Route::get('dashboard/admin', [DashboardController::class, 'getAdminStats']);
    Route::get('dashboard/rh', [DashboardController::class, 'getRHStats']);

});
