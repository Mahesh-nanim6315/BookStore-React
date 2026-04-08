/**
 * Mirrors Laravel migrations:
 * - wishlists, reviews (+ is_approved), newsletters, notifications
 * - role_permissions, settings
 */

exports.up = async function up(knex) {
  await knex.schema.createTable("wishlists", (table) => {
    table.bigIncrements("id");
    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .bigInteger("book_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("books")
      .onDelete("CASCADE");
    table.timestamps(true, true);
    table.unique(["user_id", "book_id"]);
  });

  await knex.schema.createTable("reviews", (table) => {
    table.bigIncrements("id");
    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .bigInteger("book_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("books")
      .onDelete("CASCADE");
    table.specificType("rating", "tinyint").notNullable();
    table.text("comment").nullable();
    table.boolean("is_approved").notNullable().defaultTo(false);
    table.timestamps(true, true);
    table.unique(["user_id", "book_id"]);
  });

  await knex.schema.createTable("newsletters", (table) => {
    table.bigIncrements("id");
    table.string("email").notNullable().unique();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("notifications", (table) => {
    table.uuid("id").primary();
    table.string("type").notNullable();
    table.string("notifiable_type").notNullable();
    table.bigInteger("notifiable_id").unsigned().notNullable();
    table.text("data").notNullable();
    table.timestamp("read_at").nullable();
    table.timestamps(true, true);
    table.index(["notifiable_type", "notifiable_id"], "notifications_notifiable_index");
  });

  await knex.schema.createTable("role_permissions", (table) => {
    table.bigIncrements("id");
    table.string("role").notNullable().unique();
    table.json("permissions").nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("settings", (table) => {
    table.bigIncrements("id");
    table.string("key").notNullable().unique();
    table.text("value").nullable();
    table.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("settings");
  await knex.schema.dropTableIfExists("role_permissions");
  await knex.schema.dropTableIfExists("notifications");
  await knex.schema.dropTableIfExists("newsletters");
  await knex.schema.dropTableIfExists("reviews");
  await knex.schema.dropTableIfExists("wishlists");
};
