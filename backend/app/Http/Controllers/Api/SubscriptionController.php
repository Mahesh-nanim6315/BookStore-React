<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Stripe\Checkout\Session as StripeCheckoutSession;
use Stripe\Stripe;
use Stripe\Subscription as StripeSubscription;

class SubscriptionController extends Controller
{
    private function frontendUrl(string $path): string
    {
        $base = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

        return $base . '/' . ltrim($path, '/');
    }

    private function frontendPath(string $path): string
    {
        return '/' . ltrim($path, '/');
    }

    public function index()
    {
        $plans = [
            [
                'name' => 'Free Reader',
                'monthly' => 0,
                'yearly' => 0,
                'features' => [
                    'Access to free books',
                    '2 downloads per month',
                    'Standard support',
                ],
            ],
            [
                'name' => 'Premium Reader',
                'monthly' => 9,
                'yearly' => 90,
                'features' => [
                    'Unlimited ebooks',
                    '5 audiobooks per month',
                    'Early access releases',
                    'No ads',
                ],
                'popular' => true,
            ],
            [
                'name' => 'Ultimate Reader',
                'monthly' => 19,
                'yearly' => 190,
                'features' => [
                    'Unlimited ebooks',
                    'Unlimited audiobooks',
                    'Offline downloads',
                    'Exclusive content',
                    'Priority support',
                ],
            ],
        ];

        $subscriptionsEnabled = (bool) Setting::get('subscriptions_enabled', 1);
        $freeTrialDays = (int) Setting::get('free_trial_days', 7);

        return response()->json([
            'success' => true,
            'data' => [
                'plans' => $plans,
                'subscriptions_enabled' => $subscriptionsEnabled,
                'free_trial_days' => $freeTrialDays
            ]
        ]);
    }

