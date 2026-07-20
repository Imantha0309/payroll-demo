<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminLog extends Model
{
    protected $fillable = [
        'session_id',
        'module',
        'action_type',
        'performed_by',
        'employee_id',
        'employee_name',
        // 'application_id',
        // 'application_name',
        'details',
        'log'
    ];

    public function session()
    {
        return $this->belongsTo(LoginSession::class, 'session_id');
    }

    // public function employee()
    // {
    //     return $this->belongsTo(Employee::class, 'employee_id');
    // }

    // public function application()
    // {
    //     return $this->belongsTo(Application::class, 'application_id');
    // }
}
