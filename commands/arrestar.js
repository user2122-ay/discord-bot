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

const User    = require("../models/User");
const Arresto = require("../models/Arresto");

const ROLES_AUTORIZADOS = [
  "1451018385801351219",
  "1451018375286226957"
];

const DELITOS = {
  homicidio: {
    label:      "Homicidio (Art. 131 CP)",
    categoria:  "grave",
    multa:      15000,
    recompensa: 2000,
  },
  secuestro: {
    label:      "Secuestro (Art. 152 CP)",
    categoria:  "grave",
    multa:      12000,
    recompensa: 2000,
  },
  trafico_drogas: {
    label:      "Tráfico de drogas (Art. 310 CP)",
    categoria:  "grave",
    multa:      10000,
    recompensa: 2000,
  },
  robo_agravado: {
    label:      "Robo agravado (Art. 213 CP)",
    categoria:  "grave",
    multa:      8000,
    recompensa: 2000,
  },
  terrorismo: {
    label:      "Terrorismo (Art. 264 CP)",
    categoria:  "grave",
    multa:      15000,
    recompensa: 2000,
  },
  robo_simple: {
    label:      "Robo simple (Art. 212 CP)",
    categoria:  "moderado",
    multa:      4000,
    recompensa: 1000,
  },
  lesiones: {
    label:      "Lesiones personales (Art. 136 CP)",
    categoria:  "moderado",
    multa:      3000,
    recompensa: 1000,
  },
  portacion_ilegal: {
    label:      "Portación ilegal de armas (Art. 311 CP)",
    categoria:  "moderado",
    multa:      5000,
    recompensa: 1000,
  },
  extorsion: {
    label:      "Extorsión (Art. 215 CP)",
    categoria:  "moderado",
    multa:      4000,
    recompensa: 1000,
  },
  estafa: {
    label:      "Estafa (Art. 218 CP)",
    categoria:  "moderado",
    multa:      3000,
    recompensa: 1000,
  },
  desacato: {
    label:      "Desacato a la autoridad (Art. 345 CP)",
    categoria:  "leve",
    multa:      500,
    recompensa: 500,
  },
  alteracion_orden: {
    label:      "Alteración del orden público (Art. 346 CP)",
    categoria:  "leve",
    multa:      800,
    recompensa: 500,
  },
  conduccion_temeraria: {
    label:      "Conducción temeraria (Art. 168 CP)",
    categoria:  "leve",
    multa:      1000,
    recompensa: 500,
  },
  resistencia_autoridad: {
    label:      "Resistencia a la autoridad (Art. 344 CP)",
    categoria:  "leve",
    multa:      600,
    recompensa: 500,
  },
  posesion_drogas: {
    label:      "Posesión de drogas (Art. 303 CP)",
    categoria:  "leve",
    multa:      1500,
    recompensa: 500,
  }
};

const CHOICES = [
  { name: "🔴 Homicidio (Art. 131 CP)",                  value: "homicidio" },
  { name: "🔴 Secuestro (Art. 152 CP)",                  value: "secuestro" },
  { name: "🔴 Tráfico de drogas (Art. 310 CP)",          value: "trafico_drogas" },
  { name: "🔴 Robo agravado (Art. 213 CP)",              value: "robo_agravado" },
  { name: "🔴 Terrorismo (Art. 264 CP)",                 value: "terrorismo" },
  { name: "🟠 Robo simple (Art. 212 CP)",                value: "robo_simple" },
  { name: "🟠 Lesiones personales (Art. 136 CP)",        value: "lesiones" },
  { name: "🟠 Portación ilegal armas (Art. 311 CP)",     value: "portacion_ilegal" },
  { name: "🟠 Extorsión (Art. 215 CP)",                  value: "extorsion" },
  { name: "🟠 Estafa (Art. 218 CP)",                     value: "estafa" },
  { name: "🟡 Desacato a la autoridad (Art. 345 CP)",    value: "desacato" },
  { name: "🟡 Alteración del orden público (Art. 346 CP)", value: "alteracion_orden" },
  { name: "🟡 Conducción temeraria (Art. 168 CP)",       value: "conduccion_temeraria" },
  { name: "🟡 Resistencia a la autoridad (Art. 344 CP)", value: "resistencia_autoridad" },
  { name: "🟡 Posesión de drogas (Art. 303 CP)",         value: "posesion_drogas" }
];

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

// Opción de delito reutilizable
function delitoOption(o, nombre, requerido) {
  return o
    .setName(nombre)
    .setDescription(`Delito ${requerido ? "(obligatorio)" : "(opcional)"}`)
    .setRequired(requerido)
    .addChoices(...CHOICES);
}

