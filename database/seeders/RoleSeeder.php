<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::insert([
            [
                'name' => 'Super Admin',
            ],
            [
                'name' => 'Executive Officer',
            ],
            [
                'name' => 'Subjective Officer',
            ],
        ]);
    }
}