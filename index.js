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

// Slash command /dni
const commands = [
  new SlashCommandBuilder()
    .setName('dni')
    .setDescription('Crear DNI de Los Santos RP')
    .addStringOption(o =>
      o.setName('nombre_ic')
        .setDescription('Nombre IC')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('apellido_ic')
        .setDescription('Apellido IC')
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('edad_ic')
        .setDescription('Edad IC')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('fecha_nacimiento')
        .setDescription('Fecha de nacimiento')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('tipo_sangre')
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
  console.log(`✅ Bot encendido como ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Comando /dni registrado correctamente');
  } catch (error) {
    console.error('❌ Error al registrar el comando:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'dni') {
    const nombreIC = interaction.options.getString('nombre_ic');
    const apellidoIC = interaction.options.getString('apellido_ic');
    const edadIC = interaction.options.getInteger('edad_ic');
    const fecha = interaction.options.getString('fecha_nacimiento');
    const sangre = interaction.options.getString('tipo_sangre');

    const numeroDNI = Math.floor(100000 + Math.random() * 900000);

    const embed = new EmbedBuilder()
      .setTitle('🪪 Documento Nacional de Identidad')
      .setColor(0x1e90ff)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: '👤 Nombre IC', value: nombreIC, inline: true },
        { name: '👤 Apellido IC', value: apellidoIC, inline: true },
        { name: '🎂 Edad IC', value: String(edadIC), inline: true },
        { name: '📅 Fecha de Nacimiento', value: fecha, inline: true },
        { name: '🩸 Tipo de Sangre', value: sangre, inline: true },
        { name: '🆔 Número de DNI', value: String(numeroDNI), inline: true }
      )
      .setFooter({ text: 'Gobierno de Los Santos RP' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
