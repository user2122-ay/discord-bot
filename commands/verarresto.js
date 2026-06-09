const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags
} = require("discord.js");

const Arresto = require("../models/Arresto");

const COLORES_CATEGORIA = {
  grave:    0xe74c3c,
  moderado: 0xe67e22,
  leve:     0xf1c40f
};

const EMOJIS_CATEGORIA = {
  grave:    "🔴",
  moderado: "🟠",
  leve:     "🟡"
};

module.exports = {
  permisos:  "🌍 Todos",
  categoria: "rol",

  data: new SlashCommandBuilder()
    .setName("verarresto")
    .setDescription("Ver el historial de arrestos de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario a consultar")
        .setRequired(true)
    ),

  async execute(interaction) {

    await interaction.deferReply({ ephemeral: true });

    const usuario  = interaction.options.getUser("usuario");
    const arrestos = await Arresto.find({ discord_id: usuario.id }).sort({ fecha: -1 });

    if (!arrestos || arrestos.length === 0) {
      return interaction.editReply({
        content: "✅ Este usuario no tiene arrestos registrados."
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 Estadísticas
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const totalMultas      = arrestos.reduce((acc, a) => acc + a.multa, 0);
    const totalRecompensas = arrestos.reduce((acc, a) => acc + a.recompensa, 0);
    const graves    = arrestos.filter(a => a.categoria === "grave").length;
    const moderados = arrestos.filter(a => a.categoria === "moderado").length;
    const leves     = arrestos.filter(a => a.categoria === "leve").length;

    // Color según categoría más frecuente
    const colorPrincipal = graves > 0 ? 0xe74c3c
      : moderados > 0               ? 0xe67e22
      : 0xf1c40f;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧱 Container principal
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const container = new ContainerBuilder()
      .setAccentColor(colorPrincipal)

      // Encabezado
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## 📋 Historial de Arrestos\n` +
              `-# ${usuario.tag}`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(
              usuario.displayAvatarURL({ extension: "png", size: 256 })
            )
          )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // Estadísticas generales
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**📊 Resumen:**\n` +
          `> 🔢 Total de arrestos: **${arrestos.length}**\n` +
          `> 🔴 Graves: **${graves}** · 🟠 Moderados: **${moderados}** · 🟡 Leves: **${leves}**\n` +
          `> 💸 Total en multas: **$${totalMultas.toLocaleString()}**\n` +
          `> 🏦 Total en recompensas pagadas: **$${totalRecompensas.toLocaleString()}**`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📋 Últimos 10 arrestos
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const ultimos = arrestos.slice(0, 10);

    ultimos.forEach((a, i) => {
      const fecha  = new Date(a.fecha).toLocaleString("es-PA");
      const emoji  = EMOJIS_CATEGORIA[a.categoria] || "⚪";

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**${emoji} Arresto #${arrestos.length - i}** · \`${fecha}\`\n` +
          `> ⚖️ **Delito:** ${a.delito}\n` +
          `> 📍 **Lugar:** ${a.lugar}\n` +
          `> ⏱️ **Condena:** ${a.condena_horas} hora${a.condena_horas > 1 ? "s" : ""} RP\n` +
          `> 💸 **Multa:** $${a.multa.toLocaleString()} · 🏦 **Recompensa oficial:** $${a.recompensa.toLocaleString()}\n` +
          `> 👮 **Oficial:** <@${a.oficial_id}> (${a.oficial_tag})\n` +
          `> 🖼️ [Ver evidencia](${a.imagen_url})`
        )
      );

      // Separador entre arrestos (excepto el último)
      if (i < ultimos.length - 1) {
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
      }
    });

    // Si hay más de 10
    if (arrestos.length > 10) {
      container
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# Mostrando los últimos 10 de ${arrestos.length} arrestos totales`
          )
        );
    }

    container
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# © Panamá RP V2 · Registro Policial Oficial · ${new Date().toLocaleString("es-PA")}`
        )
      );

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [container]
    });
  }
};
