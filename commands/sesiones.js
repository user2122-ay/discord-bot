const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ThumbnailBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags
} = require("discord.js");

const ROL_AUTORIZADO = "1451018406537986168";
const ROL_PING       = "1451018397352595579";
const CANAL_SESION   = "1451018683383156827";
const CANAL_LOGS     = "1497610703677161493";

const VOTOS_REQUERIDOS = 8;
const CODIGO_SESION    = "cai";

const THUMBNAIL = "https://cdn.discordapp.com/attachments/1456748347221344340/1509722237253451868/BackgroundEraser_20260506_190546633.png?ex=6a1a35e6&is=6a18e466&hm=8f27e223e994b963d68c0945d6d4b3f04e79d193eb7f8dbace121ff849ec115e&";

let votacionActiva = false;
let votos          = new Set();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📩 Log en cajón
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function enviarLog(guild, texto, color) {
  const canal = guild.channels.cache.get(CANAL_LOGS);
  if (!canal) return;

  await canal.send({
    flags: MessageFlags.IsComponentsV2,
    components: [
      new ContainerBuilder()
        .setAccentColor(color)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## 📋 Log de Sesión\n` +
            `-# ${new Date().toLocaleString("es-PA")}`
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(texto)
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# © Panamá RP V2 · Sistema de Sesiones`
          )
        )
    ]
  }).catch(() => {});
}

