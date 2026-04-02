const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const ROL_AUTORIZADO = "1463192290423083324";
const CANAL_SESION = "1463192291056423024";
const CANAL_LOGS = "1463192293312958628";

let votacionActiva = false;
let votos = new Set();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sesion")
    .setDescription("Panel de sesiones del servidor"),

  async execute(interaction) {

    // 🔒 Permisos
    if (!interaction.member.roles.cache.has(ROL_AUTORIZADO)) {
      return interaction.reply({ content: "⛔ No tienes permisos.", ephemeral: true });
    }

    // 🎛️ PANEL (solo staff)
    const panel = new EmbedBuilder()
      .setTitle("📊 Panel de Sesión")
      .setDescription("Selecciona una acción:")
      .setColor(0x3498db);

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("abrir").setLabel("🟢 Abrir Sesión").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("cerrar").setLabel("🔴 Cerrar Sesión").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("votar").setLabel("🗳️ Votación").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("mantenimiento").setLabel("🛠️ Mantenimiento").setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [panel],
      components: [botones],
      ephemeral: true
    });

    const collector = interaction.channel.createMessageComponentCollector({ time: 600000 });

    collector.on("collect", async i => {

      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ No puedes usar esto.", ephemeral: true });
      }

      const canal = interaction.guild.channels.cache.get(CANAL_SESION);
      const logs = interaction.guild.channels.cache.get(CANAL_LOGS);

      // ========================
      // 🟢 ABRIR SESIÓN
      // ========================
      if (i.customId === "abrir") {

        const embed = new EmbedBuilder()
          .setTitle("🟢 SESIÓN ABIERTA")
          .setDescription("El servidor está abierto para rolear.\n\n¡Entren ya!")
          .setColor(0x2ecc71)
          .setTimestamp();

        canal.send({ embeds: [embed] });

        logs.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("📊 LOG SESIÓN")
              .setDescription(`🟢 Sesión abierta por <@${i.user.id}>`)
              .setColor(0x2ecc71)
          ]
        });

        return i.update({ content: "✅ Sesión abierta", components: [] });
      }

      // ========================
      // 🔴 CERRAR SESIÓN
      // ========================
      if (i.customId === "cerrar") {

        const embed = new EmbedBuilder()
          .setTitle("🔴 SESIÓN CERRADA")
          .setDescription("El servidor ha sido cerrado.")
          .setColor(0xe74c3c);

        canal.send({ embeds: [embed] });

        logs.send({
          embeds: [
            new EmbedBuilder()
              .setDescription(`🔴 Sesión cerrada por <@${i.user.id}>`)
              .setColor(0xe74c3c)
          ]
        });

        return i.update({ content: "❌ Sesión cerrada", components: [] });
      }

      // ========================
      // 🛠️ MANTENIMIENTO
      // ========================
      if (i.customId === "mantenimiento") {

        const embed = new EmbedBuilder()
          .setTitle("🛠️ MANTENIMIENTO")
          .setDescription("El servidor está en mantenimiento.")
          .setColor(0x95a5a6);

        canal.send({ embeds: [embed] });

        logs.send({
          embeds: [
            new EmbedBuilder()
              .setDescription(`🛠️ Mantenimiento activado por <@${i.user.id}>`)
              .setColor(0x95a5a6)
          ]
        });

        return i.update({ content: "🛠️ Mantenimiento activado", components: [] });
      }

      // ========================
      // 🗳️ VOTACIÓN
      // ========================
      if (i.customId === "votar") {

        if (votacionActiva) {
          return i.reply({ content: "❌ Ya hay una votación activa.", ephemeral: true });
        }

        votacionActiva = true;
        votos.clear();

        const embed = new EmbedBuilder()
          .setTitle("🗳️ VOTACIÓN ABIERTA")
          .setDescription("Presiona el botón para votar.\n\n**Votos: 0/8**")
          .setColor(0xf1c40f);

        const botonVotar = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("votar_si")
            .setLabel("✅ Votar")
            .setStyle(ButtonStyle.Success)
        );

        const mensaje = await canal.send({
          embeds: [embed],
          components: [botonVotar]
        });

        const filtro = i => i.customId === "votar_si";

        const collectorVotos = mensaje.createMessageComponentCollector({ time: 20 * 60 * 1000 });

        collectorVotos.on("collect", async btn => {

          if (votos.has(btn.user.id)) {
            return btn.reply({ content: "❌ Ya votaste.", ephemeral: true });
          }

          votos.add(btn.user.id);

          const nuevoEmbed = EmbedBuilder.from(embed)
            .setDescription(`Presiona el botón para votar.\n\n**Votos: ${votos.size}/8**`);

          await mensaje.edit({ embeds: [nuevoEmbed] });

          await btn.reply({ content: "✅ Voto registrado", ephemeral: true });

          // 🔥 SI LLEGA A 8 VOTOS
          if (votos.size >= 8) {
            collectorVotos.stop("completo");
          }
        });

        collectorVotos.on("end", async () => {

          votacionActiva = false;

          if (votos.size >= 8) {

            const abrirEmbed = new EmbedBuilder()
              .setTitle("🟢 SESIÓN ABIERTA AUTOMÁTICAMENTE")
              .setDescription("Se alcanzaron los votos necesarios.")
              .setColor(0x2ecc71);

            canal.send({ embeds: [abrirEmbed] });

            // 📩 DM a votantes
            votos.forEach(async id => {
              const user = await interaction.client.users.fetch(id);
              user.send({
                embeds: [
                  new EmbedBuilder()
                    .setTitle("🚨 ¡A ROLEAR!")
                    .setDescription("Únete en menos de 10 minutos o podrías ser sancionado.")
                    .setColor(0xe74c3c)
                ]
              }).catch(() => {});
            });

          } else {

            canal.send({
              embeds: [
                new EmbedBuilder()
                  .setTitle("❌ VOTACIÓN FALLIDA")
                  .setDescription("No se alcanzaron los votos.")
                  .setColor(0xe74c3c)
              ]
            });

          }

          mensaje.edit({ components: [] });

          logs.send({
            embeds: [
              new EmbedBuilder()
                .setTitle("📊 LOG VOTACIÓN")
                .setDescription(`Votos: ${votos.size}/8\nEjecutado por <@${interaction.user.id}>`)
                .setColor(0xf1c40f)
            ]
          });

        });

        return i.update({ content: "🗳️ Votación iniciada", components: [] });
      }

    });
  }
};
