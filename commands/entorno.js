const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 🎯 ROLES SEGÚN ENTORNO
const ROLES_ENTORNO = {
  documentos: "1451018419271893123",
  gobierno: "1451018422338060411",
  robo: "1451018419271893123",
  armas: "1451018419271893123",
  ilegal: "1451018419271893123",
  persecucion: "1451018419271893123",
  civil: null,
  ropa: null,
  comercio: null
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("entorno")
    .setDescription("Reportar un entorno de rol")

    .addStringOption(option =>
      option
        .setName("tipo")
        .setDescription("Tipo de entorno")
        .setRequired(true)
        .addChoices(
          { name: "📄 Documentos", value: "documentos" },
          { name: "🏛️ Gobierno", value: "gobierno" },
          { name: "🔫 Armas", value: "armas" },
          { name: "🚔 Persecución", value: "persecucion" },
          { name: "💰 Robo", value: "robo" },
          { name: "🚫 Actividad Ilegal", value: "ilegal" },
          { name: "👕 Cambio de Ropa", value: "ropa" },
          { name: "🏪 Comercio", value: "comercio" },
          { name: "🌆 Civil", value: "civil" }
        )
    )

    .addStringOption(option =>
      option
        .setName("lugar")
        .setDescription("Lugar del entorno")
        .setRequired(true)
    )

    .addStringOption(option =>
      option
        .setName("accion")
        .setDescription("Acción que ocurre en el entorno")
        .setRequired(true)
    )

    .addAttachmentOption(option =>
      option
        .setName("imagen")
        .setDescription("Imagen del entorno")
        .setRequired(true)
    ),

  permisos: "🌍 Todos",

  async execute(interaction) {

    const tipo = interaction.options.getString("tipo");
    const lugar = interaction.options.getString("lugar");
    const accion = interaction.options.getString("accion");
    const imagen = interaction.options.getAttachment("imagen");

    // Validar imagen
    if (!imagen.contentType?.startsWith("image/")) {
      return interaction.reply({
        content: "❌ El archivo adjunto debe ser una imagen.",
        ephemeral: true
      });
    }

    const rolPing = ROLES_ENTORNO[tipo];

    const nombres = {
      documentos: "📄 Documentos",
      gobierno: "🏛️ Gobierno",
      armas: "🔫 Uso de Armas",
      persecucion: "🚔 Persecución",
      robo: "💰 Robo",
      ilegal: "🚫 Actividad Ilegal",
      ropa: "👕 Cambio de Ropa",
      comercio: "🏪 Comercio",
      civil: "🌆 Entorno Civil"
    };

    const embed = new EmbedBuilder()
      .setTitle("🌍 Entorno de Rol Reportado")
      .setColor(0x2ecc71)
      .setDescription(
        "Se ha registrado un nuevo entorno dentro del servidor.\n\n" +
        "⚠️ Este entorno debe ser tomado en cuenta por todos los jugadores cercanos."
      )
      .addFields(
        { name: "📌 Tipo de Entorno", value: nombres[tipo], inline: true },
        { name: "📍 Ubicación", value: lugar, inline: true },
        { name: "📝 Descripción de la Acción", value: accion }
      )
      .setImage(imagen.url)
      .setFooter({
        text: `Reportado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({
      content: rolPing ? `<@&${rolPing}>` : null,
      embeds: [embed],
      allowedMentions: rolPing ? { roles: [rolPing] } : {}
    });
  }
};
