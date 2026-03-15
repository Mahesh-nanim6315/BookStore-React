import React from 'react'

const OrdersIndex = () => {
  return (
    <div className="page">
{/*  */}
<div className="orders-page">

    <h2 className="page-title">ðŸ“¦ My Orders</h2>
{/* 
    ) */}

        <div className="orders-list">
{/*              */}
                <div className="order-card">

                    <div className="order-header">
                        <div>
                            <strong>Order #</strong>
                            <p className="order-date">
                                
                            </p>
                        </div>

                        <span className="order-status ">
                            
                        </span>
                    </div>

                    <div className="order-body">
                        <p>
                            <strong>Total:</strong> â‚¹
                        </p>

                        <p>
                            <strong>Payment:</strong> 
                        </p>

                        <p>
                            <strong>Status:</strong> 
                        </p>
                    </div>

                    <div className="order-footer">
                        <a href="" className="btnes view-btns">
                            View Details
                        </a>

                        <a href="" className="btnes invoice-btn">
                            Download Invoice
                        </a>
                    </div>

                </div>
{/*              */}
        </div>
{/* 
     */}
        <div className="empty-orders">
            <p>You havenâ€™t placed any orders yet ðŸ“š</p>
            <a href="" className="btnes shop-btns">Browse Books</a>
        </div>
{/*      */}

</div>
{/*  */}
    </div>
  )
}

export default OrdersIndex







