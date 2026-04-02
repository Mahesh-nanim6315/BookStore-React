<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\CartItem;
use App\Models\Cart;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    /* ================= ADD TO CART ================= */
    public function add(Request $request, Book $book)
    {
        try {
            $request->validate([
                'format' => 'required|in:ebook,audio,paperback',
            ]);

            $format = $request->string('format')->toString();
            $price = $this->resolveBookFormatPrice($book, $format);

            $cart = Cart::firstOrCreate([
                'user_id' => Auth::id(),
            ]);

            $item = CartItem::where('cart_id', $cart->id)
                ->where('book_id', $book->id)
                ->where('format', $format)
                ->first();

            if ($item) {
                if ((float) $item->price !== $price) {
                    $item->update(['price' => $price]);
                }
                $item->increment('quantity');
                $message = ucfirst($format) . ' quantity increased in cart';
            } else {
                CartItem::create([
                    'cart_id' => $cart->id,
                    'book_id' => $book->id,
                    'format'  => $format,
                    'price'   => $price,
                    'quantity'=> 1,
                ]);
                $message = ucfirst($format) . ' added to cart';
            }

            // Get updated cart
            $updatedCart = Cart::with('items.book')
                ->where('user_id', Auth::id())
                ->first();
            $this->syncCartItemPrices($updatedCart);

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'cart' => $updatedCart,
                    'cart_total' => $updatedCart ? $updatedCart->items->sum(fn($i) => $i->price * $i->quantity) : 0,
                    'items_count' => $updatedCart ? $updatedCart->items->count() : 0
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CartController.add: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while adding item to cart.'
            ], 500);
        }
    }

    /* ================= VIEW CART ================= */
    public function view()
    {
        try {
            $cart = Cart::with('items.book')
                ->where('user_id', Auth::id())
                ->first();
            $this->syncCartItemPrices($cart);

            $subtotal = 0;
            $items_count = 0;
            $tax = 0;
            $taxRate = Setting::taxRate();
            
            if ($cart) {
                $subtotal = $cart->items->sum(fn($i) => $i->price * $i->quantity);
                $items_count = $cart->items->count();
                $tax = Setting::calculateTax($subtotal);
            }

            $coupon = session()->get('coupon');
            $discount = $coupon['discount'] ?? 0;
            $total = max(0, $subtotal + $tax - $discount);

            return response()->json([
                'success' => true,
                'data' => [
                    'cart' => $cart,
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'tax_rate' => $taxRate,
                    'items_count' => $items_count,
                    'coupon' => $coupon,
                    'discount' => $discount,
                    'total' => $total
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CartController.view: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while viewing cart.'
            ], 500);
        }
    }

    /* ================= REMOVE ITEM ================= */
    public function remove(CartItem $item)
    {
        try {
            if ((int) optional($item->cart)->user_id !== (int) Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not allowed to remove this cart item.',
                ], 403);
            }

            $item->delete();

            // Get updated cart
            $cart = Cart::with('items.book')
                ->where('user_id', Auth::id())
                ->first();
            $this->syncCartItemPrices($cart);

            return response()->json([
                'success' => true,
                'message' => 'Item removed from cart',
                'data' => [
                    'cart' => $cart,
                    'cart_total' => $cart ? $cart->items->sum(fn($i) => $i->price * $i->quantity) : 0,
                    'items_count' => $cart ? $cart->items->count() : 0
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CartController.remove: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while removing item from cart.'
            ], 500);
        }
    }

    /* ================= UPDATE QTY ================= */
    public function update(Request $request, CartItem $item)
    {
        try {
            if ((int) optional($item->cart)->user_id !== (int) Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not allowed to update this cart item.',
                ], 403);
            }

            $request->validate([
                'action' => 'required|in:increase,decrease',
            ]);

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
            $this->syncCartItemPrices($cart);

            $subtotal = $cart ? $cart->items->sum(fn($i) => $i->price * $i->quantity) : 0;
            $tax = Setting::calculateTax($subtotal);
            $taxRate = Setting::taxRate();
            $coupon = session()->get('coupon');
            $discount = $coupon['discount'] ?? 0;
            $total = max(0, $subtotal + $tax - $discount);

            return response()->json([
                'success' => true,
                'message' => $message ?? 'Cart updated',
                'data' => [
                    'cart' => $cart,
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'tax_rate' => $taxRate,
                    'items_count' => $cart ? $cart->items->count() : 0,
                    'coupon' => $coupon,
                    'discount' => $discount,
                    'total' => $total
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CartController.update: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating cart.'
            ], 500);
        }
    }

    public function applyCoupon(Request $request)
    {
        try {
            $request->validate([
                'code' => 'required|string'
            ]);

            $code = strtoupper($request->code);

            if (!preg_match('/^(SAVE|FLAT)(\d+)$/', $code, $matches)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid coupon code. Try SAVE10, SAVE20, SAVE30, SAVE50, FLAT50, FLAT100, or FLAT200.'
                ], 422);
            }

            $prefix = $matches[1]; // SAVE or FLAT
            $value  = (int) $matches[2];

            $rules = config("coupons.$prefix");

            if (!$rules || !in_array($value, $rules['allowed_values'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'That coupon value is not supported.'
                ], 422);
            }

            $cart = Cart::with('items')->where('user_id', Auth::id())->first();
            $this->syncCartItemPrices($cart);
            
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

                if (isset($rules['max_discount'])) {
                    $discount = min($discount, $rules['max_discount']);
                }
            } else {
                $discount = $value;
            }

            $tax = Setting::calculateTax($subtotal);
            $taxRate = Setting::taxRate();
            $total = max(0, $subtotal + $tax - round($discount));

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
                    'tax' => $tax,
                    'tax_rate' => $taxRate,
                    'discount' => round($discount),
                    'total' => $total
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CartController.applyCoupon: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while applying coupon.'
            ], 500);
        }
    }

    public function removeCoupon()
    {
        try {
            session()->forget('coupon');

            $cart = Cart::with('items')->where('user_id', Auth::id())->first();
            $this->syncCartItemPrices($cart);
            $subtotal = $cart ? $cart->items->sum(fn($i) => $i->price * $i->quantity) : 0;
            $tax = Setting::calculateTax($subtotal);
            $taxRate = Setting::taxRate();
            $total = $subtotal + $tax;

            return response()->json([
                'success' => true,
                'message' => 'Coupon removed',
                'data' => [
                    'subtotal' => $subtotal,
                    'tax' => $tax,
                    'tax_rate' => $taxRate,
                    'total' => $total
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CartController.removeCoupon: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while removing coupon.'
            ], 500);
        }
    }

    private function syncCartItemPrices(?Cart $cart): void
    {
        if (! $cart) {
            return;
        }

        $cart->loadMissing('items.book');

        foreach ($cart->items as $item) {
            if (! $item->book) {
                continue;
            }

            $price = $this->resolveBookFormatPrice($item->book, $item->format);

            if ((float) $item->price !== $price) {
                $item->update(['price' => $price]);
            }
        }
    }

    private function resolveBookFormatPrice(Book $book, string $format): float
    {
        $format = strtolower($format);

        if ($format === 'ebook') {
            if (! $book->has_ebook || $book->ebook_price === null) {
                throw ValidationException::withMessages([
                    'format' => ['This book is not available as an ebook.'],
                ]);
            }

            return (float) $book->ebook_price;
        }

        if ($format === 'audio') {
            if (! $book->has_audio || $book->audio_price === null) {
                throw ValidationException::withMessages([
                    'format' => ['This book is not available as an audio title.'],
                ]);
            }

            return (float) $book->audio_price;
        }

        if (! $book->has_paperback || $book->paperback_price === null) {
            throw ValidationException::withMessages([
                'format' => ['This book is not available as a paperback.'],
            ]);
        }

        if ((int) ($book->stock ?? 0) < 1) {
            throw ValidationException::withMessages([
                'format' => ['This paperback is currently out of stock.'],
            ]);
        }

        return (float) $book->paperback_price;
    }
}
