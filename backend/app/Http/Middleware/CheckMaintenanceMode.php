<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next)
    {
        $maintenance = Setting::get('maintenance_mode', 0);

        if ((string) $maintenance !== '1') {
            return $next($request);
        }

        // Allow public maintenance metadata and the login endpoint so admins can still sign in.
        if (
            $request->is('api/v1/settings/public')
            || $request->is('v1/settings/public')
            || $request->is('api/v1/login')
            || $request->is('v1/login')
            || $request->is('login')
        ) {
            return $next($request);
        }

        $user = $request->user() ?: Auth::user() ?: $this->resolveUserFromBearerToken($request);

        if ($this->isAdminUser($user)) {
            return $next($request);
        }

        if ($user && $request->hasSession()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if ($request->expectsJson() || $request->is('api/*') || $request->is('v1/*')) {
            return response()->json([
                'success' => false,
                'message' => 'The site is currently in maintenance mode. Only admins can access it.',
            ], 503);
        }

        return response()->view('maintenance', status: 503);
    }

    private function resolveUserFromBearerToken(Request $request): ?User
    {
        $token = $request->bearerToken();
        if (! $token) {
            return null;
        }

        $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

        return $accessToken?->tokenable instanceof User
            ? $accessToken->tokenable
            : null;
    }

    private function isAdminUser($user): bool
    {
        if (! $user) {
            return false;
        }

        if (strtolower((string) ($user->role ?? '')) === 'admin') {
            return true;
        }

        return method_exists($user, 'hasRole') && $user->hasRole('admin');
    }
}
