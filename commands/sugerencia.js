cat > /mnt/user-data/outputs/sugerencia.js << 'EOF'
// ============================================================
//  sugerencia.js  —  Panamá RP V2
//  Components V2: Container + botones de voto + hilo + aceptar/rechazar
//  Logs en canal + DM al usuario
// ============================================================

const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require("discord.js");

const CANAL_SUGERENCIAS = "1451018708502839346";
const CANAL_LOGS        = "1459256171129995427";
const ROL_STAFF         = "1497437860608081950";

// Mapa en memoria: messageId → { votos: { userId: "up"|"down" }, autorId }
// Para persistencia real deberías usar tu MongoDB/Postgres
const votosMap = new Map();

// ── Construir el container principal ──────────────────────────
function buildSugerenciaContainer(sugerencia, autorTag, autorId, avatarURL, up = 0, down = 0, estado = null, revisorTag = null) {
  const container = new ContainerBuilder();

  // Estado
  let estadoTexto = "⏳ En revisión";
  if (estado === "aceptada") estadoTexto = "✅ Aceptada";
  if (estado === "rechazada") estadoTexto = "❌ Rechazada";

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## 💡 Nueva Sugerencia\n**Estado:** ${estadoTexto}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(sugerencia)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `👤 **Autor:** ${autorTag} (\`${autorId}\`)\n` +
      `👍 **A favor:** ${up}　　👎 **En contra:** ${down}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const footer = revisorTag
    ? `Panamá RP V2 • Sugerencias • ${estado === "aceptada" ? "Aceptada" : "Rechazada"} por ${revisorTag}`
    : `Panamá RP V2 • Sugerencias`;

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${footer}`)
  );

  return container;
}

// ── Botones de votación + hilo + staff ───────────────────────
function buildBotones(msgId, up = 0, down = 0, resuelta = false) {
  const fila1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`sug_up_${msgId}`)
      .setLabel(`👍  ${up}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(resuelta),
    new ButtonBuilder()
      .setCustomId(`sug_down_${msgId}`)
      .setLabel(`👎  ${down}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(resuelta),
    new ButtonBuilder()
      .setCustomId(`sug_comentar_${msgId}`)
      .setLabel("💬 Comentar")
      .setStyle(ButtonStyle.Primary)
  );

  const fila2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`sug_aceptar_${msgId}`)
      .setLabel("✅ Aceptar")
      .setStyle(ButtonStyle.Success)
      .setDisabled(resuelta),
    new ButtonBuilder()
      .setCustomId(`sug_rechazar_${msgId}`)
      .setLabel("❌ Rechazar")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(resuelta)
  );

  return [fila1, fila2];
}

// ── DM al autor ───────────────────────────────────────────────
function buildDmContainer(sugerencia, estado, revisorTag) {
  const container = new ContainerBuilder();
  const emoji = estado === "aceptada" ? "✅" : "❌";

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## ${emoji} Tu sugerencia fue ${estado === "aceptada" ? "aceptada" : "rechazada"}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**Tu sugerencia:**\n${sugerencia}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `Revisada por **${revisorTag}** del Staff de Panamá RP V2.`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# Panamá RP V2 • Sistema de Sugerencias`)
  );

  return container;
}

// ── Log en canal ──────────────────────────────────────────────
function buildLogContainer(sugerencia, autorTag, autorId, estado, revisorTag, up, down) {
  const container = new ContainerBuilder();
  const emoji = estado === "aceptada" ? "✅" : "❌";

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## ${emoji} Sugerencia ${estado === "aceptada" ? "Aceptada" : "Rechazada"}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `📝 **Sugerencia:**\n${sugerencia}\n\n` +
      `👤 **Autor:** ${autorTag} (\`${autorId}\`)\n` +
      `👮 **Revisada por:** ${revisorTag}\n` +
      `👍 **A favor:** ${up}　　👎 **En contra:** ${down}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# Panamá RP V2 • Logs de Sugerencias`)
  );

  return container;
}

