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


            $table->unsignedBigInteger('session_id')
                  ->nullable();


            $table->string('module')
                  ->nullable();


            $table->string('action_type')
                  ->nullable();


            $table->string('performed_by')
                  ->nullable();


            $table->string('employee_id')
                  ->nullable();


            $table->string('employee_name')
                  ->nullable();


            $table->text('details')
                  ->nullable();


            $table->string('log')
                  ->nullable();


            $table->timestamps();

        });

    }


    public function down(): void
    {
        Schema::dropIfExists('admin_logs');
    }

};