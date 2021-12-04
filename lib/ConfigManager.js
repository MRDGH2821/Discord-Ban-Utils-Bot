const prodConfig = require('../config.json');
const betaConfig = require('../betaconfig.json');

const betaMode = false;

let token;
let clientId;
let guildId;

if (betaMode) {
	token = betaConfig.token;
	clientId = betaConfig.clientId;
	guildId = betaConfig.guildId;
}
else {
	token = prodConfig.token;
	clientId = prodConfig.clientId;
	guildId = prodConfig.guildId;
}

module.exports = {
	token,
	clientId,
	guildId,
};
