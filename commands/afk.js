const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 🧠 memoria
const afkUsers = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Ponerte en modo AFK")
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo del AFK")
        .setRequired(false)
    ),

  permisos: "🌍 Todos",

  async execute(interaction) {

    const motivo = interaction.options.getString("motivo") || "Sin motivo";

    afkUsers.set(interaction.user.id, {
      motivo,
      tiempo: Date.now()
    });

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle("🌙 Modo AFK activado")
      .setDescription(`Has entrado en AFK correctamente.`)
      .addFields(
        { name: "📝 Motivo", value: motivo, inline: false }
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: "Sistema AFK • Panamá RP V2",
        iconURL: interaction.guild.iconURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};

// exportar memoria
module.exports.afkUsers = afkUsers;
