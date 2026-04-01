const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verdni")
    .setDescription("Ver DNI de un usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("usuario");

    try {
      // 🔥 BUSCAR EN LA BASE DE DATOS
      const result = await interaction.pool.query(
        `SELECT * FROM "DNI_LS" WHERE user_id = $1`,
        [user.id]
      );

      if (result.rows.length === 0) {
        return interaction.reply({
          content: "❌ Ese usuario no tiene DNI",
          ephemeral: true
        });
      }

      const d = result.rows[0];

      const embed = new EmbedBuilder()
        .setTitle("🪪 DNI - MIAMI HISPANO RP")
        .setColor(0x2ecc71)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "👤 Nombre IC", value: d.nombre, inline: true },
          { name: "👤 Apellido IC", value: d.apellido, inline: true },
          { name: "🎂 Edad IC", value: `${d.edad}`, inline: true },
          { name: "📅 Nacimiento", value: d.fecha_nacimiento, inline: true },
          { name: "🩸 Sangre", value: d.sangre, inline: true },
          { name: "🆔 DNI", value: d.dni_numero, inline: true }
        )
        .setFooter({
          text: `Los Santos RP | ${new Date().toLocaleDateString()}`,
          iconURL: interaction.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ Error obteniendo el DNI",
        ephemeral: true
      });
    }
  }
};
