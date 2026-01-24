const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 🔒 Rol que PUEDE usar el comando
const ROL_AUTORIZADO = "1463192290423083324";

// 🔔 Rol al que se le hace PING
const ROL_PING = "1463192290314162342";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("alerta")
    .setDescription("Emitir una alerta de seguridad")
    .addStringOption(option =>
      option
        .setName("tipo")
        .setDescription("Tipo de alerta")
        .setRequired(true)
        .addChoices(
          { name: "🟢 Alerta Verde", value: "verde" },
          { name: "🟡 Alerta Amarilla", value: "amarilla" },
          { name: "🔴 Alerta Roja", value: "roja" }
        )
    )
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón de la alerta")
        .setRequired(true)
    ),

  async execute(interaction) {

    // 🔒 VERIFICAR ROL
    if (!interaction.member.roles.cache.has(ROL_AUTORIZADO)) {
      return interaction.reply({
        content: "⛔ No tienes permisos para usar este comando.",
        ephemeral: true
      });
    }

    const tipo = interaction.options.getString("tipo");
    const razon = interaction.options.getString("razon");

    let color;
    let titulo;
    let descripcion;

    if (tipo === "verde") {
      color = 0x2ecc71;
      titulo = "🟢 ALERTA VERDE";
      descripcion =
        "🔫 **Solo armas cortas permitidas**\n" +
        "• Beretta\n• Glock\n\n" +
        `📌 **Razón:** ${razon}`;
    }

    if (tipo === "amarilla") {
      color = 0xf1c40f;
      titulo = "🟡 ALERTA AMARILLA";
      descripcion =
        "🔫 **Armas semi-automáticas permitidas**\n\n" +
        `📌 **Razón:** ${razon}`;
    }

    if (tipo === "roja") {
      color = 0xe74c3c;
      titulo = "🔴 ALERTA ROJA";
      descripcion =
        "🚨 **Se permite todo tipo de armas**\n" +
        "❌ *Excepto las prohibidas por la administración*\n\n" +
        `📌 **Razón:** ${razon}`;
    }

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descripcion)
      .setColor(color)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({
        text: `Emitido por: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    // ✅ AQUÍ ESTÁ LA PARTE DEL PING (YA ARREGLADA)
    await interaction.reply({
      content: `<@&${ROL_PING}>`,
      embeds: [embed],
      allowedMentions: {
        roles: [ROL_PING]
      }
    });
  }
};
