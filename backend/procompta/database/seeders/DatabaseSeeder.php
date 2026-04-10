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
            'name' => 'ALFA SARL',
            'ice' => '002123456789001',
            'rc' => '123456',
            'address' => '123 Boulevard Mohammed V, Casablanca',
            'created_at' => now(), 'updated_at' => now(),
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

        // 2. Base Journals
        $journals = [
            ['ACH', 'Journal des Achats', 'achat'],
            ['VTE', 'Journal des Ventes', 'vente'],
            ['BQ', 'Journal de Banque', 'banque'],
            ['CS', 'Journal de Caisse', 'caisse'],
            ['OD', 'Opérations Diverses', 'od'],
        ];
        foreach ($journals as $j) {
            DB::table('journals')->insert([
                'company_id' => $companyId, 'code' => $j[0], 'name' => $j[1], 'type' => $j[2], 
                'created_at' => now(), 'updated_at' => now()
            ]);
        }

        // 3. Plan Comptable Marocain (PCM) Hierarchical - Classes 1-7
        $pcm = [
            // --- CLASSE 1 : FINANCEMENT PERMANENT ---
            ['11', 'CAPITAUX PROPRES', 'passif'],
            ['111', 'Capital social ou personnel', 'passif'],
            ['1111', 'Capital social', 'passif'],
            ['1117', 'Primes d\'émission, de fusion et d\'apport', 'passif'],
            ['114', 'Réserves légales', 'passif'],
            ['1140', 'Réserve légale', 'passif'],
            ['115', 'Autres réserves', 'passif'],
            ['1151', 'Réserves statutaires ou contractuelles', 'passif'],
            ['119', 'Résultat net de l\'exercice', 'passif'],
            ['1191', 'Résultat net de l\'exercice (créditeur)', 'passif'],
            ['1199', 'Résultat net de l\'exercice (débiteur)', 'passif'],
            ['14', 'DETTES DE FINANCEMENT', 'passif'],
            ['148', 'Autres dettes de financement', 'passif'],
            ['1481', 'Emprunts auprès des établissements de crédit', 'passif'],

            // --- CLASSE 2 : ACTIF IMMOBILISE ---
            ['21', 'IMMOBILISATION EN NON-VALEURS', 'actif'],
            ['211', 'Frais de constitution', 'actif'],
            ['2111', 'Frais de constitution', 'actif'],
            ['23', 'IMMOBILISATIONS CORPORELLES', 'actif'],
            ['231', 'Terrains', 'actif'],
            ['2311', 'Terrains nus', 'actif'],
            ['232', 'Constructions', 'actif'],
            ['2321', 'Bâtiments', 'actif'],
            ['233', 'Installations techniques, matériel et outillage', 'actif'],
            ['2332', 'Matériel et outillage', 'actif'],
            ['234', 'Matériel de transport', 'actif'],
            ['2340', 'Matériel de transport', 'actif'],
            ['235', 'Mobilier, matériel de bureau et aménagements divers', 'actif'],
            ['2351', 'Mobilier de bureau', 'actif'],
            ['2355', 'Matériel informatique', 'actif'],
            ['28', 'AMORTISSEMENTS DES IMMOBILISATIONS', 'actif'], // Type rectificatif mais mis en actif pour la balance

            // --- CLASSE 3 : ACTIF CIRCULANT (HORS TRESORERIE) ---
            ['31', 'STOCKS', 'actif'],
            ['311', 'Marchandises', 'actif'],
            ['3111', 'Marchandises', 'actif'],
            ['34', 'CREANCES DE L\'ACTIF CIRCULANT', 'actif'],
            ['342', 'Clients et comptes rattachés', 'actif'],
            ['3421', 'Clients', 'actif'],
            ['3425', 'Clients - Effets à recevoir', 'actif'],
            ['345', 'Etat - débiteur', 'actif'],
            ['3455', 'Etat, TVA récupérable', 'actif'],
            ['34551', 'TVA récupérable sur immobilisations', 'actif'],
            ['34552', 'TVA récupérable sur charges', 'actif'],

            // --- CLASSE 4 : PASSIF CIRCULANT (HORS TRESORERIE) ---
            ['44', 'DETTES DU PASSIF CIRCULANT', 'passif'],
            ['441', 'Fournisseurs et comptes rattachés', 'passif'],
            ['4411', 'Fournisseurs', 'passif'],
            ['4415', 'Fournisseurs - Effets à payer', 'passif'],
            ['443', 'Personnel - créditeur', 'passif'],
            ['4432', 'Rémunérations dues au personnel', 'passif'],
            ['444', 'Organismes sociaux', 'passif'],
            ['4441', 'C.N.S.S.', 'passif'],
            ['4443', 'A.M.O.', 'passif'],
            ['445', 'Etat - créditeur', 'passif'],
            ['4452', 'Etat, impôts sur les résultats', 'passif'],
            ['4455', 'Etat, TVA facturée', 'passif'],
            ['4456', 'Etat, TVA due (provisoire)', 'passif'],

            // --- CLASSE 5 : TRESORERIE ---
            ['51', 'TRESORERIE - ACTIF', 'actif'],
            ['511', 'Chèques et valeurs à encaisser', 'actif'],
            ['514', 'Banques, T.G.R. et C.C.P.', 'actif'],
            ['5141', 'Banques (solde débiteur)', 'actif'],
            ['516', 'Caisses, régies d\'avances et accréditifs', 'actif'],
            ['5161', 'Caisses', 'actif'],
            ['55', 'TRESORERIE - PASSIF', 'passif'],
            ['554', 'Banques (soldes créditeurs)', 'passif'],
            ['5541', 'Banques (soldes créditeurs)', 'passif'],

            // --- CLASSE 6 : COMPTES DE CHARGES ---
            ['61', 'CHARGES D\'EXPLOITATION', 'charge'],
            ['611', 'Achats revendus de marchandises', 'charge'],
            ['6111', 'Achats de marchandises', 'charge'],
            ['612', 'Achats consommés de matières et fournitures', 'charge'],
            ['6121', 'Achats de matières premières', 'charge'],
            ['613', 'Autres charges externes', 'charge'],
            ['6131', 'Locations et charges locatives', 'charge'],
            ['6133', 'Entretien et réparations', 'charge'],
            ['614', 'Autres charges externes (suite)', 'charge'],
            ['6142', 'Transports', 'charge'],
            ['6144', 'Publicité, publications et relations publiques', 'charge'],
            ['6145', 'Frais postaux et de télécommunications', 'charge'],
            ['616', 'Impôts et taxes', 'charge'],
            ['6161', 'Impôts et taxes directs', 'charge'],
            ['617', 'Charges de personnel', 'charge'],
            ['6171', 'Rémunérations du personnel', 'charge'],
            ['6174', 'Charges sociales', 'charge'],

            // --- CLASSE 7 : COMPTES DE PRODUITS ---
            ['71', 'PRODUITS D\'EXPLOITATION', 'produit'],
            ['711', 'Ventes de marchandises', 'produit'],
            ['7111', 'Ventes de marchandises au Maroc', 'produit'],
            ['712', 'Ventes de biens et services produits', 'produit'],
            ['7121', 'Ventes de produits finis', 'produit'],
            ['7124', 'Ventes de services produits', 'produit'],
            ['73', 'PRODUITS FINANCIERS', 'produit'],
            ['738', 'Intérêts et autres produits financiers', 'produit'],
            ['7381', 'Intérêts et produits assimilés', 'produit'],
        ];

        foreach ($pcm as $account) {
            DB::table('accounts')->insert([
                'company_id' => $companyId,
                'number' => $account[0],
                'label' => $account[1],
                'type' => $account[2],
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }
}
