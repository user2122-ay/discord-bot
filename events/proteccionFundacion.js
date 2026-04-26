const { EmbedBuilder } = require("discord.js");

// 🛡️ ROL FUNDACIÓN
const ROL_FUNDACION = "1497437860608081950";

module.exports = (client) => {

  client.on("messageCreate", async (message) => {

    if (message.author.bot) return;
    if (!message.guild) return;

    // 🔍 Si no hay menciones, salir
    if (!message.mentions.members.size) return;

    for (const member of message.mentions.members.values()) {

      // 🛡️ Si el usuario mencionado tiene el rol Fundación
      if (member.roles.cache.has(ROL_FUNDACION)) {

        // 🧹 BORRAR MENSAJE
        await message.delete().catch(() => {});

        // ⚠️ AVISO
        const aviso = await message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#e74c3c")
              .setDescription(
`🚫 <@${message.author.id}> no puedes mencionar a miembros de **Fundación**.

Respeta la normativa del servidor.`
              )
          ]
        });

        // ⏳ BORRAR AVISO EN 25s
        setTimeout(() => {
          aviso.delete().catch(() => {});
        }, 25000);

        break;
      }
    }

  });

};
