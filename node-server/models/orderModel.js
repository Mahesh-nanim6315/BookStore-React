const knex = require("../config/knex");

async function getOrdersByUserId(userId) {
  return knex("orders as o")
    .leftJoin("order_items as oi", "oi.order_id", "o.id")
    .where("o.user_id", Number(userId))
    .groupBy("o.id")
    .select(
      "o.id",
      "o.user_id",
      "o.address_id",
      "o.subtotal",
      "o.tax_amount",
      "o.discount_amount",
      "o.coupon_code",
      "o.total_amount",
      "o.payment_method",
      "o.payment_id",
      "o.payment_status",
      "o.status",
      "o.created_at",
      "o.updated_at",
    )
    .count({ items_count: "oi.id" })
    .orderBy("o.created_at", "desc");
}

module.exports = {
  getOrdersByUserId,
};
