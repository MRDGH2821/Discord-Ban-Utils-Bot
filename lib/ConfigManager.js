let token;
let clientId;
let guildId;
// const prodConfig = require('../config.json');
const betaMode = false;
const dotenv = require('custom-env').env('prod');

dotenv.config();
try {
  // const betaConfig = require('../betaconfig.json');
  token = process.env.TOKEN;
  // betaConfig.token;
  clientId = process.env.CLIENTID;
  // betaConfig.clientId;
  guildId = process.env.GUILDID;
  // betaConfig.guildId;
}
catch (e) {
  console.log(e);
}

module.exports = {
  token,
  clientId,
  guildId,
  betaMode,
};
