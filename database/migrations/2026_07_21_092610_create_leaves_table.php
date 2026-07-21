<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leaves', function (Blueprint $table) {
            $table->id();

            // Leave details
            $table->date('applied_date')->nullable();                 // When the leave was applied
            $table->integer('no_of_days');                             // Number of leave days requested
            $table->date('start_date')->nullable();                   // Leave start date
            $table->date('end_date')->nullable();                     // Leave end date
            $table->string('leave_type');                             // Leave type (e.g. Annual, Sick, Casual)
            $table->text('reason')->nullable();                       // Reason for leave
            $table->boolean('is_approved')->default(false);           // Approval status

            // Employee references
            $table->unsignedBigInteger('employee_id');                // FK -> employees (applicant)
            $table->unsignedBigInteger('approved_employee_id')->nullable(); // FK -> employees (approver)
            $table->unsignedBigInteger('acting_employee_id')->nullable();   // FK -> employees (acting replacement)

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('employee_id')
                  ->references('id')->on('employees')
                  ->onDelete('restrict')->onUpdate('cascade');

            $table->foreign('approved_employee_id')
                  ->references('id')->on('employees')
                  ->onDelete('set null')->onUpdate('cascade');

            $table->foreign('acting_employee_id')
                  ->references('id')->on('employees')
                  ->onDelete('set null')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leaves');
    }
};
