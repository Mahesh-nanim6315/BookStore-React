import React from 'react'

const AdminLayoutsApp = () => {
  return (
    <div className="page">
<meta charset="UTF-8" />
    <title>Admin Dashboard</title>
{/*          */}



<div className="admin-wrapper">
{/*      */}

    <div className="main-content">
{/*          */}

        <div className="toast-container" id="admin-toast-container" aria-live="polite" aria-atomic="true">
{/*              (session('success')) */}
                <div className="toast toast-success">
                    <span className="toast-text"></span>
                    <button type="button" className="toast-close" aria-label="Dismiss">&times;</button>
                </div>
{/*              */}
{/*              (session('error')) */}
                <div className="toast toast-error">
                    <span className="toast-text"></span>
                    <button type="button" className="toast-close" aria-label="Dismiss">&times;</button>
                </div>
{/*              */}
{/*              (session('status')) */}
                <div className="toast toast-info">
                    <span className="toast-text"></span>
                    <button type="button" className="toast-close" aria-label="Dismiss">&times;</button>
                </div>
{/*              */}
{/*              ($errors->any()) */}
                <div className="toast toast-error">
                    <span className="toast-text"></span>
                    <button type="button" className="toast-close" aria-label="Dismiss">&times;</button>
                </div>
{/*              */}
        </div>

        <div className="content">
{/*              */}
        </div>
    </div>
</div>


    </div>
  )
}

export default AdminLayoutsApp







