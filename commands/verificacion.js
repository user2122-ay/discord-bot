const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

// 🔧 IDS
const CANAL_APROBACION = "1463192293312958631";
const ROL_VERIFICADO = "1463192290314162342";
const ROL_CIUDADANO = "1463192290360295646";
const ROL_NO_VERIFICADO = "1463192290314162341";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verificacion")
    .setDescription("Sistema completo de verificación"),

  async execute(interaction) {
    // =========================
    // 1️⃣ MENSAJE + BOTÓN
    // =========================
    const embed = new EmbedBuilder()
      .setTitle("✅ Verificación | Los Santos RP")
      .setDescription(
        "Para acceder al servidor debes completar la verificación.\n\n" +
        "📌 Responde con sinceridad\n" +
        "📌 El staff revisará tu solicitud"
      )
      .setColor(0x3498db)
      .setFooter({ text: "Gobierno de Los Santos RP" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("verificarse")
        .setLabel("Verificarse")
        .setStyle(ButtonStyle.Success)
    );

    const mensaje = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    // =========================
    // 2️⃣ ESPERAR BOTÓN
    // =========================
    const boton = await mensaje.awaitMessageComponent({
      filter: i => i.user.id === interaction.user.id,
      time: 120000
    });

    // =========================
    // 3️⃣ MODAL
    // =========================
    const modal = new ModalBuilder()
      .setCustomId("modal_verificacion")
      .setTitle("Formulario de Verificación");

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("roblox")
          .setLabel("Usuario de Roblox")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("edad")
          .setLabel("Edad OOC")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("mg")
          .setLabel("¿Qué es MG?")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("pg")
          .setLabel("¿Qué es PG?")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("acepta")
          .setLabel("¿Aceptas normativa y decisiones del staff?")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );

    await boton.showModal(modal);

    // =========================
    // 4️⃣ ESPERAR MODAL
    // =========================
    const modalSubmit = await boton.awaitModalSubmit({
      filter: i => i.user.id === interaction.user.id,
      time: 180000
    });

    const roblox = modalSubmit.fields.getTextInputValue("roblox");

    // =========================
    // 5️⃣ ENVIAR A STAFF
    // =========================
    const embedStaff = new EmbedBuilder()
      .setTitle("📋 Solicitud de Verificación")
      .setColor(0xf1c40f)
      .addFields(
        { name: "👤 Usuario", value: `<@${interaction.user.id}>` },
        { name: "🎮 Roblox", value: roblox },
        { name: "🎂 Edad OOC", value: modalSubmit.fields.getTextInputValue("edad") },
        { name: "📘 MG", value: modalSubmit.fields.getTextInputValue("mg") },
        { name: "📕 PG", value: modalSubmit.fields.getTextInputValue("pg") },
        { name: "✅ Acepta normas", value: modalSubmit.fields.getTextInputValue("acepta") }
      );

    const rowStaff = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("aprobar")
        .setLabel("Aprobar")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("rechazar")
        .setLabel("Rechazar")
        .setStyle(ButtonStyle.Danger)
    );

    const canal = interaction.guild.channels.cache.get(CANAL_APROBACION);
    const msgStaff = await canal.send({ embeds: [embedStaff], components: [rowStaff] });

    await modalSubmit.reply({
      content: "📨 Tu solicitud fue enviada al staff.",
      ephemeral: true
    });

    // =========================
    // 6️⃣ ESPERAR DECISIÓN STAFF
    // =========================
    const decision = await msgStaff.awaitMessageComponent({ time: 86400000 });

    const member = await interaction.guild.members.fetch(interaction.user.id);

    if (decision.customId === "aprobar") {
      await member.roles.add([ROL_VERIFICADO, ROL_CIUDADANO]);
      await member.roles.remove(ROL_NO_VERIFICADO);
      await member.setNickname(roblox);
      await member.send("✅ Tu verificación fue **APROBADA**.");
      await decision.update({ content: "✅ Verificación aprobada", embeds: [], components: [] });
    } else {
      await member.send("❌ Tu verificación fue **RECHAZADA**.");
      await decision.update({ content: "❌ Verificación rechazada", embeds: [], components: [] });
    }
  }
};
