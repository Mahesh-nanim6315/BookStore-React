const knex = require("../config/knex");

async function getByKey(key) {
  return knex("settings")
    .select("key", "value")
    .where({ key })
    .first();
}

async function getValue(key, fallback = null) {
  const row = await getByKey(key);
  return row?.value ?? fallback;
}

async function getMany(keys) {
  if (!Array.isArray(keys) || keys.length === 0) {
    return [];
  }

  return knex("settings").select("key", "value").whereIn("key", keys);
}

async function isMaintenanceModeEnabled() {
  return String(await getValue("maintenance_mode", "0")) === "1";
}

module.exports = {
  getByKey,
  getValue,
  getMany,
  isMaintenanceModeEnabled,
};
