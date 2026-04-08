const knex = require("../config/knex");

const WISHLIST_BOOK_DETAIL_COLUMNS = [
  "w.*",
  "b.id as book_join_id",
  "b.name as book_name",
  "b.description as book_description",
  "b.language as book_language",
  "b.image as book_image",
  "b.author_id as book_author_id",
  "b.category_id as book_category_id",
  "b.genre_id as book_genre_id",
  "b.has_ebook as book_has_ebook",
  "b.ebook_price as book_ebook_price",
  "b.ebook_pdf as book_ebook_pdf",
  "b.ebook_pages as book_ebook_pages",
  "b.has_audio as book_has_audio",
  "b.audio_price as book_audio_price",
  "b.audio_file as book_audio_file",
  "b.audio_minutes as book_audio_minutes",
  "b.has_paperback as book_has_paperback",
  "b.paperback_price as book_paperback_price",
  "b.paperback_pages as book_paperback_pages",
  "b.stock as book_stock",
  "b.is_premium as book_is_premium",
  "b.price as book_price",
  "a.id as author_join_id",
  "a.name as author_name",
  "a.bio as author_bio",
  "a.image as author_image",
  "c.id as category_join_id",
  "c.name as category_name",
  "c.slug as category_slug",
  "g.id as genre_join_id",
  "g.name as genre_name",
];

async function getWishlistRowsByUserId(userId) {
  return knex("wishlists as w")
    .select(WISHLIST_BOOK_DETAIL_COLUMNS)
    .innerJoin("books as b", "b.id", "w.book_id")
    .leftJoin("authors as a", "a.id", "b.author_id")
    .leftJoin("categories as c", "c.id", "b.category_id")
    .leftJoin("genres as g", "g.id", "b.genre_id")
    .where("w.user_id", Number(userId))
    .orderBy("w.id", "desc");
}

async function findWishlistByUserAndBook(userId, bookId) {
  return knex("wishlists")
    .select("id", "user_id", "book_id")
    .where({
      user_id: Number(userId),
      book_id: Number(bookId),
    })
    .first();
}

async function findWishlistById(wishlistId) {
  return knex("wishlists")
    .select("id", "user_id", "book_id")
    .where({ id: Number(wishlistId) })
    .first();
}

async function deleteWishlistById(wishlistId) {
  return knex("wishlists").where({ id: Number(wishlistId) }).del();
}

async function findBookById(bookId) {
  return knex("books")
    .select("id")
    .where({ id: Number(bookId) })
    .first();
}

async function createWishlist({ userId, bookId, now }) {
  return knex("wishlists").insert({
    user_id: Number(userId),
    book_id: Number(bookId),
    created_at: now,
    updated_at: now,
  });
}

async function findWishlistWithDetailsById(wishlistId) {
  return knex("wishlists as w")
    .select(WISHLIST_BOOK_DETAIL_COLUMNS)
    .innerJoin("books as b", "b.id", "w.book_id")
    .leftJoin("authors as a", "a.id", "b.author_id")
    .leftJoin("categories as c", "c.id", "b.category_id")
    .leftJoin("genres as g", "g.id", "b.genre_id")
    .where("w.id", Number(wishlistId))
    .first();
}

module.exports = {
  getWishlistRowsByUserId,
  findWishlistByUserAndBook,
  findWishlistById,
  deleteWishlistById,
  findBookById,
  createWishlist,
  findWishlistWithDetailsById,
};
