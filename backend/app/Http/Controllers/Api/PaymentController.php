<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function process(Request $request, Order $order)
    {
        $request->validate([
            'payment_method' => 'required'
        ]);

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
                        'redirect' => route('orders.success', $order->id)
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