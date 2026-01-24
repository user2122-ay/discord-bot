const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const CANAL_APROBACION = "1463192293312958631";

const ROL_VERIFICADO = "1463192290314162342";
const ROL_CIUDADANO = "1463192290360295646";
const ROL_NO_VERIFICADO = "1463192290314162341";

module.exports = async (interaction) => {

  // 🟢 BOTÓN VERIFICARSE
  if (interaction.isButton() && interaction.customId === "btn_verificarse") {

    const modal = new ModalBuilder()
      .setCustomId("modal_verificacion")
      .setTitle("Formulario de Verificación");

    const preguntas = [
      ["roblox", "Usuario de Roblox"],
      ["edad", "Edad OOC"],
      ["mg", "¿Qué es MG?"],
      ["pg", "¿Qué es PG?"],
      ["normas", "¿Aceptas la normativa? (Sí / No)"],
      ["staff", "¿Aceptas decisiones del Staff? (Sí / No)"]
    ];

    modal.addComponents(
      ...preguntas.map(p =>
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(p[0])
            .setLabel(p[1])
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        )
      )
    );

    return interaction.showModal(modal);
  }

  // 🟡 ENVÍO DEL FORMULARIO
  if (interaction.isModalSubmit() && interaction.customId === "modal_verificacion") {

    const roblox = interaction.fields.getTextInputValue("roblox");

    const embed = new EmbedBuilder()
      .setTitle("📋 Solicitud de Verificación")
      .setColor(0xf1c40f)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "👤 Usuario", value: `<@${interaction.user.id}>` },
        { name: "🎮 Roblox", value: roblox },
        { name: "🎂 Edad OOC", value: interaction.fields.getTextInputValue("edad") },
        { name: "📘 MG", value: interaction.fields.getTextInputValue("mg") },
        { name: "📕 PG", value: interaction.fields.getTextInputValue("pg") },
        { name: "📜 Normativa", value: interaction.fields.getTextInputValue("normas") },
        { name: "⚖️ Staff", value: interaction.fields.getTextInputValue("staff") }
      )
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`veri_aceptar_${interaction.user.id}`).setLabel("Aceptar").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`veri_rechazar_${interaction.user.id}`).setLabel("Rechazar").setStyle(ButtonStyle.Danger)
    );

    const canal = await interaction.guild.channels.fetch(CANAL_APROBACION);
    await canal.send({ embeds: [embed], components: [row] });

    return interaction.reply({ content: "📨 Tu verificación fue enviada al staff.", ephemeral: true });
  }

  // 🔵 ACEPTAR / RECHAZAR
  if (interaction.isButton() && interaction.customId.startsWith("veri_")) {

    const userId = interaction.customId.split("_")[2];
    const miembro = await interaction.guild.members.fetch(userId);

    if (interaction.customId.startsWith("veri_aceptar")) {
      await miembro.roles.add([ROL_VERIFICADO, ROL_CIUDADANO]);
      await miembro.roles.remove(ROL_NO_VERIFICADO);
      await miembro.setNickname(miembro.user.username);

      await miembro.send("✅ **Tu verificación fue ACEPTADA. Bienvenido a Los Santos RP.**");
      await interaction.update({ content: "✅ Verificación aceptada.", embeds: interaction.message.embeds, components: [] });
    }

    if (interaction.customId.startsWith("veri_rechazar")) {
      await miembro.send("❌ **Tu verificación fue RECHAZADA.**");
      await interaction.update({ content: "❌ Verificación rechazada.", embeds: interaction.message.embeds, components: [] });
    }
  }
};
