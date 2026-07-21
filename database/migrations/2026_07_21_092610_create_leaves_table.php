<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */ public function up(): void
    {
        Schema::create('leaves', function (Blueprint $table) {
            $table->id();

            $table->date('applied_date')->nullable();
            $table->integer('no_of_days');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('leave_type');
            $table->text('reason')->nullable();
            $table->boolean('is_approved')->default(false);

            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('approved_employee_id');
            $table->unsignedBigInteger('acting_employee_id');

            //foreign keys
            $table->foreignId('employee_id')->references('id')->on('employees')->onUpdate('restrict')->nullOnDelete('restrict');
            $table->foreignId('approved_employee_id')->references('id')->on('employees')->onUpdate('NOT NULL')->nullOnDelete('NOT NULL');
            $table->foreignId('acting_employee_id')->nullable()->references('id')->on('employees')->onUpdate('CASCADE')->nullOnDelete('NOT NULL');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leaves');
    }
};
