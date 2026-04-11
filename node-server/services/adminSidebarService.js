const knex = require("../config/knex");
const { AppError, nowMysql } = require("../utils/helpers");

function toPage(value, fallback = 1) {
  const parsed = Number(value || fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function paginate(total, page, perPage) {
  const currentPage = toPage(page);
  const lastPage = Math.max(1, Math.ceil(Number(total || 0) / perPage));
  const offset = (currentPage - 1) * perPage;

  return {
    currentPage,
    lastPage,
    offset,
    total: Number(total || 0),
  };
}

async function getDashboardStats() {
  const [orders, revenue, users, books, recentOrders, lowStockBooks, topSellingRows, monthlySales] =
    await Promise.all([
      knex("orders").count({ total: "*" }).first(),
      knex("orders").where({ payment_status: "paid" }).sum({ total: "total_amount" }).first(),
      knex("users").count({ total: "*" }).first(),
      knex("books").count({ total: "*" }).first(),
      knex("orders as o")
        .leftJoin("users as u", "u.id", "o.user_id")
        .select(
          "o.id",
          "o.total_amount",
          "o.status",
          "o.created_at",
          "u.id as user_join_id",
          "u.name as user_name",
        )
        .orderBy("o.created_at", "desc")
        .limit(5),
      knex("books").select("id", "name", "stock").where({ has_paperback: 1 }).where("stock", "<", 5).orderBy("stock", "asc").limit(5),
      knex("order_items as oi")
        .leftJoin("books as b", "b.id", "oi.book_id")
        .select("oi.book_id", "b.id as book_join_id", "b.name as book_name")
        .sum({ total_sold: "oi.quantity" })
        .groupBy("oi.book_id", "b.id", "b.name")
        .orderBy("total_sold", "desc")
        .limit(5),
      knex("orders")
        .select(knex.raw("MONTH(created_at) as month"))
        .sum({ total: "total_amount" })
        .where({ payment_status: "paid" })
        .groupByRaw("MONTH(created_at)")
        .orderByRaw("MONTH(created_at)"),
    ]);

  return {
    success: true,
    data: {
      total_orders: Number(orders?.total || 0),
      total_revenue: Number(revenue?.total || 0),
      total_users: Number(users?.total || 0),
      total_books: Number(books?.total || 0),
      chart_data: {
        months: monthlySales.map((item) =>
          new Date(2000, Number(item.month) - 1, 1).toLocaleString("en-US", { month: "long" }),
        ),
        sales: monthlySales.map((item) => Number(item.total || 0)),
      },
      recent_orders: recentOrders.map((order) => ({
        id: order.id,
        total_amount: Number(order.total_amount || 0),
        status: order.status,
        created_at: order.created_at,
        user: order.user_join_id ? { id: order.user_join_id, name: order.user_name } : null,
      })),
      low_stock_books: lowStockBooks.map((book) => ({
        id: book.id,
        name: book.name,
        stock: Number(book.stock || 0),
      })),
      top_selling_books: topSellingRows.map((item) => ({
        book_id: item.book_id,
        total_sold: Number(item.total_sold || 0),
        book: item.book_join_id ? { id: item.book_join_id, name: item.book_name } : null,
      })),
    },
  };
}

async function getAdminOrders(query) {
  const perPage = 10;
  const status = query.status && query.status !== "all" ? query.status : null;
  const countQuery = knex("orders");

  if (status) {
    countQuery.where({ status });
  }

  const totalRow = await countQuery.count({ total: "*" }).first();
  const meta = paginate(totalRow?.total, query.page, perPage);

  const dataQuery = knex("orders as o")
    .leftJoin("users as u", "u.id", "o.user_id")
    .select(
      "o.id",
      "o.total_amount",
      "o.payment_status",
      "o.payment_method",
      "o.status",
      "o.created_at",
      "u.id as user_join_id",
      "u.name as user_name",
      "u.email as user_email",
    )
    .orderBy("o.created_at", "desc")
    .limit(perPage)
    .offset(meta.offset);

  if (status) {
    dataQuery.where("o.status", status);
  }

  const rows = await dataQuery;

  return {
    success: true,
    data: {
      data: rows.map((order) => ({
        id: order.id,
        total_amount: Number(order.total_amount || 0),
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        status: order.status,
        created_at: order.created_at,
        user: order.user_join_id
          ? { id: order.user_join_id, name: order.user_name, email: order.user_email }
          : null,
      })),
      current_page: meta.currentPage,
      last_page: meta.lastPage,
      total: meta.total,
    },
  };
}

async function getAdminPayments(query) {
  const perPage = 10;
  const totalRow = await knex("orders").whereNotNull("payment_id").count({ total: "*" }).first();
  const meta = paginate(totalRow?.total, query.page, perPage);
  const rows = await knex("orders as o")
    .leftJoin("users as u", "u.id", "o.user_id")
    .select(
      "o.id",
      "o.total_amount",
      "o.payment_id",
      "o.payment_method",
      "o.payment_status",
      "o.created_at",
      "u.id as user_join_id",
      "u.name as user_name",
    )
    .whereNotNull("o.payment_id")
    .orderBy("o.created_at", "desc")
    .limit(perPage)
    .offset(meta.offset);

  return {
    success: true,
    data: {
      data: rows.map((payment) => ({
        id: payment.id,
        total_amount: Number(payment.total_amount || 0),
        payment_id: payment.payment_id,
        payment_method: payment.payment_method,
        payment_status: payment.payment_status,
        created_at: payment.created_at,
        user: payment.user_join_id ? { id: payment.user_join_id, name: payment.user_name } : null,
      })),
      current_page: meta.currentPage,
      last_page: meta.lastPage,
      total: meta.total,
    },
  };
}

async function getAdminBooks(query) {
  const perPage = 12;
  const countQuery = knex("books as b");
  applyBookFilters(countQuery, query);
  const totalRow = await countQuery.count({ total: "*" }).first();
  const meta = paginate(totalRow?.total, query.page, perPage);

  const rows = await knex("books as b")
    .leftJoin("authors as a", "a.id", "b.author_id")
    .leftJoin("categories as c", "c.id", "b.category_id")
    .leftJoin("genres as g", "g.id", "b.genre_id")
    .select(
      "b.*",
      "a.id as author_join_id",
      "a.name as author_name",
      "c.id as category_join_id",
      "c.name as category_name",
      "g.id as genre_join_id",
      "g.name as genre_name",
    )
    .orderBy("b.id", "desc")
    .limit(perPage)
    .offset(meta.offset)
    .modify((builder) => applyBookFilters(builder, query));

  const [authors, categories, genres] = await Promise.all([
    knex("authors").select("id", "name").orderBy("name", "asc"),
    knex("categories").select("id", "name").orderBy("name", "asc"),
    knex("genres").select("id", "name").orderBy("name", "asc"),
  ]);

  return {
    success: true,
    data: {
      books: {
        data: rows.map((book) => ({
          ...book,
          has_ebook: Boolean(book.has_ebook),
          has_audio: Boolean(book.has_audio),
          has_paperback: Boolean(book.has_paperback),
          is_premium: Boolean(book.is_premium),
          author: book.author_join_id ? { id: book.author_join_id, name: book.author_name } : null,
          category: book.category_join_id ? { id: book.category_join_id, name: book.category_name } : null,
          genre: book.genre_join_id ? { id: book.genre_join_id, name: book.genre_name } : null,
        })),
        current_page: meta.currentPage,
        last_page: meta.lastPage,
        total: meta.total,
      },
      filters: { authors, categories, genres },
    },
  };
}

function applyBookFilters(query, filters) {
  if (filters.search) query.where("b.name", "like", `%${filters.search}%`);
  if (filters.author) query.where("b.author_id", Number(filters.author));
  if (filters.category) query.where("b.category_id", Number(filters.category));
  if (filters.genre) query.where("b.genre_id", Number(filters.genre));
  if (filters.format === "ebook") query.where("b.has_ebook", 1);
  if (filters.format === "audio") query.where("b.has_audio", 1);
  if (filters.format === "paperback") query.where("b.has_paperback", 1);
  if (filters.premium !== undefined && filters.premium !== "") query.where("b.is_premium", Number(filters.premium) ? 1 : 0);
}

async function getAdminAuthors(query) {
  const perPage = 10;
  const base = knex("authors as a").leftJoin("books as b", "b.author_id", "a.id");
  if (query.search) base.where("a.name", "like", `%${query.search}%`);
  base.groupBy("a.id");
  if (query.min_books) base.havingRaw("COUNT(b.id) >= ?", [Number(query.min_books)]);
  const total = (await base.clone()).length;
  const meta = paginate(total, query.page, perPage);
  const rows = await base
    .clone()
    .clearSelect()
    .select("a.*")
    .count({ books_count: "b.id" })
    .orderBy("a.id", "desc")
    .limit(perPage)
    .offset(meta.offset);

  return {
    success: true,
    data: {
      data: rows.map((row) => ({ ...row, books_count: Number(row.books_count || 0) })),
      current_page: meta.currentPage,
      last_page: meta.lastPage,
      total: meta.total,
    },
  };
}

async function getAdminUsers(query) {
  const perPage = 10;
  const countQuery = knex("users");
  if (query.search) {
    countQuery.where((builder) =>
      builder.where("name", "like", `%${query.search}%`).orWhere("email", "like", `%${query.search}%`),
    );
  }
  const totalRow = await countQuery.count({ total: "*" }).first();
  const meta = paginate(totalRow?.total, query.page, perPage);
  const rows = await knex("users")
    .select("*")
    .modify((builder) => {
      if (query.search) {
        builder.where((inner) =>
          inner.where("name", "like", `%${query.search}%`).orWhere("email", "like", `%${query.search}%`),
        );
      }
    })
    .orderBy("id", "desc")
    .limit(perPage)
    .offset(meta.offset);

  return {
    success: true,
    data: {
      data: rows,
      current_page: meta.currentPage,
      last_page: meta.lastPage,
      total: meta.total,
    },
  };
}

async function getAdminReviews(query) {
  const perPage = 10;
  const countQuery = knex("reviews as r")
    .leftJoin("users as u", "u.id", "r.user_id")
    .leftJoin("books as b", "b.id", "r.book_id");
  applyReviewFilters(countQuery, query);
  const totalRow = await countQuery.countDistinct({ total: "r.id" }).first();
  const meta = paginate(totalRow?.total, query.page, perPage);

  const rows = await knex("reviews as r")
    .leftJoin("users as u", "u.id", "r.user_id")
    .leftJoin("books as b", "b.id", "r.book_id")
    .select(
      "r.*",
      "u.id as user_join_id",
      "u.name as user_name",
      "u.email as user_email",
      "b.id as book_join_id",
      "b.name as book_name",
    )
    .modify((builder) => applyReviewFilters(builder, query))
    .orderBy("r.created_at", "desc")
    .limit(perPage)
    .offset(meta.offset);

  return {
    success: true,
    data: {
      data: rows.map((row) => ({
        ...row,
        is_approved: Boolean(row.is_approved),
        user: row.user_join_id ? { id: row.user_join_id, name: row.user_name, email: row.user_email } : null,
        book: row.book_join_id ? { id: row.book_join_id, name: row.book_name } : null,
      })),
      current_page: meta.currentPage,
      last_page: meta.lastPage,
      total: meta.total,
    },
  };
}

function applyReviewFilters(query, filters) {
  if (filters.status !== undefined && filters.status !== "") {
    query.where("r.is_approved", Number(filters.status) ? 1 : 0);
  }
  if (filters.search) {
    query.where((builder) =>
      builder.where("u.name", "like", `%${filters.search}%`).orWhere("b.name", "like", `%${filters.search}%`),
    );
  }
}

async function toggleReviewApproval(reviewId) {
  const review = await knex("reviews").where({ id: Number(reviewId) }).first();
  if (!review) throw new AppError("Review not found.", 404);
  await knex("reviews").where({ id: Number(reviewId) }).update({
    is_approved: Number(review.is_approved) ? 0 : 1,
    updated_at: nowMysql(),
  });
  const refreshedList = await getAdminReviews({ page: 1, search: "", status: "" });
  const refreshed = refreshedList.data.data.find((item) => Number(item.id) === Number(reviewId));
  return {
    success: true,
    message: "Review status updated",
    data: { review: refreshed },
  };
}

async function deleteReview(reviewId) {
  await knex("reviews").where({ id: Number(reviewId) }).del();
  return { success: true, message: "Review deleted" };
}

async function getNotifications(query) {
  const perPage = 10;
  const totalRow = await knex("notifications")
    .where({ notifiable_type: "App\\Models\\User" })
    .count({ total: "*" })
    .first();
  const meta = paginate(totalRow?.total, query.page, perPage);
  const rows = await knex("notifications")
    .select("*")
    .where({ notifiable_type: "App\\Models\\User" })
    .orderBy("created_at", "desc")
    .limit(perPage)
    .offset(meta.offset);

  return {
    success: true,
    data: {
      data: rows.map((row) => ({
        ...row,
        data: safeParseJson(row.data, {}),
      })),
      current_page: meta.currentPage,
      last_page: meta.lastPage,
      total: meta.total,
    },
  };
}

async function markNotificationRead(notificationId) {
  await knex("notifications").where({ id: String(notificationId) }).update({ read_at: nowMysql() });
  return { success: true, message: "Notification marked as read." };
}

async function getSubscriptions(query) {
  const perPage = 12;
  const latestSub = knex("subscriptions as source")
    .select("source.user_id")
    .max({ latest_id: "source.id" })
    .where("source.type", "default")
    .groupBy("source.user_id")
    .as("latest_subscription");

  const base = knex("users")
    .leftJoin(latestSub, "users.id", "latest_subscription.user_id")
    .leftJoin("subscriptions as subscription", "subscription.id", "latest_subscription.latest_id")
    .select(
      "users.id",
      "users.name",
      "users.email",
      "users.plan",
      "users.billing_cycle",
      "users.plan_expires_at",
      "users.created_at",
      "subscription.id as subscription_id",
      "subscription.stripe_id as stripe_subscription_id",
      "subscription.stripe_status",
      "subscription.ends_at as subscription_ends_at",
      "subscription.trial_ends_at",
      knex.raw(`
        CASE
          WHEN COALESCE(users.plan, 'free') = 'free' THEN 'free'
          WHEN subscription.ends_at IS NOT NULL AND subscription.ends_at > NOW() THEN 'grace_period'
          WHEN subscription.stripe_status = 'trialing' THEN 'trialing'
          WHEN subscription.stripe_status = 'active' THEN 'active'
          WHEN users.plan_expires_at IS NOT NULL AND users.plan_expires_at < NOW() THEN 'expired'
          WHEN subscription.stripe_status IN ('canceled', 'cancelled', 'incomplete_expired', 'unpaid') THEN 'cancelled'
          ELSE 'active'
        END as subscription_state
      `),
    );

  if (query.search) {
    base.where((builder) =>
      builder.where("users.name", "like", `%${query.search}%`).orWhere("users.email", "like", `%${query.search}%`),
    );
  }
  if (query.plan && query.plan !== "all") base.where("users.plan", query.plan);
  if (query.billing_cycle && query.billing_cycle !== "all") {
    if (query.billing_cycle === "none") {
      base.where((builder) => builder.whereNull("users.billing_cycle").orWhere("users.billing_cycle", ""));
    } else {
      base.where("users.billing_cycle", query.billing_cycle);
    }
  }
  if (query.status && query.status !== "all") base.having("subscription_state", query.status);

  const total = (await base.clone()).length;
  const meta = paginate(total, query.page, perPage);
  const rows = await base
    .clone()
    .orderByRaw("CASE WHEN COALESCE(users.plan, 'free') = 'free' THEN 1 ELSE 0 END ASC")
    .orderBy("users.plan_expires_at", "desc")
    .orderBy("users.name", "asc")
    .limit(perPage)
    .offset(meta.offset);

  const [totalUsers, paidUsers, activeUsers, graceUsers] = await Promise.all([
    knex("users").count({ total: "*" }).first(),
    knex("users").whereIn("plan", ["premium", "ultimate"]).count({ total: "*" }).first(),
    knex("users")
      .whereIn("plan", ["premium", "ultimate"])
      .andWhere((builder) => builder.whereNull("plan_expires_at").orWhere("plan_expires_at", ">", knex.fn.now()))
      .count({ total: "*" })
      .first(),
    knex("subscriptions")
      .where("type", "default")
      .whereNotNull("ends_at")
      .andWhere("ends_at", ">", knex.fn.now())
      .count({ total: "*" })
      .first(),
  ]);

  return {
    success: true,
    data: {
      data: rows.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        plan: item.plan || "free",
        billing_cycle: item.billing_cycle,
        plan_expires_at: item.plan_expires_at,
        created_at: item.created_at,
        subscription_state: item.subscription_state,
        stripe_status: item.stripe_status,
        stripe_subscription_id: item.stripe_subscription_id,
        subscription_ends_at: item.subscription_ends_at,
        trial_ends_at: item.trial_ends_at,
        can_cancel: ["active", "trialing"].includes(item.subscription_state),
        can_resume: item.subscription_state === "grace_period",
        can_delete: (item.plan || "free") !== "free" || Boolean(item.subscription_id),
      })),
      current_page: meta.currentPage,
      last_page: meta.lastPage,
      total: meta.total,
    },
    meta: {
      summary: {
        total: Number(totalUsers?.total || 0),
        paid: Number(paidUsers?.total || 0),
        active: Number(activeUsers?.total || 0),
        grace_period: Number(graceUsers?.total || 0),
      },
    },
  };
}

