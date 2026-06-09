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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 DELITOS — Código Penal Panamá
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DELITOS = {

  // 🔴 GRAVES
  homicidio: {
    label:      "Homicidio (Art. 131 CP)",
    categoria:  "grave",
    multa:      15000,
    recompensa: 2000,
    condenas:   [12, 24]
  },
  secuestro: {
    label:      "Secuestro (Art. 152 CP)",
    categoria:  "grave",
    multa:      12000,
    recompensa: 2000,
    condenas:   [12, 24]
  },
  trafico_drogas: {
    label:      "Tráfico de drogas (Art. 310 CP)",
    categoria:  "grave",
    multa:      10000,
    recompensa: 2000,
    condenas:   [8, 12, 24]
  },
  robo_agravado: {
    label:      "Robo agravado (Art. 213 CP)",
    categoria:  "grave",
    multa:      8000,
    recompensa: 2000,
    condenas:   [8, 12]
  },
  terrorismo: {
    label:      "Terrorismo (Art. 264 CP)",
    categoria:  "grave",
    multa:      15000,
    recompensa: 2000,
    condenas:   [24]
  },

  // 🟠 MODERADOS
  robo_simple: {
    label:      "Robo simple (Art. 212 CP)",
    categoria:  "moderado",
    multa:      4000,
    recompensa: 1000,
    condenas:   [4, 8]
  },
  lesiones: {
    label:      "Lesiones personales (Art. 136 CP)",
    categoria:  "moderado",
    multa:      3000,
    recompensa: 1000,
    condenas:   [2, 4]
  },
  portacion_ilegal: {
    label:      "Portación ilegal de armas (Art. 311 CP)",
    categoria:  "moderado",
    multa:      5000,
    recompensa: 1000,
    condenas:   [4, 8]
  },
  extorsion: {
    label:      "Extorsión (Art. 215 CP)",
    categoria:  "moderado",
    multa:      4000,
    recompensa: 1000,
    condenas:   [4, 8]
  },
  estafa: {
    label:      "Estafa (Art. 218 CP)",
    categoria:  "moderado",
    multa:      3000,
    recompensa: 1000,
    condenas:   [2, 4]
  },

  // 🟡 LEVES
  desacato: {
    label:      "Desacato a la autoridad (Art. 345 CP)",
    categoria:  "leve",
    multa:      500,
    recompensa: 500,
    condenas:   [1, 2]
  },
  alteracion_orden: {
    label:      "Alteración del orden público (Art. 346 CP)",
    categoria:  "leve",
    multa:      800,
    recompensa: 500,
    condenas:   [1, 2]
  },
  conduccion_temeraria: {
    label:      "Conducción temeraria (Art. 168 CP)",
    categoria:  "leve",
    multa:      1000,
    recompensa: 500,
    condenas:   [1, 2]
  },
  resistencia_autoridad: {
    label:      "Resistencia a la autoridad (Art. 344 CP)",
    categoria:  "leve",
    multa:      600,
    recompensa: 500,
    condenas:   [1, 2]
  },
  posesion_drogas: {
    label:      "Posesión de drogas (Art. 303 CP)",
    categoria:  "leve",
    multa:      1500,
    recompensa: 500,
    condenas:   [1, 2, 4]
  }
};

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

    .addStringOption(o =>
      o.setName("delito")
        .setDescription("Delito cometido")
        .setRequired(true)
        .addChoices(
          // 🔴 Graves
          { name: "🔴 Homicidio (Art. 131 CP)",              value: "homicidio" },
          { name: "🔴 Secuestro (Art. 152 CP)",              value: "secuestro" },
          { name: "🔴 Tráfico de drogas (Art. 310 CP)",      value: "trafico_drogas" },
          { name: "🔴 Robo agravado (Art. 213 CP)",          value: "robo_agravado" },
          { name: "🔴 Terrorismo (Art. 264 CP)",             value: "terrorismo" },
          // 🟠 Moderados
          { name: "🟠 Robo simple (Art. 212 CP)",            value: "robo_simple" },
          { name: "🟠 Lesiones personales (Art. 136 CP)",    value: "lesiones" },
          { name: "🟠 Portación ilegal armas (Art. 311 CP)", value: "portacion_ilegal" },
          { name: "🟠 Extorsión (Art. 215 CP)",              value: "extorsion" },
          { name: "🟠 Estafa (Art. 218 CP)",                 value: "estafa" },
          // 🟡 Leves
          { name: "🟡 Desacato a la autoridad (Art. 345 CP)",    value: "desacato" },
          { name: "🟡 Alteración del orden público (Art. 346 CP)", value: "alteracion_orden" },
          { name: "🟡 Conducción temeraria (Art. 168 CP)",        value: "conduccion_temeraria" },
          { name: "🟡 Resistencia a la autoridad (Art. 344 CP)",  value: "resistencia_autoridad" },
          { name: "🟡 Posesión de drogas (Art. 303 CP)",          value: "posesion_drogas" }
        )
    )

    .addIntegerOption(o =>
      o.setName("condena")
        .setDescription("Tiempo de condena en horas RP")
        .setRequired(true)
        .addChoices(
          { name: "1 hora RP",   value: 1 },
          { name: "2 horas RP",  value: 2 },
          { name: "4 horas RP",  value: 4 },
          { name: "8 horas RP",  value: 8 },
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

    // 🔒 Verificar rol
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

    const userTarget  = interaction.options.getUser("usuario");
    const delitoKey   = interaction.options.getString("delito");
    const condenaHoras = interaction.options.getInteger("condena");
    const lugar       = interaction.options.getString("lugar");
    const imagen      = interaction.options.getAttachment("imagen");

    const delito = DELITOS[delitoKey];

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💰 Actualizar economía
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Multa al arrestado — descontar del saldo
    let saldoFinal = 0;
    let multaReal  = delito.multa;

    const userArrestado = await User.findOne({ discordId: userTarget.id });
    if (userArrestado) {
      // Si no tiene suficiente saldo, cobrar lo que tenga
      if (userArrestado.saldo < delito.multa) {
        multaReal = userArrestado.saldo;
      }
      userArrestado.saldo = Math.max(0, userArrestado.saldo - delito.multa);
      saldoFinal = userArrestado.saldo;
      await userArrestado.save();
    }

    // Recompensa al oficial — sumar al banco
    let bancoFinal = 0;
    const userOficial = await User.findOne({ discordId: interaction.user.id });
    if (userOficial) {
      userOficial.banco += delito.recompensa;
      bancoFinal = userOficial.banco;
      await userOficial.save();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💾 Guardar arresto en BD
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await Arresto.create({
      discord_id:    userTarget.id,
      oficial_id:    interaction.user.id,
      oficial_tag:   interaction.user.tag,
      delito:        delito.label,
      categoria:     delito.categoria,
      condena_horas: condenaHoras,
      multa:         multaReal,
      recompensa:    delito.recompensa,
      lugar,
      imagen_url:    imagen.url
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🧱 Container
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const color = COLORES_CATEGORIA[delito.categoria];
    const emoji = EMOJIS_CATEGORIA[delito.categoria];

    const container = new ContainerBuilder()
      .setAccentColor(color)

      // 🖼️ Evidencia
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          new MediaGalleryItemBuilder()
            .setURL(imagen.url)
            .setDescription(`Evidencia — ${delito.label}`)
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
              `## 🚔 Arresto Registrado\n` +
              `-# ${emoji} ${delito.categoria.toUpperCase()} · ${new Date().toLocaleString("es-PA")}`
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

      // Info del arresto
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**👤 Arrestado:** <@${userTarget.id}> (${userTarget.tag})\n` +
          `**👮 Oficial:** <@${interaction.user.id}> (${interaction.user.tag})\n` +
          `**⚖️ Delito:** ${delito.label}\n` +
          `**📍 Lugar:** ${lugar}\n` +
          `**⏱️ Condena:** ${condenaHoras} hora${condenaHoras > 1 ? "s" : ""} RP`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      // Economía
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**💸 Multa aplicada:** $${multaReal.toLocaleString()} descontados del saldo\n` +
          `**💰 Saldo restante arrestado:** $${saldoFinal.toLocaleString()}\n` +
          `**🏦 Recompensa oficial:** +$${delito.recompensa.toLocaleString()} al banco\n` +
          `**🏦 Banco oficial ahora:** $${bancoFinal.toLocaleString()}`
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
          `**⚖️ Delito:** ${delito.label}\n` +
          `**📍 Lugar:** ${lugar}\n` +
          `**⏱️ Condena:** ${condenaHoras} hora${condenaHoras > 1 ? "s" : ""} RP\n` +
          `**💸 Multa:** $${multaReal.toLocaleString()} descontados de tu saldo\n\n` +
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
