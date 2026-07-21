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
        Schema::create('fingerprint_uploads', function (Blueprint $table) {
            $table->id();
            $table->string('month');// fingerprint records for a month
            $table->date('upload_date');// file uploaded date
            $table->string('file', 500);// uploaded file name or storage path
            $table->unsignedInteger('no_of_rows');// records count 
            $table->boolean('is_approved')->default(false); //approval info
            
            //session info
            $table->unsignedBigInteger('session_id');
            $table->unsignedBigInteger('updated_session_id');

            //created and updated at
            $table->timestamps();

            //foreign key defination
            $table->foreign('session_id')->references('id')->on('login_sessions')->onDelete('restrict')->onUpdate('restrict');
            $table->foreign('updated_session_id')->references('id')->on('login_sessions')->onDelete('restrict')->onUpdate('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fingerprint_uploads');
    }
};
