const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("entorno")
    .setDescription("Reportar entorno para rol")
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
    .addStringOption(option =>
      option
        .setName("imagen")
        .setDescription("Imagen del entorno (URL)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const lugar = interaction.options.getString("lugar");
    const accion = interaction.options.getString("accion");
    const imagen = interaction.options.getString("imagen");

    const embed = new EmbedBuilder()
      .setTitle("🌍 Entorno de Rol")
      .setColor(0x2ecc71)
      .addFields(
        { name: "📍 Lugar", value: lugar },
        { name: "⚠️ Acción", value: accion }
      )
      .setImage(imagen)
      .setFooter({
        text: `Reportado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
