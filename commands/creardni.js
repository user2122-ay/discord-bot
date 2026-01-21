const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("creardni")
    .setDescription("Crear DNI IC")
    .addStringOption(o => o.setName("nombre").setDescription("Nombre IC").setRequired(true))
    .addStringOption(o => o.setName("apellido").setDescription("Apellido IC").setRequired(true))
    .addIntegerOption(o => o.setName("edad").setDescription("Edad IC").setRequired(true))
    .addStringOption(o => o.setName("nacimiento").setDescription("Fecha de nacimiento").setRequired(true))
    .addStringOption(o =>
      o.setName("sangre")
        .setDescription("Tipo de sangre")
        .setRequired(true)
        .addChoices(
          { name: "O+", value: "O+" },
          { name: "O-", value: "O-" },
          { name: "A+", value: "A+" },
          { name: "A-", value: "A-" },
          { name: "B+", value: "B+" },
          { name: "B-", value: "B-" },
          { name: "AB+", value: "AB+" },
          { name: "AB-", value: "AB-" }
        )
    ),

  async execute(interaction) {
    const data = JSON.parse(fs.readFileSync("./dniData.json"));
    const dni = Math.floor(10000000 + Math.random() * 90000000);

    data[interaction.user.id] = {
      nombre: interaction.options.getString("nombre"),
      apellido: interaction.options.getString("apellido"),
      edad: interaction.options.getInteger("edad"),
      nacimiento: interaction.options.getString("nacimiento"),
      sangre: interaction.options.getString("sangre"),
      dni
    };

    fs.writeFileSync("./dniData.json", JSON.stringify(data, null, 2));

    const embed = new EmbedBuilder()
      .setTitle("🪪 Documento Nacional de Identidad")
      .setColor(0x3498db)
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "👤 Nombre IC", value: data[interaction.user.id].nombre, inline: true },
        { name: "👤 Apellido IC", value: data[interaction.user.id].apellido, inline: true },
        { name: "🎂 Edad IC", value: `${data[interaction.user.id].edad}`, inline: true },
        { name: "📅 Nacimiento", value: data[interaction.user.id].nacimiento, inline: true },
        { name: "🩸 Sangre", value: data[interaction.user.id].sangre, inline: true },
        { name: "🆔 DNI", value: `${dni}`, inline: true }
      )
      .setFooter({
        text: `Gobierno de Los Santos RP | ${new Date().toLocaleDateString()}`,
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
