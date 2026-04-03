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
        if (! $this->isMaintenanceEnabled()) {
            return $next($request);
        }

        $user = $this->resolveAuthenticatedUser($request);

        if ($this->canBypassMaintenance($request, $user)) {
            return $next($request);
        }

        $this->invalidateUserSession($request, $user);

        return $this->buildMaintenanceResponse($request);
    }

    private function isMaintenanceEnabled(): bool
    {
        return (string) Setting::get('maintenance_mode', 0) === '1';
    }

    private function canBypassMaintenance(Request $request, ?User $user): bool
    {
        return $this->isPublicMaintenanceRoute($request) || $this->isAdminUser($user);
    }

    private function isPublicMaintenanceRoute(Request $request): bool
    {
        return $request->is('api/v1/settings/public')
            || $request->is('v1/settings/public')
            || $request->is('api/v1/login')
            || $request->is('v1/login')
            || $request->is('login');
    }

    private function resolveAuthenticatedUser(Request $request): ?User
    {
        return $request->user() ?: Auth::user() ?: $this->resolveUserFromBearerToken($request);
    }

    private function invalidateUserSession(Request $request, ?User $user): void
    {
        if ($user && $request->hasSession()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
    }

    private function buildMaintenanceResponse(Request $request)
    {
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
