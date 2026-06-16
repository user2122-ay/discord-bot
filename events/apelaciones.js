// ============================================================
//  apelaciones.js  —  Panamá RP V2
//  Fixes: reclamar bloquea a otros Staff | HTML separado del log
//         al aceptar se quita el strike/sanción en Discord + MongoDB
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

const { Buffer } = require("buffer");
const Sancion    = require("../models/Sancion");

// ── Configuración ────────────────────────────────────────────
const OWNER_ID   = "1237774088039170170";
const ROL_STAFF  = "1451018406537986168";
const CANAL_LOGS = "1456786442071314442";

// Roles de strike y sanción (para quitarlos al aceptar)
const ROLES_STRIKE = {
  1: "1451965207806214184",
  2: "1451965273732153550",
  3: "1451965331365957702"
};

const ROLES_SANCION = {
  1: "1451018428281258035",
  2: "1451018430135406725",
  3: "1451018431561338950",
  4: "1451018433012437044",
  5: "1451018441342451734",
  6: "1451018442529570906"
};

// ════════════════════════════════════════════════════════════
//  MEMORIA DE TICKETS
//  ticketId (channelId) -> {
//    usuarioId, usuarioTag, tipo, idSancion, razon,
//    panelMsgId, accionData, reclamadoPorId, reclamadoPorTag,
//    resultado, razonResolucion, revisor
//  }
// ════════════════════════════════════════════════════════════
const ticketsActivos = new Map();

// ════════════════════════════════════════════════════════════
//  BUILDERS
// ════════════════════════════════════════════════════════════

function buildPanelBienvenida() {
  return new ContainerBuilder()
    .setAccentColor(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 📬 Sistema Oficial de Apelaciones\n-# Panamá RP V2`
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

function buildMenuSeleccion() {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("apelacion_tipo")
      .setPlaceholder("📂 Selecciona el tipo de apelación")
      .addOptions([
        { label: "Apelar Sanción",             description: "Apela una sanción (SAN-XXXXXX)", value: "sancion", emoji: "🚨" },
        { label: "Apelar Advertencia / Strike", description: "Apela un strike (STK-XXXXXX)",  value: "strike",  emoji: "⚡" }
      ])
  );
}

function buildPanelTicket(usuario, tipo, idSancion, razon, estadoTexto, reclamadoPorTag) {
  const esSancion = tipo === "sancion";
  const color     = esSancion ? 0xe74c3c : 0xf1c40f;
  const titulo    = esSancion ? "🚨 Apelación de Sanción" : "⚡ Apelación de Strike";

  let estadoFinal = "⏳ En revisión por el Staff";
  if (reclamadoPorTag && !estadoTexto) estadoFinal = `✋ Reclamado por **${reclamadoPorTag}**`;
  if (estadoTexto) estadoFinal = estadoTexto;

  return new ContainerBuilder()
    .setAccentColor(color)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## ${titulo}\n-# Panamá RP V2 • Apelaciones`
          )
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder().setURL(
            usuario.displayAvatarURL
              ? usuario.displayAvatarURL({ extension: "png", size: 256 })
              : `https://cdn.discordapp.com/embed/avatars/0.png`
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
      new TextDisplayBuilder().setContent(`**📋 Estado:** ${estadoFinal}`)
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`-# ${new Date().toLocaleString("es-PA")}`)
    );
}

