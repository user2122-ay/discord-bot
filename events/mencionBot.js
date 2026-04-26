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
  // 🚀 PANEL INTELIGENTE SIN JSON
  // ==============================
  client.once("ready", async () => {

    const canal = await client.channels.fetch(CANAL_PANEL).catch(() => null);
    if (!canal) return;

    // 🔍 Buscar si ya existe el panel
    const mensajes = await canal.messages.fetch({ limit: 20 });

    const existe = mensajes.find(msg =>
      msg.author.id === client.user.id &&
      msg.embeds.length > 0 &&
      msg.embeds[0].title === "📩 Sistema de Dudas"
    );

    if (existe) {
      console.log("🟡 Panel ya existe");
      return;
    }

    // ✅ Crear panel
    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("📩 Sistema de Dudas")
      .setDescription(
`Bienvenido al sistema de dudas.

Si tienes alguna pregunta, presiona el botón o menciona al bot escribiendo tu duda.

El equipo responderá lo antes posible.`
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

    console.log("✅ Panel creado");
  });

  // ==============================
  // 🎯 INTERACCIONES
  // ==============================
  client.on("interactionCreate", async interaction => {

    // 🔘 BOTÓN → MODAL
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

    // 📥 MODAL → ENVIAR DUDA
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

  // ==============================
  // 💬 MENCIÓN AL BOT
  // ==============================
  client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    if (message.mentions.has(client.user)) {

      const duda = message.content
        .replace(`<@${client.user.id}>`, "")
        .replace(`<@!${client.user.id}>`, "")
        .trim();

      // ❓ Solo mención
      if (!duda) {
        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setTitle("📩 Sistema de Dudas")
          .setDescription(
`Hola <@${message.author.id}> 👋

Puedes:

🔹 Usar el botón del panel  
🔹 O mencionar al bot escribiendo tu duda  

Ejemplo:
\`@Bot ¿Cómo saco mi cédula?\``
          )
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      }

      // 📤 Enviar duda
      const canal = message.guild.channels.cache.get(CANAL_DUDAS);

      const embed = new EmbedBuilder()
        .setColor("#5865f2")
        .setTitle("📩 Nueva Duda (por mención)")
        .setDescription(duda)
        .addFields({
          name: "👤 Usuario",
          value: `<@${message.author.id}>`
        })
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      canal?.send({
        content: `<@${message.author.id}>`,
        embeds: [embed]
      });

      message.reply("✅ Tu duda fue enviada correctamente.");
    }

  });

};