    public function checkout(Request $request)
    {
        $data = $request->validate([
            'plan' => 'required|in:free,premium,ultimate',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $user = Auth::user();
        $plan = $data['plan'];
        $billing = $data['billing_cycle'];

        // If subscriptions are disabled, block any non-free plan changes.
        if (! (bool) Setting::get('subscriptions_enabled', 1) && $plan !== 'free') {
            return response()->json([
                'success' => false,
                'message' => 'Subscriptions are currently disabled.'
            ], 403);
        }

        if ($user->plan === $plan && $user->billing_cycle === $billing && ! $user->subscription('default')?->onGracePeriod()) {
            return response()->json([
                'success' => false,
                'message' => 'You are already on this plan.'
            ], 422);
        }

        if ($plan === 'free') {
            if ($user->subscribed('default')) {
                $user->subscription('default')->cancelNow();
            }

            $this->syncPlanData($user, 'free', null, null);

            return response()->json([
                'success' => true,
                'message' => 'Downgraded to Free plan successfully.',
                'data' => [
                    'redirect' => $this->frontendPath('/profile')
                ]
            ]);
        }

        $priceId = $this->resolvePriceId($plan, $billing);

        if (! $priceId || $this->hasDuplicatePriceConfiguration()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid subscription configuration. Please verify your Stripe plan price IDs.'
            ], 422);
        }

        $trialDays = (int) Setting::get('free_trial_days', 7);

        if ($user->subscribed('default')) {
            if ($user->subscription('default')->onGracePeriod()) {
                $user->subscription('default')->resume();
            }

            $user->subscription('default')->swap($priceId);
            $this->syncPlanData($user, $plan, $billing, $this->nextExpiry($billing));

            return response()->json([
                'success' => true,
                'message' => 'Subscription updated successfully.',
                'data' => [
                    'redirect' => $this->frontendPath('/profile')
                ]
            ]);
        }

        $checkout = $user->newSubscription('default', $priceId)
            ->trialDays($trialDays)
            ->checkout([
                'success_url' => $this->frontendUrl("/plans?subscription=success&plan={$plan}&billing={$billing}&session_id={CHECKOUT_SESSION_ID}"),
                'cancel_url' => $this->frontendUrl('/plans?subscription=cancelled'),
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'checkout_url' => $checkout->url,
                'plan' => $plan,
                'billing_cycle' => $billing
            ]
        ]);
    }

    public function success(Request $request)
    {
        $user = Auth::user();

        $pendingPlan = $request->query('plan');
        $pendingBilling = $request->query('billing');
        $sessionId = $request->query('session_id');

        if ($sessionId) {
            $this->syncSubscriptionFromStripeCheckoutSession($user, $sessionId);
            $user = $user->fresh();
        } elseif ($user->stripe_id) {
            $this->syncLatestStripeSubscriptionForCustomer($user);
            $user = $user->fresh();
        }

        // Always verify the actual Stripe subscription instead of trusting query params alone.
        $subscription = $user->subscription('default');

        if (! $subscription) {
            return response()->json([
                'success' => false,
                'message' => 'No active Stripe subscription found.',
                'data' => [
                    'redirect' => $this->frontendPath('/plans')
                ]
            ], 422);
        }

        $subscription->loadMissing('items');
        $priceId = optional($subscription->items->first())->stripe_price;

        if (! $priceId) {
            return response()->json([
                'success' => false,
                'message' => 'Could not determine subscription plan from Stripe.',
                'data' => [
                    'redirect' => $this->frontendPath('/plans')
                ]
            ], 422);
        }

        $planMeta = $this->resolvePlanFromPriceId($priceId);

        if (! $planMeta) {
            return response()->json([
                'success' => false,
                'message' => 'Unknown Stripe price mapping for your plan.',
                'data' => [
                    'redirect' => $this->frontendPath('/plans')
                ]
            ], 422);
        }

        if (
            in_array($pendingPlan, ['premium', 'ultimate'], true) &&
            in_array($pendingBilling, ['monthly', 'yearly'], true) &&
            ($planMeta['plan'] !== $pendingPlan || $planMeta['billing'] !== $pendingBilling)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription confirmation did not match the active Stripe plan.',
                'data' => [
                    'redirect' => $this->frontendPath('/plans')
                ]
            ], 422);
        }

        $this->syncPlanData($user, $planMeta['plan'], $planMeta['billing'], $this->nextExpiry($planMeta['billing']));

        return response()->json([
            'success' => true,
            'message' => 'Subscription activated successfully.',
            'data' => [
                'redirect' => $this->frontendPath('/profile')
            ]
        ]);
    }

    public function cancel()
    {
        $user = Auth::user();

        if (! $user->subscribed('default')) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found.'
            ], 422);
        }

        $subscription = $user->subscription('default');

        if ($subscription->onGracePeriod()) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription is already set to cancel.'
            ], 422);
        }

        $subscription->cancel();

        $user->update([
            'plan_expires_at' => $subscription->fresh()->ends_at,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription will be cancelled at the end of billing period.',
            'data' => [
                'plan_expires_at' => $subscription->fresh()->ends_at
            ]
        ]);
    }

    public function resume()
    {
        $user = Auth::user();
        $subscription = $user->subscription('default');

        if (! $subscription) {
            return response()->json([
                'success' => false,
                'message' => 'No subscription found.'
            ], 422);
        }

        if (! $subscription->onGracePeriod()) {
            return response()->json([
                'success' => false,
                'message' => 'Subscription is already active.'
            ], 422);
        }

        $subscription->resume();

        $user->update([
            'plan_expires_at' => $this->nextExpiry($user->billing_cycle),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription resumed successfully.',
            'data' => [
                'plan_expires_at' => $user->plan_expires_at
            ]
        ]);
    }

    private function resolvePriceId(string $plan, string $billing): ?string
    {
        $prices = [
            'premium' => [
                'monthly' => env('STRIPE_PREMIUM_MONTHLY'),
                'yearly' => env('STRIPE_PREMIUM_YEARLY'),
            ],
            'ultimate' => [
                'monthly' => env('STRIPE_ULTIMATE_MONTHLY'),
                'yearly' => env('STRIPE_ULTIMATE_YEARLY'),
            ],
        ];

        return $prices[$plan][$billing] ?? null;
    }

    private function resolvePlanFromPriceId(string $priceId): ?array
    {
        if ($this->hasDuplicatePriceConfiguration()) {
            return null;
        }

        $map = [
            env('STRIPE_PREMIUM_MONTHLY') => ['plan' => 'premium', 'billing' => 'monthly'],
            env('STRIPE_PREMIUM_YEARLY') => ['plan' => 'premium', 'billing' => 'yearly'],
            env('STRIPE_ULTIMATE_MONTHLY') => ['plan' => 'ultimate', 'billing' => 'monthly'],
            env('STRIPE_ULTIMATE_YEARLY') => ['plan' => 'ultimate', 'billing' => 'yearly'],
        ];

        return $map[$priceId] ?? null;
    }

    private function nextExpiry(?string $billing)
    {
        if ($billing === 'yearly') {
            return now()->addYear();
        }

        return now()->addMonth();
    }

    private function syncPlanData($user, string $plan, ?string $billing, $expiresAt): void
    {
        $user->update([
            'plan' => $plan,
            'billing_cycle' => $billing,
            'plan_expires_at' => $expiresAt,
        ]);
    }

    private function hasDuplicatePriceConfiguration(): bool
    {
        $priceIds = array_filter([
            env('STRIPE_PREMIUM_MONTHLY'),
            env('STRIPE_PREMIUM_YEARLY'),
            env('STRIPE_ULTIMATE_MONTHLY'),
            env('STRIPE_ULTIMATE_YEARLY'),
        ]);

        return count($priceIds) !== count(array_unique($priceIds));
    }

    private function syncSubscriptionFromStripeCheckoutSession($user, string $sessionId): void
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $session = StripeCheckoutSession::retrieve([
            'id' => $sessionId,
            'expand' => ['subscription', 'subscription.items.data.price'],
        ]);

        $stripeSubscription = $session->subscription;

        if (is_string($stripeSubscription) && $stripeSubscription !== '') {
            $stripeSubscription = StripeSubscription::retrieve([
                'id' => $stripeSubscription,
                'expand' => ['items.data.price'],
            ]);
        }

        if (! is_object($stripeSubscription) || empty($stripeSubscription->id)) {
            return;
        }

        $user->forceFill([
            'stripe_id' => $session->customer ?: $user->stripe_id,
        ])->save();

        $this->persistStripeSubscription($user, $stripeSubscription);
    }

    private function syncLatestStripeSubscriptionForCustomer($user): void
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $subscriptions = StripeSubscription::all([
            'customer' => $user->stripe_id,
            'status' => 'all',
            'limit' => 10,
            'expand' => ['data.items.data.price'],
        ]);

        $stripeSubscription = collect($subscriptions->data ?? [])
            ->first(function ($subscription) {
                return in_array($subscription->status, ['trialing', 'active'], true);
            });

        if (! $stripeSubscription || empty($stripeSubscription->id)) {
            return;
        }

        $this->persistStripeSubscription($user, $stripeSubscription);
    }

    private function persistStripeSubscription($user, $stripeSubscription): void
    {
        DB::transaction(function () use ($user, $stripeSubscription) {
            $firstItem = $stripeSubscription->items->data[0] ?? null;

            DB::table('subscriptions')->updateOrInsert(
                ['stripe_id' => $stripeSubscription->id],
                [
                    'user_id' => $user->id,
                    'type' => 'default',
                    'stripe_status' => $stripeSubscription->status,
                    'stripe_price' => $firstItem?->price?->id,
                    'quantity' => $firstItem?->quantity,
                    'trial_ends_at' => isset($stripeSubscription->trial_end) && $stripeSubscription->trial_end
                        ? date('Y-m-d H:i:s', $stripeSubscription->trial_end)
                        : null,
                    'ends_at' => isset($stripeSubscription->cancel_at) && $stripeSubscription->cancel_at
                        ? date('Y-m-d H:i:s', $stripeSubscription->cancel_at)
                        : null,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            $localSubscription = DB::table('subscriptions')
                ->where('stripe_id', $stripeSubscription->id)
                ->first();

            if (! $localSubscription) {
                return;
            }

            DB::table('subscription_items')->where('subscription_id', $localSubscription->id)->delete();

            foreach ($stripeSubscription->items->data as $item) {
                DB::table('subscription_items')->insert([
                    'subscription_id' => $localSubscription->id,
                    'stripe_id' => $item->id,
                    'stripe_product' => $item->price?->product ?? '',
                    'stripe_price' => $item->price?->id ?? '',
                    'quantity' => $item->quantity,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });
    }
}