// BUG FIX 1: botón reclamar se deshabilita individualmente, no todo el panel
function buildBotonesTicket(ticketId, { cerrado = false, reclamado = false } = {}) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`apel_reclamar_${ticketId}`)
      .setLabel("✋ Reclamar")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(cerrado || reclamado), // se deshabilita al reclamar
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
//  HTML
// ════════════════════════════════════════════════════════════
function generarHTML(canal, mensajes, meta) {
  const filas = [...mensajes].reverse().map(m => {
    const hora     = new Date(m.createdTimestamp).toLocaleString("es-PA");
    const avatar   = m.author.displayAvatarURL({ extension: "png", size: 64 });
    const esBot    = m.author.bot;
    const contenido = (m.content || "(componente / sin texto)")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    return `
    <div class="msg${esBot ? " bot" : ""}">
      <img src="${avatar}" class="av">
      <div class="body">
        <span class="name${esBot ? " bot-name" : ""}">${m.author.username}${esBot ? " 🤖" : ""}</span>
        <span class="ts">${hora}</span>
        <p>${contenido}</p>
      </div>
    </div>`;
  }).join("\n");

  const colorResultado = meta.resultado === "aceptada" ? "#57f287" : meta.resultado === "rechazada" ? "#ed4245" : "#aaa";
  const textoResultado = meta.resultado === "aceptada" ? "✅ Aceptada" : meta.resultado === "rechazada" ? "❌ Rechazada" : "Sin resolución";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Transcripción · ${canal.name}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#1e1f22;color:#dcddde;font-family:"Segoe UI",sans-serif;padding:20px}
    .header{background:#2b2d31;border-left:4px solid #5865F2;padding:16px 20px;border-radius:8px;margin-bottom:20px}
    .header h1{color:#fff;font-size:1.2rem}
    .header p{color:#a0a0a0;font-size:.82rem;margin-top:4px}
    .tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
    .tag{background:#313338;padding:3px 12px;border-radius:20px;font-size:.78rem;color:#b0b0b0}
    .resultado{font-weight:700;color:${colorResultado};background:#1a1a1a}
    .msgs{display:flex;flex-direction:column;gap:1px}
    .msg{display:flex;gap:12px;padding:6px 8px;border-radius:4px}
    .msg:hover{background:#2b2d31}
    .msg.bot{background:#1e2030}
    .av{width:34px;height:34px;border-radius:50%;flex-shrink:0;margin-top:2px}
    .body{flex:1}
    .name{font-weight:600;color:#fff;font-size:.88rem}
    .bot-name{color:#5865F2}
    .ts{font-size:.7rem;color:#72767d;margin-left:8px}
    p{margin-top:2px;font-size:.86rem;line-height:1.5}
    .footer{margin-top:20px;text-align:center;color:#555;font-size:.75rem}
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Transcripción de Apelación</h1>
    <p>#${canal.name} · Panamá RP V2</p>
    <div class="tags">
      <span class="tag">👤 ${meta.usuario}</span>
      <span class="tag">🔑 ${meta.idSancion}</span>
      <span class="tag">🛡️ ${meta.revisor ?? "—"}</span>
      <span class="tag">📅 ${new Date().toLocaleString("es-PA")}</span>
      <span class="tag resultado">${textoResultado}</span>
      ${meta.razonResolucion ? `<span class="tag">📝 ${meta.razonResolucion}</span>` : ""}
    </div>
  </div>
  <div class="msgs">${filas}</div>
  <div class="footer">Generado automáticamente · Panamá RP V2 · ${new Date().toLocaleString("es-PA")}</div>
</body>
</html>`;
}

// ════════════════════════════════════════════════════════════
//  EXPORTAR
// ════════════════════════════════════════════════════════════
module.exports = (client) => {

  // ── !panel apelar ────────────────────────────────────────
  client.on("messageCreate", async (message) => {
    if (message.author.id !== OWNER_ID) return;
    if (message.content.trim().toLowerCase() !== "!panel apelar") return;

    await message.channel.send({
      components: [buildPanelBienvenida(), buildMenuSeleccion()],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });

    await message.delete().catch(() => {});
  });

  // ── Interacciones ────────────────────────────────────────
  client.on("interactionCreate", async (interaction) => {

    // ════════════════════════════════════════════════════════
    //  MENÚ — elegir tipo
    // ════════════════════════════════════════════════════════
    if (interaction.isStringSelectMenu() && interaction.customId === "apelacion_tipo") {
      const tipo = interaction.values[0];

      const modal = new ModalBuilder()
        .setCustomId(`apelacion_modal_${tipo}`)
        .setTitle(tipo === "sancion" ? "🚨 Apelar Sanción" : "⚡ Apelar Strike");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("id_sancion")
            .setLabel(`ID de la ${tipo === "sancion" ? "Sanción" : "Advertencia"}`)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(tipo === "sancion" ? "SAN-AB1234" : "STK-AB1234")
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("razon")
            .setLabel("Razón de la apelación")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Explica por qué consideras que fue injusta...")
            .setRequired(true)
            .setMaxLength(800)
        )
      );

      await interaction.showModal(modal);
    }

    // ════════════════════════════════════════════════════════
    //  MODAL — crear ticket
    // ════════════════════════════════════════════════════════
    if (interaction.isModalSubmit() && interaction.customId.startsWith("apelacion_modal_")) {
      const tipo      = interaction.customId.replace("apelacion_modal_", "");
      const idSancion = interaction.fields.getTextInputValue("id_sancion").trim().toUpperCase();
      const razon     = interaction.fields.getTextInputValue("razon");
      const usuario   = interaction.user;
      const guild     = interaction.guild;

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      // Verificar código en MongoDB
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

      if (accion.removido) {
        return interaction.editReply({ content: `❌ Esta acción ya fue removida anteriormente, no puede apelarse.` });
      }

      // Crear canal de ticket
      const nombreCanal = tipo === "sancion"
        ? `apelación-sanción-${idSancion.toLowerCase()}`
        : `apelación-advertencia-${idSancion.toLowerCase()}`;

      const canal = await guild.channels.create({
        name: nombreCanal,
        type: ChannelType.GuildText,
        parent: interaction.channel.parentId,
        permissionOverwrites: [
          { id: guild.roles.everyone,  deny: [PermissionFlagsBits.ViewChannel] },
          { id: usuario.id,            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
          { id: ROL_STAFF,             allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] }
        ]
      });

      // ── Ping primero ───────────────────────────────────
      await canal.send({
        content: `<@${usuario.id}> <@&${ROL_STAFF}>`,
        allowedMentions: { users: [usuario.id], roles: [ROL_STAFF] }
      });

      // ── Panel del ticket ───────────────────────────────
      const panelContainer = buildPanelTicket(usuario, tipo, idSancion, razon, null, null);
      const botones        = buildBotonesTicket(canal.id);

      const panelMsg = await canal.send({
        components: [panelContainer, botones],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });

      // ── Info de la sanción original ────────────────────
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
          new TextDisplayBuilder().setContent(`-# Panamá RP V2 • Datos del sistema de sanciones`)
        );

      await canal.send({
        components: [infoContainer],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });

      // Guardar en memoria
      ticketsActivos.set(canal.id, {
        usuarioId:       usuario.id,
        usuarioTag:      usuario.username,
        tipo,
        idSancion,
        razon,
        panelMsgId:      panelMsg.id,
        accionData:      accion,
        reclamadoPorId:  null,  // BUG FIX 1
        reclamadoPorTag: null,
        resultado:       null,
        razonResolucion: null,
        revisor:         null
      });

      await interaction.editReply({ content: `✅ Tu ticket fue creado: ${canal}` });
    }

    // ════════════════════════════════════════════════════════
    //  BOTÓN — Reclamar  (BUG FIX 1)
    // ════════════════════════════════════════════════════════
    if (interaction.isButton() && interaction.customId.startsWith("apel_reclamar_")) {
      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({ content: "❌ Solo el Staff puede reclamar tickets.", flags: MessageFlags.Ephemeral });
      }

      const ticketId = interaction.customId.replace("apel_reclamar_", "");
      const data     = ticketsActivos.get(ticketId);
      if (!data) return interaction.reply({ content: "❌ Ticket no encontrado.", flags: MessageFlags.Ephemeral });

      // Si ya fue reclamado, bloquear
      if (data.reclamadoPorId) {
        return interaction.reply({
          content: `❌ Este ticket ya fue reclamado por **${data.reclamadoPorTag}**.`,
          flags: MessageFlags.Ephemeral
        });
      }

      data.reclamadoPorId  = interaction.user.id;
      data.reclamadoPorTag = interaction.user.username;
      data.revisor         = interaction.user.username;

      // Actualizar panel con estado "Reclamado" y deshabilitar botón reclamar
      const usuarioFalso = { username: data.usuarioTag, id: data.usuarioId };
      const panelActualizado = buildPanelTicket(usuarioFalso, data.tipo, data.idSancion, data.razon, null, data.reclamadoPorTag);
      const botonesActualizados = buildBotonesTicket(ticketId, { reclamado: true });

      const panelMsg = await interaction.channel.messages.fetch(data.panelMsgId).catch(() => null);
      if (panelMsg) {
        await panelMsg.edit({
          components: [panelActualizado, botonesActualizados],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] }
        });
      }

      // Aviso en el canal
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

    // ════════════════════════════════════════════════════════
    //  BOTÓN — Aceptar (abre modal con razón)
    // ════════════════════════════════════════════════════════
    if (interaction.isButton() && interaction.customId.startsWith("apel_aceptar_")) {
      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({ content: "❌ Sin permisos.", flags: MessageFlags.Ephemeral });
      }

      const ticketId = interaction.customId.replace("apel_aceptar_", "");
      const data     = ticketsActivos.get(ticketId);
      if (!data) return interaction.reply({ content: "❌ Ticket no encontrado.", flags: MessageFlags.Ephemeral });

      // BUG FIX 1: solo quien reclamó puede resolver (o cualquier Staff si nadie reclamó)
      if (data.reclamadoPorId && data.reclamadoPorId !== interaction.user.id) {
        return interaction.reply({
          content: `❌ Este ticket fue reclamado por **${data.reclamadoPorTag}**. Solo él puede resolverlo.`,
          flags: MessageFlags.Ephemeral
        });
      }

      const modal = new ModalBuilder()
        .setCustomId(`apel_aceptar_modal_${ticketId}`)
        .setTitle("✅ Aceptar Apelación");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("razon")
            .setLabel("Razón de aceptación")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Explica por qué se acepta la apelación...")
            .setRequired(true)
            .setMaxLength(500)
        )
      );

      await interaction.showModal(modal);
    }

    // ════════════════════════════════════════════════════════
    //  MODAL — confirmar aceptación  (BUG FIX 3: quitar rol)
    // ════════════════════════════════════════════════════════
    if (interaction.isModalSubmit() && interaction.customId.startsWith("apel_aceptar_modal_")) {
      const ticketId = interaction.customId.replace("apel_aceptar_modal_", "");
      const razon    = interaction.fields.getTextInputValue("razon");
      const data     = ticketsActivos.get(ticketId);
      if (!data) return interaction.reply({ content: "❌ Ticket no encontrado.", flags: MessageFlags.Ephemeral });

      data.resultado       = "aceptada";
      data.razonResolucion = razon;
      data.revisor         = interaction.user.username;

      await interaction.deferReply();

      // ── BUG FIX 3: quitar strike o sanción ──────────────
      try {
        const guild    = interaction.guild;
        const miembro  = await guild.members.fetch(data.usuarioId).catch(() => null);
        const busqueda = await Sancion.buscarPorCodigo(data.idSancion).catch(() => null);

        if (busqueda && miembro) {
          const { registro, accion } = busqueda;

          if (data.tipo === "strike") {
            // Quitar rol del strike
            const rolStrike = ROLES_STRIKE[accion.numero];
            if (rolStrike) await miembro.roles.remove(rolStrike).catch(() => {});

            // Decrementar strikes en MongoDB
            if (registro.strikes_actuales > 0) registro.strikes_actuales--;

          } else {
            // Quitar rol de sanción
            const rolSancion = ROLES_SANCION[accion.numero];
            if (rolSancion) await miembro.roles.remove(rolSancion).catch(() => {});

            // Quitar timeout si está activo
            await miembro.timeout(null, `Apelación aceptada — ${razon}`).catch(() => {});

            // Decrementar sanciones en MongoDB
            if (registro.sanciones_acumuladas > 0) registro.sanciones_acumuladas--;
            if (accion.numero === 6) registro.baneado = false;
          }

          // Marcar acción como removida en MongoDB
          accion.removido          = true;
          accion.removido_por_id   = interaction.user.id;
          accion.removido_por_tag  = interaction.user.username;
          accion.removido_razon    = `Apelación aceptada — ${razon}`;
          accion.removido_fecha    = new Date();

          await registro.save();
        }
      } catch (err) {
        console.error("❌ Error al revertir sanción:", err);
      }

      // Actualizar panel
      const usuarioFalso = { username: data.usuarioTag, id: data.usuarioId };
      const panelActualizado = buildPanelTicket(
        usuarioFalso, data.tipo, data.idSancion, data.razon,
        `✅ **Aceptada** por ${interaction.user.username}\n📝 ${razon}`,
        null
      );

      const canal    = interaction.channel;
      const panelMsg = await canal.messages.fetch(data.panelMsgId).catch(() => null);
      if (panelMsg) {
        await panelMsg.edit({
          components: [panelActualizado, buildBotonesTicket(ticketId, { cerrado: true })],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] }
        });
      }

      await enviarDmResolucion(client, data, "aceptada", razon, interaction.user.username);
      await cerrarYTranscribir(interaction, canal, data);
    }

    // ════════════════════════════════════════════════════════
    //  BOTÓN — Rechazar (abre modal con razón)
    // ════════════════════════════════════════════════════════
    if (interaction.isButton() && interaction.customId.startsWith("apel_rechazar_")) {
      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({ content: "❌ Sin permisos.", flags: MessageFlags.Ephemeral });
      }

      const ticketId = interaction.customId.replace("apel_rechazar_", "");
      const data     = ticketsActivos.get(ticketId);
      if (!data) return interaction.reply({ content: "❌ Ticket no encontrado.", flags: MessageFlags.Ephemeral });

      // BUG FIX 1: solo quien reclamó puede resolver
      if (data.reclamadoPorId && data.reclamadoPorId !== interaction.user.id) {
        return interaction.reply({
          content: `❌ Este ticket fue reclamado por **${data.reclamadoPorTag}**. Solo él puede resolverlo.`,
          flags: MessageFlags.Ephemeral
        });
      }

      const modal = new ModalBuilder()
        .setCustomId(`apel_rechazar_modal_${ticketId}`)
        .setTitle("❌ Rechazar Apelación");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("razon")
            .setLabel("Razón del rechazo")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Explica por qué se rechaza la apelación...")
            .setRequired(true)
            .setMaxLength(500)
        )
      );

      await interaction.showModal(modal);
    }

    // ════════════════════════════════════════════════════════
    //  MODAL — confirmar rechazo
    // ════════════════════════════════════════════════════════
    if (interaction.isModalSubmit() && interaction.customId.startsWith("apel_rechazar_modal_")) {
      const ticketId = interaction.customId.replace("apel_rechazar_modal_", "");
      const razon    = interaction.fields.getTextInputValue("razon");
      const data     = ticketsActivos.get(ticketId);
      if (!data) return interaction.reply({ content: "❌ Ticket no encontrado.", flags: MessageFlags.Ephemeral });

      data.resultado       = "rechazada";
      data.razonResolucion = razon;
      data.revisor         = interaction.user.username;

      await interaction.deferReply();

      const usuarioFalso = { username: data.usuarioTag, id: data.usuarioId };
      const panelActualizado = buildPanelTicket(
        usuarioFalso, data.tipo, data.idSancion, data.razon,
        `❌ **Rechazada** por ${interaction.user.username}\n📝 ${razon}`,
        null
      );

      const canal    = interaction.channel;
      const panelMsg = await canal.messages.fetch(data.panelMsgId).catch(() => null);
      if (panelMsg) {
        await panelMsg.edit({
          components: [panelActualizado, buildBotonesTicket(ticketId, { cerrado: true })],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] }
        });
      }

      await enviarDmResolucion(client, data, "rechazada", razon, interaction.user.username);
      await cerrarYTranscribir(interaction, canal, data);
    }

    // ════════════════════════════════════════════════════════
    //  BOTÓN — Cerrar (sin resolución)
    // ════════════════════════════════════════════════════════
    if (interaction.isButton() && interaction.customId.startsWith("apel_cerrar_")) {
      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({ content: "❌ Sin permisos.", flags: MessageFlags.Ephemeral });
      }

      const ticketId = interaction.customId.replace("apel_cerrar_", "");
      const data     = ticketsActivos.get(ticketId) ?? {
        usuarioTag: "—", usuarioId: "—", idSancion: "—",
        resultado: null, razonResolucion: null, revisor: interaction.user.username
      };

      await interaction.deferReply();
      await cerrarYTranscribir(interaction, interaction.channel, data);
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
          `## ${emoji} Tu apelación fue ${resultado}\n-# Panamá RP V2 • Apelaciones`
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

