const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verdni")
    .setDescription("Ver DNI de un usuario")
    .addUserOption(o => o.setName("usuario").setDescription("Usuario").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("usuario");
    const data = JSON.parse(fs.readFileSync("./dniData.json"));

    if (!data[user.id]) {
      return interaction.reply({ content: "❌ Ese usuario no tiene DNI", ephemeral: true });
    }

    const d = data[user.id];

    const embed = new EmbedBuilder()
      .setTitle("🪪 DNI - MIAMI HISPANO RP")
      .setColor(0x2ecc71)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "👤 Nombre IC", value: d.nombre, inline: true },
        { name: "👤 Apellido IC", value: d.apellido, inline: true },
        { name: "🎂 Edad IC", value: `${d.edad}`, inline: true },
        { name: "📅 Nacimiento", value: d.nacimiento, inline: true },
        { name: "🩸 Sangre", value: d.sangre, inline: true },
        { name: "🆔 DNI", value: `${d.dni}`, inline: true }
      )
      .setFooter({
        text: `MIAMI HISPANO RP | ${new Date().toLocaleDateString()}`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
