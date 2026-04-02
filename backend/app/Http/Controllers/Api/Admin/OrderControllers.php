<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderControllers extends Controller
{
    public function index(Request $request)
    {
        try {
            $status = $request->query('status');

            $query = Order::with('user')->latest();

            if ($status) {
                $query->where('status', $status);
            }

            $orders = $query->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $orders,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('OrderControllers.index: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading orders.'
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $order = Order::with(['user', 'items.book', 'address'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => $order,
                ],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('OrderControllers.show: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading the order.'
            ], 500);
        }
    }

    public function update(Request $request, Order $order)
    {
        try {
            $request->validate([
                'status' => 'required',
                'payment_status' => 'required',
            ]);

            $order->update([
                'status' => $request->status,
                'payment_status' => $request->payment_status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order updated successfully',
                'data' => [
                    'order' => $order->fresh(['user', 'items.book', 'address']),
                ],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('OrderControllers.update: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the order.'
            ], 500);
        }
    }

    public function payments()
    {
        try {
            $payments = Order::whereNotNull('payment_id')
                ->with('user')
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $payments,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('OrderControllers.payments: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while loading payments.'
            ], 500);
        }
    }

    public function exportCsv()
    {
        try {
            $orders = Order::with('user')->get();
            $filename = 'orders_export_' . now()->format('Y_m_d_H_i_s') . '.csv';

            $csvContent = '';
            $csvContent .= implode(',', [
                'Order ID',
                'Customer',
                'Total Amount',
                'Payment Method',
                'Payment Status',
                'Order Status',
                'Date',
            ]) . "\n";

            foreach ($orders as $order) {
                $csvContent .= implode(',', [
                    $order->id,
                    '"' . optional($order->user)->name . '"',
                    $order->total_amount,
                    $order->payment_method,
                    $order->payment_status,
                    $order->status,
                    $order->created_at,
                ]) . "\n";
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'filename' => $filename,
                    'csv_content' => base64_encode($csvContent),
                    'download_url' => '',
                ],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('OrderControllers.exportCsv: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while exporting orders.'
            ], 500);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,processing,shipped,delivered',
            ]);

            $order = Order::findOrFail($id);
            $order->status = $request->status;
            $order->save();

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => [
                    'order' => $order->fresh('user'),
                ],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('OrderControllers.updateStatus: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating order status.'
            ], 500);
        }
    }

    public function updatePaymentStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'payment_status' => 'required|in:pending,paid,failed',
            ]);

            $order = Order::findOrFail($id);
            $order->payment_status = $request->payment_status;
            $order->save();

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully',
                'data' => [
                    'order' => $order->fresh('user'),
                ],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('OrderControllers.updatePaymentStatus: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating payment status.'
            ], 500);
        }
    }
}
