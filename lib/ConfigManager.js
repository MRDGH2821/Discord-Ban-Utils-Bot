let token;
let clientId;
let guildId;
const prodConfig = require('../config.json');
const betaMode = true;
const firebaseConfigPath =
  '../discord-ban-utils-bot-firebase-adminsdk-ohwmr-1392181386.json';

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
