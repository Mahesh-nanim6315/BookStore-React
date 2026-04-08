const knex = require("../config/knex");

async function findUserByEmail(email) {
  return knex("users").where({ email }).first();
}

async function findUserById(id) {
  return knex("users").where({ id: Number(id) }).first();
}

async function createUser({ name, email, passwordHash, now }) {
  const [insertId] = await knex("users").insert({
    name,
    email,
    password: passwordHash,
    role: "user",
    is_active: 1,
    created_at: now,
    updated_at: now,
  });

  return insertId;
}

async function findRolePermissionsByRole(role) {
  return knex("role_permissions")
    .select("permissions")
    .whereRaw("LOWER(role) = ?", [String(role || "").toLowerCase()])
    .first();
}

async function findPasswordResetTokenByEmail(email) {
  return knex("password_reset_tokens")
    .select("email", "token", "created_at")
    .where({ email })
    .first();
}

async function deletePasswordResetTokenByEmail(email) {
  return knex("password_reset_tokens").where({ email }).del();
}

async function upsertPasswordResetToken({ email, tokenHash, createdAt }) {
  await deletePasswordResetTokenByEmail(email);
  return knex("password_reset_tokens").insert({
    email,
    token: tokenHash,
    created_at: createdAt,
  });
}

async function createAccessTokenRecord({
  userId,
  tokenHash,
  expiresAt,
  now,
}) {
  return knex("personal_access_tokens").insert({
    tokenable_type: "App\\Models\\User",
    tokenable_id: userId,
    name: "auth_token",
    token: tokenHash,
    abilities: null,
    last_used_at: null,
    expires_at: expiresAt,
    created_at: now,
    updated_at: now,
  });
}

async function findAccessTokenByHash(tokenHash) {
  return knex("personal_access_tokens")
    .select("id", "tokenable_id", "expires_at")
    .where({
      token: tokenHash,
      tokenable_type: "App\\Models\\User",
    })
    .first();
}

async function deleteAccessTokenById(id) {
  return knex("personal_access_tokens").where({ id: Number(id) }).del();
}

async function deleteAccessTokensByUserId(userId) {
  return knex("personal_access_tokens")
    .where({
      tokenable_type: "App\\Models\\User",
      tokenable_id: Number(userId),
    })
    .del();
}

async function touchAccessTokenLastUsed(id, lastUsedAt) {
  return knex("personal_access_tokens")
    .where({ id: Number(id) })
    .update({ last_used_at: lastUsedAt });
}

async function resetUserPasswordAndRevokeTokens({
  userId,
  email,
  passwordHash,
  rememberToken,
  now,
}) {
  return knex.transaction(async (trx) => {
    await trx("users")
      .where({ id: Number(userId) })
      .update({
        password: passwordHash,
        remember_token: rememberToken,
        updated_at: now,
      });

    await trx("password_reset_tokens").where({ email }).del();

    await trx("personal_access_tokens")
      .where({
        tokenable_type: "App\\Models\\User",
        tokenable_id: Number(userId),
      })
      .del();
  });
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  findRolePermissionsByRole,
  findPasswordResetTokenByEmail,
  deletePasswordResetTokenByEmail,
  upsertPasswordResetToken,
  createAccessTokenRecord,
  findAccessTokenByHash,
  deleteAccessTokenById,
  deleteAccessTokensByUserId,
  touchAccessTokenLastUsed,
  resetUserPasswordAndRevokeTokens,
};
