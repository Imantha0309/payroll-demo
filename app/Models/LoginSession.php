<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoginSession extends Model
{
    use HasFactory;

    protected $table = 'login_sessions';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'login_time',
        'logout_time',
        'ip_address',
    ];

    protected $casts = [
        'login_time' => 'datetime',
        'logout_time' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function adminLogs()
    {
        return $this->hasMany(AdminLog::class, 'session_id');
    }
}