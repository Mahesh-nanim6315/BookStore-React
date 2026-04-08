const knex = require("../config/knex");

async function findOrderById(orderId) {
  return knex("orders").where({ id: Number(orderId) }).first();
}

async function updateOrderById(orderId, fields) {
  if (!fields || Object.keys(fields).length === 0) {
    return null;
  }

  return knex("orders").where({ id: Number(orderId) }).update(fields);
}

async function getOrderItems(orderId) {
  return knex("order_items")
    .select("id", "order_id", "book_id", "format", "quantity", "price", "created_at", "updated_at")
    .where({ order_id: Number(orderId) });
}

async function findUserLibraryItem({ userId, bookId, format }) {
  return knex("user_library")
    .select("id")
    .where({
      user_id: Number(userId),
      book_id: Number(bookId),
      format: String(format),
    })
    .first();
}

async function createUserLibraryItem({
  userId,
  bookId,
  format,
  expiresAt = null,
  now,
}) {
  return knex("user_library").insert({
    user_id: Number(userId),
    book_id: Number(bookId),
    format: String(format),
    expires_at: expiresAt,
    created_at: now,
    updated_at: now,
  });
}

async function refreshOrderWithItems(orderId) {
  const order = await findOrderById(orderId);
  if (!order) {
    return null;
  }

  const items = await getOrderItems(orderId);
  return {
    ...order,
    items,
  };
}

module.exports = {
  findOrderById,
  updateOrderById,
  getOrderItems,
  findUserLibraryItem,
  createUserLibraryItem,
  refreshOrderWithItems,
};
