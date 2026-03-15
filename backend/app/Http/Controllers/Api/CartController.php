<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Cart;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /* ================= ADD TO CART ================= */
    public function add(Request $request, Book $book)
    {
        $request->validate([
            'format' => 'required|in:ebook,audio,paperback',
            'price'  => 'required|numeric|min:0',
        ]);

        $cart = Cart::firstOrCreate([
            'user_id' => Auth::id(),
        ]);

        $item = CartItem::where('cart_id', $cart->id)
            ->where('book_id', $book->id)
            ->where('format', $request->format)
            ->first();

        if ($item) {
            $item->increment('quantity');
            $message = ucfirst($request->format) . ' quantity increased in cart';
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'book_id' => $book->id,
                'format'  => $request->format,
                'price'   => $request->price,
                'quantity'=> 1,
            ]);
            $message = ucfirst($request->format) . ' added to cart';
        }

        // Get updated cart
        $updatedCart = Cart::with('items.book')
            ->where('user_id', Auth::id())
            ->first();

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'cart' => $updatedCart,
                'cart_total' => $updatedCart ? $updatedCart->items->sum(fn($i) => $i->price * $i->quantity) : 0,
                'items_count' => $updatedCart ? $updatedCart->items->count() : 0
            ]
        ]);
    }

    /* ================= VIEW CART ================= */
    public function view()
    {
        $cart = Cart::with('items.book')
            ->where('user_id', Auth::id())
            ->first();

        $subtotal = 0;
        $items_count = 0;
        
        if ($cart) {
            $subtotal = $cart->items->sum(fn($i) => $i->price * $i->quantity);
            $items_count = $cart->items->count();
        }

        // Get applied coupon from session
        $coupon = session()->get('coupon');

        return response()->json([
            'success' => true,
            'data' => [
                'cart' => $cart,
                'subtotal' => $subtotal,
                'items_count' => $items_count,
                'coupon' => $coupon,
                'discount' => $coupon['discount'] ?? 0,
                'total' => $subtotal - ($coupon['discount'] ?? 0)
            ]
        ]);
    }

    /* ================= REMOVE ITEM ================= */
    public function remove(CartItem $item)
    {
        $item->delete();

        // Get updated cart
        $cart = Cart::with('items.book')
            ->where('user_id', Auth::id())
            ->first();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart',
            'data' => [
                'cart' => $cart,
                'cart_total' => $cart ? $cart->items->sum(fn($i) => $i->price * $i->quantity) : 0,
                'items_count' => $cart ? $cart->items->count() : 0
            ]
        ]);
    }

    /* ================= UPDATE QTY ================= */
    public function update(Request $request, CartItem $item)
    {
        if ($request->action === 'increase') {
            $item->increment('quantity');
            $message = 'Quantity increased';
        }

        if ($request->action === 'decrease') {
            $item->decrement('quantity');
            $message = 'Quantity decreased';
        }

        if ($item->quantity <= 0) {
            $item->delete();
            $message = 'Item removed from cart';
        }

        // Get updated cart
        $cart = Cart::with('items.book')
            ->where('user_id', Auth::id())
            ->first();

        $subtotal = $cart ? $cart->items->sum(fn($i) => $i->price * $i->quantity) : 0;
        $coupon = session()->get('coupon');

        return response()->json([
            'success' => true,
            'message' => $message ?? 'Cart updated',
            'data' => [
                'cart' => $cart,
                'subtotal' => $subtotal,
                'items_count' => $cart ? $cart->items->count() : 0,
                'coupon' => $coupon,
                'discount' => $coupon['discount'] ?? 0,
                'total' => $subtotal - ($coupon['discount'] ?? 0)
            ]
        ]);
    }

    public function applyCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $code = strtoupper($request->code);

        // Match SAVE50, SAVE20, FLAT100 etc
        if (!preg_match('/^(SAVE|FLAT)(\d+)$/', $code, $matches)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon code'
            ], 422);
        }

        $prefix = $matches[1]; // SAVE or FLAT
        $value  = (int) $matches[2];

        $rules = config("coupons.$prefix");

        if (!$rules || !in_array($value, $rules['allowed_values'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid coupon value'
            ], 422);
        }

        $cart = Cart::with('items')->where('user_id', Auth::id())->first();
        
        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart is empty'
            ], 422);
        }
        
        $subtotal = $cart->items->sum(fn($i) => $i->price * $i->quantity);

        if ($subtotal <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cart is empty'
            ], 422);
        }

        if ($rules['type'] === 'percentage') {
            $discount = ($subtotal * $value) / 100;

            // apply max cap if exists
            if (isset($rules['max_discount'])) {
                $discount = min($discount, $rules['max_discount']);
            }
        } else {
            $discount = $value;
        }

        $couponData = [
            'code' => $code,
            'type' => $rules['type'],
            'value' => $value,
            'discount' => round($discount),
        ];

        session(['coupon' => $couponData]);

        return response()->json([
            'success' => true,
            'message' => "Coupon {$code} applied successfully",
            'data' => [
                'coupon' => $couponData,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $subtotal - $discount
            ]
        ]);
    }

    public function removeCoupon()
    {
        session()->forget('coupon');

        $cart = Cart::with('items')->where('user_id', Auth::id())->first();
        $subtotal = $cart ? $cart->items->sum(fn($i) => $i->price * $i->quantity) : 0;

        return response()->json([
            'success' => true,
            'message' => 'Coupon removed',
            'data' => [
                'subtotal' => $subtotal,
                'total' => $subtotal
            ]
        ]);
    }
}