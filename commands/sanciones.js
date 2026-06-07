const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
  Events
} = require("discord.js");

const Sancion = require("../models/Sancion");

const ROL_STAFF  = "1451018406537986168";
const CANAL_LOGS = "1451018714034995281";

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧱 Vista principal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildContainer(user, registro) {

  const sanciones = registro?.sanciones_acumuladas ?? 0;
  const strikes   = registro?.strikes_actuales     ?? 0;
  const acciones  = registro?.acciones             ?? [];
  const baneado   = registro?.baneado              ?? false;

  const barraStrikes   = Array.from({ length: 3 }, (_, i) => i < strikes   ? "🟡" : "⬛").join(" ");
  const barraSanciones = Array.from({ length: 6 }, (_, i) => i < sanciones ? "🔴" : "⬛").join(" ");

  // Strikes activos
  const strikesActivos = acciones
    .filter(a => a.tipo === "strike" && !a.removido)
    .map(a => {
      const fecha = new Date(a.fecha).toLocaleDateString("es-PA");
      return (
        `⚡ **Strike ${a.numero}** · \`${a.codigo}\`\n` +
        `> 📝 ${a.motivo}\n` +
        `> 🛡️ ${a.staff_tag} · 📅 ${fecha}`
      );
    }).join("\n\n") || "Sin strikes activos.";

  // Sanciones activas
  const sancionesActivas = acciones
    .filter(a => a.tipo === "sancion" && !a.removido)
    .map(a => {
      const fecha = new Date(a.fecha).toLocaleDateString("es-PA");
      return (
        `🚨 **Sanción ${a.numero}** · \`${a.codigo}\`\n` +
        `> 📝 ${a.motivo}\n` +
        `> ⏱️ ${a.duracion_timeout || "Ban permanente"} · 🛡️ ${a.staff_tag} · 📅 ${fecha}`
      );
    }).join("\n\n") || "Sin sanciones activas.";

  // Historial removidos (últimos 3)
  const removidos = acciones
    .filter(a => a.removido)
    .slice(-3)
    .reverse()
    .map(a => {
      const fecha = new Date(a.removido_fecha).toLocaleDateString("es-PA");
      const icono = a.tipo === "strike" ? "⚡" : "🚨";
      return (
        `${icono} **${a.tipo === "strike" ? `Strike ${a.numero}` : `Sanción ${a.numero}`}** · ~~\`${a.codigo}\`~~\n` +
        `> 📝 ${a.removido_razon} · 🛡️ ${a.removido_por_tag} · 📅 ${fecha}`
      );
    }).join("\n\n") || "Ninguno.";

  const color = baneado     ? 0x992d22
    : sanciones >= 4        ? 0xe74c3c
    : sanciones >= 2        ? 0xe67e22
    : strikes > 0           ? 0xf1c40f
    : 0x2ecc71;

  return new ContainerBuilder()
    .setAccentColor(color)

    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## 📋 Expediente Disciplinario\n` +
            `-# ${user.tag}`
          )
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder().setURL(
            user.displayAvatarURL({ extension: "png", size: 256 })
          )
        )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )

    // Resumen
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**⚡ Strikes:** ${barraStrikes} (${strikes}/3)\n` +
        `**🚨 Sanciones:** ${barraSanciones} (${sanciones}/6)\n` +
        `**🚫 Estado:** ${baneado ? "Baneado permanentemente" : sanciones === 6 ? "⚠️ Límite máximo" : "✅ Activo"}`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )

    // Strikes activos
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**⚡ Strikes activos:**\n${strikesActivos}`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )

    // Sanciones activas
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**🚨 Sanciones activas:**\n${sancionesActivas}`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )

    // Removidos
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**🗑️ Últimas acciones removidas:**\n${removidos}`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# © Panamá RP V2 · ${new Date().toLocaleString("es-PA")}`
      )
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📩 Log canal moderación
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function enviarLog(guild, staffUser, targetUser, accion, razon, registro) {

  const canal = guild.channels.cache.get(CANAL_LOGS);
  if (!canal) return;

  const container = new ContainerBuilder()
    .setAccentColor(0x3498db)

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🗑️ ${accion.tipo === "strike" ? "Strike" : "Sanción"} removido\n` +
        `-# Por ${staffUser.tag}`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**👤 Usuario:** <@${targetUser.id}> (${targetUser.tag ?? targetUser.id})\n` +
        `**🛡️ Staff:** <@${staffUser.id}> (${staffUser.tag})\n` +
        `**🔑 Código:** \`${accion.codigo}\`\n` +
        `**📝 Razón:** ${razon}\n` +
        `**⚡ Strikes restantes:** ${registro.strikes_actuales}/3\n` +
        `**🚨 Sanciones restantes:** ${registro.sanciones_acumuladas}/6`
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

  await canal.send({
    flags: MessageFlags.IsComponentsV2,
    components: [container]
  }).catch(() => {});
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 COMANDO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
module.exports = {
  permisos: "🌐 Todos",

  data: new SlashCommandBuilder()
    .setName("sanciones")
    .setDescription("Ver expediente disciplinario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario a consultar (por defecto tú mismo)")
        .setRequired(false)
    ),

  async execute(interaction) {

    await interaction.deferReply({ ephemeral: true });

    const esStaff    = interaction.member.roles.cache.has(ROL_STAFF);
    const userTarget = interaction.options.getUser("usuario") ?? interaction.user;

    // 🔒 Solo staff puede ver de otros
    if (userTarget.id !== interaction.user.id && !esStaff) {
      return interaction.editReply({
        content: "❌ Solo puedes ver tu propio expediente."
      });
    }

    const registro  = await Sancion.findOne({ discord_id: userTarget.id });
    const container = buildContainer(userTarget, registro);
    const components = [container];

    // Botones solo para staff
    if (esStaff) {
      components.push(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`qs_${userTarget.id}`)
            .setLabel("➖ Quitar Strike")
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId(`qsan_${userTarget.id}`)
            .setLabel("🗑️ Quitar Sanción")
            .setStyle(ButtonStyle.Danger)
        )
      );
    }

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components
    });
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 EVENTOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  registerEvents(client) {

    client.on(Events.InteractionCreate, async (interaction) => {

      // ━━━━━━━━━━━━━━━━━━━━
      // 🔘 BOTONES
      // ━━━━━━━━━━━━━━━━━━━━
      if (interaction.isButton()) {

        if (
          !interaction.customId.startsWith("qs_") &&
          !interaction.customId.startsWith("qsan_")
        ) return;

        if (!interaction.member.roles.cache.has(ROL_STAFF)) {
          return interaction.reply({ content: "❌ Sin permisos.", ephemeral: true });
        }

        const esStrike = interaction.customId.startsWith("qs_");
        const userId   = interaction.customId.replace(esStrike ? "qs_" : "qsan_", "");

        const modal = new ModalBuilder()
          .setCustomId(esStrike ? `mqs_${userId}` : `mqsan_${userId}`)
          .setTitle(esStrike ? "➖ Quitar Strike" : "🗑️ Quitar Sanción");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("codigo")
              .setLabel("Código de la acción")
              .setStyle(TextInputStyle.Short)
              .setPlaceholder(esStrike ? "STK-XXXXXX" : "SAN-XXXXXX")
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("razon")
              .setLabel("Razón para quitar")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );

        return interaction.showModal(modal);
      }

      // ━━━━━━━━━━━━━━━━━━━━
      // 📥 MODALES
      // ━━━━━━━━━━━━━━━━━━━━
      if (interaction.isModalSubmit()) {

        if (
          !interaction.customId.startsWith("mqs_") &&
          !interaction.customId.startsWith("mqsan_")
        ) return;

        const esStrike = interaction.customId.startsWith("mqs_");
        const userId   = interaction.customId.replace(esStrike ? "mqs_" : "mqsan_", "");
        const codigo   = interaction.fields.getTextInputValue("codigo").trim().toUpperCase();
        const razon    = interaction.fields.getTextInputValue("razon").trim();

        await interaction.deferUpdate();

        // 🔍 Buscar por código en la BD
        const resultado = await Sancion.buscarPorCodigo(codigo);

        // ❌ Código no existe
        if (!resultado) {
          return interaction.followUp({
            content: `❌ El código \`${codigo}\` no existe en la base de datos.`,
            ephemeral: true
          });
        }

        const { registro, accion } = resultado;

        // ❌ No pertenece al usuario
        if (registro.discord_id !== userId) {
          return interaction.followUp({
            content: `❌ El código \`${codigo}\` no pertenece a este usuario.`,
            ephemeral: true
          });
        }

        // ❌ Tipo incorrecto
        if (esStrike && accion.tipo !== "strike") {
          return interaction.followUp({
            content: `❌ El código \`${codigo}\` es de una sanción, no de un strike.`,
            ephemeral: true
          });
        }
        if (!esStrike && accion.tipo !== "sancion") {
          return interaction.followUp({
            content: `❌ El código \`${codigo}\` es de un strike, no de una sanción.`,
            ephemeral: true
          });
        }

        // ❌ Ya removido
        if (accion.removido) {
          return interaction.followUp({
            content: `❌ El código \`${codigo}\` ya fue removido anteriormente.`,
            ephemeral: true
          });
        }

        // ✅ Marcar como removido
        accion.removido         = true;
        accion.removido_por_id  = interaction.user.id;
        accion.removido_por_tag = interaction.user.tag;
        accion.removido_razon   = razon;
        accion.removido_fecha   = new Date();

        const miembro = await interaction.guild.members.fetch(userId).catch(() => null);
        const userObj = miembro?.user ?? await interaction.client.users.fetch(userId).catch(() => null);

        // ━━━━━━━━━━━━━━━━━━━━
        // ⚡ QUITAR STRIKE
        // ━━━━━━━━━━━━━━━━━━━━
        if (esStrike) {

          registro.strikes_actuales = Math.max(0, registro.strikes_actuales - 1);

          if (miembro) {
            // Quitar todos los roles de strike
            for (let i = 1; i <= 3; i++) {
              await miembro.roles.remove(ROLES_STRIKE[i]).catch(() => {});
            }
            // Poner el rol del strike actual si quedan
            if (registro.strikes_actuales > 0) {
              await miembro.roles.add(ROLES_STRIKE[registro.strikes_actuales]).catch(() => {});
            }
          }

        // ━━━━━━━━━━━━━━━━━━━━
        // 🗑️ QUITAR SANCIÓN
        // ━━━━━━━━━━━━━━━━━━━━
        } else {

          registro.sanciones_acumuladas = Math.max(0, registro.sanciones_acumuladas - 1);
          if (registro.baneado) registro.baneado = false;

          if (miembro) {
            // Quitar rol de sanción actual
            await miembro.roles.remove(ROLES_SANCION[accion.numero]).catch(() => {});
            // Poner rol de sanción anterior si existe
            if (registro.sanciones_acumuladas > 0) {
              await miembro.roles.add(ROLES_SANCION[registro.sanciones_acumuladas]).catch(() => {});
            }
            // Quitar timeout
            await miembro.timeout(null).catch(() => {});
          }
        }

        await registro.save();

        // 📩 Log
        await enviarLog(interaction.guild, interaction.user, userObj, accion, razon, registro);

        // 🔄 Actualizar vista
        const containerActualizado = buildContainer(userObj, registro);

        const botonesActualizados = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`qs_${userId}`)
            .setLabel("➖ Quitar Strike")
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId(`qsan_${userId}`)
            .setLabel("🗑️ Quitar Sanción")
            .setStyle(ButtonStyle.Danger)
        );

        await interaction.editReply({
          flags: MessageFlags.IsComponentsV2,
          components: [containerActualizado, botonesActualizados]
        });

        await interaction.followUp({
          content:
            `✅ ${esStrike ? "Strike" : "Sanción"} con código \`${codigo}\` removido correctamente.\n` +
            `**⚡ Strikes:** ${registro.strikes_actuales}/3 · **🚨 Sanciones:** ${registro.sanciones_acumuladas}/6`,
          ephemeral: true
        });
      }
    });
  }
};
