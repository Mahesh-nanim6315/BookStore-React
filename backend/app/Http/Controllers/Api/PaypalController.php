<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Srmklive\PayPal\Services\PayPal as PayPalClient;
use App\Models\Order;
use Illuminate\Http\Request;
use App\Events\OrderPlaced;
use App\Events\PaymentSuccess;

class PayPalController extends Controller
{
    public function pay(Order $order)
    {
        $provider = new PayPalClient;
        $provider->setApiCredentials(config('paypal'));
        $provider->getAccessToken();

        $response = $provider->createOrder([
            "intent" => "CAPTURE",
            "application_context" => [
                "return_url" => route('paypal.success', $order->id),
                "cancel_url" => route('paypal.cancel', $order->id),
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
    }

    public function success(Request $request, Order $order)
    {
        $wasPaid = $order->payment_status === 'paid';

        $provider = new PayPalClient;
        $provider->setApiCredentials(config('paypal'));
        $provider->getAccessToken();

        $response = $provider->capturePaymentOrder($request->token);

        if (isset($response['status']) && $response['status'] === 'COMPLETED') {
            $order->update([
                'payment_id' => $response['id'],
                'payment_status' => 'paid',
                'status' => 'completed'
            ]);

            if (! $wasPaid) {
                event(new PaymentSuccess($order->fresh('user')));
                event(new OrderPlaced($order->fresh('user')));
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment completed successfully',
                'data' => [
                    'order' => $order,
                    'redirect' => route('orders.success', $order->id)
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Payment not completed',
            'data' => [
                'redirect' => route('payment.page', $order->id)
            ]
        ], 422);
    }

    public function cancel(Order $order)
    {
        return response()->json([
            'success' => false,
            'message' => 'Payment cancelled',
            'data' => [
                'redirect' => route('payment.page', $order->id)
            ]
        ], 422);
    }
}