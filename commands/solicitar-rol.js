const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags
} = require("discord.js");

const ROL_STAFF_LIMITE = "1451218164330401884";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("solicitar-rol")
    .setDescription("Solicita un rol en el servidor")
    .addRoleOption(opt =>
      opt.setName("rol")
        .setDescription("Rol que deseas solicitar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rolSolicitado = interaction.options.getRole("rol");
    const guild = interaction.guild;

    const rolLimite = guild.roles.cache.get(ROL_STAFF_LIMITE);
    if (!rolLimite) {
      return interaction.reply({ content: "❌ Error interno: rol límite no encontrado.", flags: MessageFlags.Ephemeral });
    }

    if (rolSolicitado.position >= rolLimite.position) {
      return interaction.reply({
        content: `❌ No puedes solicitar el rol **${rolSolicitado.name}** ya que es un rol de Staff o superior.`,
        flags: MessageFlags.Ephemeral
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`solicitar_modal_${rolSolicitado.id}`)
      .setTitle("📋 Solicitud de Rol");

    const razonInput = new TextInputBuilder()
      .setCustomId("razon")
      .setLabel("¿Por qué deseas este rol?")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Explica detalladamente tu razón...")
      .setRequired(true)
      .setMaxLength(500);

    const pruebasInput = new TextInputBuilder()
      .setCustomId("pruebas")
      .setLabel("Enlace de pruebas (imagen/video)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("https://imgur.com/... o https://cdn.discordapp.com/...")
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(razonInput),
      new ActionRowBuilder().addComponents(pruebasInput)
    );

    await interaction.showModal(modal);
  }
};