module.exports = {
  permisos:  "👮 Fuerza Pública",
  categoria: "rol",

  data: new SlashCommandBuilder()
    .setName("arrestar")
    .setDescription("Registrar un arresto")

    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario arrestado")
        .setRequired(true)
    )
    .addStringOption(o => delitoOption(o, "delito1", true))
    .addStringOption(o => delitoOption(o, "delito2", false))
    .addStringOption(o => delitoOption(o, "delito3", false))
    .addStringOption(o => delitoOption(o, "delito4", false))
    .addStringOption(o => delitoOption(o, "delito5", false))

    .addIntegerOption(o =>
      o.setName("condena")
        .setDescription("Tiempo de condena en horas RP")
        .setRequired(true)
        .addChoices(
          { name: "1 hora RP",   value: 1  },
          { name: "2 horas RP",  value: 2  },
          { name: "4 horas RP",  value: 4  },
          { name: "8 horas RP",  value: 8  },
          { name: "12 horas RP", value: 12 },
          { name: "24 horas RP", value: 24 }
        )
    )
    .addStringOption(o =>
      o.setName("lugar")
        .setDescription("Lugar del arresto")
        .setRequired(true)
    )
    .addAttachmentOption(o =>
      o.setName("imagen")
        .setDescription("Imagen/evidencia del arresto")
        .setRequired(true)
    ),

  async execute(interaction) {

    const tieneRol = interaction.member.roles.cache.some(r =>
      ROLES_AUTORIZADOS.includes(r.id)
    );
    if (!tieneRol) {
      return interaction.reply({
        content: "❌ No tienes permiso para usar este comando.",
        ephemeral: true
      });
    }

    await interaction.deferReply();

    const userTarget   = interaction.options.getUser("usuario");
    const condenaHoras = interaction.options.getInteger("condena");
    const lugar        = interaction.options.getString("lugar");
    const imagen       = interaction.options.getAttachment("imagen");

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📋 Recopilar delitos
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const delitosKeys = [
      interaction.options.getString("delito1"),
      interaction.options.getString("delito2"),
      interaction.options.getString("delito3"),
      interaction.options.getString("delito4"),
      interaction.options.getString("delito5")
    ].filter(Boolean);

    const delitosData = delitosKeys.map(k => DELITOS[k]).filter(Boolean);
    if (delitosData.length === 0) {
  return interaction.editReply({ content: "❌ No se reconocieron los delitos seleccionados." });
    }

    // Totales
    const multaTotal      = delitosData.reduce((acc, d) => acc + d.multa, 0);
    const recompensaTotal = delitosData.reduce((acc, d) => acc + d.recompensa, 0);

    // Categoría más grave
    const prioridad    = { grave: 3, moderado: 2, leve: 1 };
    const categoriaPrincipal = delitosData.reduce((prev, curr) =>
      prioridad[curr.categoria] > prioridad[prev.categoria] ? curr : prev
    ).categoria;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💰 Economía
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Multa al arrestado — ✅ permite negativo
    const userArrestado = await User.findOne({ discordId: userTarget.id });
    if (userArrestado) {
      userArrestado.saldo -= multaTotal; // ✅ puede quedar negativo
      await userArrestado.save();
    }

    // Recompensa al oficial — suma al banco
    const userOficial = await User.findOne({ discordId: interaction.user.id });
    if (userOficial) {
      userOficial.banco += recompensaTotal;
      await userOficial.save();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💾 Guardar en BD
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await Arresto.create({
      discord_id:    userTarget.id,
      oficial_id:    interaction.user.id,
      oficial_tag:   interaction.user.tag,
      delito:        delitosData.map(d => d.label).join(" | "),
      categoria:     categoriaPrincipal,
      condena_horas: condenaHoras,
      multa:         multaTotal,
      recompensa:    recompensaTotal,
      lugar,
      imagen_url:    imagen.url
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧱 Container
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const color = COLORES_CATEGORIA[categoriaPrincipal];
    const emoji = EMOJIS_CATEGORIA[categoriaPrincipal];

    // Lista de delitos formateada
    const listaDelitos = delitosData.map((d, i) =>
      `> ${EMOJIS_CATEGORIA[d.categoria]} **${i + 1}.** ${d.label} — Multa: $${d.multa.toLocaleString()}`
    ).join("\n");

    const container = new ContainerBuilder()
      .setAccentColor(color)

      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL(imagen.url)
            .setDescription(`Evidencia — Arresto`)
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## 🚔 Arresto Registrado\n` +
              `-# ${emoji} ${categoriaPrincipal.toUpperCase()} · ${new Date().toLocaleString("es-PA")}`
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

      // Info arresto
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**👤 Arrestado:** <@${userTarget.id}> (${userTarget.tag})\n` +
          `**👮 Oficial:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
          `**📍 Lugar:** ${lugar}\n` +
          `**⏱️ Condena:** ${condenaHoras} hora${condenaHoras > 1 ? "s" : ""} RP`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // Delitos
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**⚖️ Delito${delitosData.length > 1 ? "s" : ""} (${delitosData.length}):**\n` +
          listaDelitos
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // Economía — sin saldos actuales
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**💸 Multa total:** $${multaTotal.toLocaleString()} descontados del saldo\n` +
          `**🏦 Recompensa oficial:** +$${recompensaTotal.toLocaleString()} al banco`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `-# © Panamá RP V2 · Registro Policial Oficial`
        )
      );

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [container]
    });

    // 📩 DM al arrestado
    const dmContainer = new ContainerBuilder()
      .setAccentColor(color)

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## 🚔 Has sido arrestado\n` +
          `-# Panamá RP V2 · Registro Oficial`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**⚖️ Delito${delitosData.length > 1 ? "s" : ""}:**\n` +
          delitosData.map(d => `> ${EMOJIS_CATEGORIA[d.categoria]} ${d.label}`).join("\n") +
          `\n\n**📍 Lugar:** ${lugar}\n` +
          `**⏱️ Condena:** ${condenaHoras} hora${condenaHoras > 1 ? "s" : ""} RP\n` +
          `**💸 Multa total:** $${multaTotal.toLocaleString()} descontados de tu saldo\n\n` +
          `> Si consideras que este arresto fue injusto, abre un ticket en el servidor.`
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
