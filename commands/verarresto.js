const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "arrestos.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verarresto")
    .setDescription("Ver los arrestos de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario a consultar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    let data = {};
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch { data = {}; }

    if (!data[usuario.id] || data[usuario.id].length === 0) {
      return interaction.reply({ content: "❌ Este usuario no tiene arrestos registrados.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`📋 Arrestos de ${usuario.username}`)
      .setColor(0xf1c40f)
      .setThumbnail(usuario.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: "Gobierno de Los Santos RP",
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    // Agregar cada arresto al embed
    data[usuario.id].forEach((a, i) => {
      embed.addFields({
        name: `Arresto #${i + 1} - ${new Date(a.fecha).toLocaleString()}`,
        value: `**Moderador:** <@${a.moderador}>\n**Motivo:** ${a.motivo}\n**Lugar:** ${a.lugar}\n[Imagen](${a.imagen})`
      });
    });

    await interaction.reply({ embeds: [embed] });
  }
};
