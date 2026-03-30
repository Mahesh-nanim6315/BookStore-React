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
    }

    public function create()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'User creation form data',
                'available_roles' => ['user', 'admin', 'manager', 'staff']
            ]
        ]);
    }

    public function store(Request $request)
    {
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
    }

    public function edit(User $user)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'available_roles' => ['user', 'admin', 'manager', 'staff']
            ]
        ]);
    }

    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user
            ]
        ]);
    }

    public function update(Request $request, User $user)
    {
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
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
