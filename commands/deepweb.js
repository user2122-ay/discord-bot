const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 🔧 CONFIGURACIÓN
const CANAL_DEEPWEB = "1465098377120452628";
const LOGO_URL = "https://cdn.discordapp.com/attachments/1463192290469085257/1465099204182413353/images_1769377256855.jpg";

module.exports = {
  permisos: "🌐 Todos", // 👈 AÑADIDO

  data: new SlashCommandBuilder()
    .setName("deepweb")
    .setDescription("Enviar un mensaje anónimo a la Deep Web")
    .addStringOption(o =>
      o.setName("mensaje")
        .setDescription("Mensaje anónimo")
        .setRequired(true)
    ),

  async execute(interaction) {
    const mensajeDW = interaction.options.getString("mensaje");

    const canal = interaction.guild.channels.cache.get(CANAL_DEEPWEB);
    if (!canal) {
      return interaction.reply({
        content: "❌ No se encontró el canal de Deep Web.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🕶️ Deep Web")
      .setDescription(mensajeDW)
      .setColor(0x000000)
      .setThumbnail(LOGO_URL)
      .setFooter({
        text: "Mensaje anónimo • Deep Web"
      })
      .setTimestamp();

    await canal.send({
      embeds: [embed]
    });

    await interaction.reply({
      content: "🕶️ Tu mensaje fue enviado de forma anónima.",
      ephemeral: true
    });
  }
};
