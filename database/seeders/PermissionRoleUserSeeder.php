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

            // customer
            'customer access',

            // staff
            'staff access',

            // user
            'user show',
            'user create',
            'user edit',
            'user delete',

            // role
            'role show',
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

        // Create admin user
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@debbieandkrysbeachresort.com'],
            [
                'email_verified_at' => now(),
                'name' => 'admin',
                'password' => Hash::make('P@ssw0rd'),
                'status' => 'active',
            ]
        );

        $adminUser->assignRole($adminRole);

        // Create staff role
        $staffRole = Role::firstOrCreate([
            'name' => 'staff',
            'guard_name' => 'web'
        ]);

        $staffRole->givePermissionTo('staff access');

        // Create customer role
        $customerRole = Role::firstOrCreate([
            'name' => 'customer',
            'guard_name' => 'web'
        ]);

        $customerRole->givePermissionTo('customer access');
    }
}
