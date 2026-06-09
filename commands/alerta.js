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
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require("discord.js");

const ROL_AUTORIZADO = "1451018406537986168";
const ROL_PING       = "1451018411512565810";
const CANAL_ALERTAS  = "1451018740245332059";
const CANAL_LOGS     = "1455970934535225518";

const ALERTAS = {
  verde: {
    color:  0x2ecc71,
    emoji:  "🟢",
    titulo: "ALERTA VERDE — NIVEL BAJO",
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    armas:  "Pistolas y armas de mano únicamente",
    nivel:  "Situación controlada — Presencia policial preventiva",
    policias: [
      "🚔 Patrullaje activo en zonas de riesgo",
      "👁️ Mantener visibilidad en calles principales",
      "📻 Comunicación constante con despacho",
      "🚨 No usar luces a menos que sea necesario",
      "⚠️ Reportar cualquier actividad sospechosa"
    ],
    civiles: [
      "✅ Pueden circular con normalidad",
      "📵 Evitar zonas marcadas como conflictivas",
      "🚗 Respetar los controles policiales",
      "📞 Reportar actividades sospechosas al 911",
      "🏠 Mantener la calma y seguir la rutina normal"
    ]
  },

  amarilla: {
    color:  0xf1c40f,
    emoji:  "🟡",
    titulo: "ALERTA AMARILLA — NIVEL MEDIO",
    imagen: "https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=800",
    armas:  "Pistolas, escopetas y rifles semi-automáticos",
    nivel:  "Situación de riesgo moderado — Respuesta activa requerida",
    policias: [
      "🚔 Unidades desplegadas en toda la ciudad",
      "🔫 Autorización para uso de armas semi-auto",
      "🚁 Solicitar apoyo aéreo si es necesario",
      "🚧 Establecer perímetros en zonas calientes",
      "📻 Canal de emergencia activo — reportar cada 5 min",
      "🛑 Checkpoints en entradas/salidas de la ciudad",
      "👮 Mínimo 2 unidades por patrulla"
    ],
    civiles: [
      "⚠️ Evitar zonas de conflicto activo",
      "🏠 Se recomienda permanecer en interiores",
      "🚗 No obstruir vehículos de emergencia",
      "📵 Alejarse de tiroteos o altercados",
      "📞 Llamar al 911 ante cualquier incidente",
      "🚫 No grabar ni interferir operativos policiales"
    ]
  },

  roja: {
    color:  0xe74c3c,
    emoji:  "🔴",
    titulo: "ALERTA ROJA — NIVEL CRÍTICO",
    imagen: "https://images.unsplash.com/photo-1597733336794-2ff5b5e63d48?w=800",
    armas:  "Todas las armas autorizadas — Sin restricciones",
    nivel:  "🚨 EMERGENCIA MÁXIMA — Todas las unidades en código 3",
    policias: [
      "🚨 CÓDIGO 3 — Todas las unidades disponibles activas",
      "🔫 Todas las armas autorizadas sin restricción",
      "🚁 Apoyo aéreo obligatorio si está disponible",
      "🚧 Cierre total de zonas afectadas",
      "⛔ Toque de queda en zonas de conflicto",
      "🛡️ Equipo táctico desplegado inmediatamente",
      "📻 Frecuencia de emergencia exclusiva activa",
      "🤝 Coordinación con todas las agencias",
      "🚑 EMS en standby en zonas seguras",
      "⚠️ Disparar solo cuando sea absolutamente necesario"
    ],
    civiles: [
      "🚨 EVACUAR zonas de conflicto inmediatamente",
      "🏠 PERMANECER en interiores — No salir",
      "🚗 NO usar vehículos en zonas afectadas",
      "📵 NO interferir con operativos policiales",
      "🚫 Manos visibles ante cualquier oficial",
      "📞 Solo llamar al 911 en emergencias reales",
      "⛔ Toque de queda en efecto — violadores serán arrestados",
      "🔇 No difundir rumores o información falsa"
    ]
  }
};

