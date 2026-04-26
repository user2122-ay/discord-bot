const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const axios = require("axios");

// 📌 CONFIG
const CANAL_PANEL = "1459259725131809069";
const CANAL_LOGS = "1452365736927301764";
const ROL_STAFF = "1451217784444027163";
const ROL_VERIFICADO = "ID_ROL_VERIFICADO"; // 👈 pon esto

// 🧠 memoria temporal
const solicitudes = new Map();

module.exports = (client) => {

  // ==============================
  // 🚀 PANEL
  // ==============================
  client.once("ready", async () => {

    const canal = await client.channels.fetch(CANAL_PANEL).catch(() => null);
    if (!canal) return;

    // limpiar
    const mensajes = await canal.messages.fetch();
    await canal.bulkDelete(mensajes, true).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🔗 Verificación Roblox")
      .setDescription(
`Para ingresar al servidor debes verificar tu cuenta.

Presiona el botón para comenzar.`
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("verificar_inicio")
        .setLabel("Verificarse")
        .setStyle(ButtonStyle.Success)
    );

    await canal.send({ embeds: [embed], components: [row] });

    console.log("✅ Panel de verificación enviado");
  });

  // ==============================
  // 🎯 INTERACCIONES
  // ==============================
  client.on("interactionCreate", async (interaction) => {

    // 🔘 BOTÓN → MODAL
    if (interaction.isButton() && interaction.customId === "verificar_inicio") {

      const modal = new ModalBuilder()
        .setCustomId("modal_verificacion")
        .setTitle("Verificación Roblox");

      const historia = new TextInputBuilder()
        .setCustomId("historia")
        .setLabel("Historia de tu personaje")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const roblox = new TextInputBuilder()
        .setCustomId("roblox_id")
        .setLabel("Usuario o ID de Roblox")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(historia),
        new ActionRowBuilder().addComponents(roblox)
      );

      return interaction.showModal(modal);
    }

    // 📥 MODAL → BUSCAR ROBLOX
    if (interaction.isModalSubmit() && interaction.customId === "modal_verificacion") {

      const historia = interaction.fields.getTextInputValue("historia");
      const robloxInput = interaction.fields.getTextInputValue("roblox_id");

      let userId;

      try {
        // 🔍 buscar por username
        const res = await axios.post(
          "https://users.roblox.com/v1/usernames/users",
          { usernames: [robloxInput] }
        );

        userId = res.data.data[0]?.id;
      } catch {
        userId = robloxInput; // si puso ID directo
      }

      if (!userId) {
        return interaction.reply({
          content: "❌ Usuario de Roblox no encontrado",
          ephemeral: true
        });
      }

      // 🔍 perfil
      const perfil = await axios.get(
        `https://users.roblox.com/v1/users/${userId}`
      );

      const username = perfil.data.name;
      const avatar = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;

      solicitudes.set(interaction.user.id, {
        historia,
        userId,
        username,
        avatar
      });

      const embed = new EmbedBuilder()
        .setColor("#5865f2")
        .setTitle("🔍 Confirmar cuenta")
        .setDescription(`¿Esta es tu cuenta de Roblox?`)
        .setImage(avatar)
        .addFields(
          { name: "👤 Usuario", value: username }
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirmar_roblox")
          .setLabel("Sí, es mío")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId("cancelar_roblox")
          .setLabel("No")
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
      });
    }

    // ❌ CANCELAR
    if (interaction.isButton() && interaction.customId === "cancelar_roblox") {
      solicitudes.delete(interaction.user.id);
      return interaction.update({
        content: "❌ Verificación cancelada.",
        embeds: [],
        components: []
      });
    }

    // ✅ CONFIRMAR → ENVIAR A LOGS
    if (interaction.isButton() && interaction.customId === "confirmar_roblox") {

      const data = solicitudes.get(interaction.user.id);
      if (!data) return;

      const canalLogs = interaction.guild.channels.cache.get(CANAL_LOGS);

      const embed = new EmbedBuilder()
        .setColor("#f1c40f")
        .setTitle("📥 Nueva verificación")
        .setImage(data.avatar)
        .addFields(
          { name: "👤 Usuario Discord", value: `<@${interaction.user.id}>` },
          { name: "🎮 Roblox", value: data.username },
          { name: "📖 Historia", value: data.historia }
        );

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

      canalLogs.send({ embeds: [embed], components: [row] });

      await interaction.update({
        content: "✅ Solicitud enviada a staff.",
        embeds: [],
        components: []
      });
    }

    // ==============================
    // 👮 STAFF
    // ==============================
    if (interaction.isButton()) {

      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({
          content: "❌ No eres staff.",
          ephemeral: true
        });
      }

      const [accion, userId] = interaction.customId.split("_");

      const miembro = await interaction.guild.members.fetch(userId).catch(() => null);
      const data = solicitudes.get(userId);

      if (!miembro || !data) return;

      // ✅ APROBAR
      if (accion === "aprobar") {

        await miembro.setNickname(data.username).catch(() => {});
        await miembro.roles.add(ROL_VERIFICADO).catch(() => {});

        solicitudes.delete(userId);

        return interaction.update({
          content: `✅ Verificado: <@${userId}>`,
          embeds: [],
          components: []
        });
      }

      // ❌ RECHAZAR
      if (accion === "rechazar") {

        solicitudes.delete(userId);

        return interaction.update({
          content: `❌ Rechazado: <@${userId}>`,
          embeds: [],
          components: []
        });
      }
    }

  });

};
