<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderPlaced;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\UserLibrary;
use App\Models\Book;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    private function frontendPath(string $path): string
    {
        return '/' . ltrim($path, '/');
    }

    /* ================= PLACE ORDER ================= */
    public function store(Request $request)
    {
        $user = Auth::user();

        $cart = Cart::with('items')->where('user_id', $user->id)->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Cart is empty',
                'redirect' => $this->frontendPath('/cart')
            ], 422);
        }

        $subtotal = $cart->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });
        $taxAmount = Setting::calculateTax($subtotal);
        $coupon = session()->get('coupon');
        $discountAmount = (float) ($coupon['discount'] ?? 0);
        $total = max(0, $subtotal + $taxAmount - $discountAmount);

        // CREATE ORDER
        $order = Order::create([
            'user_id'        => $user->id,
            'subtotal'       => $subtotal,
            'tax_amount'     => $taxAmount,
            'discount_amount'=> $discountAmount,
            'coupon_code'    => $coupon['code'] ?? null,
            'total_amount'   => $total,
            'status'         => 'completed',
            'payment_status' => 'paid',
            'payment_method' => 'online',
            'payment_id'     => $request->payment_id ?? null,
        ]);

        event(new OrderPlaced($order));

        /* ================= ORDER ITEMS ================= */
        foreach ($cart->items as $item) {

            OrderItem::create([
                'order_id' => $order->id,
                'book_id'  => $item->book_id,
                'format'   => $item->format,
                'price'    => $item->price,
                'quantity' => $item->quantity,
            ]);

            /* ================= USER LIBRARY ================= */
            UserLibrary::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'book_id' => $item->book_id,
                    'format'  => $item->format,
                ],
                [
                    'expires_at' => in_array($item->format, ['ebook','audio'])
                        ? now()->addDays(30)
                        : null,
                ]
            );
        }

        // CLEAR CART
        $cart->items()->delete();
        $cart->delete();
        session()->forget('coupon');

        return response()->json([
            'success' => true,
            'message' => 'Order placed successfully',
            'data' => [
                'order' => $order,
                'redirect' => $this->frontendPath("/orders/{$order->id}")
            ]
        ]);
    }

    /* ================= ORDER SUCCESS ================= */
    public function success(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $order->load(['items.book', 'user']);

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order
            ]
        ]);
    }

    /* ================= MY ORDERS ================= */
    public function index()
    {
        $orders = Order::withCount('items')
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'orders' => $orders
            ]
        ]);
    }

    /* ================= INVOICE ================= */
    public function downloadInvoice(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $order->load(['items.book', 'user']);

        $pdf = Pdf::loadView('invoices.invoice', compact('order'));

        // Return PDF as base64 encoded string for React to handle
        $pdfContent = base64_encode($pdf->output());

        return response()->json([
            'success' => true,
            'data' => [
                'pdf' => $pdfContent,
                'filename' => 'invoice-order-' . $order->id . '.pdf'
            ]
        ]);
    }

    public function address(Book $book)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'book' => $book,
                'needs_address' => true
            ]
        ]);
    }

    public function show(Order $order)
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
