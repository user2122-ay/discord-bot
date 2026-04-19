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

    // 🔥 OPCIONES OBLIGATORIAS
    .addStringOption(option =>
      option.setName("tipo")
        .setDescription("Tipo de alerta")
        .setRequired(true)
        .addChoices(
          { name: "🟢 Verde", value: "verde" },
          { name: "🟡 Amarilla", value: "amarilla" },
          { name: "🔴 Roja", value: "roja" }
        )
    )
    .addStringOption(option =>
      option.setName("razon")
        .setDescription("Motivo de la alerta")
        .setRequired(true)
    ),

  permisos: `<@&${ROL_AUTORIZADO}>`,

  async execute(interaction) {

    // 🔒 Permisos
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
      descripcion = `🔫 Pistolas permitidas\n\n🟢 Riesgo bajo\n\n📌 ${razon}`;
    }

    if (tipo === "amarilla") {
      color = 0xf1c40f;
      titulo = "🟡 ALERTA AMARILLA";
      descripcion = `🔫 Semi-automáticas\n\n🟡 Riesgo medio\n\n📌 ${razon}`;
    }

    if (tipo === "roja") {
      color = 0xe74c3c;
      titulo = "🔴 ALERTA ROJA";
      descripcion = `🚨 Todas las armas\n\n🔴 Riesgo alto\n\n📌 ${razon}`;
    }

    const canalAlertas = interaction.guild.channels.cache.get(CANAL_ALERTAS);
    const canalLogs = interaction.guild.channels.cache.get(CANAL_LOGS);

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descripcion)
      .setColor(color)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .addFields(
        { name: "📍 Servidor", value: interaction.guild.name, inline: true },
        { name: "👮 Emitido por", value: `<@${interaction.user.id}>`, inline: true },
        { name: "🕒 Hora", value: `<t:${Math.floor(Date.now() / 1000)}:F>` }
      )
      .setFooter({
        text: "Sistema de Alertas • Los Santos RP"
      })
      .setTimestamp();

    // 📢 ALERTA
    if (canalAlertas) {
      await canalAlertas.send({
        content: `<@&${ROL_PING}>`,
        embeds: [embed],
        allowedMentions: { roles: [ROL_PING] }
      });
    }

    // 📜 LOG
    if (canalLogs) {
      await canalLogs.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("📜 Alerta emitida")
            .setColor(0x3498db)
            .addFields(
              { name: "👮 Usuario", value: `<@${interaction.user.id}>`, inline: true },
              { name: "🚨 Tipo", value: titulo, inline: true },
              { name: "📌 Razón", value: razon }
            )
            .setTimestamp()
        ]
      });
    }

    await interaction.reply({
      content: "✅ Alerta enviada correctamente.",
      ephemeral: true
    });
  }
};
