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
        $this->logRequestStart($request, 'process');

        try {
            [$result, $executionTime] = $this->measureExecutionTime(function () use ($request, $order) {
                $request->validate([
                    'payment_method' => 'required|in:stripe,paypal,cod'
                ]);

                $response = null;
                $statusCode = 200;

                if ((int) $order->user_id !== (int) Auth::id()) {
                    $response = [
                        'success' => false,
                        'message' => 'Unauthorized access to this order'
                    ];
                    $statusCode = 403;
                } elseif ($order->status !== 'pending') {
                    $response = [
                        'success' => false,
                        'message' => 'This order has already been processed.'
                    ];
                    $statusCode = 422;
                } else {
                    // Save selected method
                    $order->update([
                        'payment_method' => $request->payment_method
                    ]);

                    switch ($request->payment_method) {
                        case 'stripe':
                            $response = [
                                'success' => true,
                                'data' => [
                                    'checkout_url' => url('/api/v1/payments/stripe/checkout/' . $order->id)
                                ]
                            ];
                            break;

                        case 'paypal':
                            $response = [
                                'success' => true,
                                'data' => [
                                    'redirect' => url('/api/v1/payments/paypal/' . $order->id . '/pay')
                                ]
                            ];
                            break;

                        case 'cod':
                            $order->update([
                                'payment_status' => 'pending',
                                'status' => 'placed'
                            ]);

                            $response = [
                                'success' => true,
                                'message' => 'Order placed successfully',
                                'data' => [
                                    'order' => $order,
                                    'redirect' => $this->frontendPath("/orders/{$order->id}")
                                ]
                            ];
                            break;

                        default:
                            $response = [
                                'success' => false,
                                'message' => 'Invalid payment method'
                            ];
                            $statusCode = 422;
                            break;
                    }
                }

                return response()->json($response, $statusCode);
            });

            $this->logRequestSuccess('process', [
                'order_id' => $order->id,
                'payment_method' => $request->payment_method,
                'user_id' => Auth::id()
            ], $executionTime);

            $this->logBusinessOperation('Payment method selected', [
                'order_id' => $order->id,
                'payment_method' => $request->payment_method,
                'user_id' => Auth::id()
            ]);

            return $result;
        } catch (\Throwable $e) {
            $this->logRequestError('process', $e, [
                'order_id' => $order->id,
                'payment_method' => $request->payment_method ?? null,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing payment.'
            ], 500);
        }
    }
}
