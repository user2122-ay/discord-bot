const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const ROL_AUTORIZADO = "1463192290423083324";
const ROL_PING = "1463192290360295646";

const CANAL_SESION = "1463192291056423024";
const CANAL_LOGS = "1463192293312958628";

let votacionActiva = false;
let votos = new Set();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sesion")
    .setDescription("Panel de sesiones del servidor"),

  async execute(interaction) {

    if (!interaction.member.roles.cache.has(ROL_AUTORIZADO)) {
      return interaction.reply({ content: "⛔ No tienes permisos.", ephemeral: true });
    }

    const panel = new EmbedBuilder()
      .setTitle("📊 Panel de Control de Sesiones")
      .setDescription(
        "Desde este panel podrás gestionar el estado del servidor.\n\n" +
        "🔹 Abrir sesión\n🔹 Cerrar sesión\n🔹 Iniciar votación\n🔹 Activar mantenimiento\n\n" +
        "📌 Usa los botones de abajo."
      )
      .setColor(0x3498db);

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("abrir").setLabel("🟢 Abrir").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("cerrar").setLabel("🔴 Cerrar").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("votar").setLabel("🗳️ Votación").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("mantenimiento").setLabel("🛠️ Mantenimiento").setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [panel], components: [botones], ephemeral: true });

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
          .setDescription(
            "🌴 **¡El servidor ha sido abierto oficialmente!**\n\n" +
            "🚓 Todos los sistemas están activos.\n" +
            "📜 Recuerda seguir las normativas.\n\n" +
            "⚠️ Mantén rol serio y respeta a todos.\n\n" +
            "🎭 ¡Comienza tu historia en la ciudad!"
          )
          .setColor(0x2ecc71)
          .setFooter({
            text: `Apertura realizada por ${i.user.tag}`,
            iconURL: i.user.displayAvatarURL()
          })
          .setTimestamp();

        canal.send({
          content: `<@&${ROL_PING}>`,
          embeds: [embed],
          allowedMentions: { roles: [ROL_PING] }
        });

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
          .setDescription(
            "🚫 **El servidor ha sido cerrado temporalmente.**\n\n" +
            "📌 No se permite rolear.\n\n" +
            "🙏 Gracias por su participación.\n" +
            "📢 Mantente atento a novedades."
          )
          .setColor(0xe74c3c)
          .setFooter({
            text: `Cierre realizado por ${i.user.tag}`,
            iconURL: i.user.displayAvatarURL()
          })
          .setTimestamp();

        canal.send({
          content: `<@&${ROL_PING}>`,
          embeds: [embed],
          allowedMentions: { roles: [ROL_PING] }
        });

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
          .setDescription(
            "⚙️ El servidor está en mantenimiento.\n\n" +
            "🔧 Se están realizando ajustes.\n\n" +
            "⛔ No se permite rolear."
          )
          .setColor(0x95a5a6);

        canal.send({ embeds: [embed] });

        return i.update({ content: "🛠️ Activado", components: [] });
      }

      // ========================
      // 🗳️ VOTACIÓN
      // ========================
      if (i.customId === "votar") {

        if (votacionActiva) {
          return i.reply({ content: "❌ Ya hay una votación.", ephemeral: true });
        }

        votacionActiva = true;
        votos.clear();

        const embed = new EmbedBuilder()
          .setTitle("🗳️ VOTACIÓN OFICIAL")
          .setDescription(
            "📢 **Se ha iniciado una votación para abrir el servidor.**\n\n" +
            "👥 Participa votando abajo.\n\n" +
            "📊 **Votos: 0/8**\n\n" +
            "👤 **Votantes:**\nNadie aún\n\n" +
            "⏳ Tiempo límite: 20 minutos"
          )
          .setColor(0xf1c40f)
          .setFooter({
            text: `Votación iniciada por ${i.user.tag}`,
            iconURL: i.user.displayAvatarURL()
          });

        const boton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("votar_si")
            .setLabel("✅ Votar")
            .setStyle(ButtonStyle.Success)
        );

        const msg = await canal.send({
          content: `<@&${ROL_PING}>`,
          embeds: [embed],
          components: [boton],
          allowedMentions: { roles: [ROL_PING] }
        });

        const collectorV = msg.createMessageComponentCollector({ time: 20 * 60 * 1000 });

        collectorV.on("collect", async btn => {

          if (votos.has(btn.user.id)) {
            return btn.reply({ content: "❌ Ya votaste.", ephemeral: true });
          }

          votos.add(btn.user.id);

          const lista = [...votos].map(id => `<@${id}>`).join("\n");

          await msg.edit({
            embeds: [
              EmbedBuilder.from(embed).setDescription(
                "📢 **Votación en curso**\n\n" +
                `📊 **Votos:** ${votos.size}/8\n\n` +
                `👤 **Votantes:**\n${lista}\n\n` +
                "⏳ Tiempo restante activo"
              )
            ]
          });

          await btn.reply({ content: "✅ Votaste", ephemeral: true });

          if (votos.size >= 8) collectorV.stop();
        });

        collectorV.on("end", async () => {

          votacionActiva = false;

          if (votos.size >= 8) {

            canal.send({
              content: `<@&${ROL_PING}>`,
              embeds: [
                new EmbedBuilder()
                  .setTitle("🟢 APERTURA AUTOMÁTICA")
                  .setDescription(
                    "🎉 Se alcanzaron los votos necesarios.\n\n" +
                    "🚓 Servidor abierto automáticamente.\n\n" +
                    "⏰ Tienen 10 minutos para entrar."
                  )
                  .setColor(0x2ecc71)
              ],
              allowedMentions: { roles: [ROL_PING] }
            });

          } else {

            canal.send({
              embeds: [
                new EmbedBuilder()
                  .setTitle("❌ VOTACIÓN FINALIZADA")
                  .setDescription("No se alcanzaron los votos necesarios.")
                  .setColor(0xe74c3c)
              ]
            });

          }

          msg.edit({ components: [] });

          logs.send({
            embeds: [
              new EmbedBuilder()
                .setTitle("📊 LOG VOTACIÓN")
                .setDescription(`Votos: ${votos.size}/8\nResponsable: <@${i.user.id}>`)
                .setColor(0xf1c40f)
            ]
          });

        });

        return i.update({ content: "🗳️ Votación iniciada", components: [] });
      }

    });
  }
};
