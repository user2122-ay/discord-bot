const { EmbedBuilder } = require("discord.js");

const ROL_FUNDACION   = "1497437860608081950";

// 🔑 ROL que puede usar !activarpro / !retirarpro (pon el ID de admin/staff)
const ROL_STAFF       = "1497437860608081950";

// 💾 Estado en memoria (true = activo)
let proteccionActiva = true;

module.exports = (client) => {

  client.on("messageCreate", async (message) => {

    if (message.author.bot) return;
    if (!message.guild) return;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎛️ COMANDOS DE TOGGLE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const content = message.content.trim().toLowerCase();

    if (content === "!activarpro" || content === "!retirarpro") {

      // Solo staff puede usar estos comandos
      if (!message.member.roles.cache.has(ROL_STAFF)) {
        return message.reply("❌ No tienes permisos para usar ese comando.")
          .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
      }

      if (content === "!activarpro") {
        proteccionActiva = true;
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#2ecc71")
              .setDescription("✅ **Protección Fundación activada.** Nadie podrá mencionar a sus miembros.")
          ]
        });
      }

      if (content === "!retirarpro") {
        proteccionActiva = false;
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#e67e22")
              .setDescription("⚠️ **Protección Fundación desactivada.** Las menciones están permitidas.")
          ]
        });
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛡️ PROTECCIÓN ACTIVA
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!proteccionActiva) return;
    if (!message.mentions.members?.size) return;

    // Ignorar si el autor también es Fundación
    if (message.member.roles.cache.has(ROL_FUNDACION)) return;

    for (const member of message.mentions.members.values()) {

      if (member.roles.cache.has(ROL_FUNDACION)) {

        // 🧹 Borrar mensaje original
        await message.delete().catch(() => {});

        // ⚠️ Enviar aviso
        const aviso = await message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#e74c3c")
              .setTitle("🚫 Mención no permitida")
              .setDescription(
                `<@${message.author.id}> no puedes mencionar a miembros de **Fundación**.\n\n` +
                `Respeta la normativa del servidor.`
              )
              .setFooter({ text: "Este aviso se eliminará en 25 segundos." })
              .setTimestamp()
          ]
        });

        // ⏳ Borrar aviso en 25s
        setTimeout(() => aviso.delete().catch(() => {}), 25000);

        break; // Con uno que tenga el rol, ya es suficiente
      }
    }

  });

};
