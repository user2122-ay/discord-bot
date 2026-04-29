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
const ROL_VERIFICADO = "1451018445998260266";

// 🧠 memoria
const solicitudes = new Map();

module.exports = (client) => {

  // ==============================
  // 🚀 COMANDO PANEL
  // ==============================
  client.on("messageCreate", async (message) => {

    if (message.content !== "!verificacion") return;
    if (!message.member.permissions.has("Administrator")) return;

    const canal = message.guild.channels.cache.get(CANAL_PANEL);
    if (!canal) return;

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("📝 Verificación Roblox")
      .setDescription("Presiona el botón para comenzar.");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("verificar_inicio")
        .setLabel("Verificarse")
        .setStyle(ButtonStyle.Success)
    );

    await canal.send({ embeds: [embed], components: [row] });
  });

  // ==============================
  // INTERACCIONES
  // ==============================
  client.on("interactionCreate", async (interaction) => {

    // 🔘 BOTÓN → MODAL
    if (interaction.isButton() && interaction.customId === "verificar_inicio") {

      const modal = new ModalBuilder()
        .setCustomId("modal_verificacion")
        .setTitle("Verificación");

      const roblox = new TextInputBuilder()
        .setCustomId("roblox")
        .setLabel("Usuario de Roblox")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(roblox)
      );

      return interaction.showModal(modal);
    }

    // ==============================
    // 📥 MODAL → GENERAR CÓDIGO
    // ==============================
    if (interaction.isModalSubmit() && interaction.customId === "modal_verificacion") {

      await interaction.deferReply({ ephemeral: true });

      const username = interaction.fields.getTextInputValue("roblox");

      // 🔢 generar código
      const codigo = `PTY-${Math.floor(1000 + Math.random() * 9000)}`;

      solicitudes.set(interaction.user.id, {
        username,
        codigo
      });

      return interaction.editReply({
        content:
`🔐 Verificación iniciada

1. Ve a tu perfil de Roblox
2. Coloca este código en tu descripción:

👉 **${codigo}**

3. Luego presiona verificar`
        ,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("verificar_codigo")
              .setLabel("Verificar ahora")
              .setStyle(ButtonStyle.Primary)
          )
        ]
      });
    }

    // ==============================
    // 🔍 VERIFICAR BIO
    // ==============================
    if (interaction.isButton() && interaction.customId === "verificar_codigo") {

      await interaction.deferReply({ ephemeral: true });

      const data = solicitudes.get(interaction.user.id);
      if (!data) return interaction.editReply({ content: "❌ No hay proceso activo." });

      try {
        // 🔍 buscar ID
        const res = await axios.post("https://users.roblox.com/v1/usernames/users", {
          usernames: [data.username]
        });

        const userId = res.data.data[0]?.id;
        if (!userId) return interaction.editReply({ content: "❌ Usuario no encontrado." });

        // 🔍 bio
        const perfil = await axios.get(`https://users.roblox.com/v1/users/${userId}`);

        const bio = perfil.data.description || "";

        if (!bio.includes(data.codigo)) {
          return interaction.editReply({
            content: "❌ No encontramos el código en tu perfil."
          });
        }

        // ✅ ENVIAR A STAFF
        const canalLogs = await interaction.guild.channels.fetch(CANAL_LOGS);

        const embed = new EmbedBuilder()
          .setColor("#f1c40f")
          .setTitle("📥 Nueva verificación")
          .addFields(
            { name: "👤 Usuario", value: `<@${interaction.user.id}>` },
            { name: "🎮 Roblox", value: data.username }
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

        await canalLogs.send({ embeds: [embed], components: [row] });

        return interaction.editReply({
          content: "✅ Verificación enviada al staff."
        });

      } catch (err) {
        console.error(err);
        return interaction.editReply({
          content: "❌ Error verificando Roblox."
        });
      }
    }

    // ==============================
    // 👮 STAFF
    // ==============================
    if (interaction.isButton()) {

      if (!interaction.member.roles.cache.has(ROL_STAFF)) return;

      const [accion, userId] = interaction.customId.split("_");

      const miembro = await interaction.guild.members.fetch(userId).catch(() => null);
      const data = solicitudes.get(userId);

      if (!miembro || !data) return;

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
