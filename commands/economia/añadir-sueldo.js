const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("añadir-sueldo")
    .setDescription("Asignar sueldo a rol")
    .addRoleOption(o => o.setName("rol").setRequired(true).setDescription("Rol"))
    .addIntegerOption(o => o.setName("cantidad").setRequired(true).setDescription("Cantidad"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const pool = interaction.pool;
    const rol = interaction.options.getRole("rol");
    const cantidad = interaction.options.getInteger("cantidad");

    await pool.query(
      "INSERT INTO economia_sueldos (role_id, sueldo) VALUES ($1, $2) ON CONFLICT (role_id) DO UPDATE SET sueldo = $2",
      [rol.id, cantidad]
    );

    interaction.reply(`💼 Sueldo de ${rol} actualizado a $${cantidad}`);
  }
};
