<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();

            $table->time('shift_in')->nullable();
            $table->time('shift_out')->nullable();
            $table->integer('shift_hours')->nullable();
            $table->string('shift_type', 50)->nullable();
            $table->string('remark', 500)->nullable();

            $table->unsignedBigInteger('session_id');
            $table->unsignedBigInteger('updated_session_id');
            $table->unsignedBigInteger('employee_shift_id')->unique();

            //foreign keys
            $table->foreign('session_id')->references('id')->on('login_sessions')->onDelete('restrict')->onUpdate('restrict');
            $table->foreign('updated_session_id')->references('id')->on('login_sessions')->onDelete('restrict')->onUpdate('restrict');
            $table->foreign('employee_shift_id')->references('id')->on('employee_shifts')->onDelete('restrict')->onUpdate('restrict');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shifts');
    }
};
