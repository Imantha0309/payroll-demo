<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing users
        User::query()->delete();

        // Get roles by name
        $roles = Role::pluck('id', 'name');

        $users = [
            [
                'role_id' => $roles['Super Admin'],
                'username' => 'admin@gmail.com',
                'full_name' => 'PMO Admin',
                'phone_no' => '0712345678',
                'nic' => '199012345678',
                'password' => Hash::make('#Admin1234'),
                'is_active' => true,
            ],

            [
                'role_id' => $roles['Executive Officer'],
                'username' => 'executive@gmail.com',
                'full_name' => 'Executive Officer',
                'phone_no' => '0723456789',
                'nic' => '198912345678',
                'password' => Hash::make('#Executive1234'),
                'is_active' => true,
            ],
            [
                'role_id' => $roles['Subjective Officer'],
                'username' => 'subjective@gmail.com',
                'full_name' => 'Subjective Officer',
                'phone_no' => '0723456789',
                'nic' => '198912345876',
                'password' => Hash::make('#Subjective1234'),
                'is_active' => true,
            ],


        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}