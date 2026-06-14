// ============================================================
//  rolesHandler.js  —  Panamá RP V2
//  Components V2 reales: Container + TextDisplay + Separator
//  Sin pings a roles ni usuarios
// ============================================================

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder
} = require("discord.js");

const CANAL_SOLICITUDES = "1451018688965771305";
const CANAL_RETIROS     = "1451018690748219504";
const ROL_REVISOR       = "1451218164330401884";

// Función para construir el Container V2 de SOLICITUD
function buildSolicitudContainer(member, rol, razon, prueba, estado = null, revisorTag = null) {
  const container = new ContainerBuilder();

  // — Encabezado
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## 📋 Solicitud de Rol\n**Estado:** ${estado ? (estado === "aceptado" ? "✅ Aceptada" : "❌ Rechazada") : "⏳ Pendiente de revisión"}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // — Info del usuario y rol (sin ping)
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `👤 **Usuario:** ${member.user.username} (\`${member.user.id}\`)\n` +
      `🎭 **Rol solicitado:** ${rol.name} (\`${rol.id}\`)`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // — Razón
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`📝 **Razón:**\n${razon}`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // — Pruebas
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`🖼️ **Pruebas:**\n${prueba}`)
  );

  // — Si hay imagen directa de Discord, mostrar galería
  if (prueba.startsWith("https://cdn.discordapp.com") || prueba.startsWith("https://media.discordapp")) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(prueba)
      )
    );
  }

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // — Footer
  const footerText = revisorTag
    ? `Panamá RP V2 • ${estado === "aceptado" ? "Aceptado" : "Rechazado"} por ${revisorTag}`
    : `Panamá RP V2 • Solicitudes de Rol`;

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${footerText}`)
  );

  return container;
}

// Función para construir el Container V2 de RETIRO
function buildRetiroContainer(member, rol, razon, estado = null, revisorTag = null) {
  const container = new ContainerBuilder();

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## 🗑️ Solicitud de Retiro de Rol\n**Estado:** ${estado ? (estado === "aceptado" ? "✅ Aceptada" : "❌ Rechazada") : "⏳ Pendiente de revisión"}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `👤 **Usuario:** ${member.user.username} (\`${member.user.id}\`)\n` +
      `🎭 **Rol a retirar:** ${rol.name} (\`${rol.id}\`)`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`📝 **Razón:**\n${razon}`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const footerText = revisorTag
    ? `Panamá RP V2 • ${estado === "aceptado" ? "Aceptado" : "Rechazado"} por ${revisorTag}`
    : `Panamá RP V2 • Retiros de Rol`;

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${footerText}`)
  );

  return container;
}

// Botones Aceptar / Rechazar
function buildBotones(tipo, usuarioId, rolId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${tipo}_aceptar_${usuarioId}_${rolId}`)
      .setLabel("✅ Aceptar")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`${tipo}_rechazar_${usuarioId}_${rolId}`)
      .setLabel("❌ Rechazar")
      .setStyle(ButtonStyle.Danger)
  );
}

// DM al usuario (también con Components V2)
function buildDmContainer(rolNombre, accion, tipo) {
  const container = new ContainerBuilder();

  const esAceptado = accion === "aceptado";
  const emoji = esAceptado ? "✅" : "❌";
  const titulo = tipo === "solicitud"
    ? `${emoji} Solicitud de Rol ${esAceptado ? "Aceptada" : "Rechazada"}`
    : `${emoji} Retiro de Rol ${esAceptado ? "Aceptado" : "Rechazado"}`;

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${titulo}`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  const mensaje = tipo === "solicitud"
    ? (esAceptado
        ? `Tu solicitud para el rol **${rolNombre}** fue **aceptada** por el Staff de Panamá RP V2. ¡Ya tienes el rol!`
        : `Tu solicitud para el rol **${rolNombre}** fue **rechazada** por el Staff de Panamá RP V2.`)
    : (esAceptado
        ? `Tu solicitud de retiro para el rol **${rolNombre}** fue **aceptada**. El rol ha sido retirado.`
        : `Tu solicitud de retiro para el rol **${rolNombre}** fue **rechazada** por el Staff de Panamá RP V2.`);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(mensaje)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# Panamá RP V2 • Sistema de Roles`)
  );

  return container;
}

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {

    // ══════════════════════════════════════════════
    //  MODAL — /solicitar-rol
    // ══════════════════════════════════════════════
    if (interaction.isModalSubmit() && interaction.customId.startsWith("solicitar_modal_")) {
      const rolId  = interaction.customId.replace("solicitar_modal_", "");
      const razon  = interaction.fields.getTextInputValue("razon");
      const prueba = interaction.fields.getTextInputValue("pruebas");
      const member = interaction.member;
      const rol    = interaction.guild.roles.cache.get(rolId);

      if (!rol) return interaction.reply({ content: "❌ El rol ya no existe.", flags: MessageFlags.Ephemeral });

      const canal = interaction.guild.channels.cache.get(CANAL_SOLICITUDES);
      if (!canal) return interaction.reply({ content: "❌ Canal de solicitudes no encontrado.", flags: MessageFlags.Ephemeral });

      const container = buildSolicitudContainer(member, rol, razon, prueba);
      const botones   = buildBotones("rol", member.id, rolId);

      await canal.send({
        components: [container, botones],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] } // ← Sin pings
      });

      await interaction.reply({
        content: `✅ Tu solicitud para el rol **${rol.name}** fue enviada. Espera la revisión del Staff.`,
        flags: MessageFlags.Ephemeral
      });
    }

    // ══════════════════════════════════════════════
    //  MODAL — /retirar-rol
    // ══════════════════════════════════════════════
    if (interaction.isModalSubmit() && interaction.customId.startsWith("retirar_modal_")) {
      const rolId  = interaction.customId.replace("retirar_modal_", "");
      const razon  = interaction.fields.getTextInputValue("razon");
      const member = interaction.member;
      const rol    = interaction.guild.roles.cache.get(rolId);

      if (!rol) return interaction.reply({ content: "❌ El rol ya no existe.", flags: MessageFlags.Ephemeral });

      const canal = interaction.guild.channels.cache.get(CANAL_RETIROS);
      if (!canal) return interaction.reply({ content: "❌ Canal de retiros no encontrado.", flags: MessageFlags.Ephemeral });

      const container = buildRetiroContainer(member, rol, razon);
      const botones   = buildBotones("retiro", member.id, rolId);

      await canal.send({
        components: [container, botones],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] } // ← Sin pings
      });

      await interaction.reply({
        content: `✅ Tu solicitud de retiro para el rol **${rol.name}** fue enviada. Espera la revisión del Staff.`,
        flags: MessageFlags.Ephemeral
      });
    }

    // ══════════════════════════════════════════════
    //  BOTONES
    // ══════════════════════════════════════════════
    if (interaction.isButton()) {
      const customId = interaction.customId;

      // Solo manejar botones de este sistema
      const esNuestro = ["rol_aceptar_", "rol_rechazar_", "retiro_aceptar_", "retiro_rechazar_"]
        .some(p => customId.startsWith(p));
      if (!esNuestro) return;

      // Verificar rol revisor
      if (!interaction.member.roles.cache.has(ROL_REVISOR)) {
        return interaction.reply({
          content: "❌ No tienes permisos para usar este botón.",
          flags: MessageFlags.Ephemeral
        });
      }

      const partes    = customId.split("_");
      // formato: [tipo]_[accion]_[usuarioId]_[rolId]
      // ej: rol_aceptar_123456789_987654321
      //     retiro_rechazar_123456789_987654321
      const tipo      = partes[0];          // "rol" | "retiro"
      const accion    = partes[1];          // "aceptar" | "rechazar"
      const usuarioId = partes[2];
      const rolId     = partes[3];

      const miembro = await interaction.guild.members.fetch(usuarioId).catch(() => null);
      const rol     = interaction.guild.roles.cache.get(rolId);
      const revisorTag = interaction.user.username;

      if (!miembro) return interaction.reply({ content: "❌ El usuario ya no está en el servidor.", flags: MessageFlags.Ephemeral });

      // Aplicar acción
      try {
        if (tipo === "rol" && accion === "aceptar" && rol) {
          await miembro.roles.add(rol);
        } else if (tipo === "retiro" && accion === "aceptar" && rol) {
          await miembro.roles.remove(rol);
        }
      } catch (e) {
        return interaction.reply({ content: "❌ No pude modificar el rol. Verifica la jerarquía del bot.", flags: MessageFlags.Ephemeral });
      }

      // DM al usuario
      const dmContainer = buildDmContainer(rol?.name ?? "desconocido", accion, tipo === "rol" ? "solicitud" : "retiro");
      await miembro.send({
        components: [dmContainer],
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      }).catch(() => {});

      // Actualizar el mensaje con Container editado (sin botones)
      const originalComponents = interaction.message.components;
      // Reconstruir container con estado actualizado
      let containerActualizado;

      if (tipo === "rol") {
        // Extraer datos del container original del mensaje
        containerActualizado = new ContainerBuilder();
        containerActualizado.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## 📋 Solicitud de Rol\n**Estado:** ${accion === "aceptar" ? "✅ Aceptada" : "❌ Rechazada"}`
          )
        );
        containerActualizado.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        containerActualizado.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `👤 **Usuario:** ${miembro.user.username} (\`${miembro.user.id}\`)\n` +
            `🎭 **Rol:** ${rol?.name ?? "desconocido"} (\`${rolId}\`)`
          )
        );
        containerActualizado.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        containerActualizado.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`-# Panamá RP V2 • ${accion === "aceptar" ? "Aceptado" : "Rechazado"} por ${revisorTag}`)
        );
      } else {
        containerActualizado = new ContainerBuilder();
        containerActualizado.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## 🗑️ Solicitud de Retiro de Rol\n**Estado:** ${accion === "aceptar" ? "✅ Aceptada" : "❌ Rechazada"}`
          )
        );
        containerActualizado.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        containerActualizado.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `👤 **Usuario:** ${miembro.user.username} (\`${miembro.user.id}\`)\n` +
            `🎭 **Rol:** ${rol?.name ?? "desconocido"} (\`${rolId}\`)`
          )
        );
        containerActualizado.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        containerActualizado.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`-# Panamá RP V2 • ${accion === "aceptar" ? "Aceptado" : "Rechazado"} por ${revisorTag}`)
        );
      }

      await interaction.update({
        components: [containerActualizado], // Sin botones = resuelto
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });
    }
  });
};
