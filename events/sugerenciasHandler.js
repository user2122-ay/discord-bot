// ============================================================
//  sugerenciasHandler.js  —  Panamá RP V2
//  Maneja botones de votos, comentar, aceptar/rechazar
// ============================================================

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags
} = require("discord.js");

module.exports = (client) => {

  client.on("interactionCreate", async (interaction) => {

    // ── Importar datos del comando sugerencia ───────────────
    const sugCmd = client.commands.get("sugerencia");
    if (!sugCmd) return;

    const { votosUp, votosDown, sugerenciasData, buildSugerenciaContainer, buildBotones, CANAL_LOGS, ROL_STAFF } = sugCmd;

    // ════════════════════════════════════════════════════════
    //  BOTONES
    // ════════════════════════════════════════════════════════
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    const customId = interaction.customId;

    // ── VOTO 👍 ─────────────────────────────────────────────
    if (interaction.isButton() && customId.startsWith("sug_up_")) {
      const msgId  = customId.replace("sug_up_", "");
      const userId = interaction.user.id;

      if (!votosUp.has(msgId)) {
        return interaction.reply({ content: "❌ Esta sugerencia ya no está en memoria.", flags: MessageFlags.Ephemeral });
      }

      // Si ya votó 👍, quitar voto
      if (votosUp.get(msgId).has(userId)) {
        votosUp.get(msgId).delete(userId);
      } else {
        // Si había votado 👎, quitar ese voto primero
        if (votosDown.get(msgId)?.has(userId)) votosDown.get(msgId).delete(userId);
        votosUp.get(msgId).add(userId);
      }

      await actualizarMensaje(interaction, msgId, votosUp, votosDown, sugerenciasData, buildSugerenciaContainer, buildBotones);
    }

    // ── VOTO 👎 ─────────────────────────────────────────────
    else if (interaction.isButton() && customId.startsWith("sug_down_")) {
      const msgId  = customId.replace("sug_down_", "");
      const userId = interaction.user.id;

      if (!votosDown.has(msgId)) {
        return interaction.reply({ content: "❌ Esta sugerencia ya no está en memoria.", flags: MessageFlags.Ephemeral });
      }

      if (votosDown.get(msgId).has(userId)) {
        votosDown.get(msgId).delete(userId);
      } else {
        if (votosUp.get(msgId)?.has(userId)) votosUp.get(msgId).delete(userId);
        votosDown.get(msgId).add(userId);
      }

      await actualizarMensaje(interaction, msgId, votosUp, votosDown, sugerenciasData, buildSugerenciaContainer, buildBotones);
    }

    // ── COMENTAR (abre modal) ───────────────────────────────
    else if (interaction.isButton() && customId.startsWith("sug_comentar_")) {
      const msgId = customId.replace("sug_comentar_", "");

      const modal = new ModalBuilder()
        .setCustomId(`sug_comentar_modal_${msgId}`)
        .setTitle("💬 Comentar Sugerencia");

      const inputComentario = new TextInputBuilder()
        .setCustomId("comentario")
        .setLabel("Tu comentario")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Escribe tu comentario sobre esta sugerencia...")
        .setRequired(true)
        .setMaxLength(500);

      modal.addComponents(new ActionRowBuilder().addComponents(inputComentario));
      await interaction.showModal(modal);
    }

    // ── MODAL COMENTARIO (enviar al hilo) ───────────────────
    else if (interaction.isModalSubmit() && customId.startsWith("sug_comentar_modal_")) {
      const msgId      = customId.replace("sug_comentar_modal_", "");
      const comentario = interaction.fields.getTextInputValue("comentario");
      const usuario    = interaction.user;

      // Buscar el hilo del mensaje
      const mensaje = interaction.message ?? await interaction.channel?.messages.fetch(msgId).catch(() => null);
      const hilo    = interaction.channel?.threads?.cache.find(t => t.name.includes(usuario.guild?.name ?? "") || t.id === msgId)
                   ?? await buscarHilo(interaction.guild, msgId);

      if (hilo) {
        const containerComentario = new ContainerBuilder();
        containerComentario.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `💬 **${usuario.username}** comentó:\n${comentario}`
          )
        );
        containerComentario.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        containerComentario.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`-# Panamá RP V2 • Sistema de Sugerencias`)
        );

        await hilo.send({
          components: [containerComentario],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] }
        });
      }

      await interaction.reply({
        content: "✅ Tu comentario fue enviado al hilo de la sugerencia.",
        flags: MessageFlags.Ephemeral
      });
    }

    // ── ACEPTAR sugerencia ──────────────────────────────────
    else if (interaction.isButton() && customId.startsWith("sug_aceptar_")) {
      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({ content: "❌ No tienes permisos para hacer esto.", flags: MessageFlags.Ephemeral });
      }

      const msgId = customId.replace("sug_aceptar_", "");
      await resolverSugerencia(interaction, msgId, "aceptada", votosUp, votosDown, sugerenciasData, buildSugerenciaContainer, buildBotones, CANAL_LOGS, client);
    }

    // ── RECHAZAR sugerencia ─────────────────────────────────
    else if (interaction.isButton() && customId.startsWith("sug_rechazar_")) {
      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({ content: "❌ No tienes permisos para hacer esto.", flags: MessageFlags.Ephemeral });
      }

      const msgId = customId.replace("sug_rechazar_", "");
      await resolverSugerencia(interaction, msgId, "rechazada", votosUp, votosDown, sugerenciasData, buildSugerenciaContainer, buildBotones, CANAL_LOGS, client);
    }
  });
};

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════