// ════════════════════════════════════════════════════════════
//  COMANDO
// ════════════════════════════════════════════════════════════
const command = {
  data: new SlashCommandBuilder()
    .setName("sugerencia")
    .setDescription("Enviar una sugerencia para el servidor")
    .addStringOption(o =>
      o.setName("mensaje")
        .setDescription("Escribe tu sugerencia")
        .setRequired(true)
    ),

  async execute(interaction) {
    const sugerencia = interaction.options.getString("mensaje");
    const member     = interaction.member;

    const canal = interaction.guild.channels.cache.get(CANAL_SUGERENCIAS);
    if (!canal) {
      return interaction.reply({ content: "❌ Canal de sugerencias no encontrado.", flags: MessageFlags.Ephemeral });
    }

    // Enviar placeholder para obtener el messageId primero
    const msg = await canal.send({
      components: [
        buildSugerenciaContainer(sugerencia, member.user.username, member.user.id, member.user.displayAvatarURL(), 0, 0),
        ...buildBotones("pending", 0, 0)
      ],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });

    // Guardar datos en el mapa con el ID real del mensaje
    votosMap.set(msg.id, {
      autorId: member.user.id,
      autorTag: member.user.username,
      sugerencia,
      up: 0,
      down: 0,
      votos: {},      // userId → "up" | "down"
      resuelta: false
    });

    // Editar para poner el ID real en los customIds de los botones
    await msg.edit({
      components: [
        buildSugerenciaContainer(sugerencia, member.user.username, member.user.id, member.user.displayAvatarURL(), 0, 0),
        ...buildBotones(msg.id, 0, 0)
      ],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });

    // Crear hilo automáticamente
    await canal.threads.create({
      startMessage: msg,
      name: `💬 Sugerencia de ${member.user.username}`,
      autoArchiveDuration: 1440
    }).catch(() => {});

    await interaction.reply({
      content: "✅ Tu sugerencia fue enviada correctamente.",
      flags: MessageFlags.Ephemeral
    });
  }
};

// ════════════════════════════════════════════════════════════
//  EVENTOS (botones)
// ════════════════════════════════════════════════════════════
function registerEvents(client) {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    const id = interaction.customId;
    const esNuestro = ["sug_up_", "sug_down_", "sug_comentar_", "sug_aceptar_", "sug_rechazar_"]
      .some(p => id.startsWith(p));
    if (!esNuestro) return;

    const [, accion, ...resto] = id.split("_");
    const msgId = resto.join("_");
    const datos  = votosMap.get(msgId);

    if (!datos) {
      return interaction.reply({ content: "❌ No encontré los datos de esta sugerencia (el bot fue reiniciado). Los votos se perdieron.", flags: MessageFlags.Ephemeral });
    }

    // ── Comentar (hilo) ──────────────────────────────────
    if (accion === "comentar") {
      const hilo = interaction.channel.threads?.cache.find(t => t.name.includes("Sugerencia") && t.id === msgId)
        ?? interaction.message.thread;

      if (!hilo) {
        return interaction.reply({ content: "❌ No se encontró el hilo. Escribe tu comentario directamente en el hilo de esta sugerencia.", flags: MessageFlags.Ephemeral });
      }

      return interaction.reply({
        content: `💬 Ve al hilo para comentar: ${hilo}`,
        flags: MessageFlags.Ephemeral,
        allowedMentions: { parse: [] }
      });
    }

    // ── Aceptar / Rechazar (solo staff) ──────────────────
    if (accion === "aceptar" || accion === "rechazar") {
      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({ content: "❌ No tienes permisos para hacer esto.", flags: MessageFlags.Ephemeral });
      }

      if (datos.resuelta) {
        return interaction.reply({ content: "⚠️ Esta sugerencia ya fue resuelta.", flags: MessageFlags.Ephemeral });
      }

      datos.resuelta = true;
      const estado      = accion === "aceptar" ? "aceptada" : "rechazada";
      const revisorTag  = interaction.user.username;

      // Editar mensaje original
      await interaction.update({
        components: [
          buildSugerenciaContainer(datos.sugerencia, datos.autorTag, datos.autorId, null, datos.up, datos.down, estado, revisorTag),
          ...buildBotones(msgId, datos.up, datos.down, true)
        ],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });

      // DM al autor
      const autor = await interaction.guild.members.fetch(datos.autorId).catch(() => null);
      if (autor) {
        await autor.send({
          components: [buildDmContainer(datos.sugerencia, estado, revisorTag)],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] }
        }).catch(() => {});
      }

      // Log
      const canalLogs = interaction.guild.channels.cache.get(CANAL_LOGS);
      if (canalLogs) {
        await canalLogs.send({
          components: [buildLogContainer(datos.sugerencia, datos.autorTag, datos.autorId, estado, revisorTag, datos.up, datos.down)],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] }
        });
      }

      return;
    }

    // ── Votar 👍 / 👎 ────────────────────────────────────
    if (accion === "up" || accion === "down") {
      if (datos.resuelta) {
        return interaction.reply({ content: "⚠️ Esta sugerencia ya fue resuelta, no puedes votar.", flags: MessageFlags.Ephemeral });
      }

      const userId     = interaction.user.id;
      const votoActual = datos.votos[userId];

      if (votoActual === accion) {
        // Quitar voto (toggle)
        delete datos.votos[userId];
        datos[accion]--;
      } else {
        // Cambiar voto o votar nuevo
        if (votoActual) datos[votoActual]--;
        datos.votos[userId] = accion;
        datos[accion]++;
      }

      await interaction.update({
        components: [
          buildSugerenciaContainer(datos.sugerencia, datos.autorTag, datos.autorId, null, datos.up, datos.down),
          ...buildBotones(msgId, datos.up, datos.down)
        ],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });
    }
  });
}

module.exports = command;
module.exports.registerEvents = registerEvents;
EOF
echo "✅ sugerencia.js listo"
