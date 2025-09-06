<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = auth()->user();

            if (!$user->hasPermissionTo('global access')) {
                $routeName = $request->route()->getName();

                switch ($routeName) {
                    case 'users.index':
                        if (!$user->hasPermissionTo('user view')) {
                            abort(403, 'Unauthorized: Missing user view permission');
                        }
                        break;

                    case 'users.show':
                        if (!$user->hasPermissionTo('user view')) {
                            abort(403, 'Unauthorized: Missing user view permission');
                        }
                        break;

                    case 'users.store':
                        if (!$user->hasPermissionTo('user create')) {
                            abort(403, 'Unauthorized: Missing user create permission');
                        }
                        break;

                    case 'users.update':
                        if (!$user->hasPermissionTo('user edit')) {
                            abort(403, 'Unauthorized: Missing user edit permission');
                        }
                        break;

                    case 'users.destroy':
                        if (!$user->hasPermissionTo('user delete')) {
                            abort(403, 'Unauthorized: Missing user delete permission');
                        }
                        break;
                }
            }

            return $next($request);
        });
    }

    public function index()
    {
        $users = User::with('roles')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'status' => $user->status,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'roles' => $user->getRoleNames(),
                'can_edit' => !$user->hasRole('admin'),
                'can_delete' => !$user->hasRole('admin'),
            ];
        });

        $roles = Role::all(['id', 'name']);

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'status' => 'required|in:active,inactive',
            'email_verified_at' => 'nullable|boolean',
            'roles' => 'array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => $request->status,
            'email_verified_at' => $request->email_verified_at ? now() : null,
        ]);

        if ($request->roles) {
            $user->assignRole($request->roles);
        }

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'User created successfully!'
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

    public function update(Request $request, User $user)
    {
        // Prevent editing admin users
        if ($user->hasRole('admin')) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Admin users cannot be edited!'
            ]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'status' => 'required|in:active,inactive',
            'email_verified_at' => 'nullable|boolean',
            'roles' => 'array',
            'roles.*' => 'exists:roles,name',
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'status' => $request->status,
            'email_verified_at' => $request->email_verified_at ? now() : null,
        ];

        if ($request->password) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        // Sync roles
        $user->syncRoles($request->roles ?? []);

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'User updated successfully!'
        ]);
    }

    public function destroy(User $user)
    {
        // Prevent deleting admin users
        if ($user->hasRole('admin')) {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Admin users cannot be deleted!'
            ]);
        }

        $user->delete();

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'User deleted successfully!'
        ]);
    }
}