async function actualizarMensaje(interaction, msgId, votosUp, votosDown, sugerenciasData, buildSugerenciaContainer, buildBotones) {
  const data     = sugerenciasData.get(msgId);
  const upCount  = votosUp.get(msgId)?.size  ?? 0;
  const downCount= votosDown.get(msgId)?.size ?? 0;

  // Obtener el usuario original
  const usuarioFalso = { username: data?.usuarioTag ?? "Desconocido", id: data?.usuarioId ?? "0" };

  const containerActualizado = buildSugerenciaContainer(usuarioFalso, data?.sugerencia ?? "—", upCount, downCount);
  const botonesActualizados  = buildBotones(msgId, upCount, downCount);

  await interaction.update({
    components: [containerActualizado, ...botonesActualizados],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] }
  });
}

async function resolverSugerencia(interaction, msgId, estado, votosUp, votosDown, sugerenciasData, buildSugerenciaContainer, buildBotones, CANAL_LOGS, client) {
  const data       = sugerenciasData.get(msgId);
  const upCount    = votosUp.get(msgId)?.size  ?? 0;
  const downCount  = votosDown.get(msgId)?.size ?? 0;
  const revisorTag = interaction.user.username;
  const usuarioFalso = { username: data?.usuarioTag ?? "Desconocido", id: data?.usuarioId ?? "0" };

  // Actualizar el mensaje: container con estado + botones deshabilitados
  const containerFinal = buildSugerenciaContainer(usuarioFalso, data?.sugerencia ?? "—", upCount, downCount, estado, revisorTag);
  const botonesFinal   = buildBotones(msgId, upCount, downCount, true); // cerrado = true

  await interaction.update({
    components: [containerFinal, ...botonesFinal],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] }
  });

  // ── DM al usuario ────────────────────────────────────────
  if (data?.usuarioId) {
    const usuarioDm = await client.users.fetch(data.usuarioId).catch(() => null);
    if (usuarioDm) {
      const emoji = estado === "aceptada" ? "✅" : "❌";

      const dmContainer = new ContainerBuilder();
      dmContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ${emoji} Tu sugerencia fue ${estado}`
        )
      );
      dmContainer.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      dmContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `📝 **Tu sugerencia:**\n${data.sugerencia}\n\n` +
          `📊 **Votos finales:** 👍 ${upCount}  •  👎 ${downCount}`
        )
      );
      dmContainer.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );
      dmContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# Panamá RP V2 • Revisado por ${revisorTag}`)
      );

      await usuarioDm.send({
        components: [dmContainer],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      }).catch(() => {});
    }
  }

  // ── Log en canal de logs ─────────────────────────────────
  const canalLogs = interaction.guild.channels.cache.get(CANAL_LOGS);
  if (canalLogs) {
    const emoji = estado === "aceptada" ? "✅" : "❌";

    const logContainer = new ContainerBuilder();
    logContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${emoji} Sugerencia ${estado}`)
    );
    logContainer.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    logContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `📝 **Sugerencia:**\n${data?.sugerencia ?? "—"}\n\n` +
        `👤 **Autor:** ${data?.usuarioTag ?? "Desconocido"} (\`${data?.usuarioId ?? "—"}\`)\n` +
        `🛡️ **Revisado por:** ${revisorTag} (\`${interaction.user.id}\`)\n` +
        `📊 **Votos finales:** 👍 ${upCount}  •  👎 ${downCount}`
      )
    );
    logContainer.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
    logContainer.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Panamá RP V2 • Sistema de Sugerencias`)
    );

    await canalLogs.send({
      components: [logContainer],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });
  }

  // Limpiar memoria
  votosUp.delete(msgId);
  votosDown.delete(msgId);
  sugerenciasData.delete(msgId);
}

async function buscarHilo(guild, msgId) {
  try {
    const canales = guild.channels.cache.filter(c => c.isTextBased());
    for (const [, canal] of canales) {
      if (canal.threads) {
        const hilos = await canal.threads.fetchActive();
        const hilo  = hilos.threads.find(t => t.id === msgId || t.name.includes("Sugerencia"));
        if (hilo) return hilo;
      }
    }
  } catch { }
  return null;
}
