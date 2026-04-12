<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table des Employés (RH)
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('matricule')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('cin')->nullable();
            $table->string('cnss_number')->nullable();
            $table->string('job_title')->nullable();
            $table->decimal('base_salary', 15, 2);
            $table->enum('contract_type', ['CDI', 'CDD', 'Stage', 'Consultant'])->default('CDI');
            $table->integer('children_count')->default(0);
            $table->string('family_status')->default('célibataire');
            $table->date('hire_date')->nullable();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Table des Bulletins de Paie
        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->string('period_name'); // ex: "Juin 2024"
            $table->integer('month');
            $table->integer('year');
            $table->decimal('brut_salary', 15, 2);
            $table->decimal('net_salary', 15, 2);
            $table->decimal('cnss_amount', 15, 2);
            $table->decimal('amo_amount', 15, 2);
            $table->decimal('ir_amount', 15, 2);
            $table->enum('status', ['brouillon', 'validé', 'payé'])->default('brouillon');
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Table des Immobilisations (Fixed Assets)
        Schema::create('fixed_assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category')->nullable();
            $table->date('acquisition_date');
            $table->decimal('acquisition_value', 15, 2);
            $table->integer('duration_years');
            $table->string('amortization_method')->default('lineaire');
            $table->decimal('residual_value', 15, 2)->default(0);
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Table des Budgets
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->integer('year');
            $table->decimal('jan', 15, 2)->default(0);
            $table->decimal('feb', 15, 2)->default(0);
            $table->decimal('mar', 15, 2)->default(0);
            $table->decimal('apr', 15, 2)->default(0);
            $table->decimal('may', 15, 2)->default(0);
            $table->decimal('jun', 15, 2)->default(0);
            $table->decimal('jul', 15, 2)->default(0);
            $table->decimal('aug', 15, 2)->default(0);
            $table->decimal('sep', 15, 2)->default(0);
            $table->decimal('oct', 15, 2)->default(0);
            $table->decimal('nov', 15, 2)->default(0);
            $table->decimal('dec', 15, 2)->default(0);
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('budgets');
        Schema::dropIfExists('fixed_assets');
        Schema::dropIfExists('payslips');
        Schema::dropIfExists('employees');
    }
};
