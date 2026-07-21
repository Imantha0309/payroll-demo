<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salaries', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->string('month');
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('no_of_attendances', 2);
            $table->unsignedInteger('total_working_time', 3);//save as minutes
            $table->unsignedInteger('total_ot_time', 3);//save as minutes
            $table->unsignedDecimal('basic_salary', 12, 2);
            $table->unsignedDecimal('total_no_pay_amount', 12, 2);
            $table->unsignedDecimal('total_other_deduction', 12, 2);
            $table->unsignedDecimal('total_addition', 12, 2);
            $table->unsignedDecimal('total_deduction', 12, 2);
            $table->unsignedDecimal('gross_salary', 12, 2);
            $table->unsignedDecimal('net_salary', 12, 2);

            $table->string('remark', 500)->nullable();

            $table->boolean('is_paid')->default(false);
            $table->dateTime('paid_date')->nullable();

            $table->boolean('is_approved')->default(false);
            $table->unsignedBigInteger('session_id');
            $table->unsignedBigInteger('updated_session_id');

            $table->unsignedBigInteger('employee_id'); 

            $table->timestamps();
            $table->foreign('employee_id')->references('id')->on('employees')->onDelete('restrict')->onUpdate('cascade');
            $table->foreign('session_id')->references('id')->on('login_sessions')->onDelete('restrict')->onUpdate('restrict');
            $table->foreign('updated_session_id')->references('id')->on('login_sessions') ->onDelete('restrict')->onUpdate('restrict');

            
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salaries');
    }
};
