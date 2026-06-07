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

const ROL_STAFF       = "1451018406537986168";
const CANAL_LOGS      = "1451018714034995281";

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
// 🧱 Construir vista de sanciones
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildContainer(user, registro, esStaff) {

  const sanciones = registro?.sanciones_acumuladas ?? 0;
  const strikes   = registro?.strikes_actuales ?? 0;
  const historial = registro?.historial ?? [];
  const baneado   = registro?.baneado ?? false;

  // Barra visual de strikes
  const barraStrikes = ["🟡","🟡","🟡"].map((s, i) =>
    i < strikes ? "🟡" : "⬛"
  ).join(" ");

  // Barra visual de sanciones
  const barraSanciones = Array.from({ length: 6 }, (_, i) =>
    i < sanciones ? "🔴" : "⬛"
  ).join(" ");

  // Últimas 5 acciones del historial
  const ultimasAcciones = historial.slice(-5).reverse().map(h => {
    const fecha = new Date(h.fecha).toLocaleDateString("es-PA");
    const icono = h.tipo === "strike" ? "⚡" : h.tipo === "ban" ? "🚫" : "🚨";
    return `${icono} **${h.tipo === "strike" ? `Strike ${h.numero}` : `Sanción ${h.numero}`}** — ${h.motivo} · \`${fecha}\``;
  }).join("\n") || "Sin acciones registradas.";

  const color = baneado ? 0x992d22
    : sanciones >= 4   ? 0xe74c3c
    : sanciones >= 2   ? 0xe67e22
    : strikes > 0      ? 0xf1c40f
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
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**⚡ Strikes actuales:** ${barraStrikes} (${strikes}/3)\n` +
        `**🚨 Sanciones acumuladas:** ${barraSanciones} (${sanciones}/6)\n` +
        `**🚫 Estado:** ${baneado ? "Baneado permanentemente" : sanciones === 6 ? "⚠️ Límite máximo alcanzado" : "✅ Activo"}`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**📜 Últimas acciones:**\n${ultimasAcciones}`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(false)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# © Panamá RP V2 · ${new Date().toLocaleString("es-PA")}`
      )
    );

  return container;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 COMANDO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
