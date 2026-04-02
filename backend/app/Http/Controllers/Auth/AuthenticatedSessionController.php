<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        try {
            return view('auth.login');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthenticatedSessionController.create: ' . $e->getMessage() . ' on line ' . $e->getLine());
            abort(500, 'An error occurred while loading the login page.');
        }
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        try {
            $request->authenticate();
            $request->session()->regenerate();

            if (Auth::check() && in_array(Auth::user()->role, ['user', 'admin', 'manager', 'staff'])) {
                return redirect()->route('admin.dashboard');
            }

            return redirect()->route('home');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthenticatedSessionController.store: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return redirect()->back()->withErrors(['error' => 'An error occurred during login. Please try again.']);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        try {
            Auth::guard('web')->logout();

            $request->session()->invalidate();

            $request->session()->regenerateToken();

            return redirect('/');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('AuthenticatedSessionController.destroy: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return redirect('/')->withErrors(['error' => 'An error occurred during logout.']);
        }
    }
}
