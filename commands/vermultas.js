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

const Multa = require("../models/Multa");

const ROLES_AUTORIDAD = [
  "1451018375286226957",
  "1451018376515293318",
  "1451018377211412696",
  "1451018385801351219"
];

module.exports = {
  permisos:  "🌍 Todos",
  categoria: "rol",

  data: new SlashCommandBuilder()
    .setName("vermultas")
    .setDescription("Ver historial de multas de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario a consultar (por defecto tú mismo)")
        .setRequired(false)
    ),

  async execute(interaction) {

    await interaction.deferReply({ ephemeral: true });

    const esAutoridad = interaction.member.roles.cache.some(r =>
      ROLES_AUTORIDAD.includes(r.id)
    );

    const userTarget = interaction.options.getUser("usuario") ?? interaction.user;

    // 🔒 Civiles solo pueden ver las suyas
    if (userTarget.id !== interaction.user.id && !esAutoridad) {
      return interaction.editReply({
        content: "❌ Solo puedes ver tus propias multas."
      });
    }

    const multas = await Multa.find({ discord_id: userTarget.id }).sort({ fecha: -1 });

    if (!multas || multas.length === 0) {
      return interaction.editReply({
        content: "✅ Este usuario no tiene multas registradas."
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 Estadísticas
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const totalMonto = multas.reduce((acc, m) => acc + m.monto, 0);
    const placas     = [...new Set(multas.map(m => m.placa))];

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧱 Container
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const container = new ContainerBuilder()
      .setAccentColor(0xe67e22)

      // Encabezado
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## 🚨 Historial de Multas\n` +
              `-# ${userTarget.tag}`
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

      // Resumen
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**📊 Resumen:**\n` +
          `> 🔢 Total de multas: **${multas.length}**\n` +
          `> 💰 Total acumulado: **$${totalMonto.toLocaleString()}**\n` +
          `> 🚗 Placas registradas: **${placas.join(", ") || "N/A"}**`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      );

    // Últimas 10 multas
    const ultimas = multas.slice(0, 10);

    ultimas.forEach((m, i) => {
      const fecha = new Date(m.fecha).toLocaleString("es-PA");

      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**🚨 Multa #${multas.length - i}** · \`${fecha}\`\n` +
          `> 🚗 **Placa:** \`${m.placa}\`\n` +
          `> 📍 **Lugar:** ${m.lugar}\n` +
          `> 📝 **Motivo:** ${m.motivo}\n` +
          `> 💰 **Monto:** $${m.monto.toLocaleString()}\n` +
          `> 👮 **Oficial:** <@${m.oficial_id}> (${m.oficial_tag})\n` +
          (m.companero_id
            ? `> 👮‍♂️ **Compañero:** <@${m.companero_id}> (${m.companero_tag})\n`
            : ""
          ) +
          `> 🖼️ [Ver evidencia](${m.imagen_url})`
        )
      );

      if (i < ultimas.length - 1) {
        container.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
      }
    });

    if (multas.length > 10) {
      container
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# Mostrando las últimas 10 de ${multas.length} multas totales`
          )
        );
    }

    container
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# © Panamá RP V2 · Registro de Tránsito Oficial · ${new Date().toLocaleString("es-PA")}`
        )
      );

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [container]
    });
  }
};
