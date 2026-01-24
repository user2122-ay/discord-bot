const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const ROL_STAFF = "1463192290423083324"; // Rol autorizado
const ROL_PING = "1463192290314162342";  // Rol a pingear

module.exports = {
  data: new SlashCommandBuilder()
    .setName("alerta")
    .setDescription("Emitir una alerta de seguridad RP")
    .addStringOption(o =>
      o.setName("nivel")
        .setDescription("Nivel de alerta")
        .setRequired(true)
        .addChoices(
          { name: "🟢 Alerta Verde", value: "verde" },
          { name: "🟡 Alerta Amarilla", value: "amarilla" },
          { name: "🔴 Alerta Roja", value: "roja" }
        )
    )
    .addStringOption(o =>
      o.setName("razon")
        .setDescription("Razón de la alerta")
        .setRequired(true)
    ),

  async execute(interaction) {

    // 🔒 Verificación de rol
    if (!interaction.member.roles.cache.has(ROL_STAFF)) {
      return interaction.reply({
        content: "⛔ **No tienes permisos para usar este comando.**",
        ephemeral: true
      });
    }

    const nivel = interaction.options.getString("nivel");
    const razon = interaction.options.getString("razon");

    let titulo = "";
    let color = 0x3498db;
    let descripcion = "";

    if (nivel === "verde") {
      titulo = "🟢 ALERTA VERDE";
      color = 0x2ecc71;
      descripcion =
        "🔫 **Armamento permitido:**\n" +
        "• Pistolas básicas (Beretta M9, Glock)\n\n";
    }

    if (nivel === "amarilla") {
      titulo = "🟡 ALERTA AMARILLA";
      color = 0xf1c40f;
      descripcion =
        "🔫 **Armamento permitido:**\n" +
        "• Armas semi-automáticas\n\n";
    }

    if (nivel === "roja") {
      titulo = "🔴 ALERTA ROJA";
      color = 0xe74c3c;
      descripcion =
        "🔫 **Armamento permitido:**\n" +
        "• Todo tipo de armas\n" +
        "🚫 *Excepto armas prohibidas por la administración*\n\n";
    }

    descripcion += `📌 **Razón:**\n${razon}`;

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descripcion)
      .setColor(color)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({
        text: `Emitida por: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({
      content: `<@&${ROL_PING}>`,
      embeds: [embed]
    });
  }
};
