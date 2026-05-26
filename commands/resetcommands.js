const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  permisos: "👑 Administradores",

  data: new SlashCommandBuilder()
    .setName("resetcommands")
    .setDescription("Elimina todos los comandos del servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {

    try {

      await interaction.guild.commands.set([]);

      await interaction.reply({
        content: "✅ Todos los comandos del servidor fueron eliminados.",
        ephemeral: true
      });

    } catch (err) {
      console.error(err);

      await interaction.reply({
        content: "❌ Error eliminando comandos.",
        ephemeral: true
      });
    }
  }
};
