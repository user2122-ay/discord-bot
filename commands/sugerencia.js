// ============================================================
//  sugerencia.js  —  Panamá RP V2
//  Components V2 | Votos únicos | Hilo | Aceptar/Rechazar
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

// Mapa en memoria: sugerenciaMessageId -> Set de userIds que votaron
const votosUp   = new Map(); // messageId -> Set<userId>
const votosDown = new Map(); // messageId -> Set<userId>

// ── Construir container de sugerencia ──────────────────────
function buildSugerenciaContainer(usuario, sugerencia, upCount, downCount, estado = null, revisorTag = null) {
  const container = new ContainerBuilder();

  let estadoTexto = "⏳ En votación";
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
    new TextDisplayBuilder().setContent(
      `📝 **Sugerencia:**\n${sugerencia}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `👤 **Enviado por:** ${usuario.username} (\`${usuario.id}\`)\n` +
      `📊 **Votos:** 👍 ${upCount}  •  👎 ${downCount}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const footerTexto = revisorTag
    ? `Panamá RP V2 • ${estado === "aceptada" ? "Aceptada" : "Rechazada"} por ${revisorTag}`
    : `Panamá RP V2 • Sistema de Sugerencias`;

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${footerTexto}`)
  );

  return container;
}

// ── Botones de votación + comentar + aceptar/rechazar ──────
function buildBotones(msgId, upCount, downCount, cerrado = false) {
  const filaBotones = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`sug_up_${msgId}`)
      .setLabel(`👍 ${upCount}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(cerrado),
    new ButtonBuilder()
      .setCustomId(`sug_down_${msgId}`)
      .setLabel(`👎 ${downCount}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(cerrado),
    new ButtonBuilder()
      .setCustomId(`sug_comentar_${msgId}`)
      .setLabel("💬 Comentar")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(cerrado)
  );

  const filaStaff = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`sug_aceptar_${msgId}`)
      .setLabel("✅ Aceptar")
      .setStyle(ButtonStyle.Success)
      .setDisabled(cerrado),
    new ButtonBuilder()
      .setCustomId(`sug_rechazar_${msgId}`)
      .setLabel("❌ Rechazar")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(cerrado)
  );

  return [filaBotones, filaStaff];
}

// ── Guardar metadata de sugerencias ────────────────────────
// Map: messageId -> { usuarioId, usuarioTag, sugerencia }
const sugerenciasData = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sugerencia")
    .setDescription("Enviar una sugerencia para el servidor")
    .addStringOption(o =>
      o.setName("mensaje")
        .setDescription("Escribe tu sugerencia")
        .setRequired(true)
    ),

  permisos: "🌍 Todos",

  // Exportar datos y mapas para el handler
  votosUp,
  votosDown,
  sugerenciasData,
  buildSugerenciaContainer,
  buildBotones,
  CANAL_LOGS,
  ROL_STAFF,

  async execute(interaction) {
    const sugerencia = interaction.options.getString("mensaje");
    const usuario    = interaction.user;

    const canal = interaction.guild.channels.cache.get(CANAL_SUGERENCIAS);
    if (!canal) {
      return interaction.reply({ content: "❌ No se encontró el canal de sugerencias.", ephemeral: true });
    }

    const container = buildSugerenciaContainer(usuario, sugerencia, 0, 0);
    const botones   = buildBotones("temp", 0, 0);

    // Enviar mensaje
    const mensaje = await canal.send({
      components: [container, ...botones],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });

    // Guardar con el ID real del mensaje
    votosUp.set(mensaje.id,   new Set());
    votosDown.set(mensaje.id, new Set());
    sugerenciasData.set(mensaje.id, {
      usuarioId:  usuario.id,
      usuarioTag: usuario.username,
      sugerencia
    });

    // Actualizar botones con el ID real
    const containerFinal = buildSugerenciaContainer(usuario, sugerencia, 0, 0);
    const botonesFinal   = buildBotones(mensaje.id, 0, 0);

    await mensaje.edit({
      components: [containerFinal, ...botonesFinal],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });

    // Crear hilo automático
    await canal.threads.create({
      startMessage: mensaje,
      name: `💬 Sugerencia de ${usuario.username}`,
      autoArchiveDuration: 1440
    }).catch(() => {});

    await interaction.reply({
      content: "✅ Tu sugerencia fue enviada correctamente.",
      ephemeral: true
    });
  }
};
