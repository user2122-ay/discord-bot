// ============================================================
//  redes-sociales.js  —  Panamá RP V2
//  Components V2 | Cajones | Color por red | Likes | Comentarios
// ============================================================

const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags
} = require("discord.js");

const CANAL_PERMITIDO = "1451018734205403207";

// ── Configuración de redes sociales ────────────────────────
const REDES = {
  twitter: {
    label: "Twitter / X",
    emoji: "🐦",
    logo: "https://cdn-icons-png.flaticon.com/512/5969/5969020.png",
    color: 0x000000,
    accentText: "𝕏 Twitter"
  },
  instagram: {
    label: "Instagram",
    emoji: "📸",
    logo: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png",
    color: 0xE1306C,
    accentText: "📸 Instagram"
  },
  facebook: {
    label: "Facebook",
    emoji: "👥",
    logo: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
    color: 0x1877F2,
    accentText: "👥 Facebook"
  },
  tiktok: {
    label: "TikTok",
    emoji: "🎵",
    logo: "https://cdn-icons-png.flaticon.com/512/3046/3046121.png",
    color: 0x010101,
    accentText: "🎵 TikTok"
  },
  youtube: {
    label: "YouTube",
    emoji: "▶️",
    logo: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
    color: 0xFF0000,
    accentText: "▶️ YouTube"
  },
  twitch: {
    label: "Twitch",
    emoji: "🎮",
    logo: "https://cdn-icons-png.flaticon.com/512/5968/5968819.png",
    color: 0x9146FF,
    accentText: "🎮 Twitch"
  }
};

// Memoria: messageId -> { likes: Set, usuarioId, usuarioTag, red, contenido }
const publicacionesData = new Map();

// ── Construir container ─────────────────────────────────────
function buildRedContainer(usuario, red, contenido, link, likeCount, estado = null) {
  const redInfo = REDES[red];
  const container = new ContainerBuilder();

  // Encabezado con logo de la red
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## ${redInfo.accentText}\n` +
      `**${usuario.username}** compartió en ${redInfo.label}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  // Contenido del post
  if (contenido) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(contenido)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
  }

  // Link si existe
  if (link) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`🔗 **Enlace:** ${link}`)
    );
    container.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    );
  }

  // Likes
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `❤️ **${likeCount}** me gusta  •  👤 ${usuario.username} (\`${usuario.id}\`)`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# Panamá RP V2 • ${redInfo.label}`)
  );

  return container;
}

function buildBotones(msgId, likeCount, cerrado = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`red_like_${msgId}`)
      .setLabel(`❤️ ${likeCount}`)
      .setStyle(ButtonStyle.Danger)
      .setDisabled(cerrado),
    new ButtonBuilder()
      .setCustomId(`red_comentar_${msgId}`)
      .setLabel("💬 Comentar")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(cerrado)
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("redes-sociales")
    .setDescription("Comparte tu perfil o publicación de redes sociales")
    .addStringOption(o =>
      o.setName("red")
        .setDescription("¿En qué red social?")
        .setRequired(true)
        .addChoices(
          { name: "🐦 Twitter / X",   value: "twitter"   },
          { name: "📸 Instagram",      value: "instagram" },
          { name: "👥 Facebook",       value: "facebook"  },
          { name: "🎵 TikTok",         value: "tiktok"    },
          { name: "▶️ YouTube",        value: "youtube"   },
          { name: "🎮 Twitch",         value: "twitch"    }
        )
    )
    .addStringOption(o =>
      o.setName("contenido")
        .setDescription("Descripción o texto del post")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("link")
        .setDescription("Enlace a tu perfil o publicación (opcional)")
        .setRequired(false)
    )
    .addAttachmentOption(o =>
      o.setName("imagen")
        .setDescription("Imagen de tu publicación (opcional)")
        .setRequired(false)
    ),

  publicacionesData,
  buildRedContainer,
  buildBotones,
  REDES,

  async execute(interaction) {
    // Verificar canal
    if (interaction.channelId !== CANAL_PERMITIDO) {
      return interaction.reply({
        content: `❌ Solo puedes usar este comando en <#${CANAL_PERMITIDO}>.`,
        flags: MessageFlags.Ephemeral
      });
    }

    const red       = interaction.options.getString("red");
    const contenido = interaction.options.getString("contenido");
    const link      = interaction.options.getString("link") ?? null;
    const imagen    = interaction.options.getAttachment("imagen") ?? null;
    const usuario   = interaction.user;
    const redInfo   = REDES[red];

    // Validar imagen (solo imágenes)
    if (imagen && !imagen.contentType?.startsWith("image/")) {
      return interaction.reply({
        content: "❌ Solo puedes adjuntar imágenes.",
        flags: MessageFlags.Ephemeral
      });
    }

    const container = buildRedContainer(usuario, red, contenido, link, 0);
    const components = [container];

    // Galería de imagen si se adjuntó
    if (imagen) {
      const galeria = new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(imagen.url)
      );
      components.push(galeria);
    }

    // Botones temporales
    const botonesTemp = buildBotones("temp", 0);
    components.push(botonesTemp);

    const mensaje = await interaction.channel.send({
      components,
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });

    // Guardar datos con ID real
    publicacionesData.set(mensaje.id, {
      likes:      new Set(),
      usuarioId:  usuario.id,
      usuarioTag: usuario.username,
      red,
      contenido,
      link,
      imagenUrl: imagen?.url ?? null
    });

    // Reenviar con ID real en botones
    const containerFinal  = buildRedContainer(usuario, red, contenido, link, 0);
    const componentesFinal = [containerFinal];

    if (imagen) {
      componentesFinal.push(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder().setURL(imagen.url)
        )
      );
    }

    componentesFinal.push(buildBotones(mensaje.id, 0));

    await mensaje.edit({
      components: componentesFinal,
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });

    // Crear hilo para comentarios
    await interaction.channel.threads.create({
      startMessage: mensaje,
      name: `💬 ${redInfo.label} · ${usuario.username}`,
      autoArchiveDuration: 1440
    }).catch(() => {});

    await interaction.reply({
      content: `✅ Tu publicación de **${redInfo.label}** fue compartida.`,
      flags: MessageFlags.Ephemeral
    });
  }
};

