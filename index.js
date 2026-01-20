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

// 🗂️ Memoria de DNIs (temporal)
const dniDB = new Map();

// Slash commands
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
    .toJSON(),

  new SlashCommandBuilder()
    .setName('verdni')
    .setDescription('Ver el DNI de un usuario')
    .addUserOption(o =>
      o.setName('usuario')
        .setDescription('Usuario del que quieres ver el DNI')
        .setRequired(true)
    )
    .toJSON()
];

client.once('ready', async () => {
  console.log(`✅ Bot encendido como ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
    { body: commands }
  );

  console.log('✅ Comandos /dni y /verdni registrados');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // 🪪 CREAR DNI
  if (interaction.commandName === 'dni') {
    const data = {
      userId: interaction.user.id,
      nombre: interaction.options.getString('nombre_ic'),
      apellido: interaction.options.getString('apellido_ic'),
      edad: interaction.options.getInteger('edad_ic'),
      fecha: interaction.options.getString('fecha_nacimiento'),
      sangre: interaction.options.getString('tipo_sangre'),
      dni: Math.floor(100000 + Math.random() * 900000),
      avatar: interaction.user.displayAvatarURL()
    };

    dniDB.set(interaction.user.id, data);

    const embed = new EmbedBuilder()
      .setTitle('🪪 Documento Nacional de Identidad')
      .setColor(0x1e90ff)
      .setThumbnail(data.avatar)
      .addFields(
        { name: '👤 Nombre IC', value: data.nombre, inline: true },
        { name: '👤 Apellido IC', value: data.apellido, inline: true },
        { name: '🎂 Edad IC', value: String(data.edad), inline: true },
        { name: '📅 Fecha de Nacimiento', value: data.fecha, inline: true },
        { name: '🩸 Tipo de Sangre', value: data.sangre, inline: true },
        { name: '🆔 Número de DNI', value: String(data.dni), inline: true }
      )
      .setFooter({ text: 'Gobierno de Los Santos RP' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  // 🔍 VER DNI
  if (interaction.commandName === 'verdni') {
    const user = interaction.options.getUser('usuario');
    const data = dniDB.get(user.id);

    if (!data) {
      return interaction.reply({
        content: '❌ Ese usuario no tiene un DNI registrado.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🪪 DNI Registrado')
      .setColor(0x2ecc71)
      .setThumbnail(data.avatar)
      .setDescription(`DNI de <@${user.id}>`)
      .addFields(
        { name: '👤 Nombre IC', value: data.nombre, inline: true },
        { name: '👤 Apellido IC', value: data.apellido, inline: true },
        { name: '🎂 Edad IC', value: String(data.edad), inline: true },
        { name: '📅 Fecha de Nacimiento', value: data.fecha, inline: true },
        { name: '🩸 Tipo de Sangre', value: data.sangre, inline: true },
        { name: '🆔 Número de DNI', value: String(data.dni), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
