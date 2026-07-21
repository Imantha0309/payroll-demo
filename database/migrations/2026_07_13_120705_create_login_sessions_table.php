<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLoginSessionsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('login_sessions', function (Blueprint $table) {
            $table->id(); // Primary key
            $table->unsignedBigInteger('user_id');
            $table->dateTime('login_time'); // Precise login timestamp
            $table->dateTime('logout_time')->nullable(); // Nullable for active sessions
            $table->ipAddress('ip_address')->nullable(); // Nullable for active sessions

            $table->foreign('user_id')->references('id')->on('users')->onDelete('restrict')->onUpdate('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('login_sessions');
    }
}
