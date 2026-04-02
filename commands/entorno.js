const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 🔒 ROLES FUERZA PÚBLICA
const ROLES_FUERZA_PUBLICA = [
  "1463192290381271047",
  "1463192290381271043",
  "1463192290381271046", 
  "1463192290389528671", 
  "1463192290389528668", 
  "1463192290389528670"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("entorno")
    .setDescription("Reportar un entorno de rol"),

  permisos: "Fuerza Pública",

  async execute(interaction) {

    // 🔒 VERIFICAR ROLES
    const tieneRol = interaction.member.roles.cache.some(r =>
      ROLES_FUERZA_PUBLICA.includes(r.id)
    );

    if (!tieneRol) {
      return interaction.reply({
        content: "❌ No tienes permiso para usar este comando.",
        ephemeral: true
      });
    }

    const lugar = interaction.options.getString("lugar");
    const accion = interaction.options.getString("accion");
    const imagen = interaction.options.getAttachment("imagen");

    // Validar que sea imagen
    if (!imagen.contentType?.startsWith("image/")) {
      return interaction.reply({
        content: "❌ El archivo adjunto debe ser una **imagen**.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🌍 Entorno de Rol")
      .setColor(0x2ecc71)
      .addFields(
        { name: "📍 Lugar", value: lugar },
        { name: "⚠️ Acción", value: accion }
      )
      .setImage(imagen.url)
      .setFooter({
        text: `Reportado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
