// ============================================================
//  rolesHandler.js  —  Panamá RP V2
//  Maneja: modales de solicitar/retirar rol + botones aceptar/rechazar
// ============================================================

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require("discord.js");

// ─── CONFIGURACIÓN ──────────────────────────────────────────
const CANAL_SOLICITUDES = "1451018688965771305";
const CANAL_RETIROS     = "1451018690748219504";
const ROL_REVISOR       = "1451218164330401884"; // Único rol que puede aceptar/rechazar
// ────────────────────────────────────────────────────────────

module.exports = (client) => {

  client.on("interactionCreate", async (interaction) => {

    // ════════════════════════════════════════════════════════
    //  MODAL — /solicitar-rol
    // ════════════════════════════════════════════════════════
    if (interaction.isModalSubmit() && interaction.customId.startsWith("solicitar_modal_")) {
      const rolId  = interaction.customId.replace("solicitar_modal_", "");
      const razon  = interaction.fields.getTextInputValue("razon");
      const prueba = interaction.fields.getTextInputValue("pruebas");
      const member = interaction.member;
      const rol    = interaction.guild.roles.cache.get(rolId);

      if (!rol) return interaction.reply({ content: "❌ El rol ya no existe.", flags: MessageFlags.Ephemeral });

      const canal = interaction.guild.channels.cache.get(CANAL_SOLICITUDES);
      if (!canal) return interaction.reply({ content: "❌ Canal de solicitudes no encontrado.", flags: MessageFlags.Ephemeral });

      // ── Embed estilo Components V2 ──────────────────────
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setAuthor({
          name: `${member.user.username} solicita un rol`,
          iconURL: member.user.displayAvatarURL({ dynamic: true })
        })
        .setTitle("📋 Nueva Solicitud de Rol")
        .addFields(
          { name: "👤 Usuario", value: `${member} (${member.user.id})`, inline: true },
          { name: "🎭 Rol Solicitado", value: `${rol} (${rol.id})`, inline: true },
          { name: "\u200B", value: "\u200B", inline: false },
          { name: "📝 Razón", value: razon },
          { name: "🖼️ Pruebas", value: prueba }
        )
        .setFooter({ text: `Panamá RP V2 • Solicitudes de Rol` })
        .setTimestamp();

      // ── Botones Aceptar / Rechazar ──────────────────────
      const botones = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`rol_aceptar_${member.id}_${rolId}`)
          .setLabel("✅ Aceptar")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`rol_rechazar_${member.id}_${rolId}`)
          .setLabel("❌ Rechazar")
          .setStyle(ButtonStyle.Danger)
      );

      await canal.send({ embeds: [embed], components: [botones] });

      await interaction.reply({
        content: `✅ Tu solicitud para el rol **${rol.name}** fue enviada correctamente. Espera la revisión del Staff.`,
        flags: MessageFlags.Ephemeral
      });
    }

    // ════════════════════════════════════════════════════════
    //  MODAL — /retirar-rol
    // ════════════════════════════════════════════════════════
    if (interaction.isModalSubmit() && interaction.customId.startsWith("retirar_modal_")) {
      const rolId  = interaction.customId.replace("retirar_modal_", "");
      const razon  = interaction.fields.getTextInputValue("razon");
      const member = interaction.member;
      const rol    = interaction.guild.roles.cache.get(rolId);

      if (!rol) return interaction.reply({ content: "❌ El rol ya no existe.", flags: MessageFlags.Ephemeral });

      const canal = interaction.guild.channels.cache.get(CANAL_RETIROS);
      if (!canal) return interaction.reply({ content: "❌ Canal de retiros no encontrado.", flags: MessageFlags.Ephemeral });

      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setAuthor({
          name: `${member.user.username} solicita retiro de rol`,
          iconURL: member.user.displayAvatarURL({ dynamic: true })
        })
        .setTitle("🗑️ Solicitud de Retiro de Rol")
        .addFields(
          { name: "👤 Usuario", value: `${member} (${member.user.id})`, inline: true },
          { name: "🎭 Rol a Retirar", value: `${rol} (${rol.id})`, inline: true },
          { name: "\u200B", value: "\u200B", inline: false },
          { name: "📝 Razón", value: razon }
        )
        .setFooter({ text: `Panamá RP V2 • Retiros de Rol` })
        .setTimestamp();

      const botones = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`retiro_aceptar_${member.id}_${rolId}`)
          .setLabel("✅ Aceptar Retiro")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`retiro_rechazar_${member.id}_${rolId}`)
          .setLabel("❌ Rechazar")
          .setStyle(ButtonStyle.Danger)
      );

      await canal.send({ embeds: [embed], components: [botones] });

      await interaction.reply({
        content: `✅ Tu solicitud de retiro para el rol **${rol.name}** fue enviada. Espera la revisión del Staff.`,
        flags: MessageFlags.Ephemeral
      });
    }

    // ════════════════════════════════════════════════════════
    //  BOTONES — Aceptar / Rechazar SOLICITUD de rol
    // ════════════════════════════════════════════════════════
    if (interaction.isButton()) {
      const revisor = interaction.member;

      // ── Verificar que tenga el rol de revisor ───────────
      if (!revisor.roles.cache.has(ROL_REVISOR)) {
        return interaction.reply({
          content: "❌ No tienes permisos para usar este botón.",
          flags: MessageFlags.Ephemeral
        });
      }

      // ── ACEPTAR solicitud de rol ─────────────────────────
      if (interaction.customId.startsWith("rol_aceptar_")) {
        const [, , usuarioId, rolId] = interaction.customId.split("_");
        const miembro = await interaction.guild.members.fetch(usuarioId).catch(() => null);
        const rol     = interaction.guild.roles.cache.get(rolId);

        if (!miembro) return interaction.reply({ content: "❌ El usuario ya no está en el servidor.", flags: MessageFlags.Ephemeral });
        if (!rol)     return interaction.reply({ content: "❌ El rol ya no existe.", flags: MessageFlags.Ephemeral });

        await miembro.roles.add(rol);

        // Notificar al usuario por DM
        await miembro.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0x57F287)
              .setTitle("✅ Solicitud de Rol Aceptada")
              .setDescription(`Tu solicitud para el rol **${rol.name}** fue **aceptada** por el Staff de Panamá RP V2.`)
              .setTimestamp()
          ]
        }).catch(() => {}); // Si tiene DMs cerrados, ignorar

        // Editar el mensaje original para mostrar resultado
        const embedEditado = EmbedBuilder.from(interaction.message.embeds[0])
          .setColor(0x57F287)
          .setFooter({ text: `✅ Aceptado por ${revisor.user.username}` });

        await interaction.update({
          embeds: [embedEditado],
          components: [] // Quitar botones
        });
      }

      // ── RECHAZAR solicitud de rol ────────────────────────
      else if (interaction.customId.startsWith("rol_rechazar_")) {
        const [, , usuarioId, rolId] = interaction.customId.split("_");
        const miembro = await interaction.guild.members.fetch(usuarioId).catch(() => null);
        const rol     = interaction.guild.roles.cache.get(rolId);

        if (!miembro) return interaction.reply({ content: "❌ El usuario ya no está en el servidor.", flags: MessageFlags.Ephemeral });

        await miembro.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0xED4245)
              .setTitle("❌ Solicitud de Rol Rechazada")
              .setDescription(`Tu solicitud para el rol **${rol?.name ?? "desconocido"}** fue **rechazada** por el Staff de Panamá RP V2.`)
              .setTimestamp()
          ]
        }).catch(() => {});

        const embedEditado = EmbedBuilder.from(interaction.message.embeds[0])
          .setColor(0xED4245)
          .setFooter({ text: `❌ Rechazado por ${revisor.user.username}` });

        await interaction.update({
          embeds: [embedEditado],
          components: []
        });
      }

      // ── ACEPTAR retiro de rol ────────────────────────────
      else if (interaction.customId.startsWith("retiro_aceptar_")) {
        const [, , usuarioId, rolId] = interaction.customId.split("_");
        const miembro = await interaction.guild.members.fetch(usuarioId).catch(() => null);
        const rol     = interaction.guild.roles.cache.get(rolId);

        if (!miembro) return interaction.reply({ content: "❌ El usuario ya no está en el servidor.", flags: MessageFlags.Ephemeral });
        if (!rol)     return interaction.reply({ content: "❌ El rol ya no existe.", flags: MessageFlags.Ephemeral });

        await miembro.roles.remove(rol);

        await miembro.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0x57F287)
              .setTitle("✅ Retiro de Rol Aceptado")
              .setDescription(`Tu solicitud de retiro para el rol **${rol.name}** fue **aceptada** por el Staff de Panamá RP V2.`)
              .setTimestamp()
          ]
        }).catch(() => {});

        const embedEditado = EmbedBuilder.from(interaction.message.embeds[0])
          .setColor(0x57F287)
          .setFooter({ text: `✅ Retiro aceptado por ${revisor.user.username}` });

        await interaction.update({
          embeds: [embedEditado],
          components: []
        });
      }

      // ── RECHAZAR retiro de rol ───────────────────────────
      else if (interaction.customId.startsWith("retiro_rechazar_")) {
        const [, , usuarioId, rolId] = interaction.customId.split("_");
        const miembro = await interaction.guild.members.fetch(usuarioId).catch(() => null);
        const rol     = interaction.guild.roles.cache.get(rolId);

        if (!miembro) return interaction.reply({ content: "❌ El usuario ya no está en el servidor.", flags: MessageFlags.Ephemeral });

        await miembro.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0xED4245)
              .setTitle("❌ Retiro de Rol Rechazado")
              .setDescription(`Tu solicitud de retiro para el rol **${rol?.name ?? "desconocido"}** fue **rechazada** por el Staff de Panamá RP V2.`)
              .setTimestamp()
          ]
        }).catch(() => {});

        const embedEditado = EmbedBuilder.from(interaction.message.embeds[0])
          .setColor(0xED4245)
          .setFooter({ text: `❌ Retiro rechazado por ${revisor.user.username}` });

        await interaction.update({
          embeds: [embedEditado],
          components: []
        });
      }
    }
  });
};

