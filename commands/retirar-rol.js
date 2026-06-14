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
    .setName("retirar-rol")
    .setDescription("Solicita el retiro de un rol")
    .addRoleOption(opt =>
      opt.setName("rol")
        .setDescription("Rol que deseas retirar")
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
        content: `❌ No puedes solicitar el retiro del rol **${rolSolicitado.name}** ya que es un rol de Staff o superior.`,
        flags: MessageFlags.Ephemeral
      });
    }

    const modal = new ModalBuilder()
      .setCustomId(`retirar_modal_${rolSolicitado.id}`)
      .setTitle("📋 Retiro de Rol");

    const razonInput = new TextInputBuilder()
      .setCustomId("razon")
      .setLabel("¿Por qué deseas retirar este rol?")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Explica tu razón...")
      .setRequired(true)
      .setMaxLength(500);

    modal.addComponents(
      new ActionRowBuilder().addComponents(razonInput)
    );

    await interaction.showModal(modal);
  }
};
