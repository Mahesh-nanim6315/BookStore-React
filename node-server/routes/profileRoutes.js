const express = require("express");
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authMiddleware, profileController.index);
router.put("/profile/update", authMiddleware, profileController.update);

module.exports = router;
