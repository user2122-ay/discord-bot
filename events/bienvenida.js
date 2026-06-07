const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  SeparatorSpacingSize,
  MessageFlags
} = require("discord.js");

module.exports = (client) => {

  const CANAL_BIENVENIDA = "1451018651351384199";

  const COLORES = [
    0x5865F2,
    0x2ecc71,
    0xe74c3c,
    0xe67e22,
    0x9b59b6,
    0x1abc9c,
    0xf1c40f,
    0xe91e63,
    0x3498db,
    0xff5722,
  ];

  client.on("guildMemberAdd", async (member) => {

    const canal = await member.guild.channels.fetch(CANAL_BIENVENIDA).catch(() => null);
    if (!canal) return;

    const color = COLORES[Math.floor(Math.random() * COLORES.length)];

    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("✅ Verificarse")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.com/channels/1345956472986796183/1459259725131809069"),

      new ButtonBuilder()
        .setLabel("📜 Normativa")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.com/channels/1345956472986796183/1451018653259792536"),

      new ButtonBuilder()
        .setLabel("🎭 Conceptos de Rol")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.com/channels/1345956472986796183/1451771796918636697")
    );

    const container = new ContainerBuilder()
      .setAccentColor(color)

      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL("https://cdn.discordapp.com/attachments/1513007784990474270/1513007957410054304/file_00000000777871f5b9b5a9be5e994d56.png?ex=6a2629f7&is=6a24d877&hm=b198fcbd41d1606069130aebf97cacc9785f7211a9019118588be5cf731bb63a&")
            .setDescription("Panamá RP V2")
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 👋 ¡Bienvenido/a a Panamá RP V2! 🌴\n` +
          `<@${member.id}> nos alegra tenerte en esta ciudad donde cada decisión cuenta y cada historia deja huella.\n\n` +
          `Panamá RP V2 es un servidor enfocado en el rol **serio, realista y respetuoso**, donde podrás desarrollar a tu personaje desde cero y vivir experiencias únicas dentro de un entorno activo y organizado.`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `📌 **Antes de comenzar:**\n` +
          `> • Lee atentamente las **normativas** del servidor.\n` +
          `> • Elige tu rol y facción con **responsabilidad**.\n` +
          `> • Mantén siempre el **respeto** hacia la comunidad y el staff.`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `🔽 **Usa los botones para comenzar tu experiencia:**`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(false)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# © Panamá RP V2 | Todos los derechos reservados®`
        )
      );

    // ✅ Sin "content" — no es compatible con IsComponentsV2
    await canal.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container, botones]
    });

  });

};
