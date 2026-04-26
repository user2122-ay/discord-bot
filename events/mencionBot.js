const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

// 📌 CANAL DE DUDAS
const CANAL_DUDAS = "1451018706779115655";

module.exports = (client) => {

  // ==============================
  // 💬 MENCIÓN → PANEL
  // ==============================
  client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    if (message.mentions.has(client.user)) {

      // 🔒 borrar SIEMPRE
      await message.delete().catch(() => {});

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setDescription(
`Hola <@${message.author.id}>, ¿en qué puedo ayudarte?

━━━━━━━━━━━━━━━━━━

❓ Dudas generales  
🎫 Crear ticket  
📜 Normativa  
📘 Conceptos RP  
🟢 Estado del servidor  

━━━━━━━━━━━━━━━━━━`
        );

      const menu = new StringSelectMenuBuilder()
        .setCustomId(`menu_${message.author.id}`) // 🔥 PROTECCIÓN USER
        .setPlaceholder("Selecciona una opción")
        .addOptions([
          { label: "Dudas generales", value: "dudas", emoji: "❓" },
          { label: "Crear ticket", value: "ticket", emoji: "🎫" },
          { label: "Normativa", value: "normativa", emoji: "📜" },
          { label: "Conceptos RP", value: "conceptos", emoji: "📘" },
          { label: "Estado del servidor", value: "estado", emoji: "🟢" }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      const msg = await message.channel.send({
        content: `<@${message.author.id}>`,
        embeds: [embed],
        components: [row]
      });

      // ⏳ borrar panel luego
      setTimeout(() => {
        msg.delete().catch(() => {});
      }, 30000);
    }

  });

  // ==============================
  // 🎯 SELECT MENU
  // ==============================
  client.on("interactionCreate", async (interaction) => {

    if (interaction.isStringSelectMenu()) {

      // 🔒 SOLO EL USUARIO ORIGINAL
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
          .setTitle("Enviar duda");

        const input = new TextInputBuilder()
          .setCustomId("duda_texto")
          .setLabel("Escribe tu duda")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        modal.addComponents(
          new ActionRowBuilder().addComponents(input)
        );

        return interaction.showModal(modal);
      }

      // 🎫 TICKET
      if (value === "ticket") {
        return interaction.reply({
          content: "🎫 https://discord.com/channels/1345956472986796183/1451018705528946923",
          ephemeral: true
        });
      }

      // 📜 NORMATIVA
      if (value === "normativa") {
        return interaction.reply({
          content: "📜 https://discord.com/channels/1345956472986796183/1451018653259792536",
          ephemeral: true
        });
      }

      // 📘 CONCEPTOS
      if (value === "conceptos") {
        return interaction.reply({
          content: "📘 https://discord.com/channels/1345956472986796183/1451771796918636697",
          ephemeral: true
        });
      }

      // 🟢 ESTADO
      if (value === "estado") {
        return interaction.reply({
          content: "🟢 https://discord.com/channels/1345956472986796183/1451018683383156827",
          ephemeral: true
        });
      }
    }

    // ==============================
    // 📥 MODAL
    // ==============================
    if (interaction.isModalSubmit()) {

      if (!interaction.customId.startsWith("modal_")) return;

      const duda = interaction.fields.getTextInputValue("duda_texto");

      // 🔥 FETCH REAL (ARREGLA ERROR)
      const canal = await interaction.client.channels.fetch(CANAL_DUDAS).catch(() => null);

      if (!canal) {
        return interaction.reply({
          content: "❌ No se encontró el canal de dudas.",
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#5865f2")
        .setTitle("📩 Nueva Duda")
        .setDescription(duda)
        .addFields({
          name: "👤 Usuario",
          value: `<@${interaction.user.id}>`
        })
        .setTimestamp();

      await canal.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed]
      });

      await interaction.reply({
        content: "✅ Tu duda fue enviada correctamente.",
        ephemeral: true
      });
    }

  });

};
