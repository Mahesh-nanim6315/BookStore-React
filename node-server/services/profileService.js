const bcrypt = require("bcryptjs");
const authModel = require("../models/authModel");
const profileModel = require("../models/profileModel");
const authService = require("./authService");
const {
  AppError,
  isValidEmail,
  normalizeEmail,
  nowMysql,
  validateStrongPassword,
} = require("../utils/helpers");

async function getProfile(currentUser) {
  const user = await authModel.findUserById(currentUser.id);
  if (!user) {
    throw new AppError("Unauthenticated.", 401);
  }

  const [totalOrders, wishlistCount, reviewCount, recentOrderItems, formatted] = await Promise.all([
    profileModel.countOrdersByUserId(user.id),
    profileModel.countWishlistByUserId(user.id),
    profileModel.countReviewsByUserId(user.id),
    profileModel.getRecentOrderItemsByUserId(user.id),
    authService.getCurrentUser(user),
  ]);

  return {
    success: true,
    data: {
      user: formatted.user,
      total_orders: totalOrders,
      wishlist_count: wishlistCount,
      review_count: reviewCount,
      profile_completion: calculateProfileCompletion(user),
      recent_books: recentOrderItems.map(mapRecentOrderItem),
    },
  };
}

async function updateProfile(currentUser, payload) {
  const user = await authModel.findUserById(currentUser.id);
  if (!user) {
    throw new AppError("Unauthenticated.", 401);
  }

  const name = String(payload.name || "").trim();
  const email = normalizeEmail(payload.email);
  const currentPassword = String(payload.current_password || "");
  const password = String(payload.password || "");
  const passwordConfirmation = String(payload.password_confirmation || "");
  const errors = {};

  if (!name) {
    errors.name = ["Name is required."];
  } else if (name.length > 255) {
    errors.name = ["Name may not be greater than 255 characters."];
  }

  if (!email) {
    errors.email = ["Email is required."];
  } else if (!isValidEmail(email)) {
    errors.email = ["Enter a valid email address."];
  } else if (email !== String(user.email || "").toLowerCase()) {
    const existing = await authModel.findUserByEmail(email);
    if (existing && Number(existing.id) !== Number(user.id)) {
      errors.email = ["The email has already been taken."];
    }
  }

  if (password) {
    if (!currentPassword) {
      errors.current_password = ["Current password is required to change your password."];
    } else {
      const matches = await bcrypt.compare(currentPassword, String(user.password || ""));
      if (!matches) {
        errors.current_password = ["Current password is incorrect."];
      }
    }

    if (!passwordConfirmation) {
      errors.password_confirmation = ["Please confirm your password."];
    } else if (password !== passwordConfirmation) {
      errors.password_confirmation = ["Passwords do not match."];
    }

    try {
      validateStrongPassword(password);
    } catch (_error) {
      errors.password = [
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
      ];
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 422, { errors });
  }

  const changes = {
    name,
    email,
    updated_at: nowMysql(),
  };

  if (password) {
    changes.password = await bcrypt.hash(password, 12);
  }

  await profileModel.updateUserById(user.id, changes);

  const refreshedUser = await authModel.findUserById(user.id);
  const formatted = await authService.getCurrentUser(refreshedUser);

  return {
    success: true,
    message: "Profile updated successfully.",
    data: {
      user: formatted.user,
    },
  };
}

function calculateProfileCompletion(user) {
  let completion = 0;

  if (user?.name) {
    completion += 25;
  }

  if (user?.email) {
    completion += 25;
  }

  if (user?.avatar) {
    completion += 25;
  }

  if (user?.cover) {
    completion += 25;
  }

  return completion;
}

function mapRecentOrderItem(row) {
  return {
    id: row.id,
    order_id: row.order_id,
    book_id: row.book_id,
    format: row.format,
    quantity: row.quantity,
    price: row.price,
    created_at: row.created_at,
    updated_at: row.updated_at,
    book: row.book_join_id
      ? {
          id: row.book_join_id,
          name: row.book_name,
          image: row.book_image,
        }
      : null,
  };
}

module.exports = {
  getProfile,
  updateProfile,
};
