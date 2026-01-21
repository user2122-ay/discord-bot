const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// ROLES AUTORIZADOS
const ROLES_AUTORIZADOS = [
  "1463192290381271047",
  "1463192290381271043",
  "1463192290381271046"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("arrestar")
    .setDescription("Registrar un arresto")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario arrestado")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo del arresto")
        .setRequired(true)
    )
    .addAttachmentOption(o =>
      o.setName("imagen")
        .setDescription("Imagen del arresto (obligatoria)")
        .setRequired(true)
    ),

  async execute(interaction) {
    // 🔒 Verificar rol
    const tieneRol = interaction.member.roles.cache.some(r =>
      ROLES_AUTORIZADOS.includes(r.id)
    );

    if (!tieneRol) {
      return interaction.reply({
        content: "❌ No tienes permiso para usar este comando.",
        ephemeral: true
      });
    }

    const usuario = interaction.options.getUser("usuario");
    const motivo = interaction.options.getString("motivo");
    const imagen = interaction.options.getAttachment("imagen");

    const embed = new EmbedBuilder()
      .setTitle("🚔 Arresto Registrado")
      .setColor(0xe74c3c)
      .setThumbnail(usuario.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "👤 Arrestado", value: `<@${usuario.id}>`, inline: true },
        { name: "👮 Arrestado por", value: `<@${interaction.user.id}>`, inline: true },
        { name: "📄 Motivo", value: motivo }
      )
      .setImage(imagen.url)
      .setFooter({
        text: "Gobierno de Los Santos RP",
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
