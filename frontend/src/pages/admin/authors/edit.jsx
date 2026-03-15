import React from 'react'

const AdminAuthorsEdit = () => {
  return (
    <div className="page">
{/*  */}
{/* 
 */}

<h2>Edit Author</h2>

<form action=""
      method="POST" className="form-box">
{/*  */}
{/*  */}

<label>Name</label>
<input type="text" name="name"
       value="" required />

<label>Image URL</label>
<input type="text" name="image"
       value="" />
{/* 
 */}
    <img src=""
         style={{ width: '100px', margin: '10px 0' }} />
{/*  */}

<label>Bio</label>
<textarea name="bio" rows="5">

</textarea>

<button type="submit" className="btn-primary">Update Author</button>

</form>
{/* 
 */}
    </div>
  )
}

export default AdminAuthorsEdit







