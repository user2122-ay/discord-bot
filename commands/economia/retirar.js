const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("retirar")
    .setDescription("Retirar dinero del banco")
    .addIntegerOption(o =>
      o.setName("cantidad").setRequired(true).setDescription("Cantidad")
    ),

  async execute(interaction) {
    const pool = interaction.pool;
    const cantidad = interaction.options.getInteger("cantidad");
    const userId = interaction.user.id;

    const res = await pool.query(
      "SELECT * FROM economia_usuarios WHERE user_id = $1",
      [userId]
    );

    if (!res.rows.length)
      return interaction.reply("❌ No tienes cuenta.");

    if (res.rows[0].banco < cantidad)
      return interaction.reply("❌ No tienes dinero en banco.");

    await pool.query(
      "UPDATE economia_usuarios SET banco = banco - $1, efectivo = efectivo + $1 WHERE user_id = $2",
      [cantidad, userId]
    );

    interaction.reply(`💵 Retiraste $${cantidad}`);
  }
};
