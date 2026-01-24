const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verificacion")
    .setDescription("Enviar mensaje de verificación"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("✅ Verificación | Los Santos RP")
      .setDescription(
        "Para poder acceder al servidor debes completar la verificación.\n\n" +
        "📌 Presiona el botón **Verificarse** y responde correctamente.\n" +
        "⚠️ Mentir o troll = rechazo automático."
      )
      .setColor(0x3498db)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({ text: "Gobierno de Los Santos RP" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_verificarse")
        .setLabel("Verificarse")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
