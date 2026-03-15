import React from 'react'

const ReviewsEdit = () => {
  return (
    <div className="page">
<meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
        form {
    max-width: 500px;
    margin: 40px auto;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    font-family: Arial, sans-serif;
}

select, textarea, button {
    width: 100%;
    padding: 10px;
    margin-top: 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 16px;
}

select {
    background: #fff;
    cursor: pointer;
}

textarea {
    min-height: 120px;
    resize: vertical;
}

button {
    background: #4CAF50;
    color: #fff;
    border: none;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s ease;
}

button:hover {
    background: #45a049;
}

h2 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
}

    </style>


    
<h2>Edit Review</h2>

<form method="POST" action="">
{/*      */}
{/*      */}

    <select name="rating" required>
{/*          */}
            <option value="" >
                
            </option>
{/*          */}
    </select>

    <textarea name="comment" required></textarea>

    <button type="submit">Update Review</button>
</form>
    </div>
  )
}

export default ReviewsEdit







