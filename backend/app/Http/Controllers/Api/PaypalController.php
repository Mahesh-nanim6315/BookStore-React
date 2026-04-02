<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Srmklive\PayPal\Services\PayPal as PayPalClient;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\UserLibrary;
use Illuminate\Http\Request;
use App\Events\OrderPlaced;
use App\Events\PaymentSuccess;
use Illuminate\Support\Facades\Auth;

class PayPalController extends Controller
{
    private function frontendUrl(string $path): string
    {
        $base = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

        return $base . '/' . ltrim($path, '/');
    }

    public function pay(Order $order)
    {
        try {
            if ($order->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this order'
                ], 403);
            }

            if ($order->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid order or order already processed.'
                ], 422);
            }

            $provider = new PayPalClient;
            $provider->setApiCredentials(config('paypal'));
            $provider->getAccessToken();

            $response = $provider->createOrder([
                "intent" => "CAPTURE",
                "application_context" => [
                    "return_url" => $this->frontendUrl("/checkout/success?provider=paypal&order={$order->id}"),
                    "cancel_url" => $this->frontendUrl("/checkout/payment?order={$order->id}&cancelled=1"),
                ],
                "purchase_units" => [
                    [
                        "amount" => [
                            "currency_code" => "USD",
                            "value" => number_format($order->total_amount, 2, '.', '')
                        ]
                    ]
                ]
            ]);

            if (isset($response['links'])) {
                foreach ($response['links'] as $link) {
                    if ($link['rel'] === 'approve') {
                        return response()->json([
                            'success' => true,
                            'data' => [
                                'redirect_url' => $link['href']
                            ]
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Unable to initiate PayPal payment'
            ], 422);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while initiating PayPal payment.'
            ], 500);
        }
    }

    public function success(Request $request, Order $order)
    {
        try {
            if ($order->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this order'
                ], 403);
            }

            if (! $request->query('token')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Missing PayPal approval token.'
                ], 422);
            }

            $wasPaid = $order->payment_status === 'paid';

            $provider = new PayPalClient;
            $provider->setApiCredentials(config('paypal'));
            $provider->getAccessToken();

            $response = $provider->capturePaymentOrder($request->token);

            if (isset($response['status']) && $response['status'] === 'COMPLETED') {
                $order->update([
                    'payment_id' => $response['id'],
                    'payment_status' => 'paid',
                    'status' => 'confirmed'
                ]);

                $orderItems = OrderItem::where('order_id', $order->id)->get();

                foreach ($orderItems as $item) {
                    UserLibrary::firstOrCreate(
                        [
                            'user_id' => $order->user_id,
                            'book_id' => $item->book_id,
                            'format'  => $item->format,
                        ],
                        [
                            'expires_at' => in_array($item->format, ['ebook', 'audio'], true)
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
                    'message' => 'Payment completed successfully',
                    'data' => [
                        'order' => $order,
                        'redirect' => '/checkout/success'
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment not completed',
                'data' => [
                    'redirect' => '/checkout/payment'
                ]
            ], 422);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing PayPal payment.'
            ], 500);
        }
    }

    public function cancel(Order $order)
    {
        try {
            return response()->json([
                'success' => false,
                'message' => 'Payment cancelled',
                'data' => [
                    'redirect' => '/checkout/payment'
                ]
            ], 422);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while cancelling payment.'
            ], 500);
        }
    }
}
