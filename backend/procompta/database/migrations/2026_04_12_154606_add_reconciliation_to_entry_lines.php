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
        Schema::table('entry_lines', function (Blueprint $table) {
            $table->foreignId('bank_transaction_id')->nullable()->constrained('bank_transactions')->onDelete('set null');
            $table->boolean('is_reconciled')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('entry_lines', function (Blueprint $table) {
            $table->dropForeign(['bank_transaction_id']);
            $table->dropColumn(['bank_transaction_id', 'is_reconciled']);
        });
    }
};
