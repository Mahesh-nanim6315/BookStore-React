const express = require("express");
const bookController = require("../controllers/bookController");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

const router = express.Router();

router.get("/settings/public", bookController.publicSettings);

router.get("/home", bookController.home);
router.get("/products", bookController.products);
router.get("/books", bookController.booksIndex);
router.get("/books/:bookId/details", optionalAuthMiddleware, bookController.details);
router.get("/books/:bookId", optionalAuthMiddleware, bookController.show);

router.get("/ebooks", bookController.ebooks);
router.get("/audiobooks", bookController.audiobooks);
router.get("/paperbacks", bookController.paperbacks);

router.get("/categories", bookController.categories);
router.get("/category/:slug/books", bookController.categoryBooks);
router.get("/authors", bookController.authors);
router.get("/authors/:authorId", bookController.author);

router.get("/faq", bookController.faq);
router.get("/plans", bookController.plans);
router.get("/about", bookController.about);

module.exports = router;
