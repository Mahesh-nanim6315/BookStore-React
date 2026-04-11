const express = require("express");
const authRoutes = require("./authRoutes");
const adminSidebarRoutes = require("./adminSidebarRoutes");
const bookRoutes = require("./bookRoutes");
const cartRoutes = require("./cartRoutes");
const libraryRoutes = require("./libraryRoutes");
const orderRoutes = require("./orderRoutes");
const profileRoutes = require("./profileRoutes");
const wishlistRoutes = require("./wishlistRoutes");
const subscriptionRoutes = require("./subscriptionRoutes");
const paymentRoutes = require("./paymentRoutes");

const router = express.Router();

router.use(adminSidebarRoutes);
router.use(bookRoutes);
router.use(authRoutes);
router.use(cartRoutes);
router.use(libraryRoutes);
router.use(orderRoutes);
router.use(profileRoutes);
router.use(wishlistRoutes);
router.use(subscriptionRoutes);
router.use(paymentRoutes);

module.exports = router;
