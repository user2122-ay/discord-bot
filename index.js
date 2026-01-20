const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

function generarID() {
  return Math.floor(100000 + Math.random() * 900000);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("creardni")
    .setDescription("Crear DNI de Los Santos RP")
    .addStringOption(option =>
      option.setName("nombre")
        .setDescription("Nombre del ciudadano")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("apellido")
        .setDescription("Apellido del ciudadano")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("edad")
        .setDescription("Edad")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("fecha_nacimiento")
        .setDescription("Fecha de nacimiento (DD/MM/AAAA)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("sangre")
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
    const nombre = interaction.options.getString("nombre");
    const apellido = interaction.options.getString("apellido");
    const edad = interaction.options.getInteger("edad");
    const nacimiento = interaction.options.getString("fecha_nacimiento");
    const sangre = interaction.options.getString("sangre");

    const dniID = generarID();

    const embed = new EmbedBuilder()
      .setTitle("🪪 DNI OFICIAL — LOS SANTOS RP")
      .setColor(0x1E90FF)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: "👤 Nombre", value: `${nombre} ${apellido}`, inline: false },
        { name: "🎂 Edad", value: `${edad} años`, inline: true },
        { name: "📅 Fecha de nacimiento", value: nacimiento, inline: true },
        { name: "🩸 Tipo de sangre", value: sangre, inline: true },
        { name: "🆔 Número de DNI", value: `LS-${dniID}`, inline: false }
      )
      .setFooter({ text: "Gobierno de Los Santos | Documento RP" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
