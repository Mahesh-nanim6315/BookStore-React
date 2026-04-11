const express = require("express");
const libraryController = require("../controllers/libraryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/library", authMiddleware, libraryController.index);

module.exports = router;
