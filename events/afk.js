const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags
} = require("discord.js");

const { afkUsers } = require("../commands/afk");

// ⏱ Formatear tiempo bonito
function formatTiempo(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s} segundos`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}min`;
}

module.exports = (client) => {

  client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    const userId = message.author.id;

    // ==============================
    // 🔓 QUITAR AFK
    // ==============================
    if (afkUsers.has(userId)) {

      const data   = afkUsers.get(userId);
      afkUsers.delete(userId);
      const tiempo = formatTiempo(Date.now() - data.tiempo);

      try { await message.member.setNickname(data.nickOriginal); } catch {}

      const container = new ContainerBuilder()
        .setAccentColor(0x57f287)

        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `## 👋 ¡Bienvenido de vuelta!\n` +
                `-# Ya no estás en modo AFK, <@${userId}>`
              )
            )
            .setThumbnailAccessory(
              new ThumbnailBuilder().setURL(
                message.author.displayAvatarURL({ extension: "png", size: 256 })
              )
            )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `⏱ **Tiempo AFK:** ${tiempo}`
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(false)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# ${new Date().toLocaleString("es-PA")}`
          )
        );

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container]
      });
    }

    // ==============================
    // 🔔 AVISAR AFK
    // ==============================
    for (const user of message.mentions.users.values()) {

      if (!afkUsers.has(user.id)) continue;

      const data   = afkUsers.get(user.id);
      const tiempo = formatTiempo(Date.now() - data.tiempo);

      const container = new ContainerBuilder()
        .setAccentColor(0xf1c40f)

        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `## 🌙 Usuario AFK\n` +
                `-# <@${user.id}> está ausente en este momento`
              )
            )
            .setThumbnailAccessory(
              new ThumbnailBuilder().setURL(
                user.displayAvatarURL({ extension: "png", size: 256 })
              )
            )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `📝 **Motivo:** ${data.motivo}\n` +
            `⏱ **Ausente hace:** ${tiempo}`
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(false)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# Intenta contactarlo más tarde`
          )
        );

      await message.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container]
      });
    }

  });

};
