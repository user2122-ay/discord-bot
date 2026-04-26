const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const CANAL_PANEL = "1463192291211477008";
const CANAL_DUDAS = "1451018706779115655";

module.exports = (client) => {

  // ==============================
  // 🚀 PANEL (SOLO 1 VEZ)
  // ==============================
  client.once("ready", async () => {

    const canal = await client.channels.fetch(CANAL_PANEL).catch(() => null);
    if (!canal) return;

    // 🧹 borrar mensajes anteriores
    const mensajes = await canal.messages.fetch();
    await canal.bulkDelete(mensajes, true).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("📩 Sistema de Dudas")
      .setDescription(
`Bienvenido al sistema de dudas.

Si tienes alguna pregunta, presiona el botón de abajo y escribe tu duda.

El equipo la revisará lo antes posible.`
      )
      .setFooter({
        text: "Panamá RP V2",
        iconURL: client.user.displayAvatarURL()
      })
      .setTimestamp();

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("enviar_duda")
        .setLabel("Enviar duda")
        .setStyle(ButtonStyle.Primary)
    );

    await canal.send({
      embeds: [embed],
      components: [botones]
    });

    console.log("✅ Panel de dudas enviado");
  });

  // ==============================
  // 🎯 INTERACCIONES
  // ==============================
  client.on("interactionCreate", async interaction => {

    // 🔘 BOTÓN → ABRIR MODAL
    if (interaction.isButton() && interaction.customId === "enviar_duda") {

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

    // 📥 ENVIAR DUDA
    if (interaction.isModalSubmit() && interaction.customId === "modal_duda") {

      const duda = interaction.fields.getTextInputValue("duda_texto");

      const canal = interaction.guild.channels.cache.get(CANAL_DUDAS);

      const embed = new EmbedBuilder()
        .setColor("#5865f2")
        .setTitle("📩 Nueva Duda")
        .setDescription(duda)
        .addFields(
          { name: "👤 Usuario", value: `<@${interaction.user.id}>` }
        )
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      if (canal) {
        canal.send({
          content: `<@${interaction.user.id}>`,
          embeds: [embed]
        });
      }

      await interaction.reply({
        content: "✅ Tu duda fue enviada correctamente.",
        ephemeral: true
      });
    }

  });

};
