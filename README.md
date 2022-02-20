# CAUTION!

Please read the [caution notes](./Caution.md) for v2.5.2+
There is now a significant change in usage of config files!

# Discord-Ban-Utils-Bot

Discord Ban Utilities for Mutual Servers!

~~Currently the Bot is in development.~~ Bot development is supposedly finished. And can be used publicly!

Hosted on ~~my personal Raspberry Pi 2B+~~ Google Cloud VM Instance E2.

Invite Link - [click here](https://discord.com/api/oauth2/authorize?client_id=897454611370213436&permissions=1377073941638&scope=bot%20applications.commands)

Join my server - <https://discord.gg/MPtE9zsBs5>

This bot project was inspired by the project [here](https://github.com/PermissionError/dbans-cli)

## Bot Permissions

![Bot Permissions](https://i.imgur.com/FjELQce.png)

## Firebase integration

With v2.4, the bot now comes with logging feature with firebase integration & custom events.
So to setup logging follow these steps:

1. Create a Firebase project.
2. Go to project settings
3. In Firebase Admin SDK section, click on `Node.js` & finally on `Generate new private key`.
4. Copy this private key (i.e. the json file which gets downloaded) into `./lib/firebase-service-acc/`

For more info check [here](./lib/firebase-service-acc/README.md)

## Hosting

1.  Clone this repo.
2.  Create a file named `.env.prod` & put the given text -

```environment
TOKEN = insert bot token
CLIENTID = insert bot clientID
GUILDID = insert one of your server's ID
```

You can also copy [`.env.sample`](./.env.sample) file and rename it to `.env.prod`.

3.  Install dependencies by using `npm install`.
4.  Use `npm start` to run the bot code.

For more info click [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) & [here](https://discordjs.guide/creating-your-bot/)

You may also use pm2. Check the guide [here](https://discordjs.guide/improving-dev-environment/pm2.html)

```bash
pm2 start ban-utils-bot.sh --name "Ban Utils Bot" --watch
```

## How to update self-hosted version?/How to reset the Bot code?

Use the following command:

```bash
git reset --hard
git pull
```

## License

[MIT](./LICENSE)

Feel free to make your own improved version of the bot!

## Icon

Made using Canva.
See [here](https://www.canva.com/design/DAEsnh6KHfM/DTA-pMkWSqigGIgLA9Y39w/view?utm_content=DAEsnh6KHfM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink) in high resolution.

## Note from developer:

~~I still think that this bot is far from crash proof. I have done enough testing, but still some edge cases might be left out.~~
Bot has become nearly crash proof. And will also show what the error was.
Still I have configured my bot to restart on crash (using pm2), it would be nice if you report the issue ASAP to me.
