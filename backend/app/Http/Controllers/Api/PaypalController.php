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
            $response = null;
            $statusCode = 200;

            if ($order->user_id !== Auth::id()) {
                $response = [
                    'success' => false,
                    'message' => 'Unauthorized access to this order'
                ];
                $statusCode = 403;
            } elseif ($order->status !== 'pending') {
                $response = [
                    'success' => false,
                    'message' => 'Invalid order or order already processed.'
                ];
                $statusCode = 422;
            } else {
                $provider = new PayPalClient;
                $provider->setApiCredentials(config('paypal'));
                $provider->getAccessToken();

                $paypalResponse = $provider->createOrder([
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

                if (isset($paypalResponse['links'])) {
                    foreach ($paypalResponse['links'] as $link) {
                        if ($link['rel'] === 'approve') {
                            $response = [
                                'success' => true,
                                'data' => [
                                    'redirect_url' => $link['href']
                                ]
                            ];
                            break;
                        }
                    }
                }

                if ($response === null) {
                    $response = [
                        'success' => false,
                        'message' => 'Unable to initiate PayPal payment'
                    ];
                    $statusCode = 422;
                }
            }

            return response()->json($response, $statusCode);
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
            $payload = null;
            $statusCode = 200;

            if ($order->user_id !== Auth::id()) {
                $payload = [
                    'success' => false,
                    'message' => 'Unauthorized access to this order'
                ];
                $statusCode = 403;
            } elseif (! $request->query('token')) {
                $payload = [
                    'success' => false,
                    'message' => 'Missing PayPal approval token.'
                ];
                $statusCode = 422;
            } else {
                $wasPaid = $order->payment_status === 'paid';
                $response = $this->capturePaypalPaymentOrder($request->token);

                if ($this->isCompletedPaypalPayment($response)) {
                    $order->update([
                        'payment_id' => $response['id'],
                        'payment_status' => 'paid',
                        'status' => 'confirmed'
                    ]);

                    $this->addOrderItemsToUserLibrary($order);
                    $this->dispatchPaypalSuccessEvents($order, $wasPaid);

                    $payload = [
                        'success' => true,
                        'message' => 'Payment completed successfully',
                        'data' => [
                            'order' => $order,
                            'redirect' => '/checkout/success'
                        ]
                    ];
                } else {
                    $payload = [
                        'success' => false,
                        'message' => 'Payment not completed',
                        'data' => [
                            'redirect' => '/checkout/payment'
                        ]
                    ];
                    $statusCode = 422;
                }
            }

            return response()->json($payload, $statusCode);
            } catch (\Throwable $e) {
                $this->logRequestErrorAuto($e);

                return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing PayPal payment.'
            ], 500);
        }
    }

    private function capturePaypalPaymentOrder(string $token): array
    {
        $provider = new PayPalClient;
        $provider->setApiCredentials(config('paypal'));
        $provider->getAccessToken();

        return $provider->capturePaymentOrder($token);
    }

    private function isCompletedPaypalPayment(array $response): bool
    {
        return isset($response['status']) && $response['status'] === 'COMPLETED';
    }

    private function addOrderItemsToUserLibrary(Order $order): void
    {
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
    }

    private function dispatchPaypalSuccessEvents(Order $order, bool $wasPaid): void
    {
        if (! $wasPaid) {
            event(new PaymentSuccess($order->fresh('user')));
            event(new OrderPlaced($order->fresh('user')));
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
