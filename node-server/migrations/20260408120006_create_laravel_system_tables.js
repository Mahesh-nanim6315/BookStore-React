/**
 * Mirrors Laravel framework support tables:
 * - cache/cache_locks
 * - jobs/job_batches/failed_jobs
 */

exports.up = async function up(knex) {
  await knex.schema.createTable("cache", (table) => {
    table.string("key").primary();
    table.text("value", "mediumtext").notNullable();
    table.integer("expiration").notNullable();
  });

  await knex.schema.createTable("cache_locks", (table) => {
    table.string("key").primary();
    table.string("owner").notNullable();
    table.integer("expiration").notNullable();
  });

  await knex.schema.createTable("jobs", (table) => {
    table.bigIncrements("id");
    table.string("queue").notNullable().index();
    table.longtext("payload").notNullable();
    table.integer("attempts").unsigned().notNullable();
    table.integer("reserved_at").unsigned().nullable();
    table.integer("available_at").unsigned().notNullable();
    table.integer("created_at").unsigned().notNullable();
  });

  await knex.schema.createTable("job_batches", (table) => {
    table.string("id").primary();
    table.string("name").notNullable();
    table.integer("total_jobs").notNullable();
    table.integer("pending_jobs").notNullable();
    table.integer("failed_jobs").notNullable();
    table.longtext("failed_job_ids").notNullable();
    table.text("options", "mediumtext").nullable();
    table.integer("cancelled_at").nullable();
    table.integer("created_at").notNullable();
    table.integer("finished_at").nullable();
  });

  await knex.schema.createTable("failed_jobs", (table) => {
    table.bigIncrements("id");
    table.string("uuid").notNullable().unique();
    table.text("connection").notNullable();
    table.text("queue").notNullable();
    table.longtext("payload").notNullable();
    table.longtext("exception").notNullable();
    table.timestamp("failed_at").notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("failed_jobs");
  await knex.schema.dropTableIfExists("job_batches");
  await knex.schema.dropTableIfExists("jobs");
  await knex.schema.dropTableIfExists("cache_locks");
  await knex.schema.dropTableIfExists("cache");
};
