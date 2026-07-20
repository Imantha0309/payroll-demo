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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();

            // Employee Details
            $table->string('profile_title', 50)->nullable();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->unsignedBigInteger('code')->unique();
            $table->string('employee_code', 20)->unique();
            $table->string('nic', 12)->unique();
            $table->date('dob')->nullable();
            $table->string('phone', 20);
            $table->string('email', 100)->unique();
            $table->date('joined_date')->nullable();
            $table->date('left_date')->nullable();
            $table->unsignedBigInteger('fingerprint_user_id')->nullable();
            $table->boolean('is_approved')->default(true);
            $table->text('remark')->nullable();
            $table->unsignedBigInteger('session_id');
            $table->unsignedBigInteger('updated_session_id');
            $table->unsignedBigInteger('salary_id');
            $table->unsignedBigInteger('salary_level_id');
            $table->unsignedBigInteger('shift_id');
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('designation_id');

            // Foreign Keys
            $table->foreign('session_id')->references('id')->on('login_sessions')->onDelete('restrict')->onUpdate('restrict');
            $table->foreign('updated_session_id')->references('id')->on('login_sessions')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('salary_id')->references('id')->on('salaries')->onDelete('restrict')->onUpdate('restrict');
            $table->foreign('salary_level_id')->references('id')->on('salary_levels')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('shift_id')->references('id')->on('shifts')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('department_id')->references('id')->on('departments')->onDelete('set null')->onUpdate('cascade');
            $table->foreign('designation_id')->references('id')->on('designations')->onDelete('set null')->onUpdate('cascade');
           
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
