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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->date('check_date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->enum('type', ['present', 'absent', 'leave', 'late'])->default('present');            
            $table->unsignedInteger('ot_time',10)->nullable();
            $table->boolean('is_approved')->default(false);
            $table->string('fingerprint_device_id', 20);
            $table->string('updated_method', 100)->nullable();
           $table->string('fingerprint_upload_id',20)->nullable();

            $table->timestamps();

            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('restrict')->onUpdate('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
