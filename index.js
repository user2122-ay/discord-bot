const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder, 
  EmbedBuilder 
} = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const GUILD_ID = '1463192289974157334';

// 📂 cargar o crear archivo DNI
let dniData = {};
if (fs.existsSync('./dniData.json')) {
  dniData = JSON.parse(fs.readFileSync('./dniData.json', 'utf8'));
}

// 🔐 cuando el bot prende
client.once('ready', async () => {
  console.log(`✅ Bot encendido como ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName('creardni')
      .setDescription('Crear DNI de Los Santos RP')
      .addStringOption(o => o.setName('nombre').setDescription('Nombre IC').setRequired(true))
      .addStringOption(o => o.setName('apellido').setDescription('Apellido IC').setRequired(true))
      .addIntegerOption(o => o.setName('edad').setDescription('Edad IC').setRequired(true))
      .addStringOption(o => o.setName('fecha').setDescription('Fecha de nacimiento').setRequired(true))
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
      ),

    new SlashCommandBuilder()
      .setName('verdni')
      .setDescription('Ver DNI de un usuario')
      .addUserOption(o =>
        o.setName('usuario')
          .setDescription('Usuario a consultar')
          .setRequired(true)
      )
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(client.user.id, GUILD_ID),
    { body: commands }
  );

  console.log('✅ Comandos registrados');
});

// 🎮 comandos
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // 🆔 CREAR DNI
  if (interaction.commandName === 'creardni') {
    const userId = interaction.user.id;

    const dniNumber = `LS-${Math.floor(100000 + Math.random() * 900000)}`;

    dniData[userId] = {
      nombre: interaction.options.getString('nombre'),
      apellido: interaction.options.getString('apellido'),
      edadIC: interaction.options.getInteger('edad'),
      fechaNacimiento: interaction.options.getString('fecha'),
      sangre: interaction.options.getString('sangre'),
      dni: dniNumber
    };

    fs.writeFileSync('./dniData.json', JSON.stringify(dniData, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('🆔 DNI DE LOS SANTOS')
      .setColor('Blue')
      .addFields(
        { name: 'Nombre IC', value: dniData[userId].nombre, inline: true },
        { name: 'Apellido IC', value: dniData[userId].apellido, inline: true },
        { name: 'Edad IC', value: `${dniData[userId].edadIC}`, inline: true },
        { name: 'Fecha Nacimiento', value: dniData[userId].fechaNacimiento, inline: true },
        { name: 'Tipo de Sangre', value: dniData[userId].sangre, inline: true },
        { name: 'DNI', value: dniData[userId].dni, inline: false }
      )
      .setFooter({ text: 'Los Santos RP' });

    await interaction.reply({ embeds: [embed] });
  }

  // 👀 VER DNI
  if (interaction.commandName === 'verdni') {
    const usuario = interaction.options.getUser('usuario');
    const data = dniData[usuario.id];

    if (!data) {
      return interaction.reply({
        content: '❌ Ese usuario no tiene DNI registrado.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🆔 DNI DE LOS SANTOS')
      .setColor('Green')
      .addFields(
        { name: 'Nombre IC', value: data.nombre, inline: true },
        { name: 'Apellido IC', value: data.apellido, inline: true },
        { name: 'Edad IC', value: `${data.edadIC}`, inline: true },
        { name: 'Fecha Nacimiento', value: data.fechaNacimiento, inline: true },
        { name: 'Tipo de Sangre', value: data.sangre, inline: true },
        { name: 'DNI', value: data.dni, inline: false }
      )
      .setFooter({ text: `Solicitado por ${interaction.user.username}` });

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.TOKEN);
