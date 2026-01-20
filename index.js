    require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder
} = require('discord.js');

const mongoose = require('mongoose');
const DNI = require('./models/DNI');

// ===== CLIENTE =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== CONEXIÓN MONGODB =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🟢 MongoDB conectado correctamente'))
  .catch(err => console.error('🔴 Error MongoDB:', err));

// ===== READY =====
client.once('ready', async () => {
  console.log(`🤖 Bot encendido como ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName('crear-dni')
      .setDescription('Crear tu DNI de Los Santos RP'),

    new SlashCommandBuilder()
      .setName('ver-dni')
      .setDescription('Ver el DNI de un usuario')
      .addUserOption(opt =>
        opt.setName('usuario')
          .setDescription('Usuario a consultar')
          .setRequired(true)
      )
  ];

  await client.application.commands.set(commands);
  console.log('✅ Comandos registrados');
});

// ===== INTERACCIONES =====
client.on('interactionCreate', async interaction => {

  // ===== /crear-dni =====
  if (interaction.isChatInputCommand() && interaction.commandName === 'crear-dni') {

    const modal = new ModalBuilder()
      .setCustomId('dniModal')
      .setTitle('DNI — Los Santos RP');

    const nombre = new TextInputBuilder()
      .setCustomId('nombreIC')
      .setLabel('Nombre IC')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const apellido = new TextInputBuilder()
      .setCustomId('apellidoIC')
      .setLabel('Apellido IC')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const edad = new TextInputBuilder()
      .setCustomId('edadIC')
      .setLabel('Edad IC')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const fecha = new TextInputBuilder()
      .setCustomId('fechaNacimiento')
      .setLabel('Fecha de nacimiento IC')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const sangre = new TextInputBuilder()
      .setCustomId('tipoSangre')
      .setLabel('Tipo de sangre (O+, O-, A+, A-, B+, B-, AB+, AB-)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nombre),
      new ActionRowBuilder().addComponents(apellido),
      new ActionRowBuilder().addComponents(edad),
      new ActionRowBuilder().addComponents(fecha),
      new ActionRowBuilder().addComponents(sangre)
    );

    await interaction.showModal(modal);
  }

  // ===== MODAL SUBMIT =====
  if (interaction.isModalSubmit() && interaction.customId === 'dniModal') {

    const numeroDNI = Math.floor(10000000 + Math.random() * 90000000).toString();

    const data = {
      discordId: interaction.user.id,
      nombreIC: interaction.fields.getTextInputValue('nombreIC'),
      apellidoIC: interaction.fields.getTextInputValue('apellidoIC'),
      edadIC: interaction.fields.getTextInputValue('edadIC'),
      fechaNacimiento: interaction.fields.getTextInputValue('fechaNacimiento'),
      tipoSangre: interaction.fields.getTextInputValue('tipoSangre'),
      numeroDNI
    };

    await DNI.findOneAndUpdate(
      { discordId: interaction.user.id },
      data,
      { upsert: true }
    );

    const embed = new EmbedBuilder()
      .setTitle('🪪 DNI CREADO')
      .setColor('#2ecc71')
      .addFields(
        { name: 'Nombre IC', value: `${data.nombreIC} ${data.apellidoIC}` },
        { name: 'Edad IC', value: data.edadIC },
        { name: 'Nacimiento', value: data.fechaNacimiento },
        { name: 'Tipo de sangre', value: data.tipoSangre },
        { name: 'Número DNI', value: data.numeroDNI }
      )
      .setFooter({ text: 'Los Santos Spanish RP' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // ===== /ver-dni =====
  if (interaction.isChatInputCommand() && interaction.commandName === 'ver-dni') {

    const user = interaction.options.getUser('usuario');
    const dni = await DNI.findOne({ discordId: user.id });

    if (!dni) {
      return interaction.reply({
        content: '❌ Ese usuario no tiene DNI registrado.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🪪 DNI — Los Santos RP')
      .setColor('#3498db')
      .addFields(
        { name: 'Titular', value: user.tag },
        { name: 'Nombre IC', value: `${dni.nombreIC} ${dni.apellidoIC}` },
        { name: 'Edad IC', value: dni.edadIC.toString() },
        { name: 'Nacimiento', value: dni.fechaNacimiento },
        { name: 'Tipo de sangre', value: dni.tipoSangre },
        { name: 'Número DNI', value: dni.numeroDNI }
      );

    await interaction.reply({ embeds: [embed] });
  }
});

// ===== LOGIN =====
client.login(process.env.TOKEN);
