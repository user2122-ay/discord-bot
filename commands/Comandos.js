const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("comandos")
    .setDescription("Ver todos los comandos del bot y sus permisos"),

  async execute(interaction) {

    const comandos = interaction.client.commands;

    if (!comandos || comandos.size === 0) {
      return interaction.reply({
        content: "❌ No hay comandos cargados.",
        ephemeral: true
      });
    }

    let descripcion = "";

    comandos.forEach(cmd => {
      const nombre = cmd.data.name;
      const desc = cmd.data.description || "Sin descripción";
      const permisos = cmd.permisos || "Ninguno";

      descripcion += `**/${nombre}**\n📄 ${desc}\n🔒 Permisos: ${permisos}\n\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle("📜 Comandos del Bot")
      .setDescription(descripcion)
      .setColor(0x00AEFF)
      .setFooter({ text: `Total: ${comandos.size} comandos` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
