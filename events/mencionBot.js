const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
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

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setDescription(
`Hola <@${message.author.id}>, ¿en qué puedo ayudarte?

━━━━━━━━━━━━━━━━━━

❓ **Dudas generales**  
🎫 **Crear ticket**  
📜 **Normativa**  
📘 **Conceptos RP**  
🟢 **Estado del servidor**

━━━━━━━━━━━━━━━━━━`
        )
        .setTimestamp();

      const botones = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId("dudas")
          .setLabel("Dudas")
          .setEmoji("❓")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("ticket")
          .setLabel("Ticket")
          .setEmoji("🎫")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("normativa")
          .setLabel("Normativa")
          .setEmoji("📜")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("conceptos")
          .setLabel("Conceptos")
          .setEmoji("📘")
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId("estado")
          .setLabel("Estado")
          .setEmoji("🟢")
          .setStyle(ButtonStyle.Success)
      );

      await message.reply({
        embeds: [embed],
        components: [botones]
      });
    }

  });

  // ==============================
  // 🎯 BOTONES + MODAL
  // ==============================
  client.on("interactionCreate", async (interaction) => {

    // ❓ DUDAS → MODAL
    if (interaction.isButton() && interaction.customId === "dudas") {

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
    if (interaction.isButton() && interaction.customId === "ticket") {
      return interaction.reply({
        content: "🎫 Ve a este canal para crear un ticket:\nhttps://discord.com/channels/1345956472986796183/1451018705528946923",
        ephemeral: true
      });
    }

    // 📜 NORMATIVA
    if (interaction.isButton() && interaction.customId === "normativa") {
      return interaction.reply({
        content: "📜 Consulta la normativa aquí:\nhttps://discord.com/channels/1345956472986796183/1451018653259792536",
        ephemeral: true
      });
    }

    // 📘 CONCEPTOS
    if (interaction.isButton() && interaction.customId === "conceptos") {
      return interaction.reply({
        content: "📘 Conceptos RP:\nhttps://discord.com/channels/1345956472986796183/1451771796918636697",
        ephemeral: true
      });
    }

    // 🟢 ESTADO
    if (interaction.isButton() && interaction.customId === "estado") {
      return interaction.reply({
        content: "🟢 Estado del servidor:\nhttps://discord.com/channels/1345956472986796183/1451018683383156827",
        ephemeral: true
      });
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
