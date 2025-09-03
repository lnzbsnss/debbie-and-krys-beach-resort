<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $globalPermission = Permission::create(['name' => 'global-access']);

        // Create Admin role with global access
        $adminRole = Role::create(['name' => 'Admin']);
        $adminRole->givePermissionTo($globalPermission);

        // Create admin user
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@example.com',
            'password' => bcrypt('P@ssw0rd'),
            'email_verified_at' => now(),
        ]);

        // Assign Admin role to user
        $admin->assignRole($adminRole);
    }
}