async function cerrarYTranscribir(interaction, canal, data) {
  // Recopilar todos los mensajes del canal
  const mensajes = [];
  let lastId;

  while (true) {
    const batch = await canal.messages.fetch({ limit: 100, before: lastId });
    if (batch.size === 0) break;
    mensajes.push(...batch.values());
    lastId = batch.last().id;
    if (batch.size < 100) break;
  }

  // Generar HTML
  const html       = generarHTML(canal, mensajes, {
    usuario:         data.usuarioTag ?? "Desconocido",
    idSancion:       data.idSancion  ?? "—",
    revisor:         data.revisor    ?? "—",
    resultado:       data.resultado,
    razonResolucion: data.razonResolucion
  });
  const htmlBuffer = Buffer.from(html, "utf-8");

  // ── BUG FIX 2: enviar log y HTML en mensajes separados ──
  const canalLogs = canal.guild.channels.cache.get(CANAL_LOGS);
  if (canalLogs) {
    const logContainer = new ContainerBuilder()
      .setAccentColor(
        data.resultado === "aceptada"  ? 0x57F287 :
        data.resultado === "rechazada" ? 0xED4245 : 0x2b2d31
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 📋 Apelación Cerrada\n-# Panamá RP V2 • Logs`
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
            data.resultado === "aceptada"  ? "✅ Apelación Aceptada"  :
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

    // Primero el cajón (Components V2)
    await canalLogs.send({
      components: [logContainer],
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });

    // Luego el HTML como archivo adjunto (mensaje normal)
    await canalLogs.send({
      content: `📄 Transcripción del ticket \`${canal.name}\``,
      files: [{
        attachment: htmlBuffer,
        name: `transcripcion-${canal.name}.html`
      }],
      allowedMentions: { parse: [] }
    });
  }

  // Aviso de cierre
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
