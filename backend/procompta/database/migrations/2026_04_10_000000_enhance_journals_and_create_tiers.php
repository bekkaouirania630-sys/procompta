<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Enhance Journals
        Schema::table('journals', function (Blueprint $table) {
            if (!Schema::hasColumn('journals', 'type')) {
                $table->enum('type', ['achat', 'vente', 'banque', 'caisse', 'od'])->default('od')->after('code');
            }
            if (!Schema::hasColumn('journals', 'account_id')) {
                $table->foreignId('account_id')->nullable()->constrained('accounts')->onDelete('set null')->after('type');
            }
        });

        // 2. Create Tiers (Plan Tiers)
        if (!Schema::hasTable('tiers')) {
            Schema::create('tiers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
                $table->string('code')->unique();
                $table->string('name');
                $table->enum('type', ['client', 'fournisseur', 'salarie', 'autre'])->default('client');
                $table->foreignId('account_id')->nullable()->constrained('accounts')->onDelete('set null'); // Compte collectif
                
                // Moroccan Professional IDs
                $table->string('ice')->nullable();
                $table->string('if')->nullable();
                $table->string('rc')->nullable();
                $table->string('patente')->nullable();
                $table->string('cnss')->nullable();
                
                // Contact
                $table->text('address')->nullable();
                $table->string('ville')->nullable();
                $table->string('phone')->nullable();
                $table->string('email')->nullable();
                
                $table->timestamps();
            });
        }

        // 3. Migrate data from clients to tiers (if clients table exists)
        if (Schema::hasTable('clients')) {
            // Remove foreign keys pointing to clients
            if (Schema::hasTable('invoices')) {
                Schema::table('invoices', function (Blueprint $table) {
                    $table->dropForeign(['client_id']);
                });
            }

            $clients = DB::table('clients')->get();
            foreach ($clients as $client) {
                // Generate a code if none exists
                $code = strtoupper(substr($client->name, 0, 3)) . str_pad($client->id, 4, '0', STR_PAD_LEFT);
                
                DB::table('tiers')->insert([
                    'id' => $client->id, // Maintain IDs to keep relationships valid
                    'name' => $client->name,
                    'email' => $client->email,
                    'phone' => $client->phone,
                    'ice' => $client->ice,
                    'ville' => $client->ville,
                    'code' => $code,
                    'type' => 'client',
                    'created_at' => $client->created_at,
                    'updated_at' => $client->updated_at,
                ]);
            }

            // Drop clients table
            Schema::dropIfExists('clients');

            // Re-establish foreign keys on invoices
            if (Schema::hasTable('invoices')) {
                Schema::table('invoices', function (Blueprint $table) {
                    $table->renameColumn('client_id', 'tier_id');
                    $table->foreign('tier_id')->references('id')->on('tiers')->onDelete('cascade');
                });
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('invoices')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->dropForeign(['tier_id']);
                $table->renameColumn('tier_id', 'client_id');
            });
        }

        // Recreate clients table (simplified)
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('ice')->nullable();
            $table->string('ville')->nullable();
            $table->timestamps();
        });

        // Migrate back
        $tiers = DB::table('tiers')->where('type', 'client')->get();
        foreach ($tiers as $tier) {
            DB::table('clients')->insert([
                'id' => $tier->id,
                'name' => $tier->name,
                'email' => $tier->email,
                'phone' => $tier->phone,
                'ice' => $tier->ice,
                'ville' => $tier->ville,
                'created_at' => $tier->created_at,
                'updated_at' => $tier->updated_at,
            ]);
        }

        Schema::dropIfExists('tiers');

        if (Schema::hasTable('invoices')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            });
        }

        Schema::table('journals', function (Blueprint $table) {
            $table->dropForeign(['account_id']);
            $table->dropColumn(['type', 'account_id']);
        });
    }
};
