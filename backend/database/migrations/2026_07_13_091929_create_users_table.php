<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {

            $table->id();

            $table->foreignId('role_id')
                  ->constrained('roles')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');

            $table->string('username', 50)->unique();
            $table->string('full_name', 100);
            $table->string('phone_no', 15)->nullable();
            $table->string('nic', 20)->unique();

            $table->string('password');

            $table->boolean('is_active')
                  ->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
}