<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
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

    public function index(Request $request)
    {
        $query = Role::withCount('users')->with('permissions');

        // Apply search if provided
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhereHas('permissions', function ($pq) use ($search) {
                    $pq->where('name', 'like', "%{$search}%");
                });
            });
        }

        // Apply column filters
        if ($request->filled('filters')) {
            $filters = $request->filters;

            if (isset($filters['display_name']) && !empty($filters['display_name'])) {
                $query->whereIn('name', array_map('strtolower', $filters['display_name']));
            }

            if (isset($filters['users_count_text']) && !empty($filters['users_count_text'])) {
                $query->where(function ($q) use ($filters) {
                    foreach ($filters['users_count_text'] as $countText) {
                        if ($countText === 'No users') {
                            $q->orHaving('users_count', '=', 0);
                        } elseif ($countText === '1 user') {
                            $q->orHaving('users_count', '=', 1);
                        } elseif (preg_match('/(\d+) users/', $countText, $matches)) {
                            $count = intval($matches[1]);
                            $q->orHaving('users_count', '=', $count);
                        } elseif ($countText === '6+ users') {
                            $q->orHaving('users_count', '>', 5);
                        }
                    }
                });
            }
        }

        // Apply sorting
        $sortField = $request->get('sort', 'name');
        $sortDirection = $request->get('direction', 'asc');

        if ($sortField === 'users_count' || $sortField === 'users_count_text') {
            $query->orderBy('users_count', $sortDirection);
        } elseif ($sortField === 'display_name') {
            $query->orderBy('name', $sortDirection);
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        // Get page size
        $perPage = $request->get('per_page', 10);
        $roles = $query->paginate($perPage)->withQueryString();

        // Transform data
        $transformedRoles = $roles->through(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => ucfirst($role->name),
                'users_count' => $role->users_count,
                'users_count_text' => $this->getUsersCountText($role->users_count),
                'permissions' => $role->permissions->pluck('name')->toArray(),
                'permissions_count' => $role->permissions->count(),
                'permissions_text' => $role->permissions->pluck('name')->implode(', '),
                'can_edit' => $role->name !== 'admin',
                'can_delete' => $role->name !== 'admin' && $role->users_count === 0,
                'created_at' => $role->created_at->format('M d, Y'),
                'updated_at' => $role->updated_at->format('M d, Y'),
            ];
        });

        // Group permissions by category for the permission selector
        $permissions = Permission::all()->groupBy(function ($permission) {
            return explode(' ', $permission->name)[0];
        })->map(function ($categoryPermissions, $category) {
            return [
                'category' => ucfirst($category),
                'permissions' => $categoryPermissions->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'label' => ucwords(str_replace('_', ' ', $permission->name)),
                    ];
                }),
            ];
        })->values();

        // Get filter options
        $filterOptions = $this->getFilterOptions();

        return Inertia::render('roles/index', [
            'roles' => $transformedRoles,
            'permissions' => $permissions,
            'filterOptions' => $filterOptions,
            'queryParams' => $request->only(['search', 'sort', 'direction', 'per_page', 'filters']),
        ]);
    }

    private function getUsersCountText($count)
    {
        if ($count === 0) return 'No users';
        if ($count === 1) return '1 user';
        return $count . ' users';
    }

    private function getFilterOptions()
    {
        $roles = Role::withCount('users')->get();

        return [
            'display_name' => $roles->pluck('name')->map(function($name) {
                return ucfirst($name);
            })->unique()->values()->toArray(),
            'users_count_text' => [
                ['value' => 'No users', 'label' => 'No users'],
                ['value' => '1 user', 'label' => '1 user'],
                ['value' => '2 users', 'label' => '2 users'],
                ['value' => '3 users', 'label' => '3 users'],
                ['value' => '4 users', 'label' => '4 users'],
                ['value' => '5 users', 'label' => '5 users'],
                ['value' => '6+ users', 'label' => '6+ users'],
            ],
        ];
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::create([
            'name' => strtolower($request->name),
            'guard_name' => 'web',
        ]);

        if ($request->permissions) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->back()->with('success', 'Role created successfully.');
    }

    public function update(Request $request, Role $role)
    {
        if ($role->name === 'admin') {
            return redirect()->back()->with('error', 'Admin role cannot be edited.');
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles')->ignore($role->id)],
            'permissions' => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role->update([
            'name' => strtolower($request->name),
        ]);

        $role->syncPermissions($request->permissions ?? []);

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'admin') {
            return redirect()->back()->with('error', 'Admin role cannot be deleted.');
        }

        if ($role->users()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete role that has assigned users.');
        }

        $role->delete();

        return redirect()->back()->with('success', 'Role deleted successfully.');
    }
}
