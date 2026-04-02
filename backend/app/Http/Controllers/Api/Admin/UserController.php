<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = User::query();

            if ($request->search) {
                $query->where('name', 'like', "%{$request->search}%")
                      ->orWhere('email', 'like', "%{$request->search}%");
            }

            $users = $query->latest()->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $users
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading users.'
            ], 500);
        }
    }

    public function create()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'message' => 'User creation form data',
                    'available_roles' => ['user', 'admin', 'manager', 'staff']
                ]
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading create form.'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $this->logRequestStart($request, 'store');

        $user = null;

        try {
            [$result, $executionTime] = $this->measureExecutionTime(function () use ($request, &$user) {
                $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|email|max:255|unique:users,email',
                    'password' => ['required', 'confirmed', PasswordRule::defaults()],
                    'password_confirmation' => 'required',
                    'role' => 'required|in:user,admin,manager,staff',
                ]);

                $user = User::create([
                    'name' => trim((string) $request->name),
                    'email' => Str::lower(trim((string) $request->email)),
                    'password' => Hash::make($request->password),
                    'role' => $request->role,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'User created successfully',
                    'data' => [
                        'user' => $user
                    ]
                ]);
            });

            $this->logRequestSuccess('store', [
                'user_id' => $user?->id,
                'user_email' => $user?->email,
                'user_role' => $user?->role,
                'created_by' => auth()->id()
            ], $executionTime);

            $this->logBusinessOperation('Admin user created', [
                'user_id' => $user?->id,
                'user_email' => $user?->email,
                'user_role' => $user?->role,
                'created_by' => auth()->id()
            ]);

            return $result;
        } catch (\Throwable $e) {
            $this->logRequestError('store', $e, [
                'email_attempted' => $request->email ?? null,
                'role_attempted' => $request->role ?? null,
                'created_by' => auth()->id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the user.'
            ], 500);
        }
    }

    public function edit(User $user)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'available_roles' => ['user', 'admin', 'manager', 'staff']
                ]
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading edit form.'
            ], 500);
        }
    }

    public function show(User $user)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user
                ]
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading the user.'
            ], 500);
        }
    }

    public function update(Request $request, User $user)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => "required|email|max:255|unique:users,email,$user->id",
                'role' => 'required|in:user,admin,manager,staff',
                'is_active' => 'sometimes|boolean',
            ]);

            $user->update([
                'name' => trim((string) $request->name),
                'email' => Str::lower(trim((string) $request->email)),
                'role' => $request->role,
                'is_active' => $request->has('is_active')
                    ? $request->boolean('is_active')
                    : $user->is_active,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => [
                    'user' => $user->fresh()
                ]
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the user.'
            ], 500);
        }
    }

    public function destroy(User $user)
    {
        try {
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the user.'
            ], 500);
        }
    }
}
