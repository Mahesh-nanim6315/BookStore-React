<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        // API login should be stateless; avoid session-based auth.
        $user = User::where('email', $credentials['email'])->first();
        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 422);
        }

        if ((string) Setting::get('maintenance_mode', 0) === '1' && strtolower((string) $user->role) !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'The site is currently in maintenance mode. Only admins can sign in.',
            ], 503);
        }

        // Create token for API
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $this->formatUser($user),
            'message' => 'Login successful'
        ]);
    }

    /**
     * Handle an incoming registration request.
     */
    public function register(Request $request)
    {
        if ((string) Setting::get('maintenance_mode', 0) === '1') {
            return response()->json([
                'success' => false,
                'message' => 'Registration is unavailable while maintenance mode is enabled.',
            ], 503);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user', // Default role for new registrations
        ]);

        // Create token for API
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $this->formatUser($user),
            'message' => 'Registration successful'
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful'
        ]);
    }

    /**
     * Handle forgot password request.
     */
    public function forgotPassword(Request $request)
    {
        if ((string) Setting::get('maintenance_mode', 0) === '1') {
            return response()->json([
                'success' => false,
                'message' => 'Password reset is unavailable while maintenance mode is enabled.',
            ], 503);
        }

        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status !== Password::RESET_LINK_SENT) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'email' => [__($status)],
                ],
                'message' => __($status),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => __($status),
        ]);
    }

    /**
     * Handle password reset.
     */
    public function resetPassword(Request $request)
    {
        if ((string) Setting::get('maintenance_mode', 0) === '1') {
            return response()->json([
                'success' => false,
                'message' => 'Password reset is unavailable while maintenance mode is enabled.',
            ], 503);
        }

        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:8',
            'password_confirmation' => 'required',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'email' => [__($status)],
                ],
                'message' => __($status),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => __($status),
        ]);
    }

    /**
     * Get the authenticated user.
     */
    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'user' => $this->formatUser($request->user())
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'permissions' => $user->permissions(),
            'plan' => $user->plan,
            'billing_cycle' => $user->billing_cycle,
            'plan_expires_at' => $user->plan_expires_at,
            'has_active_subscription' => $user->hasActiveSubscription(),
            'subscription_on_grace_period' => (bool) optional($user->subscription('default'))->onGracePeriod(),
            'avatar_url' => $user->avatar_url,
            'cover_url' => $user->cover_url,
        ];
    }
}
