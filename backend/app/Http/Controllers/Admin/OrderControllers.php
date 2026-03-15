<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderControllers extends Controller
{
    public function index(Request $request)
    {
        $status = $request->status;

        $query = Order::with('user')->latest();

        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    public function show($id)
    {
        $order = Order::with(['user', 'items.book', 'address'])
                      ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order
            ]
        ]);
    }

    // Update order status
    public function update(Request $request, Order $order)
    {
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
                'order' => $order->fresh(['user', 'items.book', 'address'])
            ]
        ]);
    }

    public function payments()
    {
        $payments = Order::whereNotNull('payment_id')
            ->with('user')
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $payments
        ]);
    }

    public function exportCsv()
    {
        $orders = Order::with('user')->get();

        $filename = "orders_export_" . now()->format('Y_m_d_H_i_s') . ".csv";

        // Create CSV content
        $csvContent = '';
        
        // CSV Header row
        $csvContent .= implode(',', [
            'Order ID',
            'Customer',
            'Total Amount',
            'Payment Method',
            'Payment Status',
            'Order Status',
            'Date'
        ]) . "\n";

        foreach ($orders as $order) {
            $csvContent .= implode(',', [
                $order->id,
                '"' . $order->user->name . '"',
                $order->total_amount,
                $order->payment_method,
                $order->payment_status,
                $order->status,
                $order->created_at,
            ]) . "\n";
        }

        // Encode CSV content to base64 for JSON response
        $csvBase64 = base64_encode($csvContent);

        return response()->json([
            'success' => true,
            'data' => [
                'filename' => $filename,
                'csv_content' => $csvBase64,
                'download_url' => '' // Frontend can create blob URL from base64 content
            ]
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered'
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => [
                'order' => $order->fresh('user')
            ]
        ]);
    }

    public function updatePaymentStatus(Request $request, $id)
    {
        $request->validate([
            'payment_status' => 'required|in:pending,paid,failed'
        ]);

        $order = Order::findOrFail($id);
        $order->payment_status = $request->payment_status;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Payment status updated successfully',
            'data' => [
                'order' => $order->fresh('user')
            ]
        ]);
    }
}