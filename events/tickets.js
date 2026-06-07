const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  StringSelectMenuBuilder,
  MessageFlags
} = require("discord.js");

const CATEGORIA_ID = "1459214153326657559";
const CANAL_PANEL  = "1451018705528946923";
const OWNER_ID     = "1237774088039170170";

const ticketsAbiertos   = new Map();
const ticketsReclamados = new Map();

const contadores = {
  soporte: 0, usuario: 0, staff: 0, alianza: 0, fundacion: 0
};

const ROLES_TICKET = {
  soporte:   ["1451018406537986168"],
  usuario:   ["1451018406537986168"],
  staff:     ["1451018321033036068"],
  alianza:   ["1451218087910309898"],
  fundacion: ["1497437860608081950"]
};

const COLORES_TIPO = {
  soporte:   0x5865F2,
  usuario:   0xe74c3c,
  staff:     0x95a5a6,
  alianza:   0x2ecc71,
  fundacion: 0xf1c40f
};

module.exports = (client) => {

  // ==============================
  // 📌 !panel
  // ==============================
  client.on("messageCreate", async (message) => {

    if (message.author.bot) return;
    if (message.content !== "!panel") return;
    if (message.author.id !== OWNER_ID)
      return message.reply("❌ No puedes usar este comando.");

    const canal = await client.channels.fetch(CANAL_PANEL).catch(() => null);
    if (!canal) return message.reply("❌ Canal no encontrado.");

    const mensajes = await canal.messages.fetch({ limit: 100 });
    await canal.bulkDelete(mensajes, true);

    const container = new ContainerBuilder()
      .setAccentColor(0x5865F2)

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 🎫 SISTEMA DE TICKETS\n` +
          `-# Bienvenido/a al Sistema Oficial de Atención y Soporte de **Panamá RP V2**.`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Seleccione **cuidadosamente** la categoría que mejor se ajuste a su situación.\n\n` +

          `<:soporte:1459210964867092492> **SOPORTE GENERAL**\n` +
          `> Para consultas generales, errores técnicos o problemas que no encajen en otras categorías.\n\n` +

          `<:admind:1459211042939732072> **REPORTAR USUARIO**\n` +
          `> Para reportar conductas inapropiadas. Debes aportar **pruebas válidas** (capturas, clips, nombre e implicado).\n\n` +

          `<:emoji_5:1459211125790085354> **REPORTAR STAFF**\n` +
          `> Para reportar acciones indebidas del personal. Tratado con **confidencialidad e imparcialidad**.\n\n` +

          `<a:emoji_6:1459211763752108106> **ALIANZA**\n` +
          `> Para representantes de otros servidores interesados en alianzas oficiales con **Panamá RP V2**.\n\n` +

          `<:owner:1459210903911141487> **SOPORTE FUNDACIÓN**\n` +
          `> Exclusivo para asuntos directos con los Owners: decisiones administrativas o temas institucionales.`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `> ⚠️ **Importante:** El uso indebido del sistema, información falsa o falta de respeto resultará en sanciones conforme a la normativa.`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(false)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# © Panamá RP V2 | Selecciona una opción en el menú de abajo`
        )
      );

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("📂 Selecciona una categoría...")
        .addOptions([
          { label: "Soporte General",   value: "soporte",   emoji: "🟦" },
          { label: "Reportar Usuario",  value: "usuario",   emoji: "🔴" },
          { label: "Reportar Staff",    value: "staff",     emoji: "⚪" },
          { label: "Alianza",           value: "alianza",   emoji: "🟢" },
          { label: "Soporte Fundación", value: "fundacion", emoji: "👑" }
        ])
    );

    await canal.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container, menu]
    });

    message.reply("✅ Panel enviado.");
  });

  // ==============================
  // 📌 CREAR TICKET
  // ==============================
  client.on("interactionCreate", async interaction => {

    if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {

      const user  = interaction.user;
      const guild = interaction.guild;
      const tipo  = interaction.values[0];

      if (ticketsAbiertos.has(user.id)) {
        return interaction.reply({
          content: "❌ Ya tienes un ticket abierto.",
          ephemeral: true
        });
      }

      contadores[tipo]++;
      const numero = String(contadores[tipo]).padStart(3, "0");
      const nombre = `${tipo}-${numero}`;
      const roles  = ROLES_TICKET[tipo];

      const canal = await guild.channels.create({
        name: nombre,
        type: ChannelType.GuildText,
        parent: CATEGORIA_ID,
        permissionOverwrites: [
          { id: guild.id, deny: ["ViewChannel"] },
          { id: user.id, allow: ["ViewChannel", "SendMessages"] },
          ...roles.map(r => ({ id: r, allow: ["ViewChannel", "SendMessages"] }))
        ]
      });

      ticketsAbiertos.set(user.id, canal.id);

      const pings = roles.map(r => `<@&${r}>`).join(" ");
      await canal.send(`${pings} <@${user.id}>`);

      const ticketContainer = new ContainerBuilder()
        .setAccentColor(COLORES_TIPO[tipo] || 0x5865F2)

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## 🎫 Ticket — ${nombre.toUpperCase()}\n` +
            `-# Abierto por <@${user.id}>`
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `Hola <@${user.id}>, bienvenido/a a tu ticket. 👋\n\n` +
            `Un miembro del staff estará contigo en breve.\n` +
            `Por favor **describe tu situación** con el mayor detalle posible.`
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(false)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# © Panamá RP V2 | Usa los botones para gestionar el ticket`
          )
        );

      const botones = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_reclamar")
          .setLabel("✋ Reclamar")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("ticket_cerrar")
          .setLabel("🔒 Cerrar")
          .setStyle(ButtonStyle.Danger)
      );

      await canal.send({
        flags: MessageFlags.IsComponentsV2,
        components: [ticketContainer, botones]
      });

      await interaction.reply({
        content: `✅ Ticket creado: ${canal}`,
        ephemeral: true
      });
    }

    // ==============================
    // 🔘 BOTONES
    // ==============================
    if (interaction.isButton()) {

      const canal = interaction.channel;

      // ✋ RECLAMAR
      if (interaction.customId === "ticket_reclamar") {

        if (ticketsReclamados.has(canal.id)) {
          return interaction.reply({
            content: "❌ Este ticket ya fue reclamado.",
            ephemeral: true
          });
        }

        const tipo = canal.name.split("-")[0];
        const rolesPermitidos = ROLES_TICKET[tipo] || [];
        const tieneRol = interaction.member.roles.cache.some(r =>
          rolesPermitidos.includes(r.id)
        );

        if (!tieneRol) {
          return interaction.reply({
            content: "❌ No tienes permiso para reclamar este ticket.",
            ephemeral: true
          });
        }

        ticketsReclamados.set(canal.id, interaction.user.id);

        const reclamadoContainer = new ContainerBuilder()
          .setAccentColor(0x2ecc71)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## ✋ Ticket reclamado\n` +
              `<@${interaction.user.id}> está atendiendo este ticket.\n` +
              `-# El staff ya fue notificado.`
            )
          );

        await canal.send({
          flags: MessageFlags.IsComponentsV2,
          components: [reclamadoContainer]
        });

        return interaction.reply({ content: "✅ Ticket reclamado.", ephemeral: true });
      }

      // 🔒 CERRAR
      if (interaction.customId === "ticket_cerrar") {

        const tipo = canal.name.split("-")[0];
        const rolesPermitidos = ROLES_TICKET[tipo] || [];
        const esStaff = interaction.member.roles.cache.some(r =>
          rolesPermitidos.includes(r.id)
        );

        if (!esStaff) {
          return interaction.reply({
            content: "❌ Solo el staff puede cerrar este ticket.",
            ephemeral: true
          });
        }

        for (const [userId, canalId] of ticketsAbiertos.entries()) {
          if (canalId === canal.id) { ticketsAbiertos.delete(userId); break; }
        }
        ticketsReclamados.delete(canal.id);

        await interaction.reply({ content: "🔒 Cerrando ticket...", ephemeral: true });

        // 📄 TRANSCRIPCIÓN PRO
        const messages = await canal.messages.fetch({ limit: 100 });
        const ordenados = [...messages.values()].reverse();
        const abiertoPor = ordenados.find(m => !m.author.bot)?.author.tag ?? "Desconocido";
        const fechaApertura = ordenados[0]
          ? new Date(ordenados[0].createdTimestamp).toLocaleString("es-PA")
          : "—";
        const fechaCierre = new Date().toLocaleString("es-PA");

        const filas = ordenados.map(msg => {
          const hora     = new Date(msg.createdTimestamp).toLocaleString("es-PA");
          const contenido = msg.content
            ? msg.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")
            : `<span class="sin-texto">— sin texto —</span>`;
          const adjuntos = [...msg.attachments.values()]
            .map(a => `<a class="adjunto" href="${a.url}" target="_blank">📎 ${a.name}</a>`)
            .join(" ");
          const embeds = msg.embeds.length
            ? `<span class="embed-badge">📦 ${msg.embeds.length} embed(s)</span>`
            : "";
          const claseAutor = msg.author.bot ? "autor bot" : "autor";
          const claseMensaje = msg.author.bot ? "msg bot" : "msg";

          return `
          <div class="${claseMensaje}">
            <img class="avatar" src="https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png?size=40" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
            <div class="contenido-wrap">
              <div class="meta">
                <span class="${claseAutor}">${msg.author.tag}</span>
                ${msg.author.bot ? '<span class="badge-bot">BOT</span>' : ""}
                <span class="hora">${hora}</span>
              </div>
              <div class="contenido">${contenido}</div>
              ${adjuntos ? `<div class="adjuntos">${adjuntos}</div>` : ""}
              ${embeds}
            </div>
          </div>`;
        }).join("");

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Transcript · ${canal.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #1e1f22; color: #dbdee1; padding: 0; }

    /* HEADER */
    .header { background: #111214; border-bottom: 3px solid #5865F2; padding: 24px 32px; display: flex; align-items: center; gap: 20px; }
    .header-icon { font-size: 36px; }
    .header-info h1 { font-size: 20px; color: #fff; font-weight: 700; }
    .header-info p  { font-size: 13px; color: #949ba4; margin-top: 4px; }

    /* STATS */
    .stats { display: flex; gap: 12px; padding: 16px 32px; background: #2b2d31; border-bottom: 1px solid #3d4045; flex-wrap: wrap; }
    .stat { background: #1e1f22; border-radius: 8px; padding: 10px 16px; flex: 1; min-width: 160px; }
    .stat-label { font-size: 11px; color: #949ba4; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-value { font-size: 14px; color: #fff; font-weight: 600; margin-top: 2px; }

    /* MENSAJES */
    .mensajes { padding: 24px 32px; max-width: 900px; margin: 0 auto; }
    .msg { display: flex; gap: 14px; margin-bottom: 16px; padding: 12px 16px; border-radius: 10px; background: #2b2d31; border-left: 3px solid #3d4045; transition: background 0.1s; }
    .msg:hover { background: #313338; }
    .msg.bot { border-left-color: #5865F2; }
    .avatar { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
    .contenido-wrap { flex: 1; min-width: 0; }
    .meta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }
    .autor { font-weight: 700; color: #dbdee1; font-size: 14px; }
    .autor.bot { color: #5865F2; }
    .badge-bot { background: #5865F2; color: #fff; font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 4px; letter-spacing: 0.3px; }
    .hora { font-size: 11px; color: #6d6f78; }
    .contenido { font-size: 14px; line-height: 1.6; color: #dbdee1; word-break: break-word; white-space: pre-wrap; }
    .sin-texto { color: #4e5058; font-style: italic; font-size: 13px; }
    .adjuntos { margin-top: 6px; }
    .adjunto { color: #00aff4; font-size: 13px; margin-right: 8px; text-decoration: none; }
    .adjunto:hover { text-decoration: underline; }
    .embed-badge { display: inline-block; background: #2b2d31; border: 1px solid #3d4045; color: #949ba4; font-size: 12px; padding: 2px 8px; border-radius: 4px; margin-top: 4px; }

    /* FOOTER */
    footer { text-align: center; padding: 24px; font-size: 12px; color: #4e5058; border-top: 1px solid #3d4045; margin-top: 16px; }
    footer span { color: #5865F2; }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-icon">🎫</div>
    <div class="header-info">
      <h1>Transcript · ${canal.name}</h1>
      <p>${interaction.guild.name}</p>
    </div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-label">Abierto por</div>
      <div class="stat-value">${abiertoPor}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Cerrado por</div>
      <div class="stat-value">${interaction.user.tag}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Apertura</div>
      <div class="stat-value">${fechaApertura}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Cierre</div>
      <div class="stat-value">${fechaCierre}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Mensajes</div>
      <div class="stat-value">${ordenados.length}</div>
    </div>
  </div>

  <div class="mensajes">
    ${filas}
  </div>

  <footer>
    © <span>Panamá RP V2</span> · Transcript generado automáticamente
  </footer>

</body>
</html>`;

        const logChannel = interaction.guild.channels.cache.get("1456786442071314442");

        if (logChannel) {
          const logContainer = new ContainerBuilder()
            .setAccentColor(0x5865F2)
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `## 📄 Transcript generado\n` +
                `**Ticket:** \`${canal.name}\`\n` +
                `**Abierto por:** ${abiertoPor}\n` +
                `**Cerrado por:** <@${interaction.user.id}>\n` +
                `**Mensajes:** ${ordenados.length}\n` +
                `**Cierre:** ${fechaCierre}`
              )
            )
            .addSeparatorComponents(
              new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
                .setDivider(false)
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `-# Abre el archivo HTML en tu navegador para ver la transcripción completa`
              )
            );

          await logChannel.send({
            flags: MessageFlags.IsComponentsV2,
            components: [logContainer],
            files: [{
              attachment: Buffer.from(html, "utf-8"),
              name: `transcript-${canal.name}.html`
            }]
          });
        }

        setTimeout(() => canal.delete().catch(() => {}), 3000);
      }
    }
  });
};
