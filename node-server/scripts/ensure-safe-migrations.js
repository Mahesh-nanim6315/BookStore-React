const action = process.argv[2] || "migrate:latest";
const allowSchemaChanges = String(process.env.ALLOW_SCHEMA_CHANGES || "").toLowerCase() === "true";

if (!allowSchemaChanges) {
  console.error(
    [
      "Blocked Knex schema command.",
      "This Node server is meant to connect to the existing Laravel database by default.",
      "Running Knex migrations here can create or alter tables that already exist.",
      "If you really want to run this command, set ALLOW_SCHEMA_CHANGES=true and try again.",
      `Attempted command: ${action}`,
    ].join("\n"),
  );
  process.exit(1);
}

console.log(`ALLOW_SCHEMA_CHANGES=true detected. You can run: knex --knexfile knexfile.js ${action}`);
