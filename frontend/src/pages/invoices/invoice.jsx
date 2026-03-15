import React from 'react'

const InvoicesInvoice = () => {
  return (
    <div className="page">
<meta charset="UTF-8" />
    <title>Invoice #</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 14px;
        }

        .invoice-box {
            width: 100%;
            padding: 20px;
        }

        h2 {
            margin-bottom: 5px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        table th {
            background: #f4f4f4;
        }

        .total {
            text-align: right;
            font-size: 16px;
            font-weight: bold;
            margin-top: 20px;
        }
    </style>



<div className="invoice-box">
    <h2>ðŸ“š Book Store Invoice</h2>
    <p><strong>Order ID:</strong> </p>
    <p><strong>Date:</strong> </p>
    <p><strong>Customer:</strong> </p>

    <table>
        <thead>
            <tr>
                <th>Book</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
{/*              */}
            <tr>
                <td></td>
                <td>â‚¹</td>
                <td></td>
                <td>â‚¹</td>
            </tr>
{/*              */}
        </tbody>
    </table>

    <p className="total">
        Grand Total: â‚¹
    </p>
</div>
    </div>
  )
}

export default InvoicesInvoice







