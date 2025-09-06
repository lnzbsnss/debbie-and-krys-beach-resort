<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = auth()->user();

            if (!$user->hasPermissionTo('global access')) {
                $routeName = $request->route()->getName();

                switch ($routeName) {
                    case 'roles.index':
                        if (!$user->hasPermissionTo('role view')) {
                            abort(403, 'Unauthorized: Missing role view permission');
                        }
                        break;

                    case 'roles.show':
                        if (!$user->hasPermissionTo('role view')) {
                            abort(403, 'Unauthorized: Missing role view permission');
                        }
                        break;

                    case 'roles.store':
                        if (!$user->hasPermissionTo('role create')) {
                            abort(403, 'Unauthorized: Missing role create permission');
                        }
                        break;

                    case 'roles.update':
                        if (!$user->hasPermissionTo('role edit')) {
                            abort(403, 'Unauthorized: Missing role edit permission');
                        }
                        break;

                    case 'roles.destroy':
                        if (!$user->hasPermissionTo('role delete')) {
                            abort(403, 'Unauthorized: Missing role delete permission');
                        }
                        break;
                }
            }

            return $next($request);
        });
    }

    public function index()
    {
        $roles = Role::with('permissions')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
                'users_count' => $role->users()->count(),
                'created_at' => $role->created_at,
                'updated_at' => $role->updated_at,
                'can_edit' => $role->name !== 'admin',
                'can_delete' => $role->name !== 'admin',
            ];
        });

        // Group permissions by category
        $permissions = Permission::all()->groupBy(function ($permission) {
            return explode(' ', $permission->name)[0];
        })->map(function ($group, $category) {
            return [
                'category' => ucfirst($category),
                'permissions' => $group->map(function ($permission) {
                    return [
                        'name' => $permission->name,
                        'label' => ucwords(str_replace('_', ' ', $permission->name)),
                    ];
                })->values(),
            ];
        })->values();

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'web',
        ]);

        if ($request->permissions) {
            $role->givePermissionTo($request->permissions);
        }

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'Role created successfully!'
        ]);
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, Role $role)
    {
        // Prevent editing admin role
        if ($role->name === 'admin') {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Admin role cannot be edited!'
            ]);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles')->ignore($role->id)],
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->update([
            'name' => $request->name,
        ]);

        // Sync permissions
        $role->syncPermissions($request->permissions ?? []);

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'Role updated successfully!'
        ]);
    }

    public function destroy(Role $role)
    {
        // Prevent deleting admin role
        if ($role->name === 'admin') {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Admin role cannot be deleted!'
            ]);
        }

        // Check if role has users
        if ($role->users()->count() > 0) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Cannot delete role that has assigned users!'
            ]);
        }

        $role->delete();

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'Role deleted successfully!'
        ]);
    }
}
