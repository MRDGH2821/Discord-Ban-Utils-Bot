# Discord-Ban-Utils-Bot

Discord Ban Utilities for Mutual Servers!

[Invite the bot!](https://discord.com/api/oauth2/authorize?client_id=897454611370213436&permissions=1377073941638&scope=bot%20applications.commands)

[Join my server](https://discord.gg/hK7upMsXpT)

This bot project was inspired by the [dbans-cli](https://github.com/PermissionError/dbans-cli)

## Bot Permissions

![Bot Permissions](https://i.imgur.com/FjELQce.png)

## Firebase integration

With v2.4, the bot now comes with logging feature with firebase integration & custom events.
So to setup logging follow these steps:

1. Create a Firebase project.
2. Go to project settings
3. In Firebase Admin SDK section, click on `Node.js` & finally on `Generate new private key`.
4. Copy this private key (i.e. the json file which gets downloaded) into `./firebase-service-acc/`

For more info [check here](./firebase-service-acc/README.md)

## Hosting

- Clone this repo.
- Add [Firebase private key](#firebase-integration)
- Create a file named `.env` & put the given text -

```environment
DISCORD_TOKEN = insert bot token
```

You can also copy [`sample.env`](./sample.env) file and rename it to `.env`.

- Install dependencies by using `npm install`.
- Use `npm start` to run the bot code.

See discord.js guides on [setting up a bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) & [creating a bot](https://discordjs.guide/creating-your-bot/)

Or Use Docker to start:

```bash
docker compose up -d --build ban-utils-bot
```

In case there is no way to upload firebase service account key:

```environment
# Put respective details from the firebase service account file here if firebase key cannot be uploaded
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_PROJECT_ID=
```

Or use base64 encoder using

```bash
npm run firekeybase64
```

And then use the generated value below:

```environment
# Put base64 encoded version of the firebase service account file here if above method doesn't work
FIREBASE_SERVICE_ACCOUNT_BASE64=
```

## License

[MIT](./LICENCE.md)

Feel free to make your own improved version of the bot!
