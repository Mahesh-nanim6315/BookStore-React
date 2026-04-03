<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    private const PLANS_PATH = '/plans';
    private const PROFILE_PATH = '/profile';
    private const OPERATION_FAILED_MESSAGE = 'Operation failed';

    public function __construct(
        private readonly SubscriptionService $subscriptionService,
    ) {
    }

    public function index()
    {
        try {
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
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => self::OPERATION_FAILED_MESSAGE,
            ], 500);
        }
    }

    public function checkout(Request $request)
    {
        try {
            $data = $request->validate([
                'plan' => 'required|in:free,premium,ultimate',
                'billing_cycle' => 'required|in:monthly,yearly',
                'redirect_path' => 'nullable|string|max:255',
            ]);

            $user = Auth::user();
            $plan = $data['plan'];
            $billing = $data['billing_cycle'];
            $redirectPath = $this->subscriptionService->resolveRedirectPath($data['redirect_path'] ?? self::PLANS_PATH, self::PLANS_PATH);
            [$payload, $statusCode] = $this->validateCheckoutRequest($user, $plan, $billing);

            if ($payload === null) {
                [$payload, $statusCode] = $plan === 'free'
                    ? $this->handleFreeCheckout($user, $redirectPath)
                    : $this->handlePaidCheckout($user, $plan, $billing, $redirectPath);
            }

            return response()->json($payload, $statusCode);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => self::OPERATION_FAILED_MESSAGE,
            ], 500);
        }
    }

    private function validateCheckoutRequest($user, string $plan, string $billing): array
    {
        if (! (bool) Setting::get('subscriptions_enabled', 1) && $plan !== 'free') {
            return [[
                'success' => false,
                'message' => 'Subscriptions are currently disabled.'
            ], 403];
        }

        if ($user->plan === $plan && $user->billing_cycle === $billing && ! $user->subscription('default')?->onGracePeriod()) {
            return [[
                'success' => false,
                'message' => 'You are already on this plan.'
            ], 422];
        }

        return [null, 200];
    }

    private function handleFreeCheckout($user, string $redirectPath): array
    {
        if ($user->subscribed('default')) {
            $user->subscription('default')->cancelNow();
        }

        $this->subscriptionService->syncPlanData($user, 'free', null, null);

        return [[
            'success' => true,
            'message' => 'Downgraded to Free plan successfully.',
            'data' => [
                'redirect' => $redirectPath
            ]
        ], 200];
    }

    private function handlePaidCheckout($user, string $plan, string $billing, string $redirectPath): array
    {
        $priceId = $this->subscriptionService->resolvePriceId($plan, $billing);

        if (! $priceId || $this->subscriptionService->hasDuplicatePriceConfiguration()) {
            return [[
                'success' => false,
                'message' => 'Invalid subscription configuration. Please verify your Stripe plan price IDs.'
            ], 422];
        }

        if ($user->subscribed('default')) {
            return $this->handleExistingPaidSubscriptionCheckout($user, $plan, $billing, $priceId, $redirectPath);
        }

        return $this->handleNewPaidSubscriptionCheckout($user, $plan, $billing, $priceId, $redirectPath);
    }

    private function handleExistingPaidSubscriptionCheckout($user, string $plan, string $billing, string $priceId, string $redirectPath): array
    {
        if ($user->subscription('default')->onGracePeriod()) {
            $user->subscription('default')->resume();
        }

        $user->subscription('default')->swap($priceId);
        $this->subscriptionService->syncPlanData($user, $plan, $billing, $this->subscriptionService->nextExpiry($billing));

        return [[
            'success' => true,
            'message' => 'Subscription updated successfully.',
            'data' => [
                'redirect' => $redirectPath
            ]
        ], 200];
    }

    private function handleNewPaidSubscriptionCheckout($user, string $plan, string $billing, string $priceId, string $redirectPath): array
    {
        $trialDays = (int) Setting::get('free_trial_days', 7);

        $checkout = $user->newSubscription('default', $priceId)
            ->trialDays($trialDays)
            ->checkout([
                'success_url' => $this->subscriptionService->frontendUrl($this->subscriptionService->appendQueryToPath($redirectPath, [
                    'subscription' => 'success',
                    'plan' => $plan,
                    'billing' => $billing,
                    'session_id' => '{CHECKOUT_SESSION_ID}',
                ])),
                'cancel_url' => $this->subscriptionService->frontendUrl($this->subscriptionService->appendQueryToPath($redirectPath, [
                    'subscription' => 'cancelled',
                ])),
            ]);

        return [[
            'success' => true,
            'data' => [
                'checkout_url' => $checkout->url,
                'plan' => $plan,
                'billing_cycle' => $billing
            ]
        ], 200];
    }

    public function success(Request $request)
    {
        try {
            $user = Auth::user();
            $payload = null;
            $statusCode = 200;

            $pendingPlan = $request->query('plan');
            $pendingBilling = $request->query('billing');
            $sessionId = $request->query('session_id');

            if ($sessionId) {
                $this->subscriptionService->syncSubscriptionFromStripeCheckoutSession($user, $sessionId);
                $user = $user->fresh();
            } elseif ($user->stripe_id) {
                $this->subscriptionService->syncLatestStripeSubscriptionForCustomer($user);
                $user = $user->fresh();
            }

            // Always verify the actual Stripe subscription instead of trusting query params alone.
            $subscription = $user->subscription('default');

            if (! $subscription) {
                $payload = [
                    'success' => false,
                    'message' => 'No active Stripe subscription found.',
                    'data' => [
                        'redirect' => $this->subscriptionService->frontendPath(self::PLANS_PATH)
                    ]
                ];
                $statusCode = 422;
            } else {
                $subscription->loadMissing('items');
                $priceId = optional($subscription->items->first())->stripe_price;

                if (! $priceId) {
                    $payload = [
                        'success' => false,
                        'message' => 'Could not determine subscription plan from Stripe.',
                        'data' => [
                            'redirect' => $this->subscriptionService->frontendPath(self::PLANS_PATH)
                        ]
                    ];
                    $statusCode = 422;
                } else {
                    $planMeta = $this->subscriptionService->resolvePlanFromPriceId($priceId);

                    if (! $planMeta) {
                        $payload = [
                            'success' => false,
                            'message' => 'Unknown Stripe price mapping for your plan.',
                            'data' => [
                                'redirect' => $this->subscriptionService->frontendPath(self::PLANS_PATH)
                            ]
                        ];
                        $statusCode = 422;
                    } elseif (
                        in_array($pendingPlan, ['premium', 'ultimate'], true) &&
                        in_array($pendingBilling, ['monthly', 'yearly'], true) &&
                        ($planMeta['plan'] !== $pendingPlan || $planMeta['billing'] !== $pendingBilling)
                    ) {
                        $payload = [
                            'success' => false,
                            'message' => 'Subscription confirmation did not match the active Stripe plan.',
                            'data' => [
                                'redirect' => $this->subscriptionService->frontendPath(self::PLANS_PATH)
                            ]
                        ];
                        $statusCode = 422;
                    } else {
                        $this->subscriptionService->syncPlanData($user, $planMeta['plan'], $planMeta['billing'], $this->subscriptionService->nextExpiry($planMeta['billing']));

                        $payload = [
                            'success' => true,
                            'message' => 'Subscription activated successfully.',
                            'data' => [
                                'redirect' => $this->subscriptionService->frontendPath(self::PROFILE_PATH)
                            ]
                        ];
                    }
                }
            }

            return response()->json($payload, $statusCode);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => self::OPERATION_FAILED_MESSAGE,
            ], 500);
        }
    }

    public function cancel()
    {
        try {
            $user = Auth::user();
            $payload = null;
            $statusCode = 200;

            if (! $user->subscribed('default')) {
                $payload = [
                    'success' => false,
                    'message' => 'No active subscription found.'
                ];
                $statusCode = 422;
            } else {
                $subscription = $user->subscription('default');

                if ($subscription->onGracePeriod()) {
                    $payload = [
                        'success' => false,
                        'message' => 'Subscription is already set to cancel.'
                    ];
                    $statusCode = 422;
                } else {
                    $subscription->cancel();

                    $user->update([
                        'plan_expires_at' => $subscription->fresh()->ends_at,
                    ]);

                    $payload = [
                        'success' => true,
                        'message' => 'Subscription will be cancelled at the end of billing period.',
                        'data' => [
                            'plan_expires_at' => $subscription->fresh()->ends_at
                        ]
                    ];
                }
            }

            return response()->json($payload, $statusCode);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => self::OPERATION_FAILED_MESSAGE,
            ], 500);
        }
    }

    public function resume()
    {
        try {
            $user = Auth::user();
            $subscription = $user->subscription('default');
            $payload = null;
            $statusCode = 200;

            if (! $subscription) {
                $payload = [
                    'success' => false,
                    'message' => 'No subscription found.'
                ];
                $statusCode = 422;
            } elseif (! $subscription->onGracePeriod()) {
                $payload = [
                    'success' => false,
                    'message' => 'Subscription is already active.'
                ];
                $statusCode = 422;
            } else {
                $subscription->resume();

                $user->update([
                        'plan_expires_at' => $this->subscriptionService->nextExpiry($user->billing_cycle),
                ]);

                $payload = [
                    'success' => true,
                    'message' => 'Subscription resumed successfully.',
                    'data' => [
                        'plan_expires_at' => $user->plan_expires_at
                    ]
                ];
            }

            return response()->json($payload, $statusCode);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => self::OPERATION_FAILED_MESSAGE,
            ], 500);
        }
    }

}
