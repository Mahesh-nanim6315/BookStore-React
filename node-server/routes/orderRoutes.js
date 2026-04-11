const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/orders", authMiddleware, orderController.index);

module.exports = router;