const PERMISSION_LABELS = {
  access_dashboard: "Access Dashboard",
  manage_orders: "Manage Orders",
  manage_payments: "Manage Payments",
  "books.view": "Books: View",
  "books.create": "Books: Create",
  "books.edit": "Books: Edit/Update",
  "books.delete": "Books: Delete",
  "authors.view": "Authors: View",
  "authors.create": "Authors: Create",
  "authors.edit": "Authors: Edit/Update",
  "authors.delete": "Authors: Delete",
  "users.view": "Users: View",
  "users.create": "Users: Create",
  "users.edit": "Users: Edit/Update",
  "users.delete": "Users: Delete",
  manage_reviews: "Manage Reviews",
  manage_notifications: "Manage Notifications",
  manage_roles_permissions: "Manage Roles & Permissions",
};

const DEFAULT_ROLE_PERMISSIONS = {
  admin: Object.keys(PERMISSION_LABELS),
  manager: [
    "access_dashboard",
    "manage_orders",
    "books.view",
    "books.create",
    "books.edit",
    "books.delete",
    "authors.view",
    "authors.create",
    "authors.edit",
    "authors.delete",
    "manage_reviews",
    "manage_notifications",
  ],
  staff: ["access_dashboard", "manage_orders", "manage_reviews"],
  user: [],
};

