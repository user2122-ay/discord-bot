const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

// 📌 CANALES
const CANAL_DUDAS = "1451018706779115655";

module.exports = (client) => {

  // ==============================
  // 💬 MENCIÓN → PANEL
  // ==============================
  client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    if (message.mentions.has(client.user)) {

      // 🔒 borrar mensaje del usuario (para que sea "privado")
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
        )
        .setTimestamp();

      const menu = new StringSelectMenuBuilder()
        .setCustomId("menu_soporte")
        .setPlaceholder("Selecciona una opción")
        .addOptions([
          {
            label: "Dudas generales",
            value: "dudas",
            emoji: "❓"
          },
          {
            label: "Crear ticket",
            value: "ticket",
            emoji: "🎫"
          },
          {
            label: "Normativa",
            value: "normativa",
            emoji: "📜"
          },
          {
            label: "Conceptos RP",
            value: "conceptos",
            emoji: "📘"
          },
          {
            label: "Estado del servidor",
            value: "estado",
            emoji: "🟢"
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      const msg = await message.channel.send({
        content: `<@${message.author.id}>`,
        embeds: [embed],
        components: [row]
      });

      // 🧠 auto borrar panel después de 30s (opcional pero GOD)
      setTimeout(() => {
        msg.delete().catch(() => {});
      }, 30000);
    }

  });

  // ==============================
  // 🎯 SELECT MENU + MODAL
  // ==============================
  client.on("interactionCreate", async (interaction) => {

    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === "menu_soporte") {

      const value = interaction.values[0];

      // ❓ DUDAS → MODAL
      if (value === "dudas") {

        const modal = new ModalBuilder()
          .setCustomId("modal_duda")
          .setTitle("Enviar duda");

        const input = new TextInputBuilder()
          .setCustomId("duda_texto")
          .setLabel("Escribe tu duda")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        return interaction.showModal(modal);
      }

      // 🎫 TICKET
      if (value === "ticket") {
        return interaction.reply({
          content: "🎫 Ve aquí:\nhttps://discord.com/channels/1345956472986796183/1451018705528946923",
          ephemeral: true
        });
      }

      // 📜 NORMATIVA
      if (value === "normativa") {
        return interaction.reply({
          content: "📜 Normativa:\nhttps://discord.com/channels/1345956472986796183/1451018653259792536",
          ephemeral: true
        });
      }

      // 📘 CONCEPTOS
      if (value === "conceptos") {
        return interaction.reply({
          content: "📘 Conceptos RP:\nhttps://discord.com/channels/1345956472986796183/1451771796918636697",
          ephemeral: true
        });
      }

      // 🟢 ESTADO
      if (value === "estado") {
        return interaction.reply({
          content: "🟢 Estado:\nhttps://discord.com/channels/1345956472986796183/1451018683383156827",
          ephemeral: true
        });
      }

    }

    // ==============================
    // 📥 MODAL → ENVIAR DUDA
    // ==============================
    if (interaction.isModalSubmit() && interaction.customId === "modal_duda") {

      const duda = interaction.fields.getTextInputValue("duda_texto");
      const canal = interaction.guild.channels.cache.get(CANAL_DUDAS);

      const embed = new EmbedBuilder()
        .setColor("#5865f2")
        .setTitle("📩 Nueva Duda")
        .setDescription(duda)
        .addFields({
          name: "👤 Usuario",
          value: `<@${interaction.user.id}>`
        })
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      canal?.send({
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
