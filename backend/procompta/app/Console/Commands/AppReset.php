<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AppReset extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:reset {--force : Force the reset without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Réinitialise l\'ERP pour un usage réel (Vider les données de test)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->option('force') && ! $this->confirm('Voulez-vous vraiment vider TOUTES les données de test et réinitialiser le système ? Cette action est irréversible.')) {
            $this->info('Réinitialisation annulée.');
            return;
        }

        $this->info('Nettoyage en cours...');

        // Exécuter migrate:fresh avec le seeder nettoyé
        Artisan::call('migrate:fresh', [
            '--seed' => true,
            '--force' => true,
        ]);

        $this->info(Artisan::output());

        $this->success('Système réinitialisé avec succès !');
        $this->info('Structure conservée : Plan Comptable, Journaux, Rôles.');
        $this->info('Données vidées : Écritures, Factures, Employés, Transactions de test.');
    }

    private function success($message)
    {
        $this->output->writeln("<info>✔</info> $message");
    }
}
