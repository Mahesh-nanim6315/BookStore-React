<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class EmailVerificationPromptController extends Controller
{
    /**
     * Display the email verification prompt.
     */
    public function __invoke(Request $request): RedirectResponse|View
    {
        try {
            return $request->user()->hasVerifiedEmail()
                        ? redirect()->intended(route('dashboard', absolute: false))
                        : view('auth.verify-email');
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);
            return redirect()->route('dashboard')->withErrors(['error' => 'An error occurred while loading the email verification page.']);
        }
    }
}
