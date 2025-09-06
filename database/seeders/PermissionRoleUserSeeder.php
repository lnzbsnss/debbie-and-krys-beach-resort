<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermissionRoleUserSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // global
            'global access',

            // user
            'user view',
            'user create',
            'user edit',
            'user delete',

            // role
            'role view',
            'role create',
            'role edit',
            'role delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web'
            ]);
        }

        // Create admin role
        $adminRole = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web'
        ]);

        // Give permission/s to admin
        // $adminRole->givePermissionTo(Permission::all());
        $adminRole->givePermissionTo('global access');

        // Create admin user with all fields
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'email_verified_at' => now(),
                'name' => 'administrator',
                'password' => Hash::make('password'),
                'status' => 'active',
            ]
        );

        $user->assignRole($adminRole);
    }
}
