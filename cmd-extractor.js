const fs = require('fs');
const { open } = require('fs/promises'),
  cmdInfo = { info: [] },
  commandFiles = fs
    .readdirSync('./commands')
    .filter((file) => file.endsWith('.js')),
  commands = [].map((command) => command.toJSON()),
  descriptions = [],
  final = [];

for (const file of commandFiles) {
  const command = require(`./commands/${file}`),
    data = command.data.toJSON();
  data.note = command.note || 'none';
  commands.push(command.data.toJSON());
  descriptions.push(data);
}

for (const dat of descriptions) {
  const format = {
    name: `**/${dat.name}**`,
    value: `${dat.description}\n**Note:** ${dat.note}`
  };
  final.push(format);
}
cmdInfo.info = final;
open('./cmd.json', 'w').then((file) => {
  file.writeFile(JSON.stringify(cmdInfo));
  console.log('Information extracted!');
});
