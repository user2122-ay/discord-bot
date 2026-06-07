const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  MessageFlags
} = require("discord.js");

module.exports = {
  permisos: "🛡️ Administrador",

  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Enviar panel de verificación Roblox")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {

    const container = new ContainerBuilder()
      .setAccentColor(0x57f287)

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ✅ Verificación Roblox\n` +
          `# Panamá RP V2\n` +
          `-# Sistema Oficial de Verificación`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `Para acceder al servidor debes vincular tu cuenta de Roblox.\n` +
          `Sigue los pasos a continuación:\n\n` +
          `> **1.** Pulsa el botón **Verificar Cuenta**\n` +
          `> **2.** Escribe tu usuario de Roblox\n` +
          `> **3.** Responde algunas preguntas rápidas\n` +
          `> **4.** Recibirás un código único\n` +
          `> **5.** Coloca el código en tu **descripción de Roblox**\n` +
          `> **6.** Pulsa **Comprobar** y espera aprobación del staff`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `> ⚠️ Una vez aprobada tu solicitud recibirás acceso completo al servidor.`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(false)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# © Panamá RP V2 | Sistema de Verificación`
        )
      );

    const boton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("roblox_verificar")
        .setLabel("Verificar Cuenta")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container, boton]
    });

    await interaction.reply({
      content: "✅ Panel enviado correctamente.",
      ephemeral: true
    });
  }
};
