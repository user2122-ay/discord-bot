const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

// 🔒 Roles
const ROL_AUTORIZADO = "1463192290423083324";
const ROL_PING = "1463192290360295646";

// 📍 Canales
const CANAL_SESION = "1463192291056423024";
const CANAL_LOGS = "1463192293312958628";

let votacionActiva = null;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sesion")
    .setDescription("Sistema de sesiones")
    .addSubcommand(s => s.setName("abrir_votacion").setDescription("Abrir votación"))
    .addSubcommand(s => s.setName("cerrar_votacion").setDescription("Cerrar votación"))
    .addSubcommand(s => s.setName("abrir").setDescription("Abrir sesión"))
    .addSubcommand(s => s.setName("cerrar").setDescription("Cerrar sesión")),

  async execute(interaction) {

    // 🔒 Permisos
    if (!interaction.member.roles.cache.has(ROL_AUTORIZADO)) {
      return interaction.reply({ content: "⛔ Sin permisos", ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    const canalSesion = await interaction.guild.channels.fetch(CANAL_SESION);
    const canalLogs = await interaction.guild.channels.fetch(CANAL_LOGS);

    // =============================
    // 🗳️ ABRIR VOTACIÓN
    // =============================
    if (sub === "abrir_votacion") {

      if (votacionActiva) {
        return interaction.reply({ content: "❌ Ya hay una votación activa", ephemeral: true });
      }

      const votos = { si: [], no: [] };

      const embed = new EmbedBuilder()
        .setTitle("🗳️ Votación de Apertura")
        .setDescription("Presiona un botón para votar.\n\n**SI:** 0\n**NO:** 0")
        .setColor(0xf1c40f)
        .setFooter({ text: `Moderador: ${interaction.user.tag}` })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("votar_si")
          .setLabel("Votar SI")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("votar_no")
          .setLabel("Votar NO")
          .setStyle(ButtonStyle.Danger)
      );

      const msg = await canalSesion.send({
        content: `<@&${ROL_PING}>`,
        embeds: [embed],
        components: [row]
      });

      votacionActiva = { msg, votos };

      // 🎯 BOTONES
      const collector = msg.createMessageComponentCollector({ time: 10 * 60 * 1000 });

      collector.on("collect", async i => {

        if (i.customId === "votar_si") {
          votos.no = votos.no.filter(id => id !== i.user.id);
          if (!votos.si.includes(i.user.id)) votos.si.push(i.user.id);
        }

        if (i.customId === "votar_no") {
          votos.si = votos.si.filter(id => id !== i.user.id);
          if (!votos.no.includes(i.user.id)) votos.no.push(i.user.id);
        }

        const nuevoEmbed = EmbedBuilder.from(embed)
          .setDescription(
            `Presiona un botón para votar.\n\n` +
            `✅ **SI (${votos.si.length})**\n${votos.si.map(id => `<@${id}>`).join("\n") || "Nadie"}\n\n` +
            `❌ **NO (${votos.no.length})**\n${votos.no.map(id => `<@${id}>`).join("\n") || "Nadie"}`
          );

        await msg.edit({ embeds: [nuevoEmbed] });
        await i.reply({ content: "✅ Voto registrado", ephemeral: true });
      });

      await interaction.reply({ content: "✅ Votación iniciada", ephemeral: true });

      return;
    }

    // =============================
    // 🔒 CERRAR VOTACIÓN
    // =============================
    if (sub === "cerrar_votacion") {

      if (!votacionActiva) {
        return interaction.reply({ content: "❌ No hay votación activa", ephemeral: true });
      }

      const { votos } = votacionActiva;

      votacionActiva.msg.edit({ components: [] });

      // 📩 ENVIAR DM
      votos.si.forEach(async id => {
        const user = await interaction.client.users.fetch(id).catch(() => null);
        if (!user) return;

        const embedDM = new EmbedBuilder()
          .setTitle("🚨 Sesión Abierta")
          .setDescription(
            "Debes unirte a rolear inmediatamente.\n\n⏱️ Tiempo límite: 10 minutos\n❌ De no hacerlo, serás sancionado."
          )
          .setColor(0xe74c3c);

        user.send({ embeds: [embedDM] }).catch(() => {});
      });

      // 📜 LOG
      canalLogs.send({
        embeds: [{
          title: "🗳️ Votación cerrada",
          color: 0xe74c3c,
          fields: [
            { name: "👮 Staff", value: `<@${interaction.user.id}>` },
            { name: "✅ SI", value: `${votos.si.length}` },
            { name: "❌ NO", value: `${votos.no.length}` }
          ],
          timestamp: new Date()
        }]
      });

      votacionActiva = null;

      return interaction.reply({ content: "🔒 Votación cerrada", ephemeral: true });
    }

    // =============================
    // 🟢 ABRIR SESIÓN
    // =============================
    if (sub === "abrir") {

      const embed = new EmbedBuilder()
        .setTitle("🟢 SERVIDOR ABIERTO")
        .setDescription("El servidor está abierto. ¡A rolear!")
        .setColor(0x2ecc71);

      await canalSesion.send({
        content: `<@&${ROL_PING}>`,
        embeds: [embed]
      });

      canalLogs.send({
        embeds: [{
          title: "🟢 Sesión abierta",
          color: 0x2ecc71,
          fields: [{ name: "👮 Staff", value: `<@${interaction.user.id}>` }],
          timestamp: new Date()
        }]
      });

      return interaction.reply({ content: "✅ Sesión abierta", ephemeral: true });
    }

    // =============================
    // 🔴 CERRAR SESIÓN
    // =============================
    if (sub === "cerrar") {

      const embed = new EmbedBuilder()
        .setTitle("🔴 SERVIDOR CERRADO")
        .setDescription("El servidor ha sido cerrado.")
        .setColor(0xe74c3c);

      await canalSesion.send({
        content: `<@&${ROL_PING}>`,
        embeds: [embed]
      });

      canalLogs.send({
        embeds: [{
          title: "🔴 Sesión cerrada",
          color: 0xe74c3c,
          fields: [{ name: "👮 Staff", value: `<@${interaction.user.id}>` }],
          timestamp: new Date()
        }]
      });

      return interaction.reply({ content: "❌ Sesión cerrada", ephemeral: true });
    }

  }
};
