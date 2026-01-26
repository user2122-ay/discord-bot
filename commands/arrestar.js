const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// ROLES AUTORIZADOS
const ROLES_AUTORIZADOS = [
  "1463192290381271047",
  "1463192290381271043",
  "1463192290381271046", 
  "1463192290389528671", 
  "1463192290389528668", 
  "1463192290389528670", 
];

const filePath = path.join(__dirname, "..", "arrestos.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("arrestar")
    .setDescription("Registrar un arresto")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario arrestado")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo del arresto")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("lugar")
        .setDescription("Lugar del arresto")
        .setRequired(true)
    )
    .addAttachmentOption(o =>
      o.setName("imagen")
        .setDescription("Imagen del arresto (obligatoria)")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Verificar rol
    const tieneRol = interaction.member.roles.cache.some(r =>
      ROLES_AUTORIZADOS.includes(r.id)
    );

    if (!tieneRol) {
      return interaction.reply({
        content: "❌ No tienes permiso para usar este comando.",
        ephemeral: true
      });
    }

    const usuario = interaction.options.getUser("usuario");
    const motivo = interaction.options.getString("motivo");
    const lugar = interaction.options.getString("lugar");
    const imagen = interaction.options.getAttachment("imagen");

    // Leer JSON de arrestos
    let data = {};
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch { data = {}; }

    if (!data[usuario.id]) data[usuario.id] = [];

    const arresto = {
      moderador: interaction.user.id,
      motivo,
      lugar,
      imagen: imagen.url,
      fecha: new Date().toISOString()
    };

    data[usuario.id].push(arresto);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const embed = new EmbedBuilder()
      .setTitle("🚔 Arresto Registrado")
      .setColor(0xe74c3c)
      .setThumbnail(usuario.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "👤 Arrestado", value: `<@${usuario.id}>`, inline: true },
        { name: "👮 Arrestado por", value: `<@${interaction.user.id}>`, inline: true },
        { name: "📄 Motivo", value: motivo },
        { name: "📍 Lugar", value: lugar }
      )
      .setImage(imagen.url)
      .setFooter({
        text: "Gobierno de Los Santos RP",
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
