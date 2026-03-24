<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderPlaced;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Address;
use App\Models\Book;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    private function frontendPath(string $path): string
    {
        return '/' . ltrim($path, '/');
    }

    private function backendUrl(Request $request, string $path): string
    {
        return rtrim($request->getSchemeAndHttpHost(), '/') . '/' . ltrim($path, '/');
    }

    // Show checkout address form
    public function index()
    {
        $cart = Cart::where('user_id', Auth::id())
            ->with('items.book')
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Your cart is empty',
                'redirect' => $this->frontendPath('/cart')
            ], 422);
        }

        $needsAddress = $cart->items->contains(function ($item) {
            return strtolower($item->format) === 'paperback';
        });

        $subtotal = $cart->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        $tax = Setting::calculateTax($subtotal);
        $taxRate = Setting::taxRate();
        $coupon = session('coupon');
        $discount = $coupon['discount'] ?? 0;
        $couponCode = $coupon['code'] ?? null;
        $total = max(0, $subtotal + $tax - $discount);

        return response()->json([
            'success' => true,
            'data' => [
                'cart' => $cart,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'tax_rate' => $taxRate,
                'total' => $total,
                'needs_address' => $needsAddress,
                'discount' => $discount,
                'coupon_code' => $couponCode
            ]
        ]);
    }

    public function process(Request $request)
    {
        DB::beginTransaction();

        try {
            $user = Auth::user();
            $cart = Cart::with('items.book')->where('user_id', $user->id)->first();

            if (!$cart || $cart->items->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your cart is empty',
                    'redirect' => $this->frontendPath('/cart')
                ], 422);
            }

            $addressId = null;

            if ($cart->items->contains('format', 'paperback')) {
                $request->validate([
                    'full_name' => 'required|string|max:255',
                    'phone' => 'required|string|max:20',
                    'address_line' => 'required|string',
                    'city' => 'required|string|max:100',
                    'state' => 'required|string|max:100',
                    'pincode' => 'required|string|max:10',
                    'country' => 'sometimes|string|max:100'
                ]);

                $address = Address::create([
                    'user_id' => $user->id,
                    'full_name' => $request->full_name,
                    'phone' => $request->phone,
                    'address_line' => $request->address_line,
                    'city' => $request->city,
                    'state' => $request->state,
                    'pincode' => $request->pincode,
                    'country' => $request->country ?? 'India',
                ]);

                $addressId = $address->id;
            }

            $subtotal = $cart->items->sum(fn($item) => $item->price * $item->quantity);
            $tax = Setting::calculateTax($subtotal);
            $coupon = session('coupon');
            $discount = $coupon['discount'] ?? 0;
            $couponCode = $coupon['code'] ?? null;
            $total = max(0, $subtotal + $tax - $discount);

            $order = Order::create([
                'user_id' => $user->id,
                'subtotal' => $subtotal,
                'tax_amount' => $tax,
                'discount_amount' => $discount,
                'coupon_code' => $couponCode,
                'total_amount' => $total,
                'address_id' => $addressId,
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);

            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'book_id' => $item->book_id,
                    'format' => $item->format,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                ]);
            }

            session()->forget('coupon');
            $cart->items()->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order' => $order,
                    'redirect' => $this->frontendPath('/checkout/payment')
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Checkout failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function paymentPage(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this order'
            ], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This order has already been processed.',
                'redirect' => $this->frontendPath("/orders/{$order->id}")
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order
            ]
        ]);
    }

    public function processPayment(Request $request, Order $order)
    {
        Log::info('Process payment called for order: ' . $order->id . ' with status: ' . $order->status);

        if ($order->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this order'
            ], 403);
        }

        $request->validate([
            'payment_method' => 'required|in:stripe,paypal,cod',
        ]);

        $method = $request->payment_method;

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This order has already been processed.'
            ], 422);
        }

        Log::info('Payment method: ' . $method);

        $order->update([
            'payment_method' => $method,
        ]);

        Log::info('Order updated with payment method: ' . $method);

        $response = [
            'success' => true,
            'data' => [
                'order' => $order,
                'payment_method' => $method
            ]
        ];

        if ($method === 'stripe') {
            $response['data']['provider'] = 'stripe';
        } elseif ($method === 'paypal') {
            $response['data']['provider'] = 'paypal';
        } elseif ($method === 'cod') {
            $order->update([
                'payment_status' => 'pending',
                'status' => 'placed'
            ]);

            event(new OrderPlaced($order->fresh('user')));
            $response['data']['redirect'] = $this->frontendPath('/checkout/success?order=' . $order->id);
        }

        Log::info('Payment response: ' . json_encode($response));

        return response()->json($response);
    }

    public function buyNow(Book $book)
    {
        $user = Auth::user();
        $subtotal = $book->price;
        $tax = Setting::calculateTax($subtotal);
        $total = $subtotal + $tax;

        $order = Order::create([
            'user_id' => $user->id,
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'total_amount' => $total,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'book_id' => $book->id,
            'quantity' => 1,
            'price' => $book->price,
            'format' => 'paperback',
        ]);

        return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order' => $order,
                    'redirect' => $this->frontendPath('/checkout')
                ]
            ]);
    }

    public function addressBuyNow(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be modified',
                'redirect' => $this->frontendPath("/orders/{$order->id}")
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order
            ]
        ]);
    }

    public function storeBuyNowAddress(Request $request, Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $request->validate([
            'full_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address_line' => 'required|string',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'pincode' => 'required|string|max:10',
            'country' => 'sometimes|string|max:100'
        ]);

        $address = Address::create([
            'user_id' => Auth::id(),
            'full_name' => $request->full_name,
            'phone' => $request->phone,
            'address_line' => $request->address_line,
            'city' => $request->city,
            'state' => $request->state,
            'pincode' => $request->pincode,
            'country' => $request->country ?? 'India',
        ]);

        $order->update([
            'address_id' => $address->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Address saved successfully',
            'data' => [
                'order' => $order,
                'address' => $address,
                'redirect' => $this->frontendPath('/checkout/payment')
            ]
        ]);
    }

    public function success(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $order->load('items.book');

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order
            ]
        ]);
    }
}
