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
      .setTitle("📊 Panel de Sesión")
      .setDescription("Selecciona una acción administrativa:")
      .setColor(0x3498db);

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("abrir").setLabel("🟢 Abrir").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("cerrar").setLabel("🔴 Cerrar").setStyle(ButtonStyle.Danger),
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

      // 🟢 ABRIR
      if (i.customId === "abrir") {

        const embed = new EmbedBuilder()
          .setTitle("🟢 SESIÓN ABIERTA")
          .setDescription(
            "🌴 **¡El servidor ha sido abierto oficialmente!**\n\n" +
            "🚓 Sistemas activos\n📜 Respeta normativas\n\n" +
            "🎭 ¡Buen rol!"
          )
          .setColor(0x2ecc71)
          .setFooter({ text: `Por ${i.user.tag}`, iconURL: i.user.displayAvatarURL() })
          .setTimestamp();

        canal.send({
          content: `<@&${ROL_PING}>`,
          embeds: [embed],
          allowedMentions: { roles: [ROL_PING] }
        });

        logs.send({
          embeds: [new EmbedBuilder()
            .setTitle("📊 LOG SESIÓN")
            .setDescription(`🟢 Abierta por <@${i.user.id}>`)
            .setColor(0x2ecc71)]
        });

        return i.update({ content: "✅ Sesión abierta", components: [] });
      }

      // 🔴 CERRAR
      if (i.customId === "cerrar") {

        const embed = new EmbedBuilder()
          .setTitle("🔴 SESIÓN CERRADA")
          .setDescription("🚫 Servidor cerrado temporalmente.")
          .setColor(0xe74c3c);

        canal.send({
          content: `<@&${ROL_PING}>`,
          embeds: [embed],
          allowedMentions: { roles: [ROL_PING] }
        });

        logs.send({
          embeds: [new EmbedBuilder()
            .setDescription(`🔴 Cerrada por <@${i.user.id}>`)
            .setColor(0xe74c3c)]
        });

        return i.update({ content: "❌ Sesión cerrada", components: [] });
      }

      // 🛠️ MANTENIMIENTO
      if (i.customId === "mantenimiento") {

        const embed = new EmbedBuilder()
          .setTitle("🛠️ MANTENIMIENTO")
          .setDescription("⚙️ Servidor en mantenimiento.")
          .setColor(0x95a5a6);

        canal.send({
          content: `<@&${ROL_PING}>`,
          embeds: [embed],
          allowedMentions: { roles: [ROL_PING] }
        });

        logs.send({
          embeds: [new EmbedBuilder()
            .setDescription(`🛠️ Activado por <@${i.user.id}>`)
            .setColor(0x95a5a6)]
        });

        return i.update({ content: "🛠️ Activado", components: [] });
      }

      // 🗳️ VOTACIÓN
      if (i.customId === "votar") {

        if (votacionActiva) {
          return i.reply({ content: "❌ Ya hay una votación.", ephemeral: true });
        }

        votacionActiva = true;
        votos.clear();

        const embed = new EmbedBuilder()
          .setTitle("🗳️ VOTACIÓN")
          .setDescription("📊 Votos: 0/8\n⏳ 20 minutos")
          .setColor(0xf1c40f);

        const boton = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("votar_si")
            .setLabel("✅ Votar")
            .setStyle(ButtonStyle.Success)
        );

        const msg = await canal.send({ embeds: [embed], components: [boton] });

        const collectorV = msg.createMessageComponentCollector({ time: 20 * 60 * 1000 });

        collectorV.on("collect", async btn => {

          if (votos.has(btn.user.id)) {
            return btn.reply({ content: "❌ Ya votaste.", ephemeral: true });
          }

          votos.add(btn.user.id);

          await msg.edit({
            embeds: [EmbedBuilder.from(embed)
              .setDescription(`📊 Votos: ${votos.size}/8`)]
          });

          await btn.reply({ content: "✅ Voto registrado", ephemeral: true });

          if (votos.size >= 8) collectorV.stop();
        });

        collectorV.on("end", async () => {

          votacionActiva = false;

          if (votos.size >= 8) {

            canal.send({
              content: `<@&${ROL_PING}>`,
              embeds: [new EmbedBuilder()
                .setTitle("🟢 APERTURA AUTOMÁTICA")
                .setDescription("🎉 Votación exitosa.")
                .setColor(0x2ecc71)],
              allowedMentions: { roles: [ROL_PING] }
            });

            votos.forEach(async id => {
              const user = await interaction.client.users.fetch(id);
              user.send({
                embeds: [new EmbedBuilder()
                  .setTitle("🚨 A ROLEAR")
                  .setDescription("Tienes 10 minutos para entrar.")]
              }).catch(() => {});
            });

          } else {

            canal.send({
              embeds: [new EmbedBuilder()
                .setTitle("❌ VOTACIÓN FALLIDA")
                .setDescription("No se alcanzaron votos.")
                .setColor(0xe74c3c)]
            });

          }

          msg.edit({ components: [] });

          logs.send({
            embeds: [new EmbedBuilder()
              .setTitle("📊 LOG VOTACIÓN")
              .setDescription(`Votos: ${votos.size}/8\n<@${interaction.user.id}>`)
              .setColor(0xf1c40f)]
          });

        });

        return i.update({ content: "🗳️ Votación iniciada", components: [] });
      }

    });
  }
};
