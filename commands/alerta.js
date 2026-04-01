const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 🔒 Rol autorizado
const ROL_AUTORIZADO = "1463192290423083324";

// 🔔 Rol a ping
const ROL_PING = "1463192290314162342";

// 📢 Canal donde se envía la alerta
const CANAL_ALERTAS = "1463192291811528930";

// 📜 Canal de logs
const CANAL_LOGS = "1463192293312958628";

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

    // 🔒 Verificar permisos
    if (!interaction.member.roles.cache.has(ROL_AUTORIZADO)) {
      return interaction.reply({
        content: "⛔ No tienes permisos para usar este comando.",
        ephemeral: true
      });
    }

    const tipo = interaction.options.getString("tipo");
    const razon = interaction.options.getString("razon");

    let color, titulo, descripcion;

    if (tipo === "verde") {
      color = 0x2ecc71;
      titulo = "🟢 ALERTA VERDE";
      descripcion =
        "🔫 **Armas permitidas:**\n" +
        "• Pistolas (Glock, Beretta)\n\n" +
        "🟢 Nivel de riesgo: Bajo\n\n" +
        `📌 **Razón:** ${razon}`;
    }

    if (tipo === "amarilla") {
      color = 0xf1c40f;
      titulo = "🟡 ALERTA AMARILLA";
      descripcion =
        "🔫 **Armas permitidas:**\n" +
        "• Semi-automáticas\n\n" +
        "🟡 Nivel de riesgo: Medio\n\n" +
        `📌 **Razón:** ${razon}`;
    }

    if (tipo === "roja") {
      color = 0xe74c3c;
      titulo = "🔴 ALERTA ROJA";
      descripcion =
        "🚨 **Armas permitidas:**\n" +
        "• Todas (excepto restringidas por staff)\n\n" +
        "🔴 Nivel de riesgo: Alto\n\n" +
        `📌 **Razón:** ${razon}`;
    }

    // 📢 Canal de alertas
    const canalAlertas = interaction.guild.channels.cache.get(CANAL_ALERTAS);

    // 📜 Canal logs
    const canalLogs = interaction.guild.channels.cache.get(CANAL_LOGS);

    // 🎨 Embed principal
    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descripcion)
      .setColor(color)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .addFields(
        { name: "📍 Servidor", value: interaction.guild.name, inline: true },
        { name: "👮 Emitido por", value: `<@${interaction.user.id}>`, inline: true },
        { name: "🕒 Hora", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
      )
      .setFooter({
        text: "Sistema de Alertas • Los Santos RP",
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    // 🚨 ENVIAR ALERTA
    if (canalAlertas) {
      await canalAlertas.send({
        content: `<@&${ROL_PING}>`,
        embeds: [embed],
        allowedMentions: { roles: [ROL_PING] }
      });
    }

    // 📜 LOG
    if (canalLogs) {
      const logEmbed = new EmbedBuilder()
        .setTitle("📜 Alerta emitida")
        .setColor(0x3498db)
        .addFields(
          { name: "👮 Usuario", value: `<@${interaction.user.id}>`, inline: true },
          { name: "🚨 Tipo", value: titulo, inline: true },
          { name: "📌 Razón", value: razon, inline: false }
        )
        .setFooter({
          text: "Registro de Seguridad",
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      canalLogs.send({ embeds: [logEmbed] });
    }

    // ✅ RESPUESTA SOLO PARA EL STAFF
    await interaction.reply({
      content: "✅ Alerta enviada correctamente.",
      ephemeral: true
    });
  }
};
