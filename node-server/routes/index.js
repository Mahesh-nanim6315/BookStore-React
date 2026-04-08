const express = require("express");
const authRoutes = require("./authRoutes");
const bookRoutes = require("./bookRoutes");
const wishlistRoutes = require("./wishlistRoutes");
const subscriptionRoutes = require("./subscriptionRoutes");
const paymentRoutes = require("./paymentRoutes");

const router = express.Router();

router.use(bookRoutes);
router.use(authRoutes);
router.use(wishlistRoutes);
router.use(subscriptionRoutes);
router.use(paymentRoutes);

module.exports = router;
