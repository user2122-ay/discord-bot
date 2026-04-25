const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cedula")
    .setDescription("Ver cédula de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  permisos: "🌍 Todos",

  async execute(interaction) {

    const user = interaction.options.getUser("usuario");

    try {
      // 🔍 BUSCAR EN NUEVA TABLA
      const result = await interaction.pool.query(
        `SELECT * FROM "CIUDADANOS_PTY" WHERE discord_id = $1`,
        [user.id]
      );

      if (result.rows.length === 0) {
        return interaction.reply({
          content: "❌ Ese usuario no tiene cédula registrada.",
          ephemeral: true
        });
      }

      const d = result.rows[0];

      // 📄 EMBED NUEVO
      const embed = new EmbedBuilder()
        .setTitle("🪪 Cédula - Panamá RP V2")
        .setColor("#2b2d31")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(`📄 Información oficial del ciudadano`)
        .addFields(
          { name: "👤 Nombre", value: d.nombre_ic, inline: true },
          { name: "👤 Apellido", value: d.apellido_ic, inline: true },
          { name: "🎂 Edad", value: `${d.edad_ic}`, inline: true },
          { name: "📅 Nacimiento", value: d.nacimiento_ic, inline: true },
          { name: "🩸 Sangre", value: d.tipo_sangre, inline: true },
          { name: "🌎 Provincia", value: d.provincia_codigo, inline: true },
          { name: "🆔 Cédula", value: d.numero_cedula, inline: true }
        )
        .setFooter({
          text: "Gobierno de Panamá RP V2",
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);

      await interaction.reply({
        content: "❌ Error obteniendo la cédula",
        ephemeral: true
      });
    }
  }
};
