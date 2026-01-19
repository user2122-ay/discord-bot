const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ID de tu servidor donde quieres probar el comando
const GUILD_ID = '1345956472986796183';

client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  // Registrar comando de barra
  const commands = [
    new SlashCommandBuilder()
      .setName('hola')
      .setDescription('Comando de prueba')
      .toJSON()
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: commands });
    console.log('✅ Comando /hola registrado correctamente');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'hola') {
    await interaction.reply('¡Hola! 😎 Este es un comando de prueba.');
  }
});

client.login(process.env.TOKEN);
