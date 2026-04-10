<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->nullable()->constrained('clients')->onDelete('cascade');
            $table->string('numero')->nullable();
            $table->string('type')->default('vente'); // achat, vente
            $table->date('date');
            $table->date('echeance')->nullable();
            $table->decimal('ht', 15, 2)->default(0);
            $table->decimal('tva', 15, 2)->default(0);
            $table->decimal('ttc', 15, 2)->default(0);
            $table->string('statut')->default('en_attente'); // en_attente, validée, payée, rejetée
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
