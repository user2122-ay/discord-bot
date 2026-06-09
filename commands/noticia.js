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

const ROL_AUTORIZADO  = "1451018389127434342";
const CANAL_PERMITIDO = "1451018729063452695";
const ROL_PING        = "1451018420861538467";

const CONFIGS_TIPO = {
  leve: {
    color:  0x2ecc71,
    emoji:  "🟢",
    label:  "LEVE",
    ping:   false
  },
  mediano: {
    color:  0xf1c40f,
    emoji:  "🟡",
    label:  "RELEVANTE",
    ping:   false
  },
  urgente: {
    color:  0xe74c3c,
    emoji:  "🔴",
    label:  "🚨 URGENTE — ÚLTIMA HORA",
    ping:   true
  }
};

module.exports = {
  permisos:  "📰 Noticieros",
  categoria: "rol",

  data: new SlashCommandBuilder()
    .setName("noticia")
    .setDescription("Publicar una noticia RP")

    // ✅ REQUIRED PRIMERO
    .addStringOption(o =>
      o.setName("tipo")
        .setDescription("Nivel de la noticia")
        .setRequired(true)
        .addChoices(
          { name: "🟢 Leve",    value: "leve" },
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
        .setDescription("Logo del canal de noticias")
        .setRequired(true)
    )

    // ✅ OPTIONAL AL FINAL
    .addAttachmentOption(o =>
      o.setName("imagen")
        .setDescription("Imagen de los hechos (opcional)")
        .setRequired(false)
    ),

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

    const tipo   = interaction.options.getString("tipo");
    const canal  = interaction.options.getString("canal");
    const info   = interaction.options.getString("informacion");
    const logo   = interaction.options.getAttachment("logo");
    const imagen = interaction.options.getAttachment("imagen");
    const hora   = `<t:${Math.floor(Date.now() / 1000)}:F>`;

    const config = CONFIGS_TIPO[tipo];

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧱 Container
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const container = new ContainerBuilder()
      .setAccentColor(config.color);

    // 🖼️ Imagen de los hechos (si hay)
    if (imagen) {
      container.addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL(imagen.url)
            .setDescription(`Imágenes — ${canal}`)
        )
      );
    }

    container
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // Encabezado con logo
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## 📰 ${canal}\n` +
              `-# ${config.emoji} ${config.label} · ${hora}`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(logo.url)
          )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // Contenido de la noticia
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(info)
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // Footer
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# 📡 Publicado por ${interaction.user.tag} · ${canal} · Panamá RP V2`
        )
      );

    // Solo para urgente — mensaje normal con ping ANTES del container
if (config.ping) {
  await interaction.channel.send(`<@&${ROL_PING}>`);
}

// Luego el container
await interaction.reply({
  flags: MessageFlags.IsComponentsV2,
  components: [container]
});
  }
};
