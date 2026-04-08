const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const subscriptionController = require("../controllers/subscriptionController");

const router = express.Router();

router.post("/subscription/checkout", authMiddleware, subscriptionController.checkout);
router.get("/subscription/success", authMiddleware, subscriptionController.success);
router.post("/subscription/cancel", authMiddleware, subscriptionController.cancel);
router.post("/subscription/resume", authMiddleware, subscriptionController.resume);

module.exports = router;
