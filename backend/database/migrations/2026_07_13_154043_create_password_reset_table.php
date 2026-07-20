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
        Schema::create('password_resets', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index(); // User's email
            $table->unsignedBigInteger('user_id'); // Reference to user
            $table->string('token'); // Hashed reset token
            $table->timestamp('expire_date'); // Token expiration time (configurable, default 30 min)
            $table->timestamp('resetted_at')->nullable(); // When password was reset (null = not used yet)
            $table->timestamps(); // created_at and updated_at
            
            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_resets');
    }
};
