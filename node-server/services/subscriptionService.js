const { AppError, nowTimestamp, randomHex } = require("../utils/helpers");
const settingsModel = require("../models/settingsModel");
const subscriptionModel = require("../models/subscriptionModel");
const authModel = require("../models/authModel");

const ALLOWED_PLANS = new Set(["free", "premium", "ultimate"]);
const ALLOWED_BILLING = new Set(["monthly", "yearly"]);
const DEFAULT_PLANS_REDIRECT = "/plans";
const DEFAULT_PROFILE_REDIRECT = "/profile";

function frontendUrl(path) {
  const base = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
  return `${base}/${String(path || "").replace(/^\/+/, "")}`;
}

function nowMysql() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function normalizePath(path, fallback = "/") {
  const value = String(path || "").trim();
  if (!value.startsWith("/")) {
    return fallback;
  }

  if (value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function addQuery(path, query) {
  const url = new URL(frontendUrl(path));
  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function nextExpiry(billing) {
  const date = nowTimestamp();
  if (billing === "yearly") {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function priceKey(plan, billing) {
  return `${plan}_${billing}`;
}

function hasGracePeriod(subscription) {
  if (!subscription) {
    return false;
  }

  if (subscription.stripe_status !== "canceled" || !subscription.ends_at) {
    return false;
  }

  return new Date(subscription.ends_at) > nowTimestamp();
}

async function checkout(user, payload = {}) {
  const plan = String(payload.plan || "").toLowerCase();
  const billing = String(payload.billing_cycle || "").toLowerCase();
  const redirectPath = normalizePath(payload.redirect_path || DEFAULT_PLANS_REDIRECT, DEFAULT_PLANS_REDIRECT);

  if (!ALLOWED_PLANS.has(plan)) {
    throw new AppError("Validation failed.", 422, {
      errors: { plan: ["The selected plan is invalid."] },
    });
  }

  if (!ALLOWED_BILLING.has(billing)) {
    throw new AppError("Validation failed.", 422, {
      errors: { billing_cycle: ["The selected billing cycle is invalid."] },
    });
  }

  const subscriptionsEnabled = String(await settingsModel.getValue("subscriptions_enabled", "1")) === "1";
  if (!subscriptionsEnabled && plan !== "free") {
    throw new AppError("Subscriptions are currently disabled.", 403);
  }

  const latest = await subscriptionModel.findLatestByUserId(user.id);
  if (
    user.plan === plan &&
    user.billing_cycle === billing &&
    !hasGracePeriod(latest)
  ) {
    throw new AppError("You are already on this plan.", 422);
  }

  if (plan === "free") {
    if (latest && ["active", "trialing", "canceled"].includes(String(latest.stripe_status))) {
      await subscriptionModel.updateSubscriptionById(latest.id, {
        stripe_status: "canceled",
        ends_at: nowMysql(),
        updated_at: nowMysql(),
      });
    }

    await subscriptionModel.updateUserPlanData({
      userId: user.id,
      plan: "free",
      billingCycle: null,
      planExpiresAt: null,
      updatedAt: nowMysql(),
    });

    const refreshedUser = await authModel.findUserById(user.id);
    return {
      success: true,
      message: "Downgraded to Free plan successfully.",
      data: {
        redirect: redirectPath,
        user: refreshedUser,
      },
    };
  }

  // Simulated checkout URL that lands back on frontend and then calls /subscription/success.
  const sessionId = `sub_${randomHex(12)}`;
  return {
    success: true,
    data: {
      checkout_url: addQuery(redirectPath, {
        subscription: "success",
        plan,
        billing,
        session_id: sessionId,
      }),
      plan,
      billing_cycle: billing,
    },
  };
}

async function success(user, query = {}) {
  const pendingPlan = String(query.plan || "").toLowerCase();
  const pendingBilling = String(query.billing || "").toLowerCase();
  const sessionId = String(query.session_id || "").trim();

  if (!sessionId || !ALLOWED_PLANS.has(pendingPlan) || !ALLOWED_BILLING.has(pendingBilling)) {
    throw new AppError("No active Stripe subscription found.", 422, {
      redirect: DEFAULT_PLANS_REDIRECT,
    });
  }

  const expiresAt = nextExpiry(pendingBilling);
  const now = nowMysql();
  const latest = await subscriptionModel.findLatestByUserId(user.id);

  if (latest) {
    await subscriptionModel.updateSubscriptionById(latest.id, {
      stripe_status: "active",
      stripe_price: priceKey(pendingPlan, pendingBilling),
      ends_at: expiresAt,
      trial_ends_at: null,
      updated_at: now,
    });
  } else {
    await subscriptionModel.createSubscription({
      userId: user.id,
      type: "default",
      stripeId: sessionId,
      stripeStatus: "active",
      stripePrice: priceKey(pendingPlan, pendingBilling),
      quantity: 1,
      trialEndsAt: null,
      endsAt: expiresAt,
      now,
    });
  }

  await subscriptionModel.updateUserPlanData({
    userId: user.id,
    plan: pendingPlan,
    billingCycle: pendingBilling,
    planExpiresAt: expiresAt,
    updatedAt: now,
  });

  return {
    success: true,
    message: "Subscription activated successfully.",
    data: {
      redirect: DEFAULT_PROFILE_REDIRECT,
    },
  };
}

async function cancel(user) {
  const active = await subscriptionModel.findActiveByUserId(user.id);
  if (!active) {
    throw new AppError("No active subscription found.", 422);
  }

  if (hasGracePeriod(active)) {
    throw new AppError("Subscription is already set to cancel.", 422);
  }

  const planExpiresAt =
    user.plan_expires_at && new Date(user.plan_expires_at) > nowTimestamp()
      ? user.plan_expires_at
      : nextExpiry(user.billing_cycle || "monthly");

  const now = nowMysql();
  await subscriptionModel.updateSubscriptionById(active.id, {
    stripe_status: "canceled",
    ends_at: planExpiresAt,
    updated_at: now,
  });

  await subscriptionModel.updateUserPlanData({
    userId: user.id,
    plan: user.plan || "free",
    billingCycle: user.billing_cycle || null,
    planExpiresAt,
    updatedAt: now,
  });

  return {
    success: true,
    message: "Subscription will be cancelled at the end of billing period.",
    data: {
      plan_expires_at: planExpiresAt,
    },
  };
}

async function resume(user) {
  const grace = await subscriptionModel.findGracePeriodByUserId(user.id);
  if (!grace) {
    const active = await subscriptionModel.findActiveByUserId(user.id);
    if (active) {
      throw new AppError("Subscription is already active.", 422);
    }

    throw new AppError("No subscription found.", 422);
  }

  const expiresAt = nextExpiry(user.billing_cycle || "monthly");
  const now = nowMysql();
  await subscriptionModel.updateSubscriptionById(grace.id, {
    stripe_status: "active",
    ends_at: expiresAt,
    updated_at: now,
  });

  await subscriptionModel.updateUserPlanData({
    userId: user.id,
    plan: user.plan || "premium",
    billingCycle: user.billing_cycle || "monthly",
    planExpiresAt: expiresAt,
    updatedAt: now,
  });

  return {
    success: true,
    message: "Subscription resumed successfully.",
    data: {
      plan_expires_at: expiresAt,
    },
  };
}

module.exports = {
  checkout,
  success,
  cancel,
  resume,
};
