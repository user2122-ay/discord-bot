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

const GUILD_ID = 'PON_AQUI_EL_ID_DE_TU_SERVIDOR';

// 🔹 Comando Slash
const commands = [
  new SlashCommandBuilder()
    .setName('dni')
    .setDescription('Crear DNI de Los Santos RP')
    .addStringOption(opt =>
      opt.setName('nombre')
        .setDescription('Nombre')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('apellido')
        .setDescription('Apellido')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('edad')
        .setDescription('Edad')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('fecha_nacimiento')
        .setDescription('Fecha de nacimiento')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('sangre')
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
  console.log(`✅ Bot conectado como ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, GUILD_ID),
      { body: commands }
    );
    console.log('✅ Comando /dni registrado');
  } catch (error) {
    console.error('❌ Error registrando comando:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'dni') {
    const nombre = interaction.options.getString('nombre');
    const apellido = interaction.options.getString('apellido');
    const edad = interaction.options.getInteger('edad');
    const fecha = interaction.options.getString('fecha_nacimiento');
    const sangre = interaction.options.getString('sangre');

    const idDNI = Math.floor(100000 + Math.random() * 900000);

    const embed = new EmbedBuilder()
      .setTitle('🪪 DNI — Los Santos RP')
      .setColor(0x1e90ff)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: '👤 Nombre', value: `${nombre} ${apellido}`, inline: true },
        { name: '🎂 Edad', value: `${edad}`, inline: true },
        { name: '🩸 Tipo de Sangre', value: sangre, inline: true },
        { name: '📅 Fecha de Nacimiento', value: fecha, inline: true },
        { name: '🆔 Número de DNI', value: `${idDNI}`, inline: true }
      )
      .setFooter({ text: 'Gobierno de Los Santos' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
