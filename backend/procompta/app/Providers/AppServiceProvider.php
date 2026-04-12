<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\Contracts\AccountingRepositoryInterface::class,
            \App\Repositories\Eloquent\AccountingRepository::class
        );

        $this->app->singleton(\App\Services\AccountingService::class, function ($app) {
            return new \App\Services\AccountingService(
                $app->make(\App\Repositories\Contracts\AccountingRepositoryInterface::class)
            );
        });
        $this->app->bind(
            \App\Repositories\Contracts\StockRepositoryInterface::class,
            \App\Repositories\Eloquent\StockRepository::class
        );

        $this->app->singleton(\App\Services\StockService::class, function ($app) {
            return new \App\Services\StockService(
                $app->make(\App\Repositories\Contracts\StockRepositoryInterface::class)
            );
        });

        $this->app->bind(
            \App\Repositories\Contracts\InvoicingRepositoryInterface::class,
            \App\Repositories\Eloquent\InvoicingRepository::class
        );

        $this->app->singleton(\App\Services\InvoicingService::class, function ($app) {
            return new \App\Services\InvoicingService(
                $app->make(\App\Repositories\Contracts\InvoicingRepositoryInterface::class)
            );
        });

        // Other utility services
        $this->app->singleton(\App\Services\TreasuryService::class);
        $this->app->singleton(\App\Services\PayrollService::class);
        $this->app->singleton(\App\Services\OcrService::class);
        $this->app->singleton(\App\Services\NotificationService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
