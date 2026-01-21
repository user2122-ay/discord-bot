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

// 🔴 CAMBIA ESTE ID
const GUILD_ID = '1463192289974157334';

// 📂 DNI DATA
let dniData = {};
if (fs.existsSync('./dniData.json')) {
  dniData = JSON.parse(fs.readFileSync('./dniData.json', 'utf8'));
}

client.once('ready', async () => {
  console.log(`✅ Bot encendido como ${client.user.tag}`);

  const commands = [
    // 🆔 CREAR DNI
    new SlashCommandBuilder()
      .setName('creardni')
      .setDescription('Crear DNI de Los Santos RP')
      .addStringOption(o => o.setName('nombre').setDescription('Nombre IC').setRequired(true))
      .addStringOption(o => o.setName('apellido').setDescription('Apellido IC').setRequired(true))
      .addIntegerOption(o => o.setName('edad').setDescription('Edad IC').setRequired(true))
      .addStringOption(o => o.setName('fecha').setDescription('Fecha nacimiento').setRequired(true))
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

    // 👀 VER DNI
    new SlashCommandBuilder()
      .setName('verdni')
      .setDescription('Ver DNI de un usuario')
      .addUserOption(o =>
        o.setName('usuario')
          .setDescription('Usuario')
          .setRequired(true)
      ),

    // 🗳️ VOTACIÓN
    new SlashCommandBuilder().setName('abrirvotacion').setDescription('Abrir votación oficial'),
    new SlashCommandBuilder().setName('cerrarvotacion').setDescription('Cerrar votación oficial'),

    // 🏛️ SESIÓN
    new SlashCommandBuilder().setName('abrirsesion').setDescription('Abrir sesión del gobierno'),
    new SlashCommandBuilder().setName('cerrarsesion').setDescription('Cerrar sesión del gobierno')
  ].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationGuildCommands(client.user.id, GUILD_ID), { body: commands });

  console.log('✅ Comandos registrados');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // 🆔 CREAR DNI
  if (interaction.commandName === 'creardni') {
    const id = interaction.user.id;
    const fecha = new Date().toLocaleDateString('es-ES');
    const dni = `LS-${Math.floor(100000 + Math.random() * 900000)}`;

    dniData[id] = {
      nombre: interaction.options.getString('nombre'),
      apellido: interaction.options.getString('apellido'),
      edad: interaction.options.getInteger('edad'),
      fechaNac: interaction.options.getString('fecha'),
      sangre: interaction.options.getString('sangre'),
      dni,
      fecha
    };

    fs.writeFileSync('./dniData.json', JSON.stringify(dniData, null, 2));

    const embed = new EmbedBuilder()
      .setTitle('🆔 Documento Nacional de Identidad')
      .setColor(0x1e90ff)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👤 Nombre IC', value: dniData[id].nombre, inline: true },
        { name: '👤 Apellido IC', value: dniData[id].apellido, inline: true },
        { name: '🎂 Edad IC', value: `${dniData[id].edad}`, inline: true },
        { name: '📅 Nacimiento', value: dniData[id].fechaNac, inline: true },
        { name: '🩸 Sangre', value: dniData[id].sangre, inline: true },
        { name: '🆔 DNI', value: `**${dniData[id].dni}**`, inline: false }
      )
      .setFooter({
        text: `Gobierno de Los Santos RP | ${fecha}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });

    return interaction.reply({ embeds: [embed] });
  }

  // 👀 VER DNI
  if (interaction.commandName === 'verdni') {
    const user = interaction.options.getUser('usuario');
    const data = dniData[user.id];
    if (!data) return interaction.reply({ content: '❌ No tiene DNI.', ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle('🆔 Documento Nacional de Identidad')
      .setColor(0x2ecc71)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '👤 Nombre IC', value: data.nombre, inline: true },
        { name: '👤 Apellido IC', value: data.apellido, inline: true },
        { name: '🎂 Edad IC', value: `${data.edad}`, inline: true },
        { name: '📅 Nacimiento', value: data.fechaNac, inline: true },
        { name: '🩸 Sangre', value: data.sangre, inline: true },
        { name: '🆔 DNI', value: `**${data.dni}**`, inline: false }
      )
      .setFooter({ text: `Gobierno de Los Santos RP | ${data.fecha}` });

    return interaction.reply({ embeds: [embed] });
  }

  // 🗳️ ABRIR VOTACIÓN
  if (interaction.commandName === 'abrirvotacion') {
    const embed = new EmbedBuilder()
      .setTitle('🗳️ VOTACIÓN ABIERTA')
      .setColor('Orange')
      .setDescription('Se abre oficialmente la votación para decidir la apertura del servidor de ER:LC.
Los miembros habilitados podrán emitir su voto mediante las reacciones correspondientes.
La votación estará disponible por tiempo limitado.
Se solicita votar con responsabilidad.')
      .addFields({ name: '👮 Moderador', value: `<@${interaction.user.id}>` })
      .setFooter({ text: 'Staff de Los Santos RP' });

    const msg = await interaction.reply({
      content: '<@&1463192290314162342>',
      embeds: [embed],
      fetchReply: true
    });

    await msg.react('✅');
    await msg.react('❌');
  }

  // ❌ CERRAR VOTACIÓN
  if (interaction.commandName === 'cerrarvotacion') {
    const embed = new EmbedBuilder()
      .setTitle('🛑 VOTACIÓN CERRADA')
      .setColor('Red')
      .setDescription('La votación para la apertura del servidor de ER:LC ha sido cerrada.
Agradecemos a todos los que participaron.
El resultado será anunciado a continuación.')
      .addFields({ name: '👮 Moderador', value: `<@${interaction.user.id}>` })
      .setFooter({ text: 'Staff de Los Santos RP' });

    return interaction.reply({
      content: '<@&1463192290314162342>',
      embeds: [embed]
    });
  }

  // 🏛️ ABRIR SESIÓN
  if (interaction.commandName === 'abrirsesion') {
    const embed = new EmbedBuilder()
      .setTitle('🏛️ SESIÓN ABIERTA')
      .setColor('Green')
      .setDescription('Tras el resultado de la votación, el servidor de Emergency Response: Liberty County queda oficialmente abierto para rolear.
Todas las normativas del servidor están activas.
Se solicita rol serio, respeto y cooperación con el staff.
¡Buen rol para todos!
      📌 Código de sesión: **LSSANTOS**')
      .addFields({ name: '👮 Moderador', value: `<@${interaction.user.id}>` })
      .setFooter({ text: 'Staff de Los Santos RP' });

    return interaction.reply({
      content: '<@&1463192290314162342>',
      embeds: [embed]
    });
  }

  // 🔒 CERRAR SESIÓN
  if (interaction.commandName === 'cerrarsesion') {
    const embed = new EmbedBuilder()
      .setTitle('🔒 SESIÓN CERRADA')
      .setColor('DarkRed')
      .setDescription('El servidor de ER:LC queda cerrado por el momento.
Agradecemos la participación y el buen rol de todos los usuarios.
Cualquier novedad será comunicada por los canales oficiales.')
      .addFields({ name: '👮 Moderador', value: `<@${interaction.user.id}>` })
      .setFooter({ text: 'Staff de Los Santos RP' });

    return interaction.reply({
      content: '<@&1463192290314162342>',
      embeds: [embed]
    });
  }
});

client.login(process.env.TOKEN);
