const knex = require("../config/knex");

async function countOrdersByUserId(userId) {
  const row = await knex("orders")
    .count({ total: "*" })
    .where({ user_id: Number(userId) })
    .first();

  return Number(row?.total || 0);
}

async function countWishlistByUserId(userId) {
  const row = await knex("wishlists")
    .count({ total: "*" })
    .where({ user_id: Number(userId) })
    .first();

  return Number(row?.total || 0);
}

async function countReviewsByUserId(userId) {
  const row = await knex("reviews")
    .count({ total: "*" })
    .where({ user_id: Number(userId) })
    .first();

  return Number(row?.total || 0);
}

async function getRecentOrderItemsByUserId(userId, limit = 7) {
  return knex("order_items as oi")
    .select(
      "oi.id",
      "oi.order_id",
      "oi.book_id",
      "oi.format",
      "oi.quantity",
      "oi.price",
      "oi.created_at",
      "oi.updated_at",
      "b.id as book_join_id",
      "b.name as book_name",
      "b.image as book_image",
    )
    .innerJoin("orders as o", "o.id", "oi.order_id")
    .innerJoin("books as b", "b.id", "oi.book_id")
    .where("o.user_id", Number(userId))
    .orderBy("oi.created_at", "desc")
    .limit(Number(limit));
}

async function updateUserById(userId, changes) {
  return knex("users")
    .where({ id: Number(userId) })
    .update(changes);
}

module.exports = {
  countOrdersByUserId,
  countWishlistByUserId,
  countReviewsByUserId,
  getRecentOrderItemsByUserId,
  updateUserById,
};
