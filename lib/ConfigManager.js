/*
 * let clientId, guildId, token;
 * const prodConfig = require('../config.json');
 */
require('custom-env').env('dev')
  .config();
const betaMode = true,
  clientId = process.env.CLIENTID,
  guildId = process.env.GUILDID,
  token = process.env.TOKEN;

module.exports = {
  betaMode,
  clientId,
  guildId,
  token
};
