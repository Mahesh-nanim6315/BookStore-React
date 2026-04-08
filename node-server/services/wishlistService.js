const wishlistModel = require("../models/wishlistModel");
const { AppError } = require("../utils/helpers");

async function getWishlist(user) {
  const items = await wishlistModel.getWishlistRowsByUserId(user.id);

  return {
    success: true,
    data: items.map(mapWishlistRow),
  };
}

async function toggleWishlist(user, payload) {
  const bookId = Number(payload.book_id);
  if (!Number.isFinite(bookId) || bookId <= 0) {
    throw new AppError("Validation failed.", 422, {
      errors: {
        book_id: ["The book id field is required."],
      },
    });
  }

  const existing = await wishlistModel.findWishlistByUserAndBook(user.id, bookId);

  if (existing) {
    await wishlistModel.deleteWishlistById(existing.id);
    return {
      success: true,
      action: "removed",
      message: "Book removed from wishlist.",
    };
  }

  const book = await wishlistModel.findBookById(bookId);

  if (!book) {
    throw new AppError("Validation failed.", 422, {
      errors: {
        book_id: ["The selected book id is invalid."],
      },
    });
  }

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const result = await wishlistModel.createWishlist({
    userId: user.id,
    bookId,
    now,
  });

  const created = await wishlistModel.findWishlistWithDetailsById(result.insertId);

  return {
    success: true,
    action: "added",
    message: "Book added to wishlist.",
    data: mapWishlistRow(created),
  };
}

async function removeWishlistItem(user, wishlistId) {
  const item = await wishlistModel.findWishlistById(wishlistId);

  if (!item) {
    throw new AppError("Wishlist item not found.", 404);
  }

  if (Number(item.user_id) !== Number(user.id)) {
    throw new AppError("You are not allowed to remove this wishlist item.", 403);
  }

  await wishlistModel.deleteWishlistById(wishlistId);

  return {
    success: true,
    message: "Wishlist item removed.",
  };
}

function mapWishlistRow(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    book_id: row.book_id,
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
  getWishlist,
  toggleWishlist,
  removeWishlistItem,
};
