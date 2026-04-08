/**
 * Mirrors Laravel migrations:
 * - carts/cart_items/addresses/orders/order_items
 * - user_library/user_book_access
 * - coupons
 * - order pricing fields addition
 */

exports.up = async function up(knex) {
  await knex.schema.createTable("carts", (table) => {
    table.bigIncrements("id");
    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("addresses", (table) => {
    table.bigIncrements("id");
    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("full_name").notNullable();
    table.string("phone").notNullable();
    table.string("address_line").notNullable();
    table.string("city").notNullable();
    table.string("state").notNullable();
    table.string("pincode").notNullable();
    table.string("country").notNullable().defaultTo("India");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("orders", (table) => {
    table.bigIncrements("id");
    table
      .bigInteger("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.decimal("subtotal", 10, 2).notNullable();
    table.decimal("tax_amount", 10, 2).notNullable().defaultTo(0);
    table.decimal("discount_amount", 10, 2).notNullable().defaultTo(0);
    table.string("coupon_code").nullable();

    table.decimal("total_amount", 10, 2).notNullable();
    table
      .bigInteger("address_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("addresses")
      .onDelete("SET NULL");

    table.string("payment_method").nullable();
    table.string("payment_id").nullable();
    table.string("payment_status").notNullable().defaultTo("pending");
    table.string("status").notNullable().defaultTo("pending");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("cart_items", (table) => {
    table.bigIncrements("id");
    table
      .bigInteger("cart_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("carts")
      .onDelete("CASCADE");
    table
      .bigInteger("book_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("books")
      .onDelete("CASCADE");
    table.enum("format", ["ebook", "audio", "paperback"]).notNullable();
    table.integer("quantity").notNullable().defaultTo(1);
    table.decimal("price", 10, 2).notNullable();
    table.timestamps(true, true);
    table.unique(["cart_id", "book_id", "format"]);
  });

  await knex.schema.createTable("order_items", (table) => {
    table.bigIncrements("id");
    table
      .bigInteger("order_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE");
    table
      .bigInteger("book_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("books")
      .onDelete("CASCADE");
    table.enum("format", ["ebook", "audio", "paperback"]).notNullable();
    table.integer("quantity").notNullable().defaultTo(1);
    table.decimal("price", 10, 2).notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("user_library", (table) => {
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
    table.enum("format", ["ebook", "audio", "paperback"]).notNullable();
    table.timestamp("expires_at").nullable();
    table.timestamps(true, true);
    table.unique(["user_id", "book_id", "format"]);
  });

  await knex.schema.createTable("user_book_access", (table) => {
    table.bigIncrements("id");
    table.bigInteger("user_id").unsigned().notNullable().references("id").inTable("users");
    table.bigInteger("book_id").unsigned().notNullable().references("id").inTable("books");
    table.enum("type", ["ebook", "audio", "paperback"]).notNullable();
    table.enum("access", ["rent", "buy"]).notNullable();
    table.timestamp("expires_at").nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("coupons", (table) => {
    table.bigIncrements("id");
    table.string("code").notNullable().unique();
    table.enum("type", ["flat", "percent"]).notNullable();
    table.decimal("value", 10, 2).notNullable();
    table.integer("usage_limit").nullable();
    table.integer("used_count").notNullable().defaultTo(0);
    table.timestamp("expires_at").nullable();
    table.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("coupons");
  await knex.schema.dropTableIfExists("user_book_access");
  await knex.schema.dropTableIfExists("user_library");
  await knex.schema.dropTableIfExists("order_items");
  await knex.schema.dropTableIfExists("cart_items");
  await knex.schema.dropTableIfExists("orders");
  await knex.schema.dropTableIfExists("addresses");
  await knex.schema.dropTableIfExists("carts");
};
