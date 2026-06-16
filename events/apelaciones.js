// ============================================================
//  apelaciones.js  —  Panamá RP V2
//  Evento: maneja !panel apelar, tickets, botones, transcripción
// ============================================================

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionFlagsBits,
  MessageFlags
} = require("discord.js");

const Sancion = require("../models/Sancion");

// ── Configuración ───────────────────────────────────────────
const OWNER_ID        = "1237774088039170170";
const ROL_STAFF       = "1451018406537986168";
const CANAL_LOGS      = "1456786442071314442";

// ════════════════════════════════════════════════════════════
//  BUILDERS — Componentes V2
// ════════════════════════════════════════════════════════════

// Panel principal de bienvenida (enviado con !panel apelar)
function buildPanelBienvenida() {
  return new ContainerBuilder()
    .setAccentColor(0x5865F2)

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 📬 Sistema Oficial de Apelaciones\n` +
        `-# Panamá RP V2`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Bienvenido/a al **Sistema Oficial de Apelaciones de Sanciones** de **Panamá RP V2**.\n` +
        `Este panel ha sido habilitado para garantizar un proceso **ordenado, justo y transparente** para todos los miembros de la comunidad.\n\n` +
        `Antes de abrir una apelación, asegúrese de que cumple con los requisitos establecidos.\n` +
        `La apelación será evaluada por la **administración correspondiente** de manera **imparcial y objetiva**.`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**📌 Requisitos para apelar**\n\n` +
        `• Indicar claramente la sanción recibida.\n` +
        `• Especificar la fecha y el staff que la aplicó.\n` +
        `• Explicar el motivo de la apelación de forma respetuosa.\n` +
        `• Adjuntar pruebas válidas (si las posee).`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `> ⚠️ **Importante:**\n` +
        `> Las apelaciones falsas, incompletas o con faltas de respeto serán **rechazadas automáticamente**.\n` +
        `> Mientras el proceso esté en curso, la sanción **permanecerá vigente**.`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# Selecciona el tipo de apelación para comenzar.`)
    );
}

// Menú de selección de tipo de apelación
function buildMenuSeleccion() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("apelacion_tipo")
      .setPlaceholder("📂 Selecciona el tipo de apelación")
      .addOptions([
        {
          label: "Apelar Sanción",
          description: "Apela una sanción (SAN-XXXXXX)",
          value: "sancion",
          emoji: "🚨"
        },
        {
          label: "Apelar Advertencia / Strike",
          description: "Apela un strike (STK-XXXXXX)",
          value: "strike",
          emoji: "⚡"
        }
      ])
  );
}

// Panel dentro del ticket
function buildPanelTicket(usuario, tipo, idSancion, razon, accion) {
  const esSancion = tipo === "sancion";
  const color     = esSancion ? 0xe74c3c : 0xf1c40f;
  const titulo    = esSancion ? "🚨 Apelación de Sanción" : "⚡ Apelación de Strike";

  return new ContainerBuilder()
    .setAccentColor(color)

    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## ${titulo}\n` +
            `-# Panamá RP V2 • Apelaciones`
          )
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder().setURL(
            usuario.displayAvatarURL({ extension: "png", size: 256 })
          )
        )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**👤 Usuario:** ${usuario.username} (\`${usuario.id}\`)\n` +
        `**🔑 ID de ${esSancion ? "Sanción" : "Strike"}:** \`${idSancion}\`\n` +
        `**📝 Razón de apelación:**\n${razon}`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        accion
          ? `**📋 Estado:** ${accion}`
          : `**📋 Estado:** ⏳ En revisión por el Staff`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# ${new Date().toLocaleString("es-PA")}`
      )
    );
}

