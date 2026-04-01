<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Events\PaymentSuccess;
use App\Events\OrderPlaced;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\UserLibrary;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class StripeController extends Controller
{
    private function frontendUrl(string $path): string
    {
        $base = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

        return $base . '/' . ltrim($path, '/');
    }

    public function checkout(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this order'
            ], 403);
        }

        // Debug: Log the order status
        Log::info('Stripe checkout called for order: ' . $order->id . ' with status: ' . $order->status);

        // Validate that the order exists and is pending
        if ($order->status !== 'pending') {
            Log::error('Order not pending: ' . $order->status);
            return response()->json([
                'success' => false,
                'message' => 'Invalid order or order already processed. Status: ' . $order->status
            ], 400);
        }

        Log::info('Creating Stripe session for order: ' . $order->id);

        Stripe::setApiKey(config('services.stripe.secret'));

        $lineItems = [[
            'price_data' => [
                'currency' => 'inr',
                'product_data' => [
                    'name' => 'Book Purchase',
                    'description' => 'Final amount after coupon & tax',
                ],
                'unit_amount' => $order->total_amount * 100,
            ],
            'quantity' => 1,
        ]];

        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => $lineItems,
            'mode' => 'payment',
            'success_url' => $this->frontendUrl('/checkout/success?provider=stripe&order=' . $order->id . '&session_id={CHECKOUT_SESSION_ID}'),
            'cancel_url' => $this->frontendUrl('/checkout/payment?order=' . $order->id . '&cancelled=1'),
        ]);

        Log::info('Stripe session created: ' . $session->id);

        return response()->json([
            'success' => true,
            'data' => [
                'checkout_url' => $session->url,
                'session_id' => $session->id
            ]
        ]);
    }

    public function success(Request $request, Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this order'
            ], 403);
        }

        if (! $request->query('session_id')) {
            return response()->json([
                'success' => false,
                'message' => 'Missing Stripe session identifier.'
            ], 422);
        }

        $wasPaid = $order->payment_status === 'paid';
        $sessionId = $request->query('session_id');
        $paymentId = $sessionId;

        if ($sessionId) {
            Stripe::setApiKey(config('services.stripe.secret'));
            try {
                $session = Session::retrieve($sessionId);
                $paymentIntentId = $session->payment_intent ?? null;
                if ($paymentIntentId) {
                    $paymentId = $paymentIntentId;
                }
            } catch (\Exception $e) {
                // fallback to session id if retrieval fails
                $paymentId = $sessionId;
            }
        }

        $order->update([
            'payment_status' => 'paid',
            'status' => 'confirmed',
            'payment_id' => $paymentId
        ]);

        // Add books to user library
        $orderItems = OrderItem::where('order_id', $order->id)->get();

        foreach ($orderItems as $item) {
            UserLibrary::firstOrCreate(
                [
                    'user_id' => $order->user_id,
                    'book_id' => $item->book_id,
                    'format'  => $item->format,
                ],
                [
                    'expires_at' => in_array($item->format, ['ebook','audio'])
                        ? now()->addDays(30)
                        : null
                ]
            );
        }

        if (! $wasPaid) {
            event(new PaymentSuccess($order->fresh('user')));
            event(new OrderPlaced($order->fresh('user')));
        }

        return response()->json([
            'success' => true,
            'message' => 'Payment successful',
            'data' => [
                'order' => $order,
                'redirect' => '/checkout/success?order=' . $order->id
            ]
        ]);
    }

    public function cancel()
    {
        return response()->json([
            'success' => false,
            'message' => 'Payment cancelled',
        ], 422);
    }
}
