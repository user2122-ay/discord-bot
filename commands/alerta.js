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

    // 🔥 OPCIONES (ESTO TE FALTABA)
    .addStringOption(option =>
      option.setName("tipo")
        .setDescription("Tipo de alerta")
        .setRequired(true)
        .addChoices(
          { name: "Verde", value: "verde" },
          { name: "Amarilla", value: "amarilla" },
          { name: "Roja", value: "roja" }
        )
    )
    .addStringOption(option =>
      option.setName("razon")
        .setDescription("Motivo de la alerta")
        .setRequired(true)
    ),

  async execute(interaction) {

    // 🔒 Permiso
    if (!interaction.member.roles.cache.has(ROL_AUTORIZADO)) {
      return interaction.reply({
        content: "⛔ No tienes permisos.",
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
        "🔫 **Armas permitidas:**\n• Pistolas\n\n🟢 Nivel: Bajo\n\n📌 " + razon;
    }

    if (tipo === "amarilla") {
      color = 0xf1c40f;
      titulo = "🟡 ALERTA AMARILLA";
      descripcion =
        "🔫 **Armas permitidas:**\n• Semi-auto\n\n🟡 Nivel: Medio\n\n📌 " + razon;
    }

    if (tipo === "roja") {
      color = 0xe74c3c;
      titulo = "🔴 ALERTA ROJA";
      descripcion =
        "🚨 **Armas permitidas:**\n• Todas\n\n🔴 Nivel: Alto\n\n📌 " + razon;
    }

    const canalAlertas = interaction.guild.channels.cache.get(CANAL_ALERTAS);
    const canalLogs = interaction.guild.channels.cache.get(CANAL_LOGS);

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(descripcion)
      .setColor(color)
      .addFields(
        { name: "👮 Usuario", value: `<@${interaction.user.id}>`, inline: true },
        { name: "🕒 Hora", value: `<t:${Math.floor(Date.now()/1000)}:F>` }
      )
      .setTimestamp();

    if (canalAlertas) {
      await canalAlertas.send({
        content: `<@&${ROL_PING}>`,
        embeds: [embed]
      });
    }

    if (canalLogs) {
      await canalLogs.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("📜 Log de alerta")
            .setDescription(`${titulo}\n📌 ${razon}`)
            .setColor(0x3498db)
        ]
      });
    }

    await interaction.reply({
      content: "✅ Alerta enviada",
      ephemeral: true
    });
  }
};