module.exports = {
  permisos:  "🛡️ Staff",
  categoria: "staff",

  data: new SlashCommandBuilder()
    .setName("alerta")
    .setDescription("Emitir una alerta de seguridad en la ciudad")
    .addStringOption(o =>
      o.setName("tipo")
        .setDescription("Nivel de alerta")
        .setRequired(true)
        .addChoices(
          { name: "🟢 Verde — Nivel Bajo",      value: "verde" },
          { name: "🟡 Amarilla — Nivel Medio",  value: "amarilla" },
          { name: "🔴 Roja — Nivel Crítico",    value: "roja" }
        )
    )
    .addStringOption(o =>
      o.setName("razon")
        .setDescription("Motivo de la alerta")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("zona")
        .setDescription("Zona o sector afectado (opcional)")
        .setRequired(false)
    ),

  async execute(interaction) {

    if (!interaction.member.roles.cache.has(ROL_AUTORIZADO)) {
      return interaction.reply({
        content: "⛔ No tienes permisos para emitir alertas.",
        ephemeral: true
      });
    }

    const tipo  = interaction.options.getString("tipo");
    const razon = interaction.options.getString("razon");
    const zona  = interaction.options.getString("zona") || "Ciudad completa";
    const hora  = `<t:${Math.floor(Date.now() / 1000)}:F>`;

    const alerta       = ALERTAS[tipo];
    const canalAlertas = interaction.guild.channels.cache.get(CANAL_ALERTAS);
    const canalLogs    = interaction.guild.channels.cache.get(CANAL_LOGS);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧱 Container principal
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const container = new ContainerBuilder()
      .setAccentColor(alerta.color)

      // ✅ Mención dentro del container
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`<@&${ROL_PING}>`)
      )

      // 🖼️ Banner
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL(alerta.imagen)
            .setDescription(`Alerta ${tipo} — Panamá RP V2`)
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
              `## ${alerta.emoji} ${alerta.titulo}\n` +
              `-# Emitida por ${interaction.user.tag} · ${hora}`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(
              interaction.guild.iconURL({ extension: "png", size: 256 }) ||
              interaction.user.displayAvatarURL({ extension: "png", size: 256 })
            )
          )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // Info general
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**📌 Motivo:** ${razon}\n` +
          `**📍 Zona afectada:** ${zona}\n` +
          `**🔫 Armamento autorizado:** ${alerta.armas}\n` +
          `**⚡ Nivel:** ${alerta.nivel}`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // Instrucciones policías
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**👮 Instrucciones para Policías:**\n` +
          alerta.policias.map(p => `> ${p}`).join("\n")
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // Instrucciones civiles
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**🧑‍🤝‍🧑 Instrucciones para Civiles:**\n` +
          alerta.civiles.map(c => `> ${c}`).join("\n")
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# © Panamá RP V2 · Gobierno y Fuerzas del Orden · ${hora}`
        )
      );

    // Botón enterado
    const botones = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`alerta_ack_${interaction.user.id}`)
        .setLabel("✅ Enterado")
        .setStyle(
          tipo === "verde"    ? ButtonStyle.Success :
          tipo === "amarilla" ? ButtonStyle.Primary :
          ButtonStyle.Danger
        )
    );

    // 📢 Enviar al canal de alertas — sin content
    if (canalAlertas) {
      await canalAlertas.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container, botones]
      });
    }

    // 📜 Log
    if (canalLogs) {
      const logContainer = new ContainerBuilder()
        .setAccentColor(0x3498db)

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## 📜 Log de Alerta\n` +
            `-# ${hora}`
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**${alerta.emoji} Tipo:** ${alerta.titulo}\n` +
            `**📌 Motivo:** ${razon}\n` +
            `**📍 Zona:** ${zona}\n` +
            `**👮 Emitida por:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
            `**🕒 Hora:** ${hora}`
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# © Panamá RP V2 · Sistema de Alertas`
          )
        );

      await canalLogs.send({
        flags: MessageFlags.IsComponentsV2,
        components: [logContainer]
      });
    }

    await interaction.reply({
      content: `✅ Alerta **${alerta.emoji} ${tipo.toUpperCase()}** emitida correctamente en <#${CANAL_ALERTAS}>.`,
      ephemeral: true
    });
  }
};
