const { REST, Routes } = require("discord.js");

client.once("ready", async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const commands = [];
  client.commands.forEach(cmd => commands.push(cmd.data.toJSON()));

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, '1463192289974157334'),
      { body: commands }
    );
    console.log('✅ Comandos registrados');
  } catch (e) {
    console.error(e);
  }
});
