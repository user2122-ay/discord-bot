const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quitar-dinero")
    .setDescription("Quitar dinero")
    .addUserOption(o => o.setName("usuario").setRequired(true).setDescription("Usuario"))
    .addIntegerOption(o => o.setName("cantidad").setRequired(true).setDescription("Cantidad"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const pool = interaction.pool;
    const user = interaction.options.getUser("usuario");
    const cantidad = interaction.options.getInteger("cantidad");

    await pool.query(
      "UPDATE economia_usuarios SET efectivo = GREATEST(efectivo - $1, 0) WHERE user_id = $2",
      [cantidad, user.id]
    );

    interaction.reply(`💸 Quitado $${cantidad} a ${user}`);
  }
};
