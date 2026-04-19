const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("top-dinero")
    .setDescription("Ranking de dinero"),

  async execute(interaction) {
    const pool = interaction.pool;

    const res = await pool.query(
      "SELECT * FROM economia_usuarios ORDER BY (efectivo + banco) DESC LIMIT 10"
    );

    if (!res.rows.length)
      return interaction.reply("❌ No hay datos.");

    let desc = "";

    for (let i = 0; i < res.rows.length; i++) {
      const user = res.rows[i];
      const member = await interaction.guild.members.fetch(user.user_id).catch(() => null);

      desc += `**${i + 1}. ${member?.user.username || "Usuario"}** - $${user.efectivo + user.banco}\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle("🏆 Top Dinero")
      .setDescription(desc)
      .setColor(0xffd700);

    interaction.reply({ embeds: [embed] });
  }
};
