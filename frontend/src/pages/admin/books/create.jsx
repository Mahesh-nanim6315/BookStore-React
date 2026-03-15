import React from 'react'

const AdminBooksCreate = () => {
  return (
    <div className="page">
{/*  */}
{/* 
 */}
<h2 style={{ textAlign: 'center' }}>ðŸ“š Add New Book</h2>

<div className="form-container">
<form action="" method="POST">
{/*  */}


<h3>Basic Information</h3>

<label>Book Name</label>
<input type="text" name="name" required />

<select name="author_id" required>
    <option value="">Select Author</option>
{/*      */}
        <option value=""></option>
{/*      */}
</select>

<select name="genre_id" required>
    <option value="">Select Genre</option>
{/*      */}
        <option value=""></option>
{/*      */}
</select>


<select name="category_id" required>
    <option value="">Select Category</option>
{/*      */}
        <option value=""></option>
{/*      */}
</select>


<label>Description</label>
<textarea name="description" rows="5" required></textarea>

<label>Language</label>
<input type="text" name="language" placeholder="English, Telugu, Hindi" required />


<label>Image URL</label>
<input type="text" name="image" placeholder="https://..." required>

<label style={{ marginTop: '10px' }}>
    <input type="checkbox" name="is_premium" value="1" />
    Premium book (requires subscription)
</label>

<hr />


<label>
    <input type="checkbox" id="has_ebook" name="has_ebook" value="1" />
    ðŸ“˜ Available as eBook
</label>

<div id="ebookBox" className="section-box">
    <label>eBook Price</label>
    <input type="number" name="ebook_price" step="0.01" />

    <label>eBook PDF URL</label>
    <input type="text" name="ebook_pdf" />

    <label>eBook Pages</label>
    <input type="number" name="ebook_pages" />
</div>

<hr />


<label>
    <input type="checkbox" id="has_audio" name="has_audio" value="1" />
    ðŸŽ§ Available as Audio Book
</label>

<div id="audioBox" className="section-box">
    <label>Audio Price</label>
    <input type="number" name="audio_price" step="0.01" />

    <label>Audio File URL</label>
    <input type="text" name="audio_file" />

    <label>Audio Duration (minutes)</label>
    <input type="number" name="audio_minutes" />
</div>

<hr />


<label>
    <input type="checkbox" id="has_paperback" name="has_paperback" value="1" />
    ðŸ“• Available as Paperback
</label>

<div id="paperBox" className="section-box">
    <label>Paperback Price</label>
    <input type="number" name="paperback_price" step="0.01" />

    <label>Paperback Pages</label>
    <input type="number" name="paperback_pages" />

    <label>Stock Available</label>
    <input type="number" name="stock" />

  
</div>

<hr />
     <h3>âš  Legacy Price</h3>
     <label>Main Price</label>
     <input type="number" name="price" /> 

<button type="submit">âž• Add Book</button>

</form>
</div>
{/* 
 */}


    </div>
  )
}

export default AdminBooksCreate







