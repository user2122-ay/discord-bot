const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require("discord.js");

const ROL_FUNDACION = "1497437860608081950";
const ROL_STAFF     = "1497437860608081950";

let proteccionActiva = true;

module.exports = (client) => {

  client.on("messageCreate", async (message) => {

    if (message.author.bot) return;
    if (!message.guild) return;

    const content = message.content.trim().toLowerCase();

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎛️ COMANDOS DE TOGGLE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (content === "!activarpro" || content === "!retirarpro") {

      if (!message.member.roles.cache.has(ROL_STAFF)) {
        const sinPermisos = new ContainerBuilder()
          .setAccentColor(0xe74c3c)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "## ❌ Sin permisos\nNo tienes permisos para usar ese comando."
            )
          );

        return message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [sinPermisos]
        }).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
      }

      if (content === "!activarpro") {
        proteccionActiva = true;

        const container = new ContainerBuilder()
          .setAccentColor(0x2ecc71)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "## ✅ Protección activada"
            )
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "La protección de **Fundación** está ahora **activa**.\nNadie podrá mencionar a sus miembros."
            )
          );

        return message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [container]
        });
      }

      if (content === "!retirarpro") {
        proteccionActiva = false;

        const container = new ContainerBuilder()
          .setAccentColor(0xe67e22)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "## ⚠️ Protección desactivada"
            )
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "La protección de **Fundación** está ahora **desactivada**.\nLas menciones están permitidas temporalmente."
            )
          );

        return message.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [container]
        });
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛡️ PROTECCIÓN
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!proteccionActiva) return;
    if (!message.mentions.members?.size) return;
    if (message.member.roles.cache.has(ROL_FUNDACION)) return;

    for (const member of message.mentions.members.values()) {

      if (member.roles.cache.has(ROL_FUNDACION)) {

        await message.delete().catch(() => {});

        const aviso = new ContainerBuilder()
          .setAccentColor(0xe74c3c)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "## 🚫 Mención no permitida"
            )
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(true)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `<@${message.author.id}> no puedes mencionar a miembros de **Fundación**.\nRespeta la normativa del servidor.`
            )
          )
          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(false)
          )
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "-# Este aviso se eliminará en 25 segundos."
            )
          );

        const msg = await message.channel.send({
          flags: MessageFlags.IsComponentsV2,
          components: [aviso]
        });

        setTimeout(() => msg.delete().catch(() => {}), 25000);

        break;
      }
    }

  });

};
