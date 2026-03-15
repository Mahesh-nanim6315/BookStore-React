import React from 'react'

const OrdersShow = () => {
    return (
        <div className="page">
            {/*  */}

            <div className="order-container">

                {/* Order Header  */}
                <div className="order-header">
                    <h2>Order Details</h2>
                    <span className="order-status">

                    </span>
                </div>

                {/* Order Info  */}
                <div className="order-info">
                    <p><strong>Order ID:</strong> #</p>
                    <p>
                        <strong>Placed On:</strong>

                    </p>
                    <p><strong>Total Amount:</strong> â‚¹</p>
                    <p><strong>Payment Method:</strong> </p>
                </div>

                {/* Items */}
                <h3 className="section-title">Books Ordered</h3>

                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Book</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/*              ($order->items as $item) */}
                        <tr>
                            <td>
                                <strong></strong><br />
                                <small></small>
                            </td>
                            <td>â‚¹</td>
                            <td></td>
                            <td>â‚¹</td>
                        </tr>
                        {/*              */}
                    </tbody>
                </table>


                {/* Order Summary  */}
                <div className="order-summary">
                    <h3>Total: â‚¹</h3>
                </div>

                {/* Actions */}
                <div className="order-actions">
                    <a href="" className="btn btn-secondary">
                        Continue Shopping
                    </a>
                    <a href="" className="btn btn-primary">
                        Download Invoice
                    </a>



                </div>

            </div>
            {/* 
 */}
        </div>
    )
}

export default OrdersShow







