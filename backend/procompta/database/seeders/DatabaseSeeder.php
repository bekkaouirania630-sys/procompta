<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Roles & Companies
        $companyId = DB::table('companies')->insertGetId([
            'name' => 'Mon Entreprise', // À modifier avec le nom réel
            'ice' => '',
            'rc' => '',
            'address' => '',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $adminRoleId = DB::table('roles')->insertGetId(['name' => 'admin', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('roles')->insert(['name' => 'comptable', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('roles')->insert(['name' => 'rh', 'created_at' => now(), 'updated_at' => now()]);

        User::factory()->create([
            'name' => 'Administrateur',
            'email' => 'admin@procompta.ma',
            'password' => Hash::make('password'),
            'role_id' => $adminRoleId,
            'company_id' => $companyId,
        ]);

        User::factory()->create([
            'name' => 'Rania B.',
            'email' => 'bekkaouirania630@gmail.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRoleId,
            'company_id' => $companyId,
        ]);

        // 2. Base Journals (essential for the app, you can add more)
        $jAchat = DB::table('journals')->insertGetId(['company_id' => $companyId, 'code' => 'ACH', 'name' => 'Journal des Achats', 'created_at' => now(), 'updated_at' => now()]);
        $jVente = DB::table('journals')->insertGetId(['company_id' => $companyId, 'code' => 'VTE', 'name' => 'Journal des Ventes', 'created_at' => now(), 'updated_at' => now()]);
        $jBanque = DB::table('journals')->insertGetId(['company_id' => $companyId, 'code' => 'BQ', 'name' => 'Journal de Banque', 'created_at' => now(), 'updated_at' => now()]);
        $jOD = DB::table('journals')->insertGetId(['company_id' => $companyId, 'code' => 'OD', 'name' => 'Opérations Diverses', 'created_at' => now(), 'updated_at' => now()]);

        // 3. Base Accounts (Standard PCG Marocain)
        // Vous pourrez importer le reste de votre plan comptable réel plus tard.
        DB::table('accounts')->insertGetId(['company_id' => $companyId, 'number' => '3421', 'label' => 'Clients', 'type' => 'actif', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('accounts')->insertGetId(['company_id' => $companyId, 'number' => '7111', 'label' => 'Ventes de marchandises', 'type' => 'produit', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('accounts')->insertGetId(['company_id' => $companyId, 'number' => '4455', 'label' => 'Etat, TVA facturée', 'type' => 'passif', 'created_at' => now(), 'updated_at' => now()]);
        
        DB::table('accounts')->insertGetId(['company_id' => $companyId, 'number' => '4411', 'label' => 'Fournisseurs', 'type' => 'passif', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('accounts')->insertGetId(['company_id' => $companyId, 'number' => '6111', 'label' => 'Achats de marchandises', 'type' => 'charge', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('accounts')->insertGetId(['company_id' => $companyId, 'number' => '3455', 'label' => 'Etat, TVA récupérable', 'type' => 'actif', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('accounts')->insertGetId(['company_id' => $companyId, 'number' => '5141', 'label' => 'Banques', 'type' => 'actif', 'created_at' => now(), 'updated_at' => now()]);
        DB::table('accounts')->insertGetId(['company_id' => $companyId, 'number' => '5161', 'label' => 'Caisses', 'type' => 'actif', 'created_at' => now(), 'updated_at' => now()]);
    }
}
