const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

async function getUser(pool, userId) {
  const res = await pool.query(
    "SELECT * FROM economia_usuarios WHERE user_id = $1",
    [userId]
  );

  if (res.rows.length === 0) {
    await pool.query(
      "INSERT INTO economia_usuarios (user_id) VALUES ($1)",
      [userId]
    );
    return { efectivo: 0, banco: 0 };
  }

  return res.rows[0];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Ver tu dinero"),

  permisos: "🌐 Todos",

  async execute(interaction) {
    const pool = interaction.pool;
    const user = await getUser(pool, interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle("🏦 Balance")
      .addFields(
        { name: "💵 Efectivo", value: `$${user.efectivo}`, inline: true },
        { name: "🏦 Banco", value: `$${user.banco}`, inline: true }
      )
      .setColor(0x00ffcc);

    interaction.reply({ embeds: [embed] });
  }
};
