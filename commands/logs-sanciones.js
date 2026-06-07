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
// 🧱 Construir vista
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildContainer(user, registro, esStaff) {

  const sanciones = registro?.sanciones_acumuladas ?? 0;
  const strikes   = registro?.strikes_actuales ?? 0;
  const historial = registro?.historial ?? [];
  const baneado   = registro?.baneado ?? false;

  const barraStrikes   = ["🟡","🟡","🟡"].map((_, i) => i < strikes   ? "🟡" : "⬛").join(" ");
  const barraSanciones = Array.from({ length: 6 }, (_, i) => i < sanciones ? "🔴" : "⬛").join(" ");

  const ultimasAcciones = historial.slice(-5).reverse().map(h => {
    const fecha = new Date(h.fecha).toLocaleDateString("es-PA");
    const icono = h.tipo === "strike" ? "⚡" : "🚨";
    const nombre = h.tipo === "strike" ? `Strike ${h.numero}` : `Sanción ${h.numero}`;
    return `${icono} **${nombre}** — ${h.motivo} · \`${fecha}\` · por ${h.staff_tag}`;
  }).join("\n") || "Sin acciones registradas.";

  const color = baneado     ? 0x992d22
    : sanciones >= 4        ? 0xe74c3c
    : sanciones >= 2        ? 0xe67e22
    : strikes > 0           ? 0xf1c40f
    : 0x2ecc71;

  const container = new ContainerBuilder()
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

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**⚡ Strikes actuales:** ${barraStrikes} (${strikes}/3)\n` +
        `**🚨 Sanciones acumuladas:** ${barraSanciones} (${sanciones}/6)\n` +
        `**🚫 Estado:** ${baneado ? "Baneado permanentemente" : sanciones === 6 ? "⚠️ Límite máximo" : "✅ Activo"}`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**📜 Últimas acciones:**\n${ultimasAcciones}`
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

  return container;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔘 Botones staff
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildBotones(userId, registro) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`qs_${userId}`)   // quitar strike
      .setLabel("➖ Quitar Strike")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled((registro?.strikes_actuales ?? 0) === 0),

    new ButtonBuilder()
      .setCustomId(`qsan_${userId}`) // quitar sanción
      .setLabel("🗑️ Quitar Sanción")
      .setStyle(ButtonStyle.Danger)
      .setDisabled((registro?.sanciones_acumuladas ?? 0) === 0)
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📩 Log al canal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function enviarLog(guild, staffUser, targetUser, tipo, razon, registro) {
  const canal = guild.channels.cache.get(CANAL_LOGS);
  if (!canal) return;

  const container = new ContainerBuilder()
    .setAccentColor(0x3498db)

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🗑️ ${tipo === "strike" ? "Strike" : "Sanción"} removido\n` +
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

    if (userTarget.id !== interaction.user.id && !esStaff) {
      return interaction.editReply({
        content: "❌ Solo puedes ver tu propio expediente."
      });
    }

    const registro  = await Sancion.findOne({ discord_id: userTarget.id });
    const container = buildContainer(userTarget, registro, esStaff);
    const components = [container];

    if (esStaff) {
      components.push(buildBotones(userTarget.id, registro));
    }

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components
    });
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎯 EVENTOS — se llama desde index.cjs
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  registerEvents(client) {

    client.on(Events.InteractionCreate, async (interaction) => {

      // ━━━━━━━━━━━━━━━━━━━━
      // 🔘 BOTONES
      // ━━━━━━━━━━━━━━━━━━━━
      if (interaction.isButton()) {

        // ➖ Quitar Strike
        if (interaction.customId.startsWith("qs_")) {

          if (!interaction.member.roles.cache.has(ROL_STAFF)) {
            return interaction.reply({ content: "❌ Sin permisos.", ephemeral: true });
          }

          const userId = interaction.customId.replace("qs_", "");

          const modal = new ModalBuilder()
            .setCustomId(`mqs_${userId}`)
            .setTitle("➖ Quitar Strike");

          modal.addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("razon")
                .setLabel("Razón para quitar el strike")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            )
          );

          return interaction.showModal(modal);
        }

        // 🗑️ Quitar Sanción
        if (interaction.customId.startsWith("qsan_")) {

          if (!interaction.member.roles.cache.has(ROL_STAFF)) {
            return interaction.reply({ content: "❌ Sin permisos.", ephemeral: true });
          }

          const userId = interaction.customId.replace("qsan_", "");

          const modal = new ModalBuilder()
            .setCustomId(`mqsan_${userId}`)
            .setTitle("🗑️ Quitar Sanción");

          modal.addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("razon")
                .setLabel("Razón para quitar la sanción")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            )
          );

          return interaction.showModal(modal);
        }
      }

      // ━━━━━━━━━━━━━━━━━━━━
      // 📥 MODALES
      // ━━━━━━━━━━━━━━━━━━━━
      if (interaction.isModalSubmit()) {

        // ➖ MODAL QUITAR STRIKE
        if (interaction.customId.startsWith("mqs_")) {

          const userId = interaction.customId.replace("mqs_", "");
          const razon  = interaction.fields.getTextInputValue("razon");

          await interaction.deferUpdate();

          const registro = await Sancion.findOne({ discord_id: userId });

          if (!registro || registro.strikes_actuales === 0) {
            return interaction.followUp({
              content: "❌ Este usuario no tiene strikes registrados.",
              ephemeral: true
            });
          }

          const miembro  = await interaction.guild.members.fetch(userId).catch(() => null);
          const userObj  = miembro?.user ?? await interaction.client.users.fetch(userId).catch(() => null);
          const strikeAnterior = registro.strikes_actuales;

          // 🏷️ Quitar rol strike actual
          if (miembro) {
            await miembro.roles.remove(ROLES_STRIKE[strikeAnterior]).catch(() => {});
            // Poner rol anterior si existe
            if (strikeAnterior - 1 > 0) {
              await miembro.roles.add(ROLES_STRIKE[strikeAnterior - 1]).catch(() => {});
            }
          }

          registro.strikes_actuales = Math.max(0, strikeAnterior - 1);

          registro.historial.push({
            tipo:      "strike",
            numero:    registro.strikes_actuales,
            motivo:    `[REMOVIDO] ${razon}`,
            staff_id:  interaction.user.id,
            staff_tag: interaction.user.tag
          });

          await registro.save();

          // 📩 Log
          await enviarLog(interaction.guild, interaction.user, userObj, "strike", razon, registro);

          // 🔄 Actualizar mensaje
          const containerActualizado = buildContainer(userObj, registro, true);
          const botonesActualizados  = buildBotones(userId, registro);

          await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [containerActualizado, botonesActualizados]
          });

          await interaction.followUp({
            content: `✅ Strike removido a <@${userId}>. Strikes restantes: ${registro.strikes_actuales}/3`,
            ephemeral: true
          });
        }

        // 🗑️ MODAL QUITAR SANCIÓN
        if (interaction.customId.startsWith("mqsan_")) {

          const userId = interaction.customId.replace("mqsan_", "");
          const razon  = interaction.fields.getTextInputValue("razon");

          await interaction.deferUpdate();

          const registro = await Sancion.findOne({ discord_id: userId });

          if (!registro || registro.sanciones_acumuladas === 0) {
            return interaction.followUp({
              content: "❌ Este usuario no tiene sanciones registradas.",
              ephemeral: true
            });
          }

          const miembro  = await interaction.guild.members.fetch(userId).catch(() => null);
          const userObj  = miembro?.user ?? await interaction.client.users.fetch(userId).catch(() => null);
          const sancionAnterior = registro.sanciones_acumuladas;

          // 🏷️ Quitar rol sanción actual
          if (miembro) {
            await miembro.roles.remove(ROLES_SANCION[sancionAnterior]).catch(() => {});
            // Poner rol sanción anterior si existe
            if (sancionAnterior - 1 > 0) {
              await miembro.roles.add(ROLES_SANCION[sancionAnterior - 1]).catch(() => {});
            }
            // Quitar timeout
            await miembro.timeout(null).catch(() => {});
          }

          registro.sanciones_acumuladas = Math.max(0, sancionAnterior - 1);
          if (registro.baneado) registro.baneado = false;

          registro.historial.push({
            tipo:      "sancion",
            numero:    registro.sanciones_acumuladas,
            motivo:    `[REMOVIDA] ${razon}`,
            staff_id:  interaction.user.id,
            staff_tag: interaction.user.tag
          });

          await registro.save();

          // 📩 Log
          await enviarLog(interaction.guild, interaction.user, userObj, "sancion", razon, registro);

          // 🔄 Actualizar mensaje
          const containerActualizado = buildContainer(userObj, registro, true);
          const botonesActualizados  = buildBotones(userId, registro);

          await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [containerActualizado, botonesActualizados]
          });

          await interaction.followUp({
            content: `✅ Sanción removida a <@${userId}>. Sanciones restantes: ${registro.sanciones_acumuladas}/6`,
            ephemeral: true
          });
        }
      }
    });
  }
};
