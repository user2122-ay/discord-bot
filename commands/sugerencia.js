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
    ),

  async execute(interaction) {
    const sugerencia = interaction.options.getString("mensaje");

    const embed = new EmbedBuilder()
      .setTitle("💡 Nueva sugerencia")
      .setDescription(sugerencia)
      .setColor(0x2ecc71)
      .addFields(
        { name: "👤 Usuario", value: `<@${interaction.user.id}>`, inline: true },
        { name: "🆔 ID", value: interaction.user.id, inline: true }
      )
      .setFooter({
        text: "Sistema de sugerencias | Los Santos RP",
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    const canal = interaction.guild.channels.cache.get(CANAL_SUGERENCIAS);
    if (!canal) {
      return interaction.reply({
        content: "❌ No se encontró el canal de sugerencias.",
        ephemeral: true
      });
    }

    // 📤 Enviar sugerencia (SIN ping)
    const mensaje = await canal.send({
      embeds: [embed]
    });

    // 👍👎 Reacciones automáticas
    await mensaje.react("👍");
    await mensaje.react("👎");

    // ✅ Confirmación al usuario
    await interaction.reply({
      content: "✅ Tu sugerencia fue enviada correctamente.",
      ephemeral: true
    });
  }
};
