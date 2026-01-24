const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verificacion")
    .setDescription("Panel de verificación del servidor"),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle("✅ Verificación | Los Santos RP")
      .setDescription(
        "Para poder acceder al servidor debes completar la verificación.\n\n" +
        "📌 Responde con sinceridad\n" +
        "📌 El staff revisará tu solicitud\n\n" +
        "Presiona el botón para comenzar ⬇️"
      )
      .setColor(0x3498db)
      .setFooter({
        text: "Gobierno de Los Santos RP",
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_verificarse")
        .setLabel("Verificarse")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};
