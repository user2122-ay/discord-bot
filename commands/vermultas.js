const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vermultas")
    .setDescription("Ver multas de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario a consultar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const data = JSON.parse(fs.readFileSync("./multasData.json"));
    const user = interaction.options.getUser("usuario");

    if (!data[user.id] || data[user.id].length === 0) {
      return interaction.reply({
        content: "✅ Este usuario no tiene multas registradas.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("📋 Historial de Multas")
      .setColor(0x3498db)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: "Gobierno de Los Santos RP",
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    data[user.id].forEach((m, i) => {
      embed.addFields({
        name: `🚨 Multa #${i + 1}`,
        value:
          `🚗 **Placa:** ${m.placa}\n` +
          `👮 **Oficial:** ${m.oficial}\n` +
          `📍 **Lugar:** ${m.lugar}\n` +
          `📝 **Motivo:** ${m.motivo}\n` +
          `💰 **Monto:** $${m.monto}\n` +
          `🕒 **Fecha:** ${m.fecha}`
      });
    });

    await interaction.reply({ embeds: [embed] });
  }
};
