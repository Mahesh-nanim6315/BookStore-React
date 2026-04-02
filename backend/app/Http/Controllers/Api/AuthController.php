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
        $this->logRequestStart($request, 'login');
        $email = null;
        $user = null;

        try {
            [$result, $executionTime] = $this->measureExecutionTime(function () use ($request, &$email, &$user) {
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
            });

            $this->logRequestSuccess('login', [
                'user_email' => $email,
                'user_role' => $user->role ?? null
            ], $executionTime);

            $this->logBusinessOperation('User login successful', [
                'user_id' => $user->id ?? null,
                'user_email' => $email
            ]);

            return $result;
        } catch (ValidationException $e) {
            $this->logRequestError('login', $e, [
                'email_attempted' => $request->email ?? null
            ]);

            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
                'message' => 'Invalid credentials.',
            ], 422);
        } catch (\Throwable $e) {
            $this->logRequestError('login', $e, [
                'email_attempted' => $request->email ?? null
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
        $this->logRequestStart($request, 'register');
        $email = null;
        $user = null;

        try {
            [$result, $executionTime] = $this->measureExecutionTime(function () use ($request, &$email, &$user) {
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
            });

            $this->logRequestSuccess('register', [
                'user_email' => $email,
                'user_id' => $user->id ?? null
            ], $executionTime);

            $this->logBusinessOperation('User registration successful', [
                'user_id' => $user->id,
                'user_email' => $email
            ]);

            return $result;
        } catch (ValidationException $e) {
            $this->logRequestError('register', $e, [
                'email_attempted' => $request->email ?? null
            ]);

            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
                'message' => 'Validation failed.',
            ], 422);
        } catch (\Throwable $e) {
            $this->logRequestError('register', $e, [
                'email_attempted' => $request->email ?? null
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
                $this->logRequestErrorAuto($e);

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
                $this->logRequestErrorAuto($e);

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
                $this->logRequestErrorAuto($e);

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
                $this->logRequestErrorAuto($e);

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