async function getRolesPermissions() {
  const dbRoles = await knex("users")
    .distinct("role")
    .whereNotNull("role");

  const roles = [
    ...new Set([
      "admin",
      "manager",
      "staff",
      "user",
      ...dbRoles.map((row) => String(row.role || "").toLowerCase()).filter(Boolean),
    ]),
  ];

  const saved = await knex("role_permissions").select("id", "role", "permissions");
  const savedByRole = Object.fromEntries(
    saved.map((row) => [
      String(row.role || "").toLowerCase(),
      Array.isArray(row.permissions) ? row.permissions : safeParseJson(row.permissions, []),
    ]),
  );

  const rolePermissions = Object.fromEntries(
    roles.map((role) => [role, savedByRole[role] || DEFAULT_ROLE_PERMISSIONS[role] || []]),
  );

  return {
    success: true,
    data: {
      roles,
      permission_labels: PERMISSION_LABELS,
      role_permissions: rolePermissions,
      default_permissions: DEFAULT_ROLE_PERMISSIONS,
    },
  };
}

async function updateRolesPermissions(permissionsInput) {
  const now = nowMysql();
  const allowed = Object.keys(PERMISSION_LABELS);
  const roles = ["manager", "staff", "user"];

  for (const role of roles) {
    const selected = Array.isArray(permissionsInput?.[role]) ? permissionsInput[role] : [];
    const filtered = [...new Set(selected.filter((item) => allowed.includes(item)))];
    const existing = await knex("role_permissions").whereRaw("LOWER(role) = ?", [role]).first();

    if (existing) {
      await knex("role_permissions")
        .where({ id: existing.id })
        .update({
          permissions: JSON.stringify(filtered),
          updated_at: now,
        });
    } else {
      await knex("role_permissions").insert({
        role,
        permissions: JSON.stringify(filtered),
        created_at: now,
        updated_at: now,
      });
    }
  }

  const refreshed = await getRolesPermissions();
  return {
    success: true,
    message: "Roles and permissions updated successfully.",
    data: {
      role_permissions: refreshed.data.role_permissions,
    },
  };
}

