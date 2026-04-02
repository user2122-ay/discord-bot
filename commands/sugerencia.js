const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 🔧 CONFIGURACIÓN
const CANAL_SUGERENCIAS = "1463192291211477011";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sugerencia")
    .setDescription("Enviar una sugerencia para el servidor")
    .addStringOption(o =>
      o.setName("mensaje")
        .setDescription("Escribe tu sugerencia")
        .setRequired(true)
        .setMinLength(5)
        .setMaxLength(1000)
    ),

  async execute(interaction) {
    const sugerencia = interaction.options.getString("mensaje");

    const canal = interaction.guild.channels.cache.get(CANAL_SUGERENCIAS);
    if (!canal) {
      return interaction.reply({
        content: "❌ No se encontró el canal de sugerencias.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("💡 Nueva sugerencia")
      .setDescription(`📌 ${sugerencia}`)
      .setColor(0x2ecc71)
      .addFields(
        { name: "👤 Usuario", value: `<@${interaction.user.id}>`, inline: true },
        { name: "🆔 ID", value: interaction.user.id, inline: true }
      )
      .setFooter({
        text: "Sistema de sugerencias • Los Santos RP",
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    try {
      // 📤 Enviar sugerencia
      const mensaje = await canal.send({ embeds: [embed] });

      // 👍👎 Reacciones
      await mensaje.react("👍").catch(() => {});
      await mensaje.react("👎").catch(() => {});

      // ✅ Confirmación
      await interaction.reply({
        content: "✅ Tu sugerencia fue enviada correctamente.",
        ephemeral: true
      });

    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ Ocurrió un error al enviar la sugerencia.",
        ephemeral: true
      });
    }
  }
};
