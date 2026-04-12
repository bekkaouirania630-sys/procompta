<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            // Fix address spelling if needed or just add new fields
            if (!Schema::hasColumn('companies', 'if')) {
                $table->string('if')->nullable()->after('ice');
            }
            if (!Schema::hasColumn('companies', 'patente')) {
                $table->string('patente')->nullable()->after('rc');
            }
            if (!Schema::hasColumn('companies', 'cnss')) {
                $table->string('cnss')->nullable()->after('patente');
            }
            if (!Schema::hasColumn('companies', 'phone')) {
                $table->string('phone')->nullable()->after('address');
            }
            if (!Schema::hasColumn('companies', 'email')) {
                $table->string('email')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('companies', 'ville')) {
                $table->string('ville')->nullable()->after('email');
            }
            if (!Schema::hasColumn('companies', 'logo')) {
                $table->string('logo')->nullable()->after('ville');
            }
            if (!Schema::hasColumn('companies', 'tva_regime')) {
                $table->enum('tva_regime', ['mensuel', 'trimestriel', 'exoneré'])->default('mensuel')->after('logo');
            }
            if (!Schema::hasColumn('companies', 'compta_method')) {
                $table->enum('compta_method', ['engagement', 'encaissement'])->default('engagement')->after('tva_regime');
            }
            if (!Schema::hasColumn('companies', 'currency')) {
                $table->string('currency', 3)->default('MAD')->after('compta_method');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'if', 'patente', 'cnss', 'phone', 'email', 'ville', 
                'logo', 'tva_regime', 'compta_method', 'currency'
            ]);
        });
    }
};
