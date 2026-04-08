/**
 * Mirrors Laravel migrations:
 * - 0001_01_01_000000_create_users_table.php
 * - 2025_12_17_094512_create_personal_access_tokens_table.php
 * - plus user table alteration migrations up to current backend state
 */

exports.up = async function up(knex) {
  await knex.schema.createTable("users", (table) => {
    table.bigIncrements("id");
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.boolean("is_active").notNullable().defaultTo(true);
    table.timestamp("email_verified_at").nullable();
    table.string("password").notNullable();
    table.string("remember_token", 100).nullable();

    table.string("role").notNullable().defaultTo("user");
    table.string("plan").notNullable().defaultTo("free");
    table.string("billing_cycle").nullable();
    table.timestamp("plan_expires_at").nullable();
    table.string("avatar").nullable();
    table.string("cover").nullable();

    table.string("stripe_id").nullable().index();
    table.string("pm_type").nullable();
    table.string("pm_last_four", 4).nullable();
    table.timestamp("trial_ends_at").nullable();

    table.timestamps(true, true);
  });

  await knex.schema.createTable("password_reset_tokens", (table) => {
    table.string("email").primary();
    table.string("token").notNullable();
    table.timestamp("created_at").nullable();
  });

  await knex.schema.createTable("sessions", (table) => {
    table.string("id").primary();
    table.bigInteger("user_id").unsigned().nullable().index();
    table.string("ip_address", 45).nullable();
    table.text("user_agent").nullable();
    table.longtext("payload").notNullable();
    table.integer("last_activity").notNullable().index();
  });

  await knex.schema.createTable("personal_access_tokens", (table) => {
    table.bigIncrements("id");
    table.string("tokenable_type").notNullable();
    table.bigInteger("tokenable_id").unsigned().notNullable();
    table.text("name").notNullable();
    table.string("token", 64).notNullable().unique();
    table.text("abilities").nullable();
    table.timestamp("last_used_at").nullable();
    table.timestamp("expires_at").nullable().index();
    table.timestamps(true, true);
    table.index(["tokenable_type", "tokenable_id"], "pat_tokenable_index");
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("personal_access_tokens");
  await knex.schema.dropTableIfExists("sessions");
  await knex.schema.dropTableIfExists("password_reset_tokens");
  await knex.schema.dropTableIfExists("users");
};
