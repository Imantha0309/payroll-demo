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
        Schema::create('salary_levels', function (Blueprint $table) {
            $table->id();
            $table->string('code', 15);
            $table->unsignedDecimal('basic_salary', 12, 2);
            $table->unsignedDecimal('ot_rate', 5, 2);
            $table->unsignedDecimal('other_addition', 10, 2);
            $table->unsignedDecimal('other_deduction', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_levels');
    }
};
