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
use Illuminate\Validation\ValidationException;

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
        try {
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

            $this->syncCartItemPrices($cart);

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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CheckoutController.index: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading checkout.'
            ], 500);
        }
    }

    public function process(Request $request)
    {
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

            $this->syncCartItemPrices($cart);

            $order = DB::transaction(function () use ($request, $user, $cart) {
                $addressId = null;

                if ($cart->items->contains('format', 'paperback')) {
                    $validatedAddress = $this->validateAddress($request);

                    $address = Address::create([
                        'user_id' => $user->id,
                        'full_name' => $validatedAddress['full_name'],
                        'phone' => $validatedAddress['phone'],
                        'address_line' => $validatedAddress['address_line'],
                        'city' => $validatedAddress['city'],
                        'state' => $validatedAddress['state'],
                        'pincode' => $validatedAddress['pincode'],
                        'country' => $validatedAddress['country'],
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

                $cart->items()->delete();

                return $order;
            });

            session()->forget('coupon');

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order' => $order,
                    'redirect' => $this->frontendPath('/checkout/payment')
                ]
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CheckoutController.process: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing checkout.'
            ], 500);
        }
    }

    public function paymentPage(Order $order)
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CheckoutController.paymentPage: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading payment page.'
            ], 500);
        }
    }

    public function processPayment(Request $request, Order $order)
    {
        try {
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CheckoutController.processPayment: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing payment.'
            ], 500);
        }
    }

    public function buyNow(Book $book)
    {
        try {
            $user = Auth::user();
            $subtotal = $this->resolveBookFormatPrice($book, 'paperback');
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
                'price' => $subtotal,
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CheckoutController.buyNow: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating buy now order.'
            ], 500);
        }
    }

    public function addressBuyNow(Order $order)
    {
        try {
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CheckoutController.addressBuyNow: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading buy now address page.'
            ], 500);
        }
    }

    public function storeBuyNowAddress(Request $request, Order $order)
    {
        try {
            if ($order->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            $validatedAddress = $this->validateAddress($request);

            $address = Address::create([
                'user_id' => Auth::id(),
                'full_name' => $validatedAddress['full_name'],
                'phone' => $validatedAddress['phone'],
                'address_line' => $validatedAddress['address_line'],
                'city' => $validatedAddress['city'],
                'state' => $validatedAddress['state'],
                'pincode' => $validatedAddress['pincode'],
                'country' => $validatedAddress['country'],
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CheckoutController.storeBuyNowAddress: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while saving address.'
            ], 500);
        }
    }

    public function success(Order $order)
    {
        try {
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
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('CheckoutController.success: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading success page.'
            ], 500);
        }
    }

    private function syncCartItemPrices(Cart $cart): void
    {
        $cart->loadMissing('items.book');

        foreach ($cart->items as $item) {
            if (! $item->book) {
                continue;
            }

            $price = $this->resolveBookFormatPrice($item->book, $item->format);

            if ((float) $item->price !== $price) {
                $item->update(['price' => $price]);
                $item->price = $price;
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

    private function validateAddress(Request $request): array
    {
        $request->merge([
            'full_name' => trim((string) $request->input('full_name')),
            'phone' => trim((string) $request->input('phone')),
            'address_line' => trim((string) $request->input('address_line')),
            'city' => trim((string) $request->input('city')),
            'state' => trim((string) $request->input('state')),
            'pincode' => trim((string) $request->input('pincode')),
            'country' => trim((string) ($request->input('country') ?: 'India')),
        ]);

        return $request->validate([
            'full_name' => ['required', 'string', 'min:2', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^[6-9][0-9]{9}$/'],
            'address_line' => ['required', 'string', 'min:8', 'max:500'],
            'city' => ['required', 'string', 'min:2', 'max:100', 'regex:/^[\pL\s.\'-]+$/u'],
            'state' => ['required', 'string', 'min:2', 'max:100', 'regex:/^[\pL\s.\'-]+$/u'],
            'pincode' => ['required', 'string', 'regex:/^[1-9][0-9]{5}$/'],
            'country' => ['required', 'string', 'min:2', 'max:100', 'regex:/^[\pL\s.\'-]+$/u'],
        ], [
            'phone.regex' => 'Phone number must be a valid 10-digit Indian mobile number.',
            'city.regex' => 'City may contain only letters, spaces, apostrophes, periods, and hyphens.',
            'state.regex' => 'State may contain only letters, spaces, apostrophes, periods, and hyphens.',
            'pincode.regex' => 'Pincode must be a valid 6-digit Indian PIN code.',
            'country.regex' => 'Country may contain only letters, spaces, apostrophes, periods, and hyphens.',
        ]);
    }
}
