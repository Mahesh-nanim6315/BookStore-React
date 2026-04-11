const adminSidebarService = require("../services/adminSidebarService");

async function dashboardStats(req, res, next) {
  try {
    res.json(await adminSidebarService.getDashboardStats());
  } catch (error) {
    next(error);
  }
}

async function ordersIndex(req, res, next) {
  try {
    res.json(await adminSidebarService.getAdminOrders(req.query));
  } catch (error) {
    next(error);
  }
}

async function paymentsIndex(req, res, next) {
  try {
    res.json(await adminSidebarService.getAdminPayments(req.query));
  } catch (error) {
    next(error);
  }
}

async function booksIndex(req, res, next) {
  try {
    res.json(await adminSidebarService.getAdminBooks(req.query));
  } catch (error) {
    next(error);
  }
}

async function authorsIndex(req, res, next) {
  try {
    res.json(await adminSidebarService.getAdminAuthors(req.query));
  } catch (error) {
    next(error);
  }
}

async function usersIndex(req, res, next) {
  try {
    res.json(await adminSidebarService.getAdminUsers(req.query));
  } catch (error) {
    next(error);
  }
}

async function reviewsIndex(req, res, next) {
  try {
    res.json(await adminSidebarService.getAdminReviews(req.query));
  } catch (error) {
    next(error);
  }
}

async function reviewApprove(req, res, next) {
  try {
    res.json(await adminSidebarService.toggleReviewApproval(req.params.reviewId));
  } catch (error) {
    next(error);
  }
}

async function reviewDelete(req, res, next) {
  try {
    res.json(await adminSidebarService.deleteReview(req.params.reviewId));
  } catch (error) {
    next(error);
  }
}

async function notificationsIndex(req, res, next) {
  try {
    res.json(await adminSidebarService.getNotifications(req.query));
  } catch (error) {
    next(error);
  }
}

async function notificationRead(req, res, next) {
  try {
    res.json(await adminSidebarService.markNotificationRead(req.params.notificationId));
  } catch (error) {
    next(error);
  }
}

async function subscriptionsIndex(req, res, next) {
  try {
    res.json(await adminSidebarService.getSubscriptions(req.query));
  } catch (error) {
    next(error);
  }
}

async function rolesIndex(req, res, next) {
  try {
    res.json(await adminSidebarService.getRolesPermissions());
  } catch (error) {
    next(error);
  }
}

async function rolesUpdate(req, res, next) {
  try {
    res.json(await adminSidebarService.updateRolesPermissions(req.body.permissions));
  } catch (error) {
    next(error);
  }
}

async function settingsIndex(req, res, next) {
  try {
    res.json(await adminSidebarService.getSettings());
  } catch (error) {
    next(error);
  }
}

async function settingsUpdate(req, res, next) {
  try {
    res.json(await adminSidebarService.updateSettings(req.body));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dashboardStats,
  ordersIndex,
  paymentsIndex,
  booksIndex,
  authorsIndex,
  usersIndex,
  reviewsIndex,
  reviewApprove,
  reviewDelete,
  notificationsIndex,
  notificationRead,
  subscriptionsIndex,
  rolesIndex,
  rolesUpdate,
  settingsIndex,
  settingsUpdate,
};
