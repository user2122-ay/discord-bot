const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags
} = require("discord.js");

const User  = require("../models/User");
const Multa = require("../models/Multa");

const ROLES_AUTORIZADOS = [
  "1451018375286226957",
  "1451018385801351219"
];

module.exports = {
  permisos:  "👮 Fuerza Pública",
  categoria: "rol",

  data: new SlashCommandBuilder()
    .setName("multar")
    .setDescription("Registrar una multa vehicular")

    // ✅ REQUIRED PRIMERO
    .addStringOption(o =>
      o.setName("placa")
        .setDescription("Placa del vehículo")
        .setRequired(true)
    )
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario multado")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("lugar")
        .setDescription("Lugar de la infracción")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo de la multa")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("monto")
        .setDescription("Monto de la multa en $")
        .setRequired(true)
    )
    .addAttachmentOption(o =>
      o.setName("imagen")
        .setDescription("Imagen de evidencia")
        .setRequired(true)
    )

    // ✅ OPTIONAL AL FINAL
    .addUserOption(o =>
      o.setName("companero")
        .setDescription("Compañero en el operativo")
        .setRequired(false)
    ),

  async execute(interaction) {

    if (!interaction.member.roles.cache.some(r => ROLES_AUTORIZADOS.includes(r.id))) {
      return interaction.reply({
        content: "⛔ No tienes permisos para usar este comando.",
        ephemeral: true
      });
    }

    await interaction.deferReply();

    const placa       = interaction.options.getString("placa").toUpperCase();
    const userTarget  = interaction.options.getUser("usuario");
    const lugar       = interaction.options.getString("lugar");
    const motivo      = interaction.options.getString("motivo");
    const monto       = interaction.options.getInteger("monto");
    const imagen      = interaction.options.getAttachment("imagen");
    const companero   = interaction.options.getUser("companero");

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💰 Descontar del banco del multado
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const userMultado = await User.findOne({ discordId: userTarget.id });
    if (userMultado) {
      userMultado.banco -= monto; // ✅ permite negativo
      await userMultado.save();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💾 Guardar en MongoDB
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await Multa.create({
      discord_id:   userTarget.id,
      placa,
      oficial_id:   interaction.user.id,
      oficial_tag:  interaction.user.tag,
      companero_id:  companero?.id        ?? null,
      companero_tag: companero?.tag       ?? null,
      lugar,
      motivo,
      monto,
      imagen_url:   imagen.url
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧱 Container
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const container = new ContainerBuilder()
      .setAccentColor(0xe67e22)

      // 🖼️ Evidencia
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL(imagen.url)
            .setDescription(`Evidencia — Multa ${placa}`)
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // Encabezado
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## 🚨 Multa Registrada\n` +
              `-# ${new Date().toLocaleString("es-PA")}`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(
              userTarget.displayAvatarURL({ extension: "png", size: 256 })
            )
          )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // Info de la multa
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**🚗 Placa:** \`${placa}\`\n` +
          `**👤 Multado:** <@${userTarget.id}> (${userTarget.tag})\n` +
          `**👮 Oficial:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
          (companero
            ? `**👮‍♂️ Compañero:** <@${companero.id}> (${companero.tag})\n`
            : ""
          ) +
          `**📍 Lugar:** ${lugar}\n` +
          `**📝 Motivo:** ${motivo}`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // Monto
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**💰 Monto:** $${monto.toLocaleString()} descontados del banco`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# © Panamá RP V2 · Registro de Tránsito Oficial`
        )
      );

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [container]
    });

    // 📩 DM al multado
    const dmContainer = new ContainerBuilder()
      .setAccentColor(0xe67e22)

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 🚨 Has recibido una multa\n` +
          `-# Panamá RP V2 · Tránsito`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**🚗 Placa:** \`${placa}\`\n` +
          `**📍 Lugar:** ${lugar}\n` +
          `**📝 Motivo:** ${motivo}\n` +
          `**💰 Monto:** $${monto.toLocaleString()} descontados de tu banco\n\n` +
          `> Si consideras que esta multa fue injusta, abre un ticket en el servidor.`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# © Panamá RP V2 · ${new Date().toLocaleString("es-PA")}`
        )
      );

    await userTarget.send({
      flags: MessageFlags.IsComponentsV2,
      components: [dmContainer]
    }).catch(() => {});
  }
};
