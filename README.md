# Discord-Ban-Utils-Bot

Discord Ban Utilities for Mutual Servers!

~~Currently the Bot is in development.~~ Bot development is supposedly finished. And can be used publicly!

Hosted on my personal Raspberry Pi 2B+.

Invite Link - [click here](https://discord.com/api/oauth2/authorize?client_id=897454611370213436&permissions=277562263718&scope=bot%20applications.commands)

Join my server - https://discord.gg/MPtE9zsBs5

Join Test server 1 - https://discord.gg/6xmJtmnWYx

Join test server 2 - https://discord.gg/tssxShnhS2

## Bot Permissions

![Bot Permissions](https://i.imgur.com/vth293y.png)

## Hosting

1. Clone this repo.
2. Create a file named `config.json` & put the given text -

```json
{
  "token": "insert bot token",
  "clientId": "insert bot clientID",
  "guildId": "insert one of your server's ID"
}
```

3. Install dependencies by using `npm install`.
4. Use `npm start` to run the bot code.

For more info click [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) & [here](https://discordjs.guide/creating-your-bot/)

You may also use pm2. Check the guide [here](https://discordjs.guide/improving-dev-environment/pm2.html)

```bash
pm2 start botstart.sh --name "Time Tag Bot" --watch
```

## How to update self-hosted version?/How to reset the Bot code?

Use the following command:

```bash
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
