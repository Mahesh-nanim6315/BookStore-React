/**
 * Mirrors Laravel migrations:
 * - 2026_02_03_000001_create_authors_table.php
 * - 2026_02_03_000002_create_categories_table.php
 * - 2026_02_03_000003_create_genres_table.php
 * - 2026_02_03_000004_create_books_table.php
 * - 2026_02_17_045611_add_embedding_to_books_table.php
 * - 2026_02_18_073048_add_is_premium_to_books.php
 * - 2026_02_20_100141_add_embedding_provider_to_books_table.php
 */

exports.up = async function up(knex) {
  await knex.schema.createTable("authors", (table) => {
    table.bigIncrements("id");
    table.string("name").notNullable();
    table.text("bio").nullable();
    table.string("image").nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("categories", (table) => {
    table.bigIncrements("id");
    table.string("name").notNullable().unique();
    table.string("slug").notNullable().unique();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("genres", (table) => {
    table.bigIncrements("id");
    table.string("name").notNullable().unique();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("books", (table) => {
    table.bigIncrements("id");
    table.string("name").notNullable();
    table.text("description").notNullable();
    table.string("language").nullable();
    table.string("image").notNullable();

    table
      .bigInteger("author_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("authors")
      .onDelete("CASCADE");
    table
      .bigInteger("category_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("categories")
      .onDelete("CASCADE");
    table
      .bigInteger("genre_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("genres")
      .onDelete("CASCADE");

    table.boolean("has_ebook").notNullable().defaultTo(false);
    table.decimal("ebook_price", 8, 2).nullable();
    table.string("ebook_pdf").nullable();
    table.integer("ebook_pages").nullable();

    table.boolean("has_audio").notNullable().defaultTo(false);
    table.decimal("audio_price", 8, 2).nullable();
    table.string("audio_file").nullable();
    table.integer("audio_minutes").nullable();

    table.boolean("has_paperback").notNullable().defaultTo(false);
    table.decimal("paperback_price", 8, 2).nullable();
    table.integer("paperback_pages").nullable();
    table.integer("stock").notNullable().defaultTo(0);

    table.decimal("price", 8, 2).notNullable().defaultTo(0);
    table.boolean("is_premium").notNullable().defaultTo(false);
    table.longtext("embedding").nullable();
    table.string("embedding_provider").nullable();

    table.timestamps(true, true);
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("books");
  await knex.schema.dropTableIfExists("genres");
  await knex.schema.dropTableIfExists("categories");
  await knex.schema.dropTableIfExists("authors");
};
