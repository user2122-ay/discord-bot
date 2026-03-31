const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// 🔒 Rol que PUEDE USAR el comando (STAFF)
const ROL_AUTORIZADO = "1463192290423083324";

// 📢 Rol al que SE HACE PING
const ROL_PING = "1463192290360295646";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sesion")
    .setDescription("Sesiones y votaciones")
    .addSubcommand(s => s.setName("abrir_votacion").setDescription("Abrir votación"))
    .addSubcommand(s => s.setName("cerrar_votacion").setDescription("Cerrar votación"))
    .addSubcommand(s => s.setName("abrir").setDescription("Abrir sesión"))
    .addSubcommand(s => s.setName("cerrar").setDescription("Cerrar sesión")),

  async execute(interaction) {

    // 🔒 VERIFICAR ROL STAFF
    if (!interaction.member.roles.cache.has(ROL_AUTORIZADO)) {
      return interaction.reply({
        content: "⛔ **No tienes permisos para usar este comando.**",
        ephemeral: true
      });
    }

    let desc = "";
    let color = 0x3498db;

    if (interaction.options.getSubcommand() === "abrir_votacion") {
      desc =
        "🗳️ **Se abre oficialmente la votación para decidir la apertura del servidor de ER:LC.**\n\n" +
        "Los miembros habilitados podrán emitir su voto mediante las reacciones correspondientes.\n" +
        "La votación estará disponible por tiempo limitado.\n\n" +
        "Se solicita votar con responsabilidad.";
      color = 0xf1c40f;

      const embed = new EmbedBuilder()
        .setTitle("📢 Staff de Los Santos RP")
        .setDescription(desc)
        .setColor(color)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({
          text: `Moderador: ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      const mensaje = await interaction.reply({
        content: `<@&${ROL_PING}>`,
        embeds: [embed],
        allowedMentions: { roles: [ROL_PING] }, // ✅ PING REAL
        fetchReply: true
      });

      await mensaje.react("✅");
      await mensaje.react("❌");
      return;
    }

    if (interaction.options.getSubcommand() === "cerrar_votacion") {
      desc =
        "🔒 **La votación para la apertura del servidor de ER:LC ha sido cerrada.**\n\n" +
        "Agradecemos a todos los que participaron.\n" +
        "El resultado será anunciado a continuación.";
      color = 0xe74c3c;
    }

    if (interaction.options.getSubcommand() === "abrir") {
      desc =
        "🟢 **Tras el resultado de la votación, el servidor de ER:LC queda oficialmente abierto para rolear.**\n\n" +
        "Todas las normativas del servidor están activas.\n" +
        "Se solicita rol serio, respeto y cooperación con el staff.\n\n" +
        "📌 **Código:** `CODIGO`\n\n" +
        "¡Buen rol para todos!";
    }

    if (interaction.options.getSubcommand() === "cerrar") {
      desc =
        "🔴 **El servidor de ER:LC queda cerrado por el momento.**\n\n" +
        "Agradecemos la participación y el buen rol de todos los usuarios.\n" +
        "Cualquier novedad será comunicada por los canales oficiales.";
      color = 0x95a5a6;
    }

    const embed = new EmbedBuilder()
      .setTitle("📢 Staff de MIAMI HISPANO RP")
      .setDescription(desc)
      .setColor(color)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({
        text: `Moderador: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({
      content: `<@&${ROL_PING}>`,
      embeds: [embed],
      allowedMentions: { roles: [ROL_PING] } // ✅ PING REAL
    });
  }
};
