const knexConfig = require("../knexfile");

const environment = process.env.NODE_ENV || "development";
const resolvedConfig = knexConfig[environment] || knexConfig.development;

const knex = require("knex")(resolvedConfig);

module.exports = knex;
