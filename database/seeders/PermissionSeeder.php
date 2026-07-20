<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;


class PermissionSeeder extends Seeder
{

    public function run(): void
    {

        Permission::insert([

            [
                'name'=>'Security_read_all'
            ],

            [
                'name'=>'Security_create'
            ],

            [
                'name'=>'Security_update'
            ],

            [
                'name'=>'Security_delete'
            ]

        ]);

    }

}