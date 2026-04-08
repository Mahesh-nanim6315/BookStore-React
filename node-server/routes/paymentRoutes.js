const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.post("/payments/:orderId/process", authMiddleware, paymentController.process);

router.get(
  "/payments/stripe/checkout/:orderId",
  authMiddleware,
  paymentController.stripeCheckout,
);
router.get(
  "/payments/stripe/success/:orderId",
  authMiddleware,
  paymentController.stripeSuccess,
);
router.get("/payments/stripe/cancel", authMiddleware, paymentController.stripeCancel);

router.get("/payments/paypal/:orderId/pay", authMiddleware, paymentController.paypalPay);
router.get(
  "/payments/paypal/:orderId/success",
  authMiddleware,
  paymentController.paypalSuccess,
);
router.get(
  "/payments/paypal/:orderId/cancel",
  authMiddleware,
  paymentController.paypalCancel,
);

module.exports = router;
