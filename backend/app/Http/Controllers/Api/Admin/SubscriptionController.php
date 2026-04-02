<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'plan' => 'nullable|in:all,free,premium,ultimate',
                'billing_cycle' => 'nullable|in:all,monthly,yearly,none',
                'status' => 'nullable|in:all,free,active,trialing,grace_period,expired,cancelled',
                'page' => 'nullable|integer|min:1',
            ]);

            $latestSubscriptions = DB::table('subscriptions as source')
                ->select('source.user_id', DB::raw('MAX(source.id) as latest_id'))
                ->where('source.type', 'default')
                ->groupBy('source.user_id');

            $baseQuery = User::query()
                ->leftJoinSub($latestSubscriptions, 'latest_subscription', function ($join) {
                    $join->on('users.id', '=', 'latest_subscription.user_id');
                })
                ->leftJoin('subscriptions as subscription', 'subscription.id', '=', 'latest_subscription.latest_id')
                ->select([
                    'users.id',
                    'users.name',
                    'users.email',
                    'users.plan',
                    'users.billing_cycle',
                    'users.plan_expires_at',
                    'users.created_at',
                    'subscription.id as subscription_id',
                    'subscription.stripe_id as stripe_subscription_id',
                    'subscription.stripe_status',
                    'subscription.ends_at as subscription_ends_at',
                    'subscription.trial_ends_at',
                ])
                ->selectRaw("
                    CASE
                        WHEN COALESCE(users.plan, 'free') = 'free' THEN 'free'
                        WHEN subscription.ends_at IS NOT NULL AND subscription.ends_at > NOW() THEN 'grace_period'
                        WHEN subscription.stripe_status = 'trialing' THEN 'trialing'
                        WHEN subscription.stripe_status = 'active' THEN 'active'
                        WHEN users.plan_expires_at IS NOT NULL AND users.plan_expires_at < NOW() THEN 'expired'
                        WHEN subscription.stripe_status IN ('canceled', 'cancelled', 'incomplete_expired', 'unpaid') THEN 'cancelled'
                        ELSE 'active'
                    END as subscription_state
                ");

            if (!empty($validated['search'])) {
                $search = trim($validated['search']);
                $baseQuery->where(function ($query) use ($search) {
                    $query
                        ->where('users.name', 'like', "%{$search}%")
                        ->orWhere('users.email', 'like', "%{$search}%")
                        ->orWhere('subscription.stripe_id', 'like', "%{$search}%");
                });
            }

            if (($validated['plan'] ?? 'all') !== 'all') {
                $baseQuery->where('users.plan', $validated['plan']);
            }

            if (($validated['billing_cycle'] ?? 'all') !== 'all') {
                if ($validated['billing_cycle'] === 'none') {
                    $baseQuery->where(function ($query) {
                        $query->whereNull('users.billing_cycle')->orWhere('users.billing_cycle', '');
                    });
                } else {
                    $baseQuery->where('users.billing_cycle', $validated['billing_cycle']);
                }
            }

            if (($validated['status'] ?? 'all') !== 'all') {
                $baseQuery->having('subscription_state', '=', $validated['status']);
            }

            $summary = [
                'total' => User::count(),
                'paid' => User::whereIn('plan', ['premium', 'ultimate'])->count(),
                'active' => User::query()
                    ->whereIn('plan', ['premium', 'ultimate'])
                    ->where(function ($query) {
                        $query
                            ->whereNull('plan_expires_at')
                            ->orWhere('plan_expires_at', '>', now());
                    })
                    ->count(),
                'grace_period' => DB::table('subscriptions')
                    ->where('type', 'default')
                    ->whereNotNull('ends_at')
                    ->where('ends_at', '>', now())
                    ->count(),
            ];

            $subscriptions = $baseQuery
                ->orderByRaw("CASE WHEN COALESCE(users.plan, 'free') = 'free' THEN 1 ELSE 0 END ASC")
                ->orderByDesc('users.plan_expires_at')
                ->orderBy('users.name')
                ->paginate(12)
                ->through(function ($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'email' => $item->email,
                        'plan' => $item->plan ?: 'free',
                        'billing_cycle' => $item->billing_cycle,
                        'plan_expires_at' => $item->plan_expires_at,
                        'created_at' => $item->created_at,
                        'subscription_state' => $item->subscription_state,
                        'stripe_status' => $item->stripe_status,
                        'stripe_subscription_id' => $item->stripe_subscription_id,
                        'subscription_ends_at' => $item->subscription_ends_at,
                        'trial_ends_at' => $item->trial_ends_at,
                        'can_cancel' => in_array($item->subscription_state, ['active', 'trialing'], true),
                        'can_resume' => $item->subscription_state === 'grace_period',
                        'can_delete' => ($item->plan ?: 'free') !== 'free' || !empty($item->subscription_id),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $subscriptions,
                'meta' => [
                    'summary' => $summary,
                    'filters' => [
                        'search' => $validated['search'] ?? '',
                        'plan' => $validated['plan'] ?? 'all',
                        'billing_cycle' => $validated['billing_cycle'] ?? 'all',
                        'status' => $validated['status'] ?? 'all',
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('SubscriptionController.index: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading subscriptions.'
            ], 500);
        }
    }

    public function cancel(User $user)
    {
        try {
            if (! $user->subscribed('default')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active subscription found for this user.',
                ], 422);
            }

            $subscription = $user->subscription('default');

            if ($subscription->onGracePeriod()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subscription is already set to cancel.',
                ], 422);
            }

            $subscription->cancel();
            $freshSubscription = $subscription->fresh();

            $user->update([
                'plan_expires_at' => $freshSubscription->ends_at,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subscription will be cancelled at the end of the billing period.',
                'data' => [
                    'plan_expires_at' => $freshSubscription->ends_at,
                ],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('SubscriptionController.cancel: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while cancelling the subscription.'
            ], 500);
        }
    }

    public function resume(User $user)
    {
        try {
            $subscription = $user->subscription('default');

            if (! $subscription) {
                return response()->json([
                    'success' => false,
                    'message' => 'No subscription found for this user.',
                ], 422);
            }

            if (! $subscription->onGracePeriod()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subscription is already active.',
                ], 422);
            }

            $subscription->resume();

            $user->update([
                'plan_expires_at' => $user->billing_cycle === 'yearly' ? now()->addYear() : now()->addMonth(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Subscription resumed successfully.',
                'data' => [
                    'plan_expires_at' => $user->plan_expires_at,
                ],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('SubscriptionController.resume: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while resuming the subscription.'
            ], 500);
        }
    }

    public function destroy(User $user)
    {
        try {
            $localSubscriptionIds = DB::table('subscriptions')
                ->where('user_id', $user->id)
                ->pluck('id');

            if ($localSubscriptionIds->isEmpty() && ($user->plan === null || $user->plan === 'free')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No subscription record found for this user.',
                ], 422);
            }

            $subscription = $user->subscription('default');

            if ($subscription) {
                $subscription->cancelNow();
            }

            DB::transaction(function () use ($user, $localSubscriptionIds) {
                if ($localSubscriptionIds->isNotEmpty()) {
                    DB::table('subscription_items')
                        ->whereIn('subscription_id', $localSubscriptionIds)
                        ->delete();

                    DB::table('subscriptions')
                        ->whereIn('id', $localSubscriptionIds)
                        ->delete();
                }

                $user->update([
                    'plan' => 'free',
                    'billing_cycle' => null,
                    'plan_expires_at' => null,
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'Subscription deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('SubscriptionController.destroy: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the subscription.'
            ], 500);
        }
    }
}
