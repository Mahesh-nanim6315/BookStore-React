/**
 * Mirrors Laravel migrations:
 * - subscriptions, subscription_items (+ meter fields)
 * - documents, document_chunks
 */

exports.up = async function up(knex) {
  await knex.schema.createTable("subscriptions", (table) => {
    table.bigIncrements("id");
    table.bigInteger("user_id").unsigned().notNullable();
    table.string("type").notNullable();
    table.string("stripe_id").notNullable().unique();
    table.string("stripe_status").notNullable();
    table.string("stripe_price").nullable();
    table.integer("quantity").nullable();
    table.timestamp("trial_ends_at").nullable();
    table.timestamp("ends_at").nullable();
    table.timestamps(true, true);
    table.index(["user_id", "stripe_status"]);
  });

  await knex.schema.createTable("subscription_items", (table) => {
    table.bigIncrements("id");
    table.bigInteger("subscription_id").unsigned().notNullable();
    table.string("stripe_id").notNullable().unique();
    table.string("stripe_product").notNullable();
    table.string("stripe_price").notNullable();
    table.string("meter_id").nullable();
    table.integer("quantity").nullable();
    table.string("meter_event_name").nullable();
    table.timestamps(true, true);
    table.index(["subscription_id", "stripe_price"]);
  });

  await knex.schema.createTable("documents", (table) => {
    table.bigIncrements("id");
    table.string("title").notNullable();
    table.string("file_path").notNullable();
    table.string("source_type").notNullable().defaultTo("upload");
    table.timestamps(true, true);
    table.index(["source_type", "created_at"]);
  });

  await knex.schema.createTable("document_chunks", (table) => {
    table.bigIncrements("id");
    table
      .bigInteger("document_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("documents")
      .onDelete("CASCADE");
    table.integer("chunk_index").unsigned().notNullable();
    table.integer("page_no").unsigned().nullable();
    table.longtext("chunk_text").notNullable();
    table.longtext("embedding").nullable();
    table.string("embedding_provider").nullable();
    table.timestamps(true, true);
    table.index(["document_id", "chunk_index"]);
    table.index("embedding_provider");
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("document_chunks");
  await knex.schema.dropTableIfExists("documents");
  await knex.schema.dropTableIfExists("subscription_items");
  await knex.schema.dropTableIfExists("subscriptions");
};
