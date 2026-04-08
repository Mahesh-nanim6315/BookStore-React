const knex = require("../config/knex");

async function findLatestByUserId(userId) {
  return knex("subscriptions")
    .where({ user_id: Number(userId) })
    .orderBy("id", "desc")
    .first();
}

async function findActiveByUserId(userId) {
  return knex("subscriptions")
    .where({ user_id: Number(userId) })
    .whereIn("stripe_status", ["active", "trialing"])
    .orderBy("id", "desc")
    .first();
}

async function findGracePeriodByUserId(userId) {
  return knex("subscriptions")
    .where({ user_id: Number(userId), stripe_status: "canceled" })
    .whereNotNull("ends_at")
    .where("ends_at", ">", knex.fn.now())
    .orderBy("id", "desc")
    .first();
}

async function createSubscription({
  userId,
  type = "default",
  stripeId,
  stripeStatus,
  stripePrice,
  quantity = 1,
  trialEndsAt = null,
  endsAt = null,
  now,
}) {
  const [insertId] = await knex("subscriptions").insert({
    user_id: Number(userId),
    type,
    stripe_id: stripeId,
    stripe_status: stripeStatus,
    stripe_price: stripePrice,
    quantity,
    trial_ends_at: trialEndsAt,
    ends_at: endsAt,
    created_at: now,
    updated_at: now,
  });

  return insertId;
}

async function updateSubscriptionById(id, fields) {
  if (!fields || Object.keys(fields).length === 0) {
    return null;
  }

  return knex("subscriptions").where({ id: Number(id) }).update(fields);
}

async function updateUserPlanData({ userId, plan, billingCycle, planExpiresAt, updatedAt }) {
  return knex("users")
    .where({ id: Number(userId) })
    .update({
      plan,
      billing_cycle: billingCycle,
      plan_expires_at: planExpiresAt,
      updated_at: updatedAt,
    });
}

module.exports = {
  findLatestByUserId,
  findActiveByUserId,
  findGracePeriodByUserId,
  createSubscription,
  updateSubscriptionById,
  updateUserPlanData,
};
