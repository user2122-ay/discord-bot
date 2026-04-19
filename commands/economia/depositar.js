const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("depositar")
    .setDescription("Depositar dinero")
    .addIntegerOption(o =>
      o.setName("cantidad").setRequired(true).setDescription("Cantidad")
    ),

  async execute(interaction) {
    const pool = interaction.pool;
    const cantidad = interaction.options.getInteger("cantidad");
    const userId = interaction.user.id;

    const user = await pool.query(
      "SELECT * FROM economia_usuarios WHERE user_id = $1",
      [userId]
    );

    if (!user.rows.length)
      return interaction.reply("❌ No tienes cuenta.");

    if (user.rows[0].efectivo < cantidad)
      return interaction.reply("❌ No tienes efectivo.");

    await pool.query(
      "UPDATE economia_usuarios SET efectivo = efectivo - $1, banco = banco + $1 WHERE user_id = $2",
      [cantidad, userId]
    );

    interaction.reply(`🏦 Depositaste $${cantidad}`);
  }
};
