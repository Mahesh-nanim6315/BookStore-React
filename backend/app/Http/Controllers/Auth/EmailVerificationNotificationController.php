<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmailVerificationNotificationController extends Controller
{
    /**
     * Send a new email verification notification.
     */
    public function store(Request $request): RedirectResponse
    {
        try {
            if ($request->user()->hasVerifiedEmail()) {
                return redirect()->intended(route('dashboard', absolute: false));
            }

            $request->user()->sendEmailVerificationNotification();

            return back()->with('status', 'verification-link-sent');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('EmailVerificationNotificationController.store: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return back()->withErrors(['error' => 'An error occurred while sending the verification email.']);
        }
    }
}
