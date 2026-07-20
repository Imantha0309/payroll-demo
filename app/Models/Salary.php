<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    protected $table = 'salaries';

    protected $fillable = [
        'employee_id',
        'month',
        'start_date',
        'end_date',
        'no_of_attendances',
        'total_work_time',
        'total_ot_time',
        'basic_salary',
        'total_no_pay_amount',
        'total_other_deduction',
        'total_addition',
        'total_deduction',
        'gross_salary',
        'net_salary',
        'remark',
        'session_id',
        'updated_session_id',
        'is_paid',
        'paid_date',
        'is_approved',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'paid_date' => 'datetime',

        'basic_salary' => 'decimal:2',
        'total_no_pay_amount' => 'decimal:2',
        'total_other_deduction' => 'decimal:2',
        'total_addition' => 'decimal:2',
        'total_deduction' => 'decimal:2',
        'gross_salary' => 'decimal:2',
        'net_salary' => 'decimal:2',

        'is_paid' => 'boolean',
        'is_approved' => 'boolean',
    ];

    /**
     * Employee who owns this salary record.
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    /**
     * User who created this salary record.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'session_id');
    }

    /**
     * User who last updated this salary record.
     */
    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_session_id');
    }
}