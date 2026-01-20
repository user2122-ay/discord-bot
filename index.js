require('dotenv').config();

const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder, 
  EmbedBuilder 
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName('dni')
    .setDescription('Crear DNI de Los Santos RP')
    .addStringOption(o =>
      o.setName('nombre').setDescription('Nombre').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('apellido').setDescription('Apellido').setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('edad').setDescription('Edad').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('fecha').setDescription('Fecha de nacimiento').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('sangre')
        .setDescription('Tipo de sangre')
        .setRequired(true)
        .addChoices(
          { name: 'O+', value: 'O+' },
          { name: 'O-', value: 'O-' },
          { name: 'A+', value: 'A+' },
          { name: 'A-', value: 'A-' },
          { name: 'B+', value: 'B+' },
          { name: 'B-', value: 'B-' },
          { name: 'AB+', value: 'AB+' },
          { name: 'AB-', value: 'AB-' }
        )
    )
    .toJSON()
];

client.once('ready', async () => {
  console.log(`Bot listo como ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
    { body: commands }
  );

  console.log('Comando /dni registrado');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'dni') {
    const embed = new EmbedBuilder()
      .setTitle('🪪 DNI — Los Santos RP')
      .setColor(0x1e90ff)
      .addFields(
        { name: 'Nombre', value: interaction.options.getString('nombre'), inline: true },
        { name: 'Apellido', value: interaction.options.getString('apellido'), inline: true },
        { name: 'Edad', value: String(interaction.options.getInteger('edad')), inline: true },
        { name: 'Fecha Nac.', value: interaction.options.getString('fecha'), inline: true },
        { name: 'Sangre', value: interaction.options.getString('sangre'), inline: true },
        { name: 'DNI', value: String(Math.floor(100000 + Math.random() * 900000)), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
