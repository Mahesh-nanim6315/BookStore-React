<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice #{{ $order->id }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 14px;
            color: #111827;
            margin: 0;
            padding: 24px;
        }

        .invoice-box {
            width: 100%;
        }

        .invoice-header {
            margin-bottom: 24px;
        }

        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 8px;
        }

        .invoice-meta p {
            margin: 4px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th, td {
            border: 1px solid #d1d5db;
            padding: 10px;
            text-align: left;
        }

        th {
            background: #f3f4f6;
        }

        .totals {
            margin-top: 24px;
            width: 100%;
        }

        .totals-row {
            text-align: right;
            margin: 6px 0;
        }

        .grand-total {
            font-size: 16px;
            font-weight: bold;
            margin-top: 12px;
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="invoice-header">
            <p class="invoice-title">BookSphere Invoice</p>
            <div class="invoice-meta">
                <p><strong>Order ID:</strong> #{{ $order->id }}</p>
                <p><strong>Date:</strong> {{ optional($order->created_at)->format('d/m/Y H:i:s') }}</p>
                <p><strong>Customer:</strong> {{ $order->user->name ?? 'Guest' }}</p>
                <p><strong>Email:</strong> {{ $order->user->email ?? 'N/A' }}</p>
                <p><strong>Payment Status:</strong> {{ ucfirst($order->payment_status ?? 'pending') }}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Book</th>
                    <th>Format</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($order->items as $item)
                    <tr>
                        <td>{{ $item->book->name ?? 'Book' }}</td>
                        <td>{{ ucfirst($item->format ?? 'N/A') }}</td>
                        <td>Rs. {{ number_format((float) ($item->price ?? 0), 2) }}</td>
                        <td>{{ $item->quantity ?? 0 }}</td>
                        <td>Rs. {{ number_format((float) (($item->price ?? 0) * ($item->quantity ?? 0)), 2) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5">No items found for this order.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>

        <div class="totals">
            <p class="totals-row">Subtotal: Rs. {{ number_format((float) ($order->subtotal ?? 0), 2) }}</p>
            <p class="totals-row">Tax: Rs. {{ number_format((float) ($order->tax_amount ?? 0), 2) }}</p>
            <p class="totals-row">Discount: Rs. {{ number_format((float) ($order->discount_amount ?? 0), 2) }}</p>
            <p class="totals-row grand-total">Grand Total: Rs. {{ number_format((float) ($order->total_amount ?? 0), 2) }}</p>
        </div>
    </div>
</body>
</html>
