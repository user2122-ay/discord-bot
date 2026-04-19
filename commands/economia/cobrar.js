const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cobrar")
    .setDescription("Cobrar sueldo"),

  async execute(interaction) {
    const pool = interaction.pool;
    const userId = interaction.user.id;

    const userRes = await pool.query(
      "SELECT * FROM economia_usuarios WHERE user_id = $1",
      [userId]
    );

    if (!userRes.rows.length)
      return interaction.reply("❌ No tienes cuenta.");

    const user = userRes.rows[0];

    const cooldown = 6 * 24 * 60 * 60 * 1000;
    if (Date.now() - user.last_claim < cooldown)
      return interaction.reply("⏳ Espera 6 días para cobrar.");

    let total = 0;

    for (const role of interaction.member.roles.cache.values()) {
      const sueldo = await pool.query(
        "SELECT sueldo FROM economia_sueldos WHERE role_id = $1",
        [role.id]
      );

      if (sueldo.rows.length) {
        total += sueldo.rows[0].sueldo;
      }
    }

    if (total <= 0)
      return interaction.reply("❌ No tienes sueldo.");

    const impuesto = Math.floor(total * 0.1);
    const final = total - impuesto;

    await pool.query(
      "UPDATE economia_usuarios SET efectivo = efectivo + $1, last_claim = $2 WHERE user_id = $3",
      [final, Date.now(), userId]
    );

    interaction.reply(`💰 Cobraste $${final} (Impuesto: $${impuesto})`);
  }
};
