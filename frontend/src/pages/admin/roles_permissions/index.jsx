import React from 'react'

const AdminRolesPermissionsIndex = () => {
  return (
    <div className="page">
{/*  */}
{/* 
 */}
<div className="page-header">
    <h2>Roles & Permissions</h2>
</div>
{/* 
 (session('success')) */}
    <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #86efac', background: '#f0fdf4', color: '#166534', borderRadius: '6px' }}>
        
    </div>
{/*  */}

<form action="" method="POST">
{/*      */}
{/*      */}
{/* 
     */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <h3 style={{ marginTop: '0', marginBottom: '12px' }}></h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '10px' }}>
{/*                  */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                        <input
                            type="checkbox"
                            name="permissions[][]"
                            value=""
                            
                         />
                        <span></span>
                    </label>
{/*                  */}
            </div>
        </div>
{/*      */}

    <button type="submit" className="btn-primary">Save Permissions</button>
</form>
{/*  */}
    </div>
  )
}

export default AdminRolesPermissionsIndex







