<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{

    public function up(): void
    {

        Schema::create('admin_logs', function(Blueprint $table){

            $table->id();
            $table->unsignedBigInteger('session_id');
            $table->string('module',100)->nullable();
            $table->string('action_type', 100)->nullable();
            $table->string('performed_by', 100);
            $table->text('details')->nullable();
            $table->string('log', 500)->nullable();
            $table->timestamps();

        });

    }


    public function down(): void
    {
        Schema::dropIfExists('admin_logs');
    }

};