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
            $table->date('check_in');
            $table->date('check_out');            
            $table->enum('type', ['Leave', 'Half Day']);
            $table->unsignedInteger('working_time', 3);//save as minutes
            $table->unsignedInteger('ot_time', 3);//save as minutes   
            $table->string('updated_method', 100); 
            $table->boolean('is_approved')->default(false);
            $table->unsignedBigInteger('fingerprint_device_id');
            $table->unsignedBigInteger('fingerprint_upload_id');
            $table->timestamps();


            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('fingerprint_upload_id')->references('id')->on('fingerprint_uploads')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('fingerprint_device_id')->references('id')->on('sample')->onDelete('restrict')->onUpdate('cascade');
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
