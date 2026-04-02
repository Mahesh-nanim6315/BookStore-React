<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function login(LoginRequest $request)
    {
        try {
            $request->ensureIsNotRateLimited();

            $credentials = $request->validated();
            $email = Str::lower(trim((string) $credentials['email']));

            // API login should be stateless; avoid session-based auth.
            $user = User::where('email', $email)->first();
            if (! $user || ! Hash::check($credentials['password'], $user->password)) {
                $request->hitRateLimiter();

                throw ValidationException::withMessages([
                    'email' => ['Invalid credentials.'],
                ]);
            }

            if (! $user->is_active) {
                $request->hitRateLimiter();

                throw ValidationException::withMessages([
                    'email' => ['This account has been deactivated. Please contact support.'],
                ]);
            }

            if ((string) Setting::get('maintenance_mode', 0) === '1' && strtolower((string) $user->role) !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'The site is currently in maintenance mode. Only admins can sign in.',
                ], 503);
            }

            $request->clearRateLimiter();

            // Create token for API
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => $this->formatUser($user),
                'message' => 'Login successful'
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthController.login failed', [
                'exception' => $e::class,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Operation failed',
            ], 500);
        }
    }

    /**
     * Handle an incoming registration request.
     */
    public function register(Request $request)
    {
        try {
            if ((string) Setting::get('maintenance_mode', 0) === '1') {
                return response()->json([
                    'success' => false,
                    'message' => 'Registration is unavailable while maintenance mode is enabled.',
                ], 503);
            }

            $request->merge([
                'email' => Str::lower(trim((string) $request->email)),
            ]);

            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'confirmed', PasswordRule::defaults()],
            ]);

            $email = $request->string('email')->toString();

            $user = User::create([
                'name' => $request->name,
                'email' => $email,
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthController.register failed', [
                'exception' => $e::class,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Operation failed',
            ], 500);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function logout(Request $request)
    {
        try {
            // Revoke the token that was used to authenticate the current request
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout successful'
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthController.logout failed', [
                'exception' => $e::class,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Operation failed',
            ], 500);
        }
    }

    /**
     * Handle forgot password request.
     */
    public function forgotPassword(Request $request)
    {
        try {
            if ((string) Setting::get('maintenance_mode', 0) === '1') {
                return response()->json([
                    'success' => false,
                    'message' => 'Password reset is unavailable while maintenance mode is enabled.',
                ], 503);
            }

            $request->merge([
                'email' => Str::lower(trim((string) $request->email)),
            ]);

            $request->validate(['email' => 'required|email']);

            $email = $request->string('email')->toString();

            $status = Password::sendResetLink(
                ['email' => $email]
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthController.forgotPassword failed', [
                'exception' => $e::class,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Operation failed',
            ], 500);
        }
    }

    /**
     * Handle password reset.
     */
    public function resetPassword(Request $request)
    {
        try {
            if ((string) Setting::get('maintenance_mode', 0) === '1') {
                return response()->json([
                    'success' => false,
                    'message' => 'Password reset is unavailable while maintenance mode is enabled.',
                ], 503);
            }

            $request->merge([
                'email' => Str::lower(trim((string) $request->email)),
            ]);

            $request->validate([
                'token' => 'required',
                'email' => 'required|email',
                'password' => ['required', 'confirmed', PasswordRule::defaults()],
                'password_confirmation' => 'required',
            ]);

            $email = $request->string('email')->toString();

            $status = Password::reset(
                [
                    'email' => $email,
                    'password' => $request->password,
                    'password_confirmation' => $request->password_confirmation,
                    'token' => $request->token,
                ],
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthController.resetPassword failed', [
                'exception' => $e::class,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Operation failed',
            ], 500);
        }
    }

    /**
     * Get the authenticated user.
     */
    public function user(Request $request)
    {
        try {
            return response()->json([
                'success' => true,
                'user' => $this->formatUser($request->user())
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthController.user failed', [
                'exception' => $e::class,
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Operation failed',
            ], 500);
        }
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
