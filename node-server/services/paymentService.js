const { AppError, randomHex } = require("../utils/helpers");
const paymentModel = require("../models/paymentModel");

function frontendUrl(path) {
  const base = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
  return `${base}/${String(path || "").replace(/^\/+/, "")}`;
}

function nowMysql() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function isOwner(order, userId) {
  return Number(order.user_id) === Number(userId);
}

async function requireOwnedOrder(orderId, userId) {
  const order = await paymentModel.findOrderById(orderId);
  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  if (!isOwner(order, userId)) {
    throw new AppError("Unauthorized access to this order", 403);
  }

  return order;
}

async function grantOrderItemsToLibrary(order) {
  const items = await paymentModel.getOrderItems(order.id);
  const now = nowMysql();

  for (const item of items) {
    const existing = await paymentModel.findUserLibraryItem({
      userId: order.user_id,
      bookId: item.book_id,
      format: item.format,
    });

    if (existing) {
      continue;
    }

    await paymentModel.createUserLibraryItem({
      userId: order.user_id,
      bookId: item.book_id,
      format: item.format,
      expiresAt: ["ebook", "audio"].includes(String(item.format)) ? addDays(30) : null,
      now,
    });
  }
}

async function process(orderId, user, payload = {}) {
  const order = await requireOwnedOrder(orderId, user.id);
  const paymentMethod = String(payload.payment_method || "").toLowerCase();

  if (!["stripe", "paypal", "cod"].includes(paymentMethod)) {
    throw new AppError("Validation failed.", 422, {
      errors: {
        payment_method: ["The selected payment method is invalid."],
      },
    });
  }

  if (String(order.status) !== "pending") {
    throw new AppError("This order has already been processed.", 422);
  }

  await paymentModel.updateOrderById(order.id, {
    payment_method: paymentMethod,
  });

  if (paymentMethod === "stripe") {
    return {
      success: true,
      data: {
        checkout_url: `/api/v1/payments/stripe/checkout/${order.id}`,
      },
    };
  }

  if (paymentMethod === "paypal") {
    return {
      success: true,
      data: {
        redirect: `/api/v1/payments/paypal/${order.id}/pay`,
      },
    };
  }

  await paymentModel.updateOrderById(order.id, {
    payment_status: "pending",
    status: "placed",
  });

  const updatedOrder = await paymentModel.findOrderById(order.id);
  return {
    success: true,
    message: "Order placed successfully",
    data: {
      order: updatedOrder,
      redirect: `/orders/${order.id}`,
    },
  };
}

async function stripeCheckout(orderId, user) {
  const order = await requireOwnedOrder(orderId, user.id);

  if (String(order.status) !== "pending") {
    throw new AppError(
      `Invalid order or order already processed. Status: ${order.status}`,
      400,
    );
  }

  const sessionId = `cs_test_${randomHex(12)}`;
  return {
    success: true,
    data: {
      checkout_url: frontendUrl(
        `/checkout/success?provider=stripe&order=${order.id}&session_id=${sessionId}`,
      ),
      session_id: sessionId,
    },
  };
}

async function stripeSuccess(orderId, user, query = {}) {
  const order = await requireOwnedOrder(orderId, user.id);
  const sessionId = String(query.session_id || "").trim();

  if (!sessionId) {
    throw new AppError("Missing Stripe session identifier.", 422);
  }

  await paymentModel.updateOrderById(order.id, {
    payment_status: "paid",
    status: "confirmed",
    payment_id: sessionId,
  });

  const updatedOrder = await paymentModel.findOrderById(order.id);
  await grantOrderItemsToLibrary(updatedOrder);

  return {
    success: true,
    message: "Payment successful",
    data: {
      order: updatedOrder,
      redirect: `/checkout/success?order=${order.id}`,
    },
  };
}

function stripeCancel() {
  return {
    success: false,
    message: "Payment cancelled",
  };
}

async function paypalPay(orderId, user) {
  const order = await requireOwnedOrder(orderId, user.id);

  if (String(order.status) !== "pending") {
    throw new AppError("Invalid order or order already processed.", 422);
  }

  const token = `paypal_${randomHex(12)}`;
  return {
    success: true,
    data: {
      redirect_url: frontendUrl(
        `/checkout/success?provider=paypal&order=${order.id}&token=${token}`,
      ),
    },
  };
}

async function paypalSuccess(orderId, user, query = {}) {
  const order = await requireOwnedOrder(orderId, user.id);
  const token = String(query.token || "").trim();

  if (!token) {
    throw new AppError("Missing PayPal approval token.", 422);
  }

  await paymentModel.updateOrderById(order.id, {
    payment_id: token,
    payment_status: "paid",
    status: "confirmed",
  });

  const updatedOrder = await paymentModel.findOrderById(order.id);
  await grantOrderItemsToLibrary(updatedOrder);

  return {
    success: true,
    message: "Payment completed successfully",
    data: {
      order: updatedOrder,
      redirect: "/checkout/success",
    },
  };
}

function paypalCancel() {
  return {
    success: false,
    message: "Payment cancelled",
    data: {
      redirect: "/checkout/payment",
    },
  };
}

module.exports = {
  process,
  stripeCheckout,
  stripeSuccess,
  stripeCancel,
  paypalPay,
  paypalSuccess,
  paypalCancel,
};
