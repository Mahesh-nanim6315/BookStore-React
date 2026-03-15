import React from 'react'

const AdminAuthorsCreate = () => {
  return (
    <div className="page">
{/*  */}
{/* 
 */}

<h2>Add Author</h2>

<form action="" method="POST" className="form-box">
{/*  */}

<label>Name</label>
<input type="text" name="name" required />

<label>Image URL</label>
<input type="text" name="image" />

<label>Bio</label>
<textarea name="bio" rows="5"></textarea>

<button type="submit" className="btn-primary">Create Author</button>

</form>
{/* 
 */}
    </div>
  )
}

export default AdminAuthorsCreate







