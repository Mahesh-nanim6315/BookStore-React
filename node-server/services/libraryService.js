const libraryModel = require("../models/libraryModel");

async function getLibrary(user) {
  const rows = await libraryModel.getLibraryRowsByUserId(user.id);

  return {
    success: true,
    data: {
      libraries: rows.map(mapLibraryRow),
    },
  };
}

function mapLibraryRow(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    book_id: row.book_id,
    format: row.format,
    expires_at: row.expires_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    book: {
      id: row.book_join_id,
      name: row.book_name,
      description: row.book_description,
      language: row.book_language,
      image: row.book_image,
      author_id: row.book_author_id,
      category_id: row.book_category_id,
      genre_id: row.book_genre_id,
      has_ebook: Boolean(row.book_has_ebook),
      ebook_price: row.book_ebook_price,
      ebook_pdf: row.book_ebook_pdf,
      ebook_pages: row.book_ebook_pages,
      has_audio: Boolean(row.book_has_audio),
      audio_price: row.book_audio_price,
      audio_file: row.book_audio_file,
      audio_minutes: row.book_audio_minutes,
      has_paperback: Boolean(row.book_has_paperback),
      paperback_price: row.book_paperback_price,
      paperback_pages: row.book_paperback_pages,
      stock: row.book_stock,
      is_premium: Boolean(row.book_is_premium),
      price: row.book_price,
      author: row.author_join_id
        ? {
            id: row.author_join_id,
            name: row.author_name,
            bio: row.author_bio,
            image: row.author_image,
          }
        : null,
      category: row.category_join_id
        ? {
            id: row.category_join_id,
            name: row.category_name,
            slug: row.category_slug,
          }
        : null,
      genre: row.genre_join_id
        ? {
            id: row.genre_join_id,
            name: row.genre_name,
          }
        : null,
    },
  };
}

module.exports = {
  getLibrary,
};