async function getSettings() {
  const wantedKeys = [
    "site_name",
    "support_email",
    "tax_rate",
    "maintenance_mode",
    "subscriptions_enabled",
    "free_trial_days",
    "auto_approve_reviews",
    "books_per_page",
  ];

  const rows = await knex("settings").select("key", "value").whereIn("key", wantedKeys);
  const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  return {
    success: true,
    data: {
      settings: {
        site_name: String(values.site_name || ""),
        support_email: String(values.support_email || ""),
        tax_rate: String(values.tax_rate || "5"),
        maintenance_mode: String(values.maintenance_mode || "0"),
        subscriptions_enabled: String(values.subscriptions_enabled || "1"),
        free_trial_days: String(values.free_trial_days || "0"),
        auto_approve_reviews: String(values.auto_approve_reviews || "0"),
        books_per_page: String(values.books_per_page || "12"),
      },
    },
  };
}

async function updateSettings(payload) {
  const now = nowMysql();
  const normalized = {
    site_name: String(payload.site_name || "").trim(),
    support_email: String(payload.support_email || "").trim(),
    tax_rate: String(payload.tax_rate ?? "5").trim(),
    maintenance_mode: String(payload.maintenance_mode ?? "0").trim() === "1" ? "1" : "0",
    subscriptions_enabled: String(payload.subscriptions_enabled ?? "1").trim() === "1" ? "1" : "0",
    free_trial_days: String(payload.free_trial_days ?? "0").trim(),
    auto_approve_reviews: String(payload.auto_approve_reviews ?? "0").trim() === "1" ? "1" : "0",
    books_per_page: String(payload.books_per_page ?? "12").trim(),
  };

  for (const [key, value] of Object.entries(normalized)) {
    const existing = await knex("settings").where({ key }).first();
    if (existing) {
      await knex("settings").where({ key }).update({ value, updated_at: now });
    } else {
      await knex("settings").insert({ key, value, created_at: now, updated_at: now });
    }
  }

  return {
    success: true,
    message: "Settings updated successfully.",
    data: {
      settings: (await getSettings()).data.settings,
    },
  };
}

function safeParseJson(value, fallback) {
  if (value && typeof value === "object") return value;
  try {
    return JSON.parse(String(value || ""));
  } catch (_error) {
    return fallback;
  }
}

module.exports = {
  getDashboardStats,
  getAdminOrders,
  getAdminPayments,
  getAdminBooks,
  getAdminAuthors,
  getAdminUsers,
  getAdminReviews,
  toggleReviewApproval,
  deleteReview,
  getNotifications,
  markNotificationRead,
  getSubscriptions,
  getRolesPermissions,
  updateRolesPermissions,
  getSettings,
  updateSettings,
};