module.exports = {
  permisos:  "🛡️ Staff",
  categoria: "staff",

  data: new SlashCommandBuilder()
    .setName("sesion")
    .setDescription("Panel de control de sesiones del servidor"),

  async execute(interaction) {

    if (!interaction.member.roles.cache.has(ROL_AUTORIZADO)) {
      return interaction.reply({ content: "⛔ No tienes permisos.", ephemeral: true });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧱 Panel de control
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const panel = new ContainerBuilder()
      .setAccentColor(0x5865F2)

      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## 📊 Panel de Control\n` +
              `-# Sistema Oficial de Sesiones · Panamá RP V2`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(THUMBNAIL)
          )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**🟢 Abrir Sesión**\n> Inicia oficialmente las actividades del servidor.\n\n` +
          `**🔴 Cerrar Sesión**\n> Finaliza todas las actividades del roleplay.\n\n` +
          `**🗳️ Iniciar Votación**\n> Los usuarios votan para abrir sesión. Se necesitan **${VOTOS_REQUERIDOS} votos**.\n\n` +
          `**🛠️ Mantenimiento**\n> Activa el modo mantenimiento del servidor.`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# Usa los botones de abajo para gestionar el servidor`
        )
      );

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("abrir")
        .setLabel("Abrir")
        .setEmoji("🟢")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("cerrar")
        .setLabel("Cerrar")
        .setEmoji("🔴")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("votar")
        .setLabel("Votación")
        .setEmoji("🗳️")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("mantenimiento")
        .setLabel("Mantenimiento")
        .setEmoji("🛠️")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
      components: [panel, botones]
    });

    const collector = interaction.channel.createMessageComponentCollector({
      time: 600000
    });

    collector.on("collect", async i => {

      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ No puedes usar esto.", ephemeral: true });
      }

      const canal = interaction.guild.channels.cache.get(CANAL_SESION);

      // ━━━━━━━━━━━━━━━━━━━━
      // 🟢 ABRIR
      // ━━━━━━━━━━━━━━━━━━━━
      if (i.customId === "abrir") {

        const apertura = new ContainerBuilder()
          .setAccentColor(0x57F287)

          .addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL("https://cdn.discordapp.com/attachments/1455970934535225518/1509727251342823578/sidistroatribut01-progress-100-transparent-22958.gif?ex=6a1a3a92&is=6a18e912&hm=712861e4f7c631a31c374f6603680e081bdbb440664dfc1f0940c8e097989213&")
                .setDescription("Servidor Abierto")
            )
          )

          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          )

          .addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `## 🟢 Servidor Abierto\n` +
                  `-# PANAMÁ RP V2 · ${new Date().toLocaleString("es-PA")}`
                )
              )
              .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(THUMBNAIL)
              )
          )

          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          )

          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `> ✅ La sesión ha sido **abierta oficialmente**.\n` +
              `> 🔑 **Código de acceso:** \`${CODIGO_SESION}\`\n` +
              `> 👥 Los usuarios ya pueden ingresar y comenzar el roleplay.\n\n` +
              `**📌 Indicaciones:**\n` +
              `> • Mantener el rol serio y respetuoso\n` +
              `> • Seguir las normas del servidor\n` +
              `> • Acatar instrucciones del staff en todo momento\n\n` +
              `🔥 **¡El roleplay comienza ahora!**`
            )
          )

          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
          )

          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `-# © Panamá RP V2 · Sistema Oficial de Sesiones`
            )
          );

        // ✅ Ping separado
        await canal.send({ content: `<@&${ROL_PING}>`, allowedMentions: { roles: [ROL_PING] } });
        await canal.send({ flags: MessageFlags.IsComponentsV2, components: [apertura] });

        await enviarLog(
          interaction.guild,
          `**🟢 Sesión abierta**\n**👮 Staff:** <@${i.user.id}> (${i.user.tag})\n**🔑 Código:** \`${CODIGO_SESION}\``,
          0x57F287
        );

        return i.update({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new ContainerBuilder()
              .setAccentColor(0x57F287)
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `## ✅ Sesión abierta correctamente\n-# ${new Date().toLocaleString("es-PA")}`
                )
              )
          ]
        });
      }

      // ━━━━━━━━━━━━━━━━━━━━
      // 🔴 CERRAR
      // ━━━━━━━━━━━━━━━━━━━━
      if (i.customId === "cerrar") {

        const cierre = new ContainerBuilder()
          .setAccentColor(0xED4245)

          .addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL("https://cdn.discordapp.com/attachments/1456748347221344340/1509752792137597080/l102-0961-closed-animated-led-sign.gif?ex=6a1a525b&is=6a1900db&hm=0dd043efe79018c7e6e99ed98e95bce8ea8ee3a9023edad3e9bf3aeca36db9f9&")
                .setDescription("Servidor Cerrado")
            )
          )

          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          )

          .addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `## 🔴 Servidor Cerrado\n` +
                  `-# PANAMÁ RP V2 · ${new Date().toLocaleString("es-PA")}`
                )
              )
              .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(THUMBNAIL)
              )
          )

          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          )

          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `> ❌ La sesión ha sido **cerrada oficialmente**.\n` +
              `> 🚫 Todas las actividades de roleplay quedan suspendidas.\n\n` +
              `**📌 Información:**\n` +
              `> • El servidor entra en período de descanso\n` +
              `> • Mantente atento a los próximos anuncios\n` +
              `> • Gracias por participar en la sesión de hoy\n\n` +
              `❤️ **¡Gracias por ser parte de la comunidad!**`
            )
          )

          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
          )

          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `-# © Panamá RP V2 · Sistema Oficial de Sesiones`
            )
          );

        await canal.send({ content: `<@&${ROL_PING}>`, allowedMentions: { roles: [ROL_PING] } });
        await canal.send({ flags: MessageFlags.IsComponentsV2, components: [cierre] });

        await enviarLog(
          interaction.guild,
          `**🔴 Sesión cerrada**\n**👮 Staff:** <@${i.user.id}> (${i.user.tag})`,
          0xED4245
        );

        return i.update({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new ContainerBuilder()
              .setAccentColor(0xED4245)
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `## ❌ Sesión cerrada correctamente\n-# ${new Date().toLocaleString("es-PA")}`
                )
              )
          ]
        });
      }

      // ━━━━━━━━━━━━━━━━━━━━
      // 🛠️ MANTENIMIENTO
      // ━━━━━━━━━━━━━━━━━━━━
      if (i.customId === "mantenimiento") {

        const mantenimiento = new ContainerBuilder()
          .setAccentColor(0xFEE75C)

          .addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
              new MediaGalleryItemBuilder()
                .setURL("https://cdn.discordapp.com/attachments/1456748347221344340/1509754798315012358/17688135.gif?ex=6a1a5439&is=6a1902b9&hm=16d67219d9af970d0103769fbfcfad61a28d5ed263734c9a015c5e42b8b4621b&")
                .setDescription("Mantenimiento")
            )
          )

          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          )

          .addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `## 🛠️ Servidor en Mantenimiento\n` +
                  `-# PANAMÁ RP V2 · ${new Date().toLocaleString("es-PA")}`
                )
              )
              .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(THUMBNAIL)
              )
          )

          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
          )

          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `> ⚙️ El servidor se encuentra en **mantenimiento oficial**.\n` +
              `> 🔧 Se están realizando mejoras, ajustes y optimizaciones.\n\n` +
              `**⚠️ Recomendaciones:**\n` +
              `> • Evitar realizar acciones dentro del servidor\n` +
              `> • Esperar indicaciones oficiales del staff\n` +
              `> • Mantenerse atentos a los anuncios\n\n` +
              `📢 **La reapertura será anunciada oficialmente.**`
            )
          )

          .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
          )

          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `-# © Panamá RP V2 · Sistema Oficial del Servidor`
            )
          );

        await canal.send({ content: `<@&${ROL_PING}>`, allowedMentions: { roles: [ROL_PING] } });
        await canal.send({ flags: MessageFlags.IsComponentsV2, components: [mantenimiento] });

        await enviarLog(
          interaction.guild,
          `**🛠️ Mantenimiento activado**\n**👮 Staff:** <@${i.user.id}> (${i.user.tag})`,
          0xFEE75C
        );

        return i.update({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new ContainerBuilder()
              .setAccentColor(0xFEE75C)
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `## 🛠️ Mantenimiento activado correctamente\n-# ${new Date().toLocaleString("es-PA")}`
                )
              )
          ]
        });
      }

      // ━━━━━━━━━━━━━━━━━━━━
      // 🗳️ VOTACIÓN
      // ━━━━━━━━━━━━━━━━━━━━
      if (i.customId === "votar") {

        if (votacionActiva) {
          return i.reply({ content: "❌ Ya hay una votación activa.", ephemeral: true });
        }

        votacionActiva = true;
        votos.clear();

        const buildVotacion = (votosActuales) => {
          const barra = Array.from({ length: VOTOS_REQUERIDOS }, (_, idx) =>
            idx < votosActuales ? "🟩" : "⬛"
          ).join("");

          const listaVotos = votosActuales > 0
            ? `${votosActuales} usuario${votosActuales > 1 ? "s" : ""} han votado`
            : "Aún no hay votos registrados.";

          return new ContainerBuilder()
            .setAccentColor(0xF1C40F)

            .addMediaGalleryComponents(
              new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder()
                  .setURL("https://cdn.discordapp.com/attachments/1456748347221344340/1509756643548725288/11-00-13-565_512.gif?ex=6a1a55f1&is=6a190471&hm=e91668b6d3aae2e5ad582640c9cd41565599495440858fad763b6a279d5a61e3&")
                  .setDescription("Votación Activa")
              )
            )

            .addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )

            .addSectionComponents(
              new SectionBuilder()
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `## 🗳️ Votación Activa\n` +
                    `-# PANAMÁ RP V2 · Se necesitan ${VOTOS_REQUERIDOS} votos`
                  )
                )
                .setThumbnailAccessory(
                  new ThumbnailBuilder().setURL(THUMBNAIL)
                )
            )

            .addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
            )

            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `**📊 Progreso:** ${barra} (${votosActuales}/${VOTOS_REQUERIDOS})\n\n` +
                `> 👥 ${listaVotos}\n` +
                `> ⏳ Tiempo disponible: **20 minutos**\n\n` +
                `**📌 Indicaciones:**\n` +
                `> • Un solo voto por usuario\n` +
                `> • La decisión es democrática\n` +
                `> • Respeta a los demás usuarios\n\n` +
                `🔥 **¡Tu voz tiene poder, hazla valer!**`
              )
            )

            .addSeparatorComponents(
              new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
            )

            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `-# © Panamá RP V2 · Sistema Oficial de Votaciones`
              )
            );
        };

        const botonesVotacion = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("votar_si")
            .setLabel(`Votar (0/${VOTOS_REQUERIDOS})`)
            .setEmoji("✅")
            .setStyle(ButtonStyle.Success)
        );

        // Ping separado
        await canal.send({ content: `<@&${ROL_PING}>`, allowedMentions: { roles: [ROL_PING] } });

        const msg = await canal.send({
          flags: MessageFlags.IsComponentsV2,
          components: [buildVotacion(0), botonesVotacion]
        });

        const collectorV = msg.createMessageComponentCollector({
          time: 20 * 60 * 1000,
          filter: btn => btn.customId === "votar_si"
        });

        collectorV.on("collect", async btn => {

          if (votos.has(btn.user.id)) {
            return btn.reply({ content: "❌ Ya votaste anteriormente.", ephemeral: true });
          }

          votos.add(btn.user.id);

          await btn.reply({
            content: `✅ Voto registrado. **${votos.size}/${VOTOS_REQUERIDOS}** votos.`,
            ephemeral: true
          });

          // 🔄 Actualizar contador en tiempo real
          const botonesActualizados = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("votar_si")
              .setLabel(`Votar (${votos.size}/${VOTOS_REQUERIDOS})`)
              .setEmoji("✅")
              .setStyle(ButtonStyle.Success)
          );

          await msg.edit({
            flags: MessageFlags.IsComponentsV2,
            components: [buildVotacion(votos.size), botonesActualizados]
          }).catch(() => {});

          if (votos.size >= VOTOS_REQUERIDOS) {
            collectorV.stop("aprobada");
          }
        });

        collectorV.on("end", async (_, reason) => {

          votacionActiva = false;
          await msg.delete().catch(() => {});

          if (reason === "aprobada") {

            const aprobado = new ContainerBuilder()
              .setAccentColor(0x57F287)

              .addSectionComponents(
                new SectionBuilder()
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                      `## 🟢 Sesión Aprobada por Votación\n` +
                      `-# PANAMÁ RP V2 · ${new Date().toLocaleString("es-PA")}`
                    )
                  )
                  .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(THUMBNAIL)
                  )
              )

              .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
              )

              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `> ✅ Se alcanzaron los **${VOTOS_REQUERIDOS} votos** necesarios.\n` +
                  `> 🔑 **Código de acceso:** \`${CODIGO_SESION}\`\n` +
                  `> 🎉 El servidor queda **oficialmente abierto**.\n\n` +
                  `**📌 Indicaciones:**\n` +
                  `> • Mantener el rol serio y respetuoso\n` +
                  `> • Seguir las normas del servidor\n` +
                  `> • Acatar instrucciones del staff\n\n` +
                  `🔥 **¡El roleplay comienza ahora!**`
                )
              )

              .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
              )

              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `-# © Panamá RP V2 · Sesión abierta automáticamente por votación`
                )
              );

            await canal.send({ content: `<@&${ROL_PING}>`, allowedMentions: { roles: [ROL_PING] } });
            await canal.send({ flags: MessageFlags.IsComponentsV2, components: [aprobado] });

            await enviarLog(
              interaction.guild,
              `**🗳️ Sesión aprobada por votación**\n**📊 Votos:** ${votos.size}/${VOTOS_REQUERIDOS}\n**🔑 Código:** \`${CODIGO_SESION}\``,
              0x57F287
            );

          } else {

            const rechazada = new ContainerBuilder()
              .setAccentColor(0xED4245)

              .addSectionComponents(
                new SectionBuilder()
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                      `## 🔒 Votación Finalizada\n` +
                      `-# PANAMÁ RP V2 · ${new Date().toLocaleString("es-PA")}`
                    )
                  )
                  .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(THUMBNAIL)
                  )
              )

              .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
              )

              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `> ❌ No se alcanzaron los **${VOTOS_REQUERIDOS} votos** necesarios.\n` +
                  `> 📊 Votos obtenidos: **${votos.size}/${VOTOS_REQUERIDOS}**\n` +
                  `> 🚫 La sesión no fue aprobada esta vez.\n\n` +
                  `💙 **Gracias por participar en la votación.**`
                )
              )

              .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
              )

              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `-# © Panamá RP V2 · Votación finalizada`
                )
              );

            await canal.send({ flags: MessageFlags.IsComponentsV2, components: [rechazada] });

            await enviarLog(
              interaction.guild,
              `**🗳️ Votación finalizada sin aprobación**\n**📊 Votos obtenidos:** ${votos.size}/${VOTOS_REQUERIDOS}`,
              0xED4245
            );
          }
        });

        return i.update({
          flags: MessageFlags.IsComponentsV2,
          components: [
            new ContainerBuilder()
              .setAccentColor(0xF1C40F)
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `## 🗳️ Votación iniciada correctamente\n-# ${new Date().toLocaleString("es-PA")}`
                )
              )
          ]
        });
      }
    });
  }
};
