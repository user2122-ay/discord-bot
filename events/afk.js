const { EmbedBuilder } = require("discord.js");
const { afkUsers } = require("../commands/afk");

module.exports = (client) => {

  client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    const userId = message.author.id;

    // 🔓 Quitar AFK
    if (afkUsers.has(userId)) {
      const data = afkUsers.get(userId);
      afkUsers.delete(userId);

      const tiempo = Math.floor((Date.now() - data.tiempo) / 1000);

      const embed = new EmbedBuilder()
        .setColor("#57f287")
        .setTitle("👋 Bienvenido de vuelta")
        .setDescription("Ya no estás en modo AFK")
        .addFields(
          { name: "⏱ Tiempo AFK", value: `${tiempo}s`, inline: true }
        )
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      message.reply({ embeds: [embed] });
    }

    // 🔔 Avisar AFK
    message.mentions.users.forEach(user => {
      if (afkUsers.has(user.id)) {

        const data = afkUsers.get(user.id);
        const tiempo = Math.floor((Date.now() - data.tiempo) / 1000);

        const embed = new EmbedBuilder()
          .setColor("#f1c40f")
          .setTitle("🌙 Usuario AFK")
          .setDescription(`<@${user.id}> está ausente`)
          .addFields(
            { name: "📝 Motivo", value: data.motivo, inline: false },
            { name: "⏱ Tiempo", value: `${tiempo}s`, inline: true }
          )
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setTimestamp();

        message.reply({ embeds: [embed] });
      }
    });

  });

};
