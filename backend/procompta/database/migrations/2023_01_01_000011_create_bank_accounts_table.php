<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained('companies')->onDelete('cascade');
            $table->string('name');           // Ex: "Compte Principal CIH"
            $table->string('bank_name')->nullable(); // Ex: "Attijariwafabank"
            $table->string('account_number')->nullable();
            $table->string('rib')->nullable();
            $table->decimal('opening_balance', 15, 2)->default(0);
            $table->decimal('current_balance', 15, 2)->default(0);
            $table->char('currency', 3)->default('MAD');
            $table->enum('type', ['banque', 'caisse'])->default('banque');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('bank_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bank_account_id')->constrained('bank_accounts')->onDelete('cascade');
            $table->foreignId('entry_id')->nullable()->constrained('entries')->onDelete('set null');
            $table->date('date');
            $table->string('label');
            $table->decimal('debit', 15, 2)->default(0);   // Sortie
            $table->decimal('credit', 15, 2)->default(0);  // Entrée
            $table->boolean('is_reconciled')->default(false);
            $table->string('reference')->nullable();
            $table->string('category')->nullable(); // import CSV categorization
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_transactions');
        Schema::dropIfExists('bank_accounts');
    }
};
