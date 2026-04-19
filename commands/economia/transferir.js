const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("transferir")
    .setDescription("Enviar dinero")
    .addUserOption(o => o.setName("usuario").setRequired(true).setDescription("Usuario"))
    .addIntegerOption(o => o.setName("cantidad").setRequired(true).setDescription("Cantidad")),

  async execute(interaction) {
    const pool = interaction.pool;

    const target = interaction.options.getUser("usuario");
    const cantidad = interaction.options.getInteger("cantidad");
    const senderId = interaction.user.id;

    const sender = await pool.query(
      "SELECT * FROM economia_usuarios WHERE user_id = $1",
      [senderId]
    );

    if (sender.rows[0].efectivo < cantidad)
      return interaction.reply("❌ No tienes dinero.");

    await pool.query(
      "INSERT INTO economia_usuarios (user_id) VALUES ($1) ON CONFLICT DO NOTHING",
      [target.id]
    );

    await pool.query(
      "UPDATE economia_usuarios SET efectivo = efectivo - $1 WHERE user_id = $2",
      [cantidad, senderId]
    );

    await pool.query(
      "UPDATE economia_usuarios SET efectivo = efectivo + $1 WHERE user_id = $2",
      [cantidad, target.id]
    );

    interaction.reply(`💸 Enviaste $${cantidad} a ${target}`);
  }
};
