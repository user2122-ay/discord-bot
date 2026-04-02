const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verdni")
    .setDescription("Ver DNI de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("usuario");

    try {
      const result = await interaction.pool.query(
        `SELECT * FROM "DNI_LS" WHERE user_id = $1`,
        [user.id]
      );

      if (!result.rows || result.rows.length === 0) {
        return interaction.reply({
          content: "❌ Ese usuario no tiene DNI registrado.",
          ephemeral: true
        });
      }

      const d = result.rows[0];

      const embed = new EmbedBuilder()
        .setTitle("🪪 Documento Nacional de Identidad")
        .setColor(0x2ecc71)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "👤 Nombre IC", value: d.nombre || "No registrado", inline: true },
          { name: "👤 Apellido IC", value: d.apellido || "No registrado", inline: true },
          { name: "🎂 Edad IC", value: d.edad ? `${d.edad}` : "No registrado", inline: true },
          { name: "📅 Nacimiento", value: d.fecha_nacimiento || "No registrado", inline: true },
          { name: "🩸 Sangre", value: d.sangre || "No registrado", inline: true },
          { name: "🆔 DNI", value: d.dni_numero || "No registrado", inline: true }
        )
        .setFooter({
          text: `Los Santos RP • ${new Date().toLocaleDateString()}`,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error("❌ Error en /verdni:", error);

      await interaction.reply({
        content: "❌ Ocurrió un error al obtener el DNI.",
        ephemeral: true
      });
    }
  }
};
