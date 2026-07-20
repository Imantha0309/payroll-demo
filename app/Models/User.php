<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'users';

    protected $fillable = [
        'role_id',
        'designation_id',
        'username',
        'full_name',
        'phone_no',
        'nic',
        'password',
        'is_active',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * User belongs to one role
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * User belongs to one designation
     */
    public function designation()
    {
        return $this->belongsTo(Designation::class, 'designation_id');
    }

    /**
     * User has one login session
     */
    public function loginSession()
    {
        return $this->hasOne(LoginSession::class, 'user_id', 'id');
    }
}