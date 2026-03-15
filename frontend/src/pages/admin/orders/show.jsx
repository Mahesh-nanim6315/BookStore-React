import React from 'react'

const AdminOrdersShow = () => {
  return (
    <div className="page">
{/*  */}
{/* 
 */}

<h2>Order Details #</h2>

<div className="card">
    <h4>Customer Information</h4>
    <p><strong>Name:</strong> </p>
    <p><strong>Email:</strong> </p>
</div>

<div className="card">
    <h4>Shipping Address</h4>
{/*      */}
        <p></p>
        <p></p>
        <p>, </p>
        <p></p>
{/*      */}
        <p>Digital Order (No Shipping Required)</p>
{/*      */}
</div>

<div className="card">
    <h4>Order Summary</h4>
    <p><strong>Status:</strong> </p>
    <p><strong>Payment Status:</strong> </p>
    <p><strong>Payment Method:</strong> </p>
    <p><strong>Subtotal:</strong> â‚¹</p>
    <p><strong>Tax:</strong> â‚¹</p>
    <p><strong>Discount:</strong> â‚¹</p>
    <p><strong>Total:</strong> â‚¹</p>
</div>

<div className="card">
    <h4>Ordered Items</h4>
    <table border="1" width="100%" cellpadding="10">
        <tr>
            <th>Book</th>
            <th>Format</th>
            <th>Quantity</th>
            <th>Price</th>
        </tr>
{/* 
         */}
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td>â‚¹</td>
        </tr>
{/*          */}
    </table>
</div>
{/* 
 */}
    </div>
  )
}

export default AdminOrdersShow







