/* let clientId, guildId, token;
   const prodConfig = require('../config.json'); */
require('custom-env').env('prod')
  .config();
const betaMode = false,
  clientId = process.env.CLIENTID,
  guildId = process.env.GUILDID,
  token = process.env.TOKEN;

module.exports = {
  betaMode,
  clientId,
  guildId,
  token
};
