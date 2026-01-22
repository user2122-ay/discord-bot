const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("entorno")
    .setDescription("Reportar un entorno de rol")
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
        .setDescription("Imagen del entorno (adjunta desde tu galería)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const lugar = interaction.options.getString("lugar");
    const accion = interaction.options.getString("accion");
    const imagen = interaction.options.getAttachment("imagen");

    // Validar que sea imagen
    if (!imagen.contentType?.startsWith("image/")) {
      return interaction.reply({
        content: "❌ El archivo adjunto debe ser una **imagen**.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🌍 Entorno de Rol")
      .setColor(0x2ecc71)
      .addFields(
        { name: "📍 Lugar", value: lugar },
        { name: "⚠️ Acción", value: accion }
      )
      .setImage(imagen.url)
      .setFooter({
        text: `Reportado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
