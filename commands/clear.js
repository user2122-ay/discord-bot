const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Eliminar mensajes de un canal")
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de mensajes a eliminar (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addChannelOption(option =>
      option
        .setName("canal")
        .setDescription("Canal donde borrar mensajes")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // 🔒 SOLO ADMINS

  async execute(interaction) {

    const cantidad = interaction.options.getInteger("cantidad");
    const canal = interaction.options.getChannel("canal");

    // ⚠️ Validar canal
    if (!canal.isTextBased()) {
      return interaction.reply({
        content: "❌ Ese canal no es válido.",
        ephemeral: true
      });
    }

    try {
      const mensajes = await canal.bulkDelete(cantidad, true);

      await interaction.reply({
        content: `🧹 Se eliminaron **${mensajes.size} mensajes** en <#${canal.id}>.`,
        ephemeral: true
      });

    } catch (error) {
      console.error(error);

      await interaction.reply({
        content: "❌ Error al eliminar mensajes. Puede que sean muy antiguos (más de 14 días).",
        ephemeral: true
      });
    }
  }
};
