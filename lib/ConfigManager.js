let token;
let clientId;
let guildId;
const prodConfig = require('../config.json');
const betaMode = true;
const firebaseConfigPath = prodConfig.firebaseConfigPath;


try {
  const betaConfig = require('../betaconfig.json');

  if (betaMode) {
    token = betaConfig.token;
    clientId = betaConfig.clientId;
    guildId = betaConfig.guildId;
  }
}
catch {
  token = prodConfig.token;
  clientId = prodConfig.clientId;
  guildId = prodConfig.guildId;
}

module.exports = {
  token,
  clientId,
  guildId,
  betaMode,
  firebaseConfigPath,
};
