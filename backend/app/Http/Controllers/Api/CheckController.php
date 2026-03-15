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
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
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
                'redirect' => route('cart.view')
            ], 422);
        }

        // Check if cart needs physical delivery
        $needsAddress = $cart->items->contains(function ($item) {
            return strtolower($item->format) === 'paperback';
        });

        $subtotal = $cart->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        $tax = round($subtotal * 0.05); // 5%

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
                'total' => $total,
                'needs_address' => $needsAddress,
                'discount' => $discount,
                'coupon_code' => $couponCode
            ]
        ]);
    }

    // Process checkout from cart (creates order)
    public function process(Request $request)
    {
        DB::beginTransaction();
        
        try {
            $user = Auth::user();
            
            // Get user's cart with items
            $cart = Cart::with('items.book')->where('user_id', $user->id)->first();
            
            if (!$cart || $cart->items->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your cart is empty',
                    'redirect' => route('cart.view')
                ], 422);
            }

            $addressId = null;
            
            // Validate and save address if paperback exists
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

                // Save address
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

            // Calculate totals
            $subtotal = $cart->items->sum(fn($item) => $item->price * $item->quantity);
            $tax = round($subtotal * 0.05); // 5% tax
            $coupon = session('coupon');

            $discount = $coupon['discount'] ?? 0;
            $couponCode = $coupon['code'] ?? null;

            $total = max(0, $subtotal + $tax - $discount);

            // Create order
            $order = Order::create([
                'user_id'         => $user->id,
                'subtotal'        => $subtotal,
                'tax_amount'      => $tax,
                'discount_amount' => $discount,
                'coupon_code'     => $couponCode,
                'total_amount'    => $total,
                'address_id'      => $addressId,
                'status'          => 'pending',
                'payment_status'  => 'pending',
            ]);

            // Create order items
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
 
            // Clear cart
            $cart->items()->delete();

            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order' => $order,
                    'redirect' => route('payment.page', $order->id)
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

    // Show payment page
    public function paymentPage(Order $order)
    {
        // Check if order belongs to current user
        if ($order->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this order'
            ], 403);
        }

        // Check if order is still pending
        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This order has already been processed.',
                'redirect' => route('orders.show', $order->id)
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order
            ]
        ]);
    }

    // Process payment
    public function processPayment(Request $request, Order $order)
    {
        // Check if order belongs to current user
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

        // Update order with payment method
        $order->update([
            'payment_method' => $method,
        ]);

        $response = [
            'success' => true,
            'data' => [
                'order' => $order,
                'payment_method' => $method
            ]
        ];

        // Handle different payment methods
        if ($method === 'stripe') {
            $response['data']['redirect'] = route('stripe.checkout', $order->id);
        } elseif ($method === 'paypal') {
            $response['data']['redirect'] = route('paypal.pay', $order->id);
        } elseif ($method === 'cod') {
            $order->update([
                'payment_status' => 'pending',
                'status' => 'placed'
            ]);

            event(new OrderPlaced($order->fresh('user')));
            $response['data']['redirect'] = route('orders.success', $order->id);
        }

        return response()->json($response);
    }

    // Buy Now functionality
    public function buyNow(Book $book)
    {
        $user = Auth::user();

        // Calculate totals
        $subtotal = $book->price;
        $tax = round($subtotal * 0.05);
        $total = $subtotal + $tax;

        // Create order
        $order = Order::create([
            'user_id' => $user->id,
            'subtotal' => $subtotal,
            'tax_amount' => $tax,
            'total_amount' => $total,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        // Create order item
        OrderItem::create([
            'order_id' => $order->id,
            'book_id' => $book->id,
            'quantity' => 1,
            'price' => $book->price,
            'format' => 'paperback', // Default format for buy now
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully',
            'data' => [
                'order' => $order,
                'redirect' => route('checkout.address.buynow', $order->id)
            ]
        ]);
    }

    // Show address form for buy now
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
                'redirect' => route('orders.show', $order->id)
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order
            ]
        ]);
    }

    // Store address for buy now order
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

        // Save address
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

        // Update order with address
        $order->update([
            'address_id' => $address->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Address saved successfully',
            'data' => [
                'order' => $order,
                'address' => $address,
                'redirect' => route('payment.page', $order->id)
            ]
        ]);
    }

    public function success(Order $order)
    {
        // Check if order belongs to current user
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