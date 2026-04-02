<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class ConfirmablePasswordController extends Controller
{
    /**
     * Show the confirm password view.
     */
    public function show(): View
    {
        try {
            return view('auth.confirm-password');
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);
            abort(500, 'An error occurred while loading the confirm password page.');
        }
    }

    /**
     * Confirm the user's password.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            if (! Auth::guard('web')->validate([
                'email' => $request->user()->email,
                'password' => $request->password,
            ])) {
                throw ValidationException::withMessages([
                    'password' => __('auth.password'),
                ]);
            }

            $request->session()->put('auth.password_confirmed_at', time());

            return redirect()->intended(route('dashboard', absolute: false));
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);
            return redirect()->back()->withErrors(['error' => 'An error occurred while confirming your password.']);
        }
    }
}