module.exports = {
  permisos: "🌐 Todos",

  data: new SlashCommandBuilder()
    .setName("sanciones")
    .setDescription("Ver expediente disciplinario de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario a consultar (opcional, por defecto tú mismo)")
        .setRequired(false)
    ),

  async execute(interaction) {

    await interaction.deferReply({ ephemeral: true });

    const esStaff   = interaction.member.roles.cache.has(ROL_STAFF);
    const userTarget = interaction.options.getUser("usuario") ?? interaction.user;

    // 🔒 Solo staff puede ver sanciones de otros
    if (userTarget.id !== interaction.user.id && !esStaff) {
      return interaction.editReply({
        content: "❌ Solo puedes ver tu propio expediente."
      });
    }

    const registro = await Sancion.findOne({ discord_id: userTarget.id });

    const container = buildContainer(userTarget, registro, esStaff);

    // Botones solo para staff
    const components = [];

    if (esStaff) {
      const botones = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`quitar_strike_${userTarget.id}`)
          .setLabel("➖ Quitar Strike")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(!registro || registro.strikes_actuales === 0),

        new ButtonBuilder()
          .setCustomId(`quitar_sancion_${userTarget.id}`)
          .setLabel("🗑️ Quitar Sanción")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(!registro || registro.sanciones_acumuladas === 0)
      );
      components.push(botones);
    }

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [container, ...components]
    });
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔘 BOTONES + MODALES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  registerEvents(client) {

    client.on(Events.InteractionCreate, async (interaction) => {

      // ━━━━━━━━━━━━━━━━━━━━
      // 🔘 BOTONES
      // ━━━━━━━━━━━━━━━━━━━━
      if (interaction.isButton()) {

        const esStaff = interaction.member.roles.cache.has(ROL_STAFF);
        if (!esStaff) {
          return interaction.reply({
            content: "❌ No tienes permisos.",
            ephemeral: true
          });
        }

        // ➖ QUITAR STRIKE
        if (interaction.customId.startsWith("quitar_strike_")) {
          const userId = interaction.customId.split("_")[2];

          const modal = new ModalBuilder()
            .setCustomId(`modal_qstrike_${userId}`)
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

        // 🗑️ QUITAR SANCIÓN
        if (interaction.customId.startsWith("quitar_sancion_")) {
          const userId = interaction.customId.split("_")[2];

          const modal = new ModalBuilder()
            .setCustomId(`modal_qsancion_${userId}`)
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
        if (interaction.customId.startsWith("modal_qstrike_")) {

          const userId = interaction.customId.split("_")[2];
          const razon  = interaction.fields.getTextInputValue("razon");

          await interaction.deferUpdate();

          const registro = await Sancion.findOne({ discord_id: userId });
          if (!registro || registro.strikes_actuales === 0) {
            return interaction.followUp({ content: "❌ Este usuario no tiene strikes.", ephemeral: true });
          }

          const miembro = await interaction.guild.members.fetch(userId).catch(() => null);

          // Quitar rol de strike actual
          if (miembro) {
            await miembro.roles.remove(ROLES_STRIKE[registro.strikes_actuales]).catch(() => {});
            // Si tiene strikes restantes, poner el rol correcto
            if (registro.strikes_actuales - 1 > 0) {
              await miembro.roles.add(ROLES_STRIKE[registro.strikes_actuales - 1]).catch(() => {});
            }
          }

          registro.strikes_actuales = Math.max(0, registro.strikes_actuales - 1);

          registro.historial.push({
            tipo:      "strike",
            numero:    registro.strikes_actuales,
            motivo:    `[REMOVIDO] ${razon}`,
            staff_id:  interaction.user.id,
            staff_tag: interaction.user.tag
          });

          await registro.save();

          // 📩 Log al canal
          await enviarLog(interaction, miembro?.user ?? { id: userId, tag: userId }, "strike", razon, registro);

          // 🔄 Actualizar vista
          const userObj = miembro?.user ?? await interaction.client.users.fetch(userId).catch(() => null);
          const containerActualizado = buildContainer(userObj, registro, true);

          const botonesActualizados = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`quitar_strike_${userId}`)
              .setLabel("➖ Quitar Strike")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(registro.strikes_actuales === 0),

            new ButtonBuilder()
              .setCustomId(`quitar_sancion_${userId}`)
              .setLabel("🗑️ Quitar Sanción")
              .setStyle(ButtonStyle.Danger)
              .setDisabled(registro.sanciones_acumuladas === 0)
          );

          await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [containerActualizado, botonesActualizados]
          });

          await interaction.followUp({ content: "✅ Strike removido correctamente.", ephemeral: true });
        }

        // 🗑️ MODAL QUITAR SANCIÓN
        if (interaction.customId.startsWith("modal_qsancion_")) {

          const userId = interaction.customId.split("_")[2];
          const razon  = interaction.fields.getTextInputValue("razon");

          await interaction.deferUpdate();

          const registro = await Sancion.findOne({ discord_id: userId });
          if (!registro || registro.sanciones_acumuladas === 0) {
            return interaction.followUp({ content: "❌ Este usuario no tiene sanciones.", ephemeral: true });
          }

          const miembro = await interaction.guild.members.fetch(userId).catch(() => null);

          // Quitar rol de sanción actual
          if (miembro) {
            await miembro.roles.remove(ROLES_SANCION[registro.sanciones_acumuladas]).catch(() => {});
            // Restaurar rol de sanción anterior si existe
            if (registro.sanciones_acumuladas - 1 > 0) {
              await miembro.roles.add(ROLES_SANCION[registro.sanciones_acumuladas - 1]).catch(() => {});
            }
            // Quitar timeout si tiene
            await miembro.timeout(null).catch(() => {});
          }

          registro.sanciones_acumuladas = Math.max(0, registro.sanciones_acumuladas - 1);
          if (registro.baneado) registro.baneado = false;

          registro.historial.push({
            tipo:      "sancion",
            numero:    registro.sanciones_acumuladas,
            motivo:    `[REMOVIDA] ${razon}`,
            staff_id:  interaction.user.id,
            staff_tag: interaction.user.tag
          });

          await registro.save();

          // 📩 Log al canal
          await enviarLog(interaction, miembro?.user ?? { id: userId, tag: userId }, "sancion", razon, registro);

          // 🔄 Actualizar vista
          const userObj = miembro?.user ?? await interaction.client.users.fetch(userId).catch(() => null);
          const containerActualizado = buildContainer(userObj, registro, true);

          const botonesActualizados = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`quitar_strike_${userId}`)
              .setLabel("➖ Quitar Strike")
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(registro.strikes_actuales === 0),

            new ButtonBuilder()
              .setCustomId(`quitar_sancion_${userId}`)
              .setLabel("🗑️ Quitar Sanción")
              .setStyle(ButtonStyle.Danger)
              .setDisabled(registro.sanciones_acumuladas === 0)
          );

          await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [containerActualizado, botonesActualizados]
          });

          await interaction.followUp({ content: "✅ Sanción removida correctamente.", ephemeral: true });
        }
      }
    });
  }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📩 Log al canal de moderación
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function enviarLog(interaction, user, tipo, razon, registro) {
  const canal = interaction.guild.channels.cache.get(CANAL_LOGS);
  if (!canal) return;

  const container = new ContainerBuilder()
    .setAccentColor(0x3498db)

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `## 🗑️ ${tipo === "strike" ? "Strike" : "Sanción"} removido\n` +
        `-# Por ${interaction.user.tag}`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**👤 Usuario:** <@${user.id}> (${user.tag ?? user.id})\n` +
        `**🛡️ Staff:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
        `**📝 Razón:** ${razon}\n` +
        `**⚡ Strikes restantes:** ${registro.strikes_actuales}/3\n` +
        `**🚨 Sanciones restantes:** ${registro.sanciones_acumuladas}/6`
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(false)
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
