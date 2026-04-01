const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

function generarDNI() {
  return Math.floor(100000 + Math.random() * 900000);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("creardni")
    .setDescription("Crear DNI IC")
    .addStringOption(o => o.setName("nombre").setDescription("Nombre").setRequired(true))
    .addStringOption(o => o.setName("apellido").setDescription("Apellido").setRequired(true))
    .addIntegerOption(o => o.setName("edad").setDescription("Edad").setRequired(true))
    .addStringOption(o => o.setName("fecha").setDescription("Fecha de nacimiento").setRequired(true))
    .addStringOption(o => o.setName("sangre").setDescription("Tipo de sangre").setRequired(true)),

  async execute(interaction) {

    const nombre = interaction.options.getString("nombre");
    const apellido = interaction.options.getString("apellido");
    const edad = interaction.options.getInteger("edad");
    const fecha = interaction.options.getString("fecha");
    const sangre = interaction.options.getString("sangre");

    const dni = `LS-${generarDNI()}`;

    try {
      // 💾 GUARDAR EN LA BASE DE DATOS
      await interaction.pool.query(
        `INSERT INTO "DNI_LS"
        (user_id, nombre, apellido, edad, fecha_nacimiento, sangre, dni_numero)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          interaction.user.id,
          nombre,
          apellido,
          edad,
          fecha,
          sangre,
          dni
        ]
      );

      // 📄 RESPUESTA
      const embed = new EmbedBuilder()
        .setTitle("🪪 DNI CREADO")
        .setColor("Green")
        .addFields(
          { name: "Nombre", value: `${nombre} ${apellido}` },
          { name: "Edad", value: `${edad}` },
          { name: "DNI", value: dni }
        );

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "❌ Error guardando en la base de datos",
        ephemeral: true
      });
    }
  }
};
