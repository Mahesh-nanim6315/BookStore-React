const express = require("express");
const wishlistController = require("../controllers/wishlistController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/wishlist", authMiddleware, wishlistController.index);
router.post("/wishlist/toggle", authMiddleware, wishlistController.toggle);
router.delete("/wishlist/:wishlistId", authMiddleware, wishlistController.destroy);

module.exports = router;
