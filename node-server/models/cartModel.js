const knex = require("../config/knex");

async function findCartByUserId(userId) {
  return knex("carts")
    .select("id", "user_id", "created_at", "updated_at")
    .where({ user_id: Number(userId) })
    .first();
}

async function getCartItemsByCartId(cartId) {
  return knex("cart_items as ci")
    .select(
      "ci.id",
      "ci.cart_id",
      "ci.book_id",
      "ci.format",
      "ci.quantity",
      "ci.price",
      "ci.created_at",
      "ci.updated_at",
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
    )
    .innerJoin("books as b", "b.id", "ci.book_id")
    .leftJoin("authors as a", "a.id", "b.author_id")
    .leftJoin("categories as c", "c.id", "b.category_id")
    .leftJoin("genres as g", "g.id", "b.genre_id")
    .where("ci.cart_id", Number(cartId))
    .orderBy("ci.id", "desc");
}

module.exports = {
  findCartByUserId,
  getCartItemsByCartId,
};
