const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

// 📌 CONFIG
const CANAL_PANEL = "1459259725131809069";
const CANAL_LOGS = "1452365736927301764";
const ROL_STAFF = "1451217784444027163";
const ROL_VERIFICADO = "1451018445998260266";

// 🧠 memoria
const solicitudes = new Map();

module.exports = (client) => {

  // ==============================
  // 🚀 COMANDO !verificacion
  // ==============================
  client.on("messageCreate", async (message) => {

    if (message.content !== "!verificacion") return;
    if (!message.member.permissions.has("Administrator")) return;

    const canal = message.guild.channels.cache.get(CANAL_PANEL);
    if (!canal) return;

    // 🧹 limpiar canal
    const mensajes = await canal.messages.fetch();
    await canal.bulkDelete(mensajes, true).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("📝 Sistema de Verificación")
      .setDescription(
`Para entrar al servidor debes completar tu verificación.

Presiona el botón y responde las preguntas.`
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("verificar_inicio")
        .setLabel("Comenzar verificación")
        .setStyle(ButtonStyle.Success)
    );

    await canal.send({ embeds: [embed], components: [row] });
    message.reply("✅ Panel enviado");
  });

  // ==============================
  // 🎯 INTERACCIONES
  // ==============================
  client.on("interactionCreate", async (interaction) => {

    // 🔘 BOTÓN → MODAL
    if (interaction.isButton() && interaction.customId === "verificar_inicio") {

      const modal = new ModalBuilder()
        .setCustomId("modal_verificacion")
        .setTitle("Verificación RP");

      const historia = new TextInputBuilder()
        .setCustomId("historia")
        .setLabel("Historia de tu personaje")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const rol = new TextInputBuilder()
        .setCustomId("rol")
        .setLabel("¿Qué es el rol serio?")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const roblox = new TextInputBuilder()
        .setCustomId("roblox")
        .setLabel("Usuario de Roblox")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(historia),
        new ActionRowBuilder().addComponents(rol),
        new ActionRowBuilder().addComponents(roblox)
      );

      return interaction.showModal(modal);
    }

    // 📥 ENVIAR FORMULARIO
    if (interaction.isModalSubmit() && interaction.customId === "modal_verificacion") {

      const historia = interaction.fields.getTextInputValue("historia");
      const rol = interaction.fields.getTextInputValue("rol");
      const roblox = interaction.fields.getTextInputValue("roblox");

      solicitudes.set(interaction.user.id, {
        historia,
        rol,
        roblox
      });

      const canalLogs = await interaction.guild.channels.fetch(CANAL_LOGS).catch(() => null);

      if (!canalLogs) {
        return interaction.reply({
          content: "❌ Error: canal de logs no encontrado",
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor("#f1c40f")
        .setTitle("📥 Nueva verificación")
        .addFields(
          { name: "👤 Usuario", value: `<@${interaction.user.id}>` },
          { name: "🎮 Roblox", value: roblox },
          { name: "📖 Historia", value: historia },
          { name: "📘 Rol", value: rol }
        )
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`aprobar_${interaction.user.id}`)
          .setLabel("Aprobar")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId(`rechazar_${interaction.user.id}`)
          .setLabel("Rechazar")
          .setStyle(ButtonStyle.Danger)
      );

      await canalLogs.send({
        embeds: [embed],
        components: [row]
      });

      await interaction.reply({
        content: "✅ Tu verificación fue enviada al staff.",
        ephemeral: true
      });
    }

    // ==============================
    // 👮 STAFF
    // ==============================
    if (interaction.isButton()) {

      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({
          content: "❌ No eres staff",
          ephemeral: true
        });
      }

      const [accion, userId] = interaction.customId.split("_");

      const miembro = await interaction.guild.members.fetch(userId).catch(() => null);
      const data = solicitudes.get(userId);

      if (!miembro || !data) return;

      // ✅ APROBAR
      if (accion === "aprobar") {

        await miembro.setNickname(data.roblox).catch(() => {});
        await miembro.roles.add(ROL_VERIFICADO).catch(() => {});

        solicitudes.delete(userId);

        return interaction.update({
          content: `✅ Usuario verificado: <@${userId}>`,
          embeds: [],
          components: []
        });
      }

      // ❌ RECHAZAR
      if (accion === "rechazar") {

        solicitudes.delete(userId);

        return interaction.update({
          content: `❌ Usuario rechazado: <@${userId}>`,
          embeds: [],
          components: []
        });
      }
    }

  });

};
