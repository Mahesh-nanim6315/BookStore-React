<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    private function frontendPath(string $path): string
    {
        return '/' . ltrim($path, '/');
    }

    public function process(Request $request, Order $order)
    {
        $request->validate([
            'payment_method' => 'required|in:stripe,paypal,cod'
        ]);

        if ((int) $order->user_id !== (int) Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this order'
            ], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This order has already been processed.'
            ], 422);
        }

        // Save selected method
        $order->update([
            'payment_method' => $request->payment_method
        ]);

        switch ($request->payment_method) {

            case 'stripe':
                return response()->json([
                    'success' => true,
                    'data' => [
                        'checkout_url' => url('/api/v1/payments/stripe/checkout/' . $order->id)
                    ]
                ]);

            case 'paypal':
                return response()->json([
                    'success' => true,
                    'data' => [
                        'redirect' => url('/api/v1/payments/paypal/' . $order->id . '/pay')
                    ]
                ]);

            case 'cod':
                $order->update([
                    'payment_status' => 'pending',
                    'status' => 'placed'
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Order placed successfully',
                    'data' => [
                        'order' => $order,
                        'redirect' => $this->frontendPath("/orders/{$order->id}")
                    ]
                ]);

            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid payment method'
                ], 422);
        }
    }
}
