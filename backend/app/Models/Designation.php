<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Designation extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'session_id', 'updated_session_id', 'is_active'];

    
    protected $casts = [
        'is_active' => 'boolean',
    ];
    



    public function session()
    {
        return $this->belongsTo(LoginSession::class, 'session_id');
    }

    public function updatedSession()
    {
        return $this->belongsTo(LoginSession::class, 'updated_session_id');
    }
}

