require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log('🧹 Limpiando comandos slash antiguos...');

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    // BORRAR COMANDOS GLOBALES
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: [] }
    );

    console.log('✅ Comandos globales borrados');

  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.TOKEN);
