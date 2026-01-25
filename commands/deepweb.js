const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 🔧 CONFIGURACIÓN
const CANAL_DEEPWEB = "1465098377120452628";
const LOGO_URL = "https://media.discordapp.net/stickers/1465099204404842608.png";

module.exports = {
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
      .setTitle("🕶️ Deep Web | Mensaje Anónimo")
      .setDescription(mensajeDW)
      .setColor(0x000000)
      .setThumbnail(LOGO_URL)
      .setFooter({
        text: "Fuente anónima • Deep Web",
      })
      .setTimestamp();

    const msg = await canal.send({
      embeds: [embed]
    });

    // 👍👎 Reacciones (opcional pero queda 🔥)
    await msg.react("👍");
    await msg.react("👎");

    await interaction.reply({
      content: "🕶️ Tu mensaje fue enviado de forma anónima.",
      ephemeral: true
    });
  }
};
