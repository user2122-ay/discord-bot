const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const ROLES_AUTORIZADOS = [
  "1463192290381271046",
  "1463192290381271043", 
  "1463192290381271044", 
  "1463192290389528671", 
  "1463192290389528668", 
  "1463192290389528670", 
  "1463192290389528669", 
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("multar")
    .setDescription("Registrar una multa vehicular")
    .addStringOption(o =>
      o.setName("placa")
        .setDescription("Placa del vehículo")
        .setRequired(true)
    )
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario multado")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("oficial")
        .setDescription("Oficial que impone la multa")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("lugar")
        .setDescription("Lugar de la infracción")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo de la multa")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("monto")
        .setDescription("Monto de la multa")
        .setRequired(true)
    )
    .addAttachmentOption(o =>
      o.setName("imagen")
        .setDescription("Imagen de evidencia")
        .setRequired(true)
    ),

  async execute(interaction) {

    // 🔒 Verificar roles
    if (!interaction.member.roles.cache.some(r => ROLES_AUTORIZADOS.includes(r.id))) {
      return interaction.reply({
        content: "⛔ No tienes permisos para usar este comando.",
        ephemeral: true
      });
    }

    const data = JSON.parse(fs.readFileSync("./multasData.json"));

    const multa = {
      placa: interaction.options.getString("placa"),
      usuario: interaction.options.getUser("usuario").id,
      oficial: interaction.options.getString("oficial"),
      lugar: interaction.options.getString("lugar"),
      motivo: interaction.options.getString("motivo"),
      monto: interaction.options.getInteger("monto"),
      imagen: interaction.options.getAttachment("imagen").url,
      fecha: new Date().toLocaleString()
    };

    if (!data[multa.usuario]) data[multa.usuario] = [];
    data[multa.usuario].push(multa);

    fs.writeFileSync("./multasData.json", JSON.stringify(data, null, 2));

    const embed = new EmbedBuilder()
      .setTitle("🚨 Multa Registrada")
      .setColor(0xe67e22)
      .setImage(multa.imagen)
      .addFields(
        { name: "🚗 Placa", value: multa.placa, inline: true },
        { name: "👤 Usuario", value: `<@${multa.usuario}>`, inline: true },
        { name: "👮 Oficial", value: multa.oficial, inline: true },
        { name: "📍 Lugar", value: multa.lugar, inline: true },
        { name: "📝 Motivo", value: multa.motivo, inline: false },
        { name: "💰 Monto", value: `$${multa.monto}`, inline: true }
      )
      .setFooter({
        text: `Gobierno de Los Santos RP | ${multa.fecha}`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
