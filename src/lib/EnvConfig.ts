if (process.env.DISCORD_TOKEN === undefined) {
  throw new Error("Token not defined");
}

const EnvConfig = {
  token: process.env.DISCORD_TOKEN,
};

export default EnvConfig;
