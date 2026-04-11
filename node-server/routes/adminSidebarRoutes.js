const express = require("express");
const adminSidebarController = require("../controllers/adminSidebarController");
const authMiddleware = require("../middleware/authMiddleware");
const { requirePermission, requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/admin/dashboard/stats", authMiddleware, requirePermission("access_dashboard"), adminSidebarController.dashboardStats);
router.get("/admin/subscriptions", authMiddleware, requirePermission("access_dashboard"), adminSidebarController.subscriptionsIndex);
router.get("/admin/orders", authMiddleware, requirePermission("manage_orders"), adminSidebarController.ordersIndex);
router.get("/admin/payments", authMiddleware, requirePermission("manage_payments"), adminSidebarController.paymentsIndex);
router.get("/admin/books", authMiddleware, requirePermission("books.view"), adminSidebarController.booksIndex);
router.get("/admin/authors", authMiddleware, requirePermission("authors.view"), adminSidebarController.authorsIndex);
router.get("/admin/reviews", authMiddleware, requirePermission("manage_reviews"), adminSidebarController.reviewsIndex);
router.patch("/admin/reviews/:reviewId/approve", authMiddleware, requirePermission("manage_reviews"), adminSidebarController.reviewApprove);
router.delete("/admin/reviews/:reviewId", authMiddleware, requirePermission("manage_reviews"), adminSidebarController.reviewDelete);
router.get("/admin/users", authMiddleware, requirePermission("users.view"), adminSidebarController.usersIndex);
router.get("/notifications", authMiddleware, requirePermission("manage_notifications"), adminSidebarController.notificationsIndex);
router.post("/notifications/:notificationId/read", authMiddleware, requirePermission("manage_notifications"), adminSidebarController.notificationRead);
router.get("/admin/roles-permissions", authMiddleware, requirePermission("manage_roles_permissions"), adminSidebarController.rolesIndex);
router.put("/admin/roles-permissions", authMiddleware, requirePermission("manage_roles_permissions"), adminSidebarController.rolesUpdate);
router.get("/admin/settings", authMiddleware, requireRole("admin"), adminSidebarController.settingsIndex);
router.post("/admin/settings", authMiddleware, requireRole("admin"), adminSidebarController.settingsUpdate);

module.exports = router;
