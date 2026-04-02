const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vermultas")
    .setDescription("Ver multas de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario a consultar")
        .setRequired(true)
    ),

  permisos: "🌍 Todos",

  async execute(interaction) {
    const user = interaction.options.getUser("usuario");

    try {
      // 🔥 BUSCAR EN BASE DE DATOS
      const result = await interaction.pool.query(
        `SELECT * FROM "MULTAS_LS" WHERE user_id = $1 ORDER BY id DESC`,
        [user.id]
      );

      if (result.rows.length === 0) {
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

      result.rows.forEach((m, i) => {
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

      // 🔒 SOLO LO VE QUIEN EJECUTA
      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });

    } catch (error) {
      console.error("❌ Error obteniendo multas:", error);
      await interaction.reply({
        content: "❌ Error obteniendo las multas",
        ephemeral: true
      });
    }
  }
};