// Botones del ticket
function buildBotonesTicket(ticketId, cerrado = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`apel_reclamar_${ticketId}`)
      .setLabel("✋ Reclamar")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(cerrado),
    new ButtonBuilder()
      .setCustomId(`apel_aceptar_${ticketId}`)
      .setLabel("✅ Aceptar Apelación")
      .setStyle(ButtonStyle.Success)
      .setDisabled(cerrado),
    new ButtonBuilder()
      .setCustomId(`apel_rechazar_${ticketId}`)
      .setLabel("❌ Rechazar")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(cerrado),
    new ButtonBuilder()
      .setCustomId(`apel_cerrar_${ticketId}`)
      .setLabel("🔒 Cerrar Ticket")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(cerrado)
  );
}

// ════════════════════════════════════════════════════════════
//  TRANSCRIPCIÓN HTML
// ════════════════════════════════════════════════════════════
function generarHTML(canal, mensajes, metadatos) {
  const filas = mensajes.reverse().map(m => {
    const hora    = new Date(m.createdTimestamp).toLocaleString("es-PA");
    const avatar  = m.author.displayAvatarURL({ extension: "png", size: 64 });
    const esBot   = m.author.bot;
    const contenido = m.content || "(sin texto)";

    return `
    <div class="mensaje ${esBot ? "bot" : ""}">
      <img src="${avatar}" class="avatar" alt="avatar">
      <div class="contenido">
        <span class="autor ${esBot ? "bot-tag" : ""}">${m.author.username}${esBot ? " 🤖" : ""}</span>
        <span class="hora">${hora}</span>
        <p>${contenido.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>")}</p>
      </div>
    </div>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Transcripción — ${canal.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #1e1f22; color: #dcddde; font-family: "Segoe UI", sans-serif; padding: 20px; }
    .header { background: #2b2d31; border-left: 4px solid #5865F2; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px; }
    .header h1 { color: #fff; font-size: 1.3rem; }
    .header p  { color: #a0a0a0; font-size: 0.85rem; margin-top: 4px; }
    .meta { display: flex; gap: 16px; margin-top: 12px; flex-wrap: wrap; }
    .meta span { background: #313338; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; color: #b0b0b0; }
    .meta .resultado-aceptada { background: #1a4731; color: #57f287; }
    .meta .resultado-rechazada { background: #4a1515; color: #ed4245; }
    .mensajes { display: flex; flex-direction: column; gap: 2px; }
    .mensaje { display: flex; gap: 12px; padding: 6px 8px; border-radius: 4px; transition: background .1s; }
    .mensaje:hover { background: #2b2d31; }
    .mensaje.bot { background: #1e2030; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
    .contenido { flex: 1; }
    .autor { font-weight: 600; color: #fff; font-size: 0.9rem; }
    .autor.bot-tag { color: #5865F2; }
    .hora { font-size: 0.72rem; color: #72767d; margin-left: 8px; }
    p { margin-top: 2px; font-size: 0.88rem; line-height: 1.5; color: #dcddde; }
    .footer { margin-top: 24px; text-align: center; color: #555; font-size: 0.78rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Transcripción de Apelación</h1>
    <p>#${canal.name} — Panamá RP V2</p>
    <div class="meta">
      <span>👤 ${metadatos.usuario}</span>
      <span>🔑 ${metadatos.idSancion}</span>
      <span>📅 ${new Date().toLocaleString("es-PA")}</span>
      <span>🛡️ Revisado por: ${metadatos.revisor ?? "—"}</span>
      <span class="resultado-${metadatos.resultado ?? "pendiente"}">${
        metadatos.resultado === "aceptada" ? "✅ Apelación Aceptada" :
        metadatos.resultado === "rechazada" ? "❌ Apelación Rechazada" :
        "⏳ Sin resolución"
      }</span>
      ${metadatos.razonResolucion ? `<span>📝 ${metadatos.razonResolucion}</span>` : ""}
    </div>
  </div>
  <div class="mensajes">
    ${filas}
  </div>
  <div class="footer">Generado automáticamente por Panamá RP V2 • ${new Date().toLocaleString("es-PA")}</div>
</body>
</html>`;
}

// ════════════════════════════════════════════════════════════
//  REGISTRO DE TICKETS ACTIVOS
//  ticketId (channelId) -> { usuarioId, tipo, idSancion, razon, panelMsgId, reclamadoPor, resultado, razonResolucion, revisor }
// ════════════════════════════════════════════════════════════
const ticketsActivos = new Map();

// ════════════════════════════════════════════════════════════
//  EXPORTAR EVENTO
// ════════════════════════════════════════════════════════════
module.exports = (client) => {

  // ── !panel apelar ─────────────────────────────────────────
  client.on("messageCreate", async (message) => {
    if (message.author.id !== OWNER_ID) return;
    if (message.content.trim().toLowerCase() !== "!panel apelar") return;

    const panel = buildPanelBienvenida();
    const menu  = buildMenuSeleccion();

    await message.channel.send({
      components: [panel, menu],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });

    await message.delete().catch(() => {});
  });

  // ── Interacciones ─────────────────────────────────────────
  client.on("interactionCreate", async (interaction) => {

    // ══════════════════════════════════════════════════════
    //  MENÚ — elegir tipo de apelación
    // ══════════════════════════════════════════════════════
    if (interaction.isStringSelectMenu() && interaction.customId === "apelacion_tipo") {
      const tipo = interaction.values[0]; // "sancion" | "strike"

      const modal = new ModalBuilder()
        .setCustomId(`apelacion_modal_${tipo}`)
        .setTitle(tipo === "sancion" ? "🚨 Apelar Sanción" : "⚡ Apelar Strike");

      const idInput = new TextInputBuilder()
        .setCustomId("id_sancion")
        .setLabel(`ID de la ${tipo === "sancion" ? "Sanción" : "Advertencia"} (ej: ${tipo === "sancion" ? "SAN" : "STK"}-XXXXXX)`)
        .setStyle(TextInputStyle.Short)
        .setPlaceholder(tipo === "sancion" ? "SAN-AB1234" : "STK-AB1234")
        .setRequired(true);

      const razonInput = new TextInputBuilder()
        .setCustomId("razon")
        .setLabel("Razón de la apelación")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Explica por qué consideras que la sanción fue injusta...")
        .setRequired(true)
        .setMaxLength(800);

      modal.addComponents(
        new ActionRowBuilder().addComponents(idInput),
        new ActionRowBuilder().addComponents(razonInput)
      );

      await interaction.showModal(modal);
    }

    // ══════════════════════════════════════════════════════
    //  MODAL — crear ticket de apelación
    // ══════════════════════════════════════════════════════
    if (interaction.isModalSubmit() && interaction.customId.startsWith("apelacion_modal_")) {
      const tipo      = interaction.customId.replace("apelacion_modal_", "");
      const idSancion = interaction.fields.getTextInputValue("id_sancion").trim().toUpperCase();
      const razon     = interaction.fields.getTextInputValue("razon");
      const usuario   = interaction.user;
      const guild     = interaction.guild;

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // ── Verificar que el código existe y pertenece al usuario ──
      const busqueda = await Sancion.buscarPorCodigo(idSancion).catch(() => null);

      if (!busqueda) {
        return interaction.editReply({ content: `❌ No se encontró ninguna acción con el código \`${idSancion}\`.` });
      }

      const { registro, accion } = busqueda;

      if (registro.discord_id !== usuario.id) {
        return interaction.editReply({ content: "❌ Este código no pertenece a tu cuenta." });
      }

      const tipoEsperado = tipo === "sancion" ? "sancion" : "strike";
      if (accion.tipo !== tipoEsperado) {
        return interaction.editReply({ content: `❌ El código \`${idSancion}\` es de tipo **${accion.tipo}**, no de **${tipoEsperado}**.` });
      }

      // ── Crear canal de ticket ──────────────────────────
      const nombreCanal = tipo === "sancion"
        ? `apelación-sanción-${idSancion.toLowerCase()}`
        : `apelación-advertencia-${idSancion.toLowerCase()}`;

      const categoriaId = interaction.channel.parentId; // misma categoría

      const canal = await guild.channels.create({
        name: nombreCanal,
        type: ChannelType.GuildText,
        parent: categoriaId,
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: usuario.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
          },
          {
            id: ROL_STAFF,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages]
          }
        ]
      });

      // ── Panel del ticket ───────────────────────────────
      const miembro = await guild.members.fetch(usuario.id).catch(() => null);
      const panelContainer = buildPanelTicket(usuario, tipo, idSancion, razon, null);
      const botones        = buildBotonesTicket(canal.id);

      const panelMsg = await canal.send({
        components: [panelContainer, botones],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });

      // Info de la sanción original
      const infoContainer = new ContainerBuilder()
        .setAccentColor(0x2b2d31)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**📋 Información de la ${accion.tipo === "sancion" ? "Sanción" : "Strike"} original:**\n` +
            `• **Número:** ${accion.tipo === "sancion" ? `Sanción ${accion.numero}/6` : `Strike ${accion.numero}/3`}\n` +
            `• **Motivo original:** ${accion.motivo}\n` +
            `• **Aplicado por:** ${accion.staff_tag}\n` +
            `• **Fecha:** ${new Date(accion.fecha).toLocaleString("es-PA")}`
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`-# Panamá RP V2 • Datos extraídos del sistema de sanciones`)
        );

      await canal.send({
        components: [infoContainer],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });

      // Guardar en memoria
      ticketsActivos.set(canal.id, {
        usuarioId: usuario.id,
        usuarioTag: usuario.username,
        tipo,
        idSancion,
        razon,
        panelMsgId: panelMsg.id,
        accionData: accion,
        reclamadoPor: null,
        resultado: null,
        razonResolucion: null,
        revisor: null
      });

      await interaction.editReply({
        content: `✅ Tu ticket de apelación fue creado: ${canal}`
      });
    }

    // ══════════════════════════════════════════════════════
    //  BOTÓN — Reclamar ticket
    // ══════════════════════════════════════════════════════
    if (interaction.isButton() && interaction.customId.startsWith("apel_reclamar_")) {
      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({ content: "❌ Solo el Staff puede reclamar tickets.", flags: MessageFlags.Ephemeral });
      }

      const ticketId = interaction.customId.replace("apel_reclamar_", "");
      const data     = ticketsActivos.get(ticketId);
      if (!data) return interaction.reply({ content: "❌ Ticket no encontrado en memoria.", flags: MessageFlags.Ephemeral });

      data.reclamadoPor = interaction.user.username;
      data.revisor      = interaction.user.username;

      const avisoContainer = new ContainerBuilder()
        .setAccentColor(0x5865F2)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## ✋ Ticket Reclamado\n` +
            `**${interaction.user.username}** ha tomado este ticket y lo revisará en breve.`
          )
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`-# ${new Date().toLocaleString("es-PA")}`)
        );

      await interaction.reply({
        components: [avisoContainer],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });
    }

    // ══════════════════════════════════════════════════════
    //  BOTÓN — Aceptar apelación (pide razón con modal)
    // ══════════════════════════════════════════════════════
    if (interaction.isButton() && interaction.customId.startsWith("apel_aceptar_")) {
      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({ content: "❌ Sin permisos.", flags: MessageFlags.Ephemeral });
      }

      const ticketId = interaction.customId.replace("apel_aceptar_", "");

      const modal = new ModalBuilder()
        .setCustomId(`apel_aceptar_modal_${ticketId}`)
        .setTitle("✅ Aceptar Apelación");

      const razonInput = new TextInputBuilder()
        .setCustomId("razon")
        .setLabel("Razón de aceptación")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Explica por qué se acepta la apelación...")
        .setRequired(true)
        .setMaxLength(500);

      modal.addComponents(new ActionRowBuilder().addComponents(razonInput));
      await interaction.showModal(modal);
    }

    // ══════════════════════════════════════════════════════
    //  MODAL — confirmar aceptación
    // ══════════════════════════════════════════════════════
    if (interaction.isModalSubmit() && interaction.customId.startsWith("apel_aceptar_modal_")) {
      const ticketId = interaction.customId.replace("apel_aceptar_modal_", "");
      const razon    = interaction.fields.getTextInputValue("razon");
      const data     = ticketsActivos.get(ticketId);

      if (!data) return interaction.reply({ content: "❌ Ticket no encontrado.", flags: MessageFlags.Ephemeral });

      data.resultado       = "aceptada";
      data.razonResolucion = razon;
      data.revisor         = interaction.user.username;

      await interaction.deferReply();

      // Actualizar panel del ticket
      const panelActualizado = buildPanelTicket(
        { username: data.usuarioTag, id: data.usuarioId, displayAvatarURL: () => `https://cdn.discordapp.com/embed/avatars/0.png` },
        data.tipo, data.idSancion, data.razon,
        `✅ **Aceptada** por ${interaction.user.username}\n📝 ${razon}`
      );

      const canal = interaction.channel;
      const panelMsg = await canal.messages.fetch(data.panelMsgId).catch(() => null);
      if (panelMsg) {
        await panelMsg.edit({
          components: [panelActualizado, buildBotonesTicket(ticketId, true)],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] }
        });
      }

      // DM al usuario
      await enviarDmResolucion(client, data, "aceptada", razon, interaction.user.username);

      // Cerrar y transcribir
      await cerrarYTranscribir(interaction, canal, data, client);
    }

    // ══════════════════════════════════════════════════════
    //  BOTÓN — Rechazar apelación (pide razón con modal)
    // ══════════════════════════════════════════════════════
    if (interaction.isButton() && interaction.customId.startsWith("apel_rechazar_")) {
      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({ content: "❌ Sin permisos.", flags: MessageFlags.Ephemeral });
      }

      const ticketId = interaction.customId.replace("apel_rechazar_", "");

      const modal = new ModalBuilder()
        .setCustomId(`apel_rechazar_modal_${ticketId}`)
        .setTitle("❌ Rechazar Apelación");

      const razonInput = new TextInputBuilder()
        .setCustomId("razon")
        .setLabel("Razón del rechazo")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Explica por qué se rechaza la apelación...")
        .setRequired(true)
        .setMaxLength(500);

      modal.addComponents(new ActionRowBuilder().addComponents(razonInput));
      await interaction.showModal(modal);
    }

    // ══════════════════════════════════════════════════════
    //  MODAL — confirmar rechazo
    // ══════════════════════════════════════════════════════
    if (interaction.isModalSubmit() && interaction.customId.startsWith("apel_rechazar_modal_")) {
      const ticketId = interaction.customId.replace("apel_rechazar_modal_", "");
      const razon    = interaction.fields.getTextInputValue("razon");
      const data     = ticketsActivos.get(ticketId);

      if (!data) return interaction.reply({ content: "❌ Ticket no encontrado.", flags: MessageFlags.Ephemeral });

      data.resultado       = "rechazada";
      data.razonResolucion = razon;
      data.revisor         = interaction.user.username;

      await interaction.deferReply();

      const panelActualizado = buildPanelTicket(
        { username: data.usuarioTag, id: data.usuarioId, displayAvatarURL: () => `https://cdn.discordapp.com/embed/avatars/0.png` },
        data.tipo, data.idSancion, data.razon,
        `❌ **Rechazada** por ${interaction.user.username}\n📝 ${razon}`
      );

      const canal = interaction.channel;
      const panelMsg = await canal.messages.fetch(data.panelMsgId).catch(() => null);
      if (panelMsg) {
        await panelMsg.edit({
          components: [panelActualizado, buildBotonesTicket(ticketId, true)],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] }
        });
      }

      await enviarDmResolucion(client, data, "rechazada", razon, interaction.user.username);
      await cerrarYTranscribir(interaction, canal, data, client);
    }

    // ══════════════════════════════════════════════════════
    //  BOTÓN — Cerrar ticket (sin resolución)
    // ══════════════════════════════════════════════════════
    if (interaction.isButton() && interaction.customId.startsWith("apel_cerrar_")) {
      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({ content: "❌ Sin permisos.", flags: MessageFlags.Ephemeral });
      }

      const ticketId = interaction.customId.replace("apel_cerrar_", "");
      const data     = ticketsActivos.get(ticketId) ?? { resultado: null, razonResolucion: null, revisor: interaction.user.username };

      await interaction.deferReply();
      await cerrarYTranscribir(interaction, interaction.channel, data, client);
    }
  });
};

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════

