const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  permisos: "👑 Administradores",

  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Enviar panel de verificación Roblox")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("✅ Verificación Roblox")
      .setDescription(
        [
          "# Panamá RP V2",
          "",
          "Para verificar tu cuenta sigue los pasos:",
          "",
          "**1.** Pulsa el botón de verificación.",
          "**2.** Escribe tu usuario de Roblox.",
          "**3.** Recibe tu código único.",
          "**4.** Coloca el código en tu descripción de Roblox.",
          "**5.** Pulsa comprobar.",
          "**6.** Espera la aprobación del staff.",
          "",
          "> Una vez aprobada tu solicitud recibirás acceso al servidor."
        ].join("\n")
      )
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({
        text: "Sistema de Verificación • Panamá RP V2"
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("roblox_verificar")
        .setLabel("Verificar Cuenta")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: "✅ Panel enviado correctamente.",
      ephemeral: true
    });
  }
};
