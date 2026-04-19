const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("añadir-dinero")
    .setDescription("Añadir dinero")
    .addUserOption(o => o.setName("usuario").setRequired(true).setDescription("Usuario"))
    .addIntegerOption(o => o.setName("cantidad").setRequired(true).setDescription("Cantidad"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const pool = interaction.pool;
    const user = interaction.options.getUser("usuario");
    const cantidad = interaction.options.getInteger("cantidad");

    await pool.query(
      "INSERT INTO economia_usuarios (user_id) VALUES ($1) ON CONFLICT DO NOTHING",
      [user.id]
    );

    await pool.query(
      "UPDATE economia_usuarios SET efectivo = efectivo + $1 WHERE user_id = $2",
      [cantidad, user.id]
    );

    interaction.reply(`💰 Añadido $${cantidad} a ${user}`);
  }
};
