const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 🔧 CONFIGURACIÓN
const ROL_AUTORIZADO = "1463192290372620334";
const CANAL_PERMITIDO = "1463192291501019319";
const ROL_PING = "1463192289974157340";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("noticia")
    .setDescription("Publicar una noticia RP")

    .addStringOption(o =>
      o.setName("tipo")
        .setDescription("Nivel de la noticia")
        .setRequired(true)
        .addChoices(
          { name: "🟢 Leve", value: "leve" },
          { name: "🟡 Mediano", value: "mediano" },
          { name: "🔴 Urgente", value: "urgente" }
        )
    )

    .addStringOption(o =>
      o.setName("canal")
        .setDescription("Nombre del canal de noticias")
        .setRequired(true)
    )

    .addStringOption(o =>
      o.setName("informacion")
        .setDescription("Información de la noticia")
        .setRequired(true)
    )

    .addAttachmentOption(o =>
      o.setName("logo")
        .setDescription("Logo del canal (imagen)")
        .setRequired(true)
    )

    .addAttachmentOption(o =>
      o.setName("imagenes")
        .setDescription("Imágenes de los hechos (opcional)")
        .setRequired(false)
    ),

  permisos: "Noticieros",

  async execute(interaction) {

    // 🚫 Canal incorrecto
    if (interaction.channel.id !== CANAL_PERMITIDO) {
      return interaction.reply({
        content: "⛔ Este comando solo puede usarse en el canal autorizado.",
        ephemeral: true
      });
    }

    // 🚫 Rol no autorizado
    if (!interaction.member.roles.cache.has(ROL_AUTORIZADO)) {
      return interaction.reply({
        content: "⛔ No tienes permisos para usar este comando.",
        ephemeral: true
      });
    }

    // 📥 Datos
    const tipo = interaction.options.getString("tipo");
    const canal = interaction.options.getString("canal");
    const info = interaction.options.getString("informacion");
    const logo = interaction.options.getAttachment("logo");
    const imagenes = interaction.options.getAttachment("imagenes");

    // 📰 Embed (SIN mostrar el tipo)
    const embed = new EmbedBuilder()
      .setTitle(`📰 ${canal}`)
      .setDescription(info)
      .setColor(0xe67e22)
      .setThumbnail(logo.url)
      .setFooter({
        text: `Publicado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    if (imagenes) {
      embed.setImage(imagenes.url);
    }

    // 🎯 SOLO PING SI ES URGENTE
    const contenido = tipo === "urgente" ? `<@&${ROL_PING}>` : null;

    // 📢 ENVIAR
    await interaction.reply({
      content: contenido,
      embeds: [embed],
      allowedMentions: tipo === "urgente" ? { roles: [ROL_PING] } : {}
    });
  }
};
