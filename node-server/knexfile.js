require("dotenv").config();

function getEnv(name, fallbackName, defaultValue) {
  if (process.env[name] !== undefined) {
    return process.env[name];
  }

  if (fallbackName && process.env[fallbackName] !== undefined) {
    return process.env[fallbackName];
  }

  return defaultValue;
}

const shared = {
  client: "mysql2",
  connection: {
    host: getEnv("DB_HOST", null, "127.0.0.1"),
    port: Number(getEnv("DB_PORT", null, 3306)),
    user: getEnv("DB_USER", "DB_USERNAME", "root"),
    password: getEnv("DB_PASSWORD", null, ""),
    database: getEnv("DB_NAME", "DB_DATABASE", "agent"),
  },
  pool: {
    min: 2,
    max: Number(getEnv("DB_CONNECTION_LIMIT", null, 10)),
  },
  migrations: {
    directory: "./migrations",
    tableName: "knex_migrations",
  },
};

module.exports = {
  development: {
    ...shared,
  },
  production: {
    ...shared,
  },
};
