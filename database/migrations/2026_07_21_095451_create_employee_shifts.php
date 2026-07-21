<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_shifts', function (Blueprint $table) {
            $table->id();

            
            $table->unsignedInteger('employee_shift_id')->unique();
            $table->time('shift_in')->nullable();
            $table->time('shift_out')->nullable();
            $table->string('shift_type', 50)->nullable();
            $table->time('pre_overtime_end')->nullable();
            $table->time('post_overtime_start')->nullable();
            $table->boolean('is_approved')->default(false);

            //session
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('session_id');                  // FK -> login_sessions (created by)
            $table->unsignedBigInteger('updated_session_id');          // FK -> login_sessions (updated by)

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('session_id') ->references('id')->on('login_sessions')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('updated_session_id')->references('id')->on('login_sessions')->onDelete('restrict')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_shifts');
    }
};
