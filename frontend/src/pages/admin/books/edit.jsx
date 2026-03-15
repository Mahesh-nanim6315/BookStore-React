import React from 'react'

const AdminBooksEdit = () => {
  return (
    <div className="page">
{/* 
 */}
{/* 
 */}

<h2 style={{ textAlign: 'center', marginTop: '80px' }}>âœï¸ Edit Book</h2>

<div className="form-container">
<form action="" method="POST">
{/*  */}
{/*  */}

    {/* BASIC INFO */}
    <h3>Basic Information</h3>

    <label>Book Name</label>
    <input type="text" name="name" value="" required />

    {/* Author */}
       <select name="author_id" required>
       <option value="">Select Author</option>
{/*         */}
              <option value=""
              >
              
              </option>
{/*         */}
       </select>


       {/* Genre */}
       <select name="genre_id" required>
       <option value="">Select Genre</option>
{/*         */}
              <option value=""
              >
              
              </option>
{/*         */}
       </select>


       {/* Category */}
       <select name="category_id" required>
       <option value="">Select Category</option>
{/*         */}
              <option value=""
              >
              
              </option>
{/*         */}
       </select>


    <label>Description</label>
    <textarea name="description" rows="5" required></textarea>

    <label>Language</label>
    <input type="text" name="language" value="" />


    <label>Image URL</label>
    <input type="url" name="image" value="" required />

    <label style={{ marginTop: '10px' }}>
        <input type="checkbox" name="is_premium" value="1"
             />
        Premium book (requires subscription)
    </label>

    <div style={{ margin: '10px 0' }}>
        <strong>Preview:</strong><br />
        <img src="" width="120" />
    </div>

    <hr />

    {/* EBOOK */}
    <h3>ðŸ“˜ eBook</h3>

    <label>
        <input type="checkbox" name="has_ebook" value="1"
             />
        Available as eBook
    </label>

    <label>eBook Price</label>
    <input type="number" step="0.01" name="ebook_price"
           value="" />

    <label>eBook PDF URL</label>
    <input type="text" name="ebook_pdf"
           value="" />

    <label>eBook Pages</label>
    <input type="number" name="ebook_pages"
           value="" />

    <hr />

    {/* AUDIO */}
    <h3>ðŸŽ§ Audio Book</h3>

    <label>
        <input type="checkbox" name="has_audio" value="1"
             />
        Available as Audio Book
    </label>

    <label>Audio Price</label>
    <input type="number" step="0.01" name="audio_price"
           value="" />

    <label>Audio File URL</label>
    <input type="text" name="audio_file"
           value="" />

    <label>Audio Duration (minutes)</label>
    <input type="number" name="audio_minutes"
           value="" />

    <hr />

    {/* PAPERBACK */}
    <h3>ðŸ“• Paperback</h3>

    <label>
        <input type="checkbox" name="has_paperback" value="1"
             />
        Available as Paperback
    </label>

    <label>Paperback Price</label>
    <input type="number" step="0.01" name="paperback_price"
           value="" />

    <label>Paperback Pages</label>
    <input type="number" name="paperback_pages"
           value="" />

    <label>Stock Available</label>
    <input type="number" name="stock"
           value="" />

    <hr />
       <h3>âš  Legacy Price</h3>
     <label>Main Price</label>
     <input type="number" name="price"
            value="" /> 

    <button type="submit">ðŸ’¾ Update Book</button>
</form>
</div>
{/* 
 */}
    </div>
  )
}

export default AdminBooksEdit







