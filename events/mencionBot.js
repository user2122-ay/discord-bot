const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags
} = require("discord.js");

const CANAL_DUDAS = "1451018706779115655";

module.exports = (client) => {

  // ==============================
  // 💬 MENCIÓN → PANEL
  // ==============================
  client.on("messageCreate", async (message) => {

    if (message.author.bot) return;
    if (!message.mentions.has(client.user)) return;

    await message.delete().catch(() => {});

    const container = new ContainerBuilder()
      .setAccentColor(0x5865F2)

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 👋 ¡Hola <@${message.author.id}>!\n` +
          `-# ¿En qué puedo ayudarte hoy?`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `❓ **Dudas generales** — Envía una duda al canal oficial\n` +
          `🎫 **Crear ticket** — Accede al sistema de tickets\n` +
          `📜 **Normativa** — Lee las reglas del servidor\n` +
          `📘 **Conceptos RP** — Aprende los conceptos básicos de rol\n` +
          `🟢 **Estado del servidor** — Consulta el estado actual`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(false)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# Este panel se eliminará en 30 segundos`
        )
      );

    // ✅ Menú fuera del container (Discord no permite ActionRow dentro)
    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`botmenu_${message.author.id}`) // ✅ prefijo único "botmenu_"
        .setPlaceholder("📂 Selecciona una opción...")
        .addOptions([
          { label: "Dudas generales",      value: "dudas",     emoji: "❓" },
          { label: "Crear ticket",          value: "ticket",    emoji: "🎫" },
          { label: "Normativa",             value: "normativa", emoji: "📜" },
          { label: "Conceptos RP",          value: "conceptos", emoji: "📘" },
          { label: "Estado del servidor",   value: "estado",    emoji: "🟢" }
        ])
    );

    const msg = await message.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container, menu]
    });

    setTimeout(() => msg.delete().catch(() => {}), 30000);
  });

  // ==============================
  // 🎯 SELECT MENU
  // ==============================
  client.on("interactionCreate", async (interaction) => {

    if (interaction.isStringSelectMenu()) {

      // ✅ Solo procesar los del bot de mención
      if (!interaction.customId.startsWith("botmenu_")) return;

      // 🔒 Solo el usuario original
      const userId = interaction.customId.split("_")[1];
      if (interaction.user.id !== userId) {
        return interaction.reply({
          content: "❌ Este panel no es para ti.",
          ephemeral: true
        });
      }

      const value = interaction.values[0];

      // ❓ DUDAS
      if (value === "dudas") {
        const modal = new ModalBuilder()
          .setCustomId(`modal_${interaction.user.id}`)
          .setTitle("📩 Enviar duda");

        const input = new TextInputBuilder()
          .setCustomId("duda_texto")
          .setLabel("Escribe tu duda aquí")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder("Describe tu duda con el mayor detalle posible...")
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return interaction.showModal(modal);
      }

      // 🎫 TICKET
      if (value === "ticket") {
        return interaction.reply({
          content: "🎫 Dirígete aquí para abrir un ticket:\nhttps://discord.com/channels/1345956472986796183/1451018705528946923",
          ephemeral: true
        });
      }

      // 📜 NORMATIVA
      if (value === "normativa") {
        return interaction.reply({
          content: "📜 Lee la normativa aquí:\nhttps://discord.com/channels/1345956472986796183/1451018653259792536",
          ephemeral: true
        });
      }

      // 📘 CONCEPTOS
      if (value === "conceptos") {
        return interaction.reply({
          content: "📘 Aprende los conceptos de rol aquí:\nhttps://discord.com/channels/1345956472986796183/1451771796918636697",
          ephemeral: true
        });
      }

      // 🟢 ESTADO
      if (value === "estado") {
        return interaction.reply({
          content: "🟢 Consulta el estado del servidor aquí:\nhttps://discord.com/channels/1345956472986796183/1451018683383156827",
          ephemeral: true
        });
      }
    }

    // ==============================
    // 📥 MODAL
    // ==============================
    if (interaction.isModalSubmit()) {

      if (!interaction.customId.startsWith("modal_")) return;
      if (interaction.customId === "modal_roblox") return;

      const duda = interaction.fields.getTextInputValue("duda_texto");

      const canal = await interaction.client.channels.fetch(CANAL_DUDAS).catch(() => null);
      if (!canal) {
        return interaction.reply({
          content: "❌ No se encontró el canal de dudas.",
          ephemeral: true
        });
      }

      const dudaContainer = new ContainerBuilder()
        .setAccentColor(0x5865F2)

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## 📩 Nueva Duda\n` +
            `-# Enviada por <@${interaction.user.id}>`
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(duda)
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(false)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# <@${interaction.user.id}> · ${new Date().toLocaleString("es-PA")}`
          )
        );

      await canal.send({
        content: `<@${interaction.user.id}>`,
        flags: MessageFlags.IsComponentsV2,
        components: [dudaContainer]
      });

      await interaction.reply({
        content: "✅ Tu duda fue enviada correctamente.",
        ephemeral: true
      });
    }

  });

};