async function enviarDmResolucion(client, data, resultado, razon, revisorTag) {
  try {
    const usuario = await client.users.fetch(data.usuarioId);
    const color   = resultado === "aceptada" ? 0x57F287 : 0xED4245;
    const emoji   = resultado === "aceptada" ? "✅" : "❌";

    const dmContainer = new ContainerBuilder()
      .setAccentColor(color)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ${emoji} Tu apelación fue ${resultado}\n` +
          `-# Panamá RP V2 • Apelaciones`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**🔑 ID apelado:** \`${data.idSancion}\`\n` +
          `**📝 Tu razón:** ${data.razon}\n\n` +
          `**📋 Decisión del Staff:**\n${razon}\n\n` +
          `**🛡️ Revisado por:** ${revisorTag}`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# ${new Date().toLocaleString("es-PA")}`)
      );

    await usuario.send({
      components: [dmContainer],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });
  } catch { /* DMs cerrados */ }
}

async function cerrarYTranscribir(interaction, canal, data, client) {
  // Recopilar mensajes
  let mensajes = [];
  let lastId;

  while (true) {
    const batch = await canal.messages.fetch({ limit: 100, before: lastId });
    if (batch.size === 0) break;
    mensajes.push(...batch.values());
    lastId = batch.last().id;
    if (batch.size < 100) break;
  }

  // Generar HTML
  const html = generarHTML(canal, mensajes, {
    usuario:         data.usuarioTag ?? "Desconocido",
    idSancion:       data.idSancion  ?? "—",
    revisor:         data.revisor    ?? "—",
    resultado:       data.resultado,
    razonResolucion: data.razonResolucion
  });

  const { Buffer } = require("buffer");
  const htmlBuffer = Buffer.from(html, "utf-8");

  // Enviar log al canal de logs
  const canalLogs = canal.guild.channels.cache.get(CANAL_LOGS);
  if (canalLogs) {
    const logContainer = new ContainerBuilder()
      .setAccentColor(data.resultado === "aceptada" ? 0x57F287 : data.resultado === "rechazada" ? 0xED4245 : 0x2b2d31)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 📋 Ticket de Apelación Cerrado\n` +
          `-# Panamá RP V2 • Logs`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**👤 Usuario:** ${data.usuarioTag ?? "—"} (\`${data.usuarioId ?? "—"}\`)\n` +
          `**🔑 ID apelado:** \`${data.idSancion ?? "—"}\`\n` +
          `**📋 Resultado:** ${
            data.resultado === "aceptada" ? "✅ Apelación Aceptada" :
            data.resultado === "rechazada" ? "❌ Apelación Rechazada" : "🔒 Cerrado sin resolución"
          }\n` +
          `**📝 Razón Staff:** ${data.razonResolucion ?? "—"}\n` +
          `**🛡️ Revisado por:** ${data.revisor ?? "—"}`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`-# ${new Date().toLocaleString("es-PA")}`)
      );

    await canalLogs.send({
      components: [logContainer],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] },
      files: [{
        attachment: htmlBuffer,
        name: `transcripcion-${canal.name}.html`
      }]
    });
  }

  // Responder y eliminar canal tras 5s
  const cierreContainer = new ContainerBuilder()
    .setAccentColor(0x2b2d31)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🔒 Ticket cerrándose...\n` +
        `Este canal será eliminado en **5 segundos**.\n` +
        `La transcripción fue enviada al canal de logs.`
      )
    );

  await interaction.editReply({
    components: [cierreContainer],
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] }
  });

  setTimeout(async () => {
    ticketsActivos.delete(canal.id);
    await canal.delete().catch(() => {});
  }, 5000);
}

