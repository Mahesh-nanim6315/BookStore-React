const orderModel = require("../models/orderModel");

async function getOrders(user) {
  const rows = await orderModel.getOrdersByUserId(user.id);

  return {
    success: true,
    data: {
      orders: rows.map((row) => ({
        ...row,
        items_count: Number(row.items_count || 0),
      })),
    },
  };
}

module.exports = {
  getOrders,
};
