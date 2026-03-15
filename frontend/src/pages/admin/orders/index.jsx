import React from 'react'

const AdminOrdersIndex = () => {
  return (
    <div className="page">
{/*  */}
{/* 
 */}

<h2>Orders Management</h2>

<div className="page-header">
    <div style={{ marginBottom: '15px' }}>
        <a href="">All</a> |
        <a href="?status=pending">Pending</a> |
        <a href="?status=delivered">Delivered</a> |
        <a href="?status=cancelled">Cancelled</a>
    </div>

    <div style={{ marginBottom: '15px' }}>
        <a href="" 
        style={{ padding: '8px 15px', background: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
        Export CSV
        </a>
    </div>
</div>



<table border="1" cellpadding="10" width="100%">
    <thead>
        <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>
{/*          */}
        <tr>
            <td>#</td>
            <td></td>
            <td>â‚¹</td>
           <td>
                <form action="" method="POST">
{/*                      */}
{/*                      */}

                    <select name="payment_status" onChange={() => {}} className="status-dropdown">
                        <option value="pending" >Pending</option>
                        <option value="paid" >Paid</option>
                        <option value="failed" >Failed</option>
                    </select>
                </form>
            </td>

            <td>

                <form action="" method="POST">
{/*                      */}
{/*                      */}

                    <select name="status" onChange={() => {}} className="status-dropdown">
                        <option value="pending" >Pending</option>
                        <option value="processing" >Processing</option>
                        <option value="shipped" >Shipped</option>
                        <option value="delivered" >Delivered</option>
                    </select>
                </form>

            </td>

            <td></td>
            <td>
                <a href="">View</a>
            </td>
        </tr>
{/*          */}
    </tbody>
</table>

<div style={{ marginTop: '15px' }}>
    
</div>
{/* 
 */}
    </div>
  )
}

export default AdminOrdersIndex







