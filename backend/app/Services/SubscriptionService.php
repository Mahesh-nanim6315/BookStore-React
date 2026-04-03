<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Stripe\Checkout\Session as StripeCheckoutSession;
use Stripe\Stripe;
use Stripe\Subscription as StripeSubscription;

class SubscriptionService
{
    private const CHECKOUT_SESSION_ID_PLACEHOLDER = '{CHECKOUT_SESSION_ID}';

    public function frontendUrl(string $path): string
    {
        $base = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

        return $base . '/' . ltrim($path, '/');
    }

    public function frontendPath(string $path): string
    {
        return '/' . ltrim($path, '/');
    }

    public function resolveRedirectPath(?string $path, string $fallback): string
    {
        if (! is_string($path) || $path === '') {
            return $this->frontendPath($fallback);
        }

        $normalized = '/' . ltrim($path, '/');

        if (
            str_starts_with($normalized, '//') ||
            str_contains($normalized, '://') ||
            ! str_starts_with($normalized, '/')
        ) {
            return $this->frontendPath($fallback);
        }

        return $normalized;
    }

    public function appendQueryToPath(string $path, array $query): string
    {
        $separator = str_contains($path, '?') ? '&' : '?';

        $queryString = http_build_query($query);
        $queryString = str_replace(
            rawurlencode(self::CHECKOUT_SESSION_ID_PLACEHOLDER),
            self::CHECKOUT_SESSION_ID_PLACEHOLDER,
            $queryString
        );

        return $path . $separator . $queryString;
    }

    public function resolvePriceId(string $plan, string $billing): ?string
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

    public function resolvePlanFromPriceId(string $priceId): ?array
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

    public function nextExpiry(?string $billing)
    {
        if ($billing === 'yearly') {
            return now()->addYear();
        }

        return now()->addMonth();
    }

    public function syncPlanData($user, string $plan, ?string $billing, $expiresAt): void
    {
        $user->update([
            'plan' => $plan,
            'billing_cycle' => $billing,
            'plan_expires_at' => $expiresAt,
        ]);
    }

    public function hasDuplicatePriceConfiguration(): bool
    {
        $priceIds = array_filter([
            env('STRIPE_PREMIUM_MONTHLY'),
            env('STRIPE_PREMIUM_YEARLY'),
            env('STRIPE_ULTIMATE_MONTHLY'),
            env('STRIPE_ULTIMATE_YEARLY'),
        ]);

        return count($priceIds) !== count(array_unique($priceIds));
    }

    public function syncSubscriptionFromStripeCheckoutSession($user, string $sessionId): void
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

    public function syncLatestStripeSubscriptionForCustomer($user): void
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
