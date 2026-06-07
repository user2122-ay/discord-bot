const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags,
  PermissionFlagsBits
} = require("discord.js");

const axios   = require("axios");
const Sancion = require("../models/Sancion");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎭 ROLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ROL_STAFF = "1451018406537986168";

const ROLES_STRIKE = {
  1: "1451965207806214184",
  2: "1451965273732153550",
  3: "1451965331365957702"
};

const ROLES_SANCION = {
  1: "1451018428281258035",
  2: "1451018430135406725",
  3: "1451018431561338950",
  4: "1451018433012437044",
  5: "1451018441342451734",
  6: "1451018442529570906"
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⏱ DURACIONES DE TIMEOUT (ms)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TIMEOUTS = {
  1: { ms: 60 * 60 * 1000,          texto: "1 hora" },
  2: { ms: 3 * 60 * 60 * 1000,      texto: "3 horas" },
  3: { ms: 6 * 60 * 60 * 1000,      texto: "6 horas" },
  4: { ms: 12 * 60 * 60 * 1000,     texto: "12 horas" },
  5: { ms: 24 * 60 * 60 * 1000,     texto: "24 horas" },
  6: null // ban permanente
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎮 ERLC API
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function ejecutarERLC(comando) {
  try {
    const res = await axios.post(
      "https://api.policeroleplay.community/v1/server/command",
      { command: comando },
      {
        headers: {
          "Server-Key": process.env.ROBLOX_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );
    return { ok: true, data: res.data };
  } catch (err) {
    return { ok: false, error: err.response?.data || err.message };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔨 APLICAR SANCIÓN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function aplicarSancion(miembro, numSancion, motivo, staff, guild, registro) {

  const resultado = {
    timeout:  null,
    ban:      false,
    erlc:     { ok: false, respuesta: null }
  };

  // ── Quitar roles de sanciones anteriores ──
  for (const [num, rolId] of Object.entries(ROLES_SANCION)) {
    if (parseInt(num) < numSancion) {
      await miembro.roles.remove(rolId).catch(() => {});
    }
  }

  // ── Agregar rol de sanción actual ──
  await miembro.roles.add(ROLES_SANCION[numSancion]).catch(() => {});

  if (numSancion === 6) {
    // 🚫 Ban permanente
    await guild.members.ban(miembro.id, { reason: motivo }).catch(() => {});
    resultado.ban = true;

    // ERLC ban
    const erlc = await ejecutarERLC(`:ban ${miembro.user.username}`);
    resultado.erlc = { ok: erlc.ok, respuesta: JSON.stringify(erlc.data || erlc.error) };

  } else {
    // ⏱ Timeout
    const timeout = TIMEOUTS[numSancion];
    await miembro.timeout(timeout.ms, motivo).catch(() => {});
    resultado.timeout = timeout.texto;

    // ERLC kick + mensaje
    const erlc = await ejecutarERLC(`:kick ${miembro.user.username}`);
    resultado.erlc = { ok: erlc.ok, respuesta: JSON.stringify(erlc.data || erlc.error) };
  }

  // ── Guardar en historial ──
  registro.historial.push({
    tipo:              "sancion",
    numero:            numSancion,
    motivo,
    staff_id:          staff.id,
    staff_tag:         staff.tag,
    duracion_timeout:  resultado.timeout,
    erlc_ejecutado:    resultado.erlc.ok,
    erlc_respuesta:    resultado.erlc.respuesta
  });

  return resultado;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 COMANDO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
module.exports = {
  permisos: "🛡️ Staff",

  data: new SlashCommandBuilder()
    .setName("sancionar")
    .setDescription("Aplicar strike o sanción a un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario a sancionar")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("tipo")
        .setDescription("Tipo de sanción")
        .setRequired(true)
        .addChoices(
          { name: "⚡ Strike",           value: "strike" },
          { name: "⚠️ Sanción directa",  value: "sancion" }
        )
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo de la sanción")
        .setRequired(true)
    ),

  async execute(interaction) {

    // 🔒 Verificar rol staff
    if (!interaction.member.roles.cache.has(ROL_STAFF)) {
      return interaction.reply({
        content: "❌ No tienes permisos para usar este comando.",
        ephemeral: true
      });
    }

    await interaction.deferReply();

    const userTarget = interaction.options.getUser("usuario");
    const tipo       = interaction.options.getString("tipo");
    const motivo     = interaction.options.getString("motivo");
    const staff      = interaction.user;
    const guild      = interaction.guild;

    const miembro = await guild.members.fetch(userTarget.id).catch(() => null);
    if (!miembro) {
      return interaction.editReply({ content: "❌ Usuario no encontrado en el servidor." });
    }

    // 📂 Buscar o crear registro
    let registro = await Sancion.findOne({ discord_id: userTarget.id });
    if (!registro) {
      registro = new Sancion({ discord_id: userTarget.id });
    }

    // 🚫 Ya baneado
    if (registro.baneado) {
      return interaction.editReply({ content: "❌ Este usuario ya está baneado permanentemente." });
    }

    // 🚫 Ya tiene 6 sanciones
    if (registro.sanciones_acumuladas >= 6) {
      return interaction.editReply({
        content: "❌ Este usuario ya tiene el máximo de sanciones (6). Debe ser baneado."
      });
    }

    let descripcionAccion = "";
    let colorContainer    = 0xe67e22;
    let tituloContainer   = "";
    let camposExtra       = [];
    let sancionAplicada   = null;

    // ━━━━━━━━━━━━━━━━━━━━
    // ⚡ STRIKE
    // ━━━━━━━━━━━━━━━━━━━━
    if (tipo === "strike") {

      registro.strikes_actuales++;
      const numStrike = registro.strikes_actuales;

      // Quitar strike anterior y poner el nuevo
      for (let i = 1; i <= 3; i++) {
        await miembro.roles.remove(ROLES_STRIKE[i]).catch(() => {});
      }
      await miembro.roles.add(ROLES_STRIKE[numStrike]).catch(() => {});

      // Guardar en historial
      registro.historial.push({
        tipo:     "strike",
        numero:   numStrike,
        motivo,
        staff_id: staff.id,
        staff_tag: staff.tag
      });

      colorContainer  = 0xf1c40f;
      tituloContainer = `⚡ Strike ${numStrike} aplicado`;
      descripcionAccion = `Strike **${numStrike}/3** registrado.`;

      camposExtra = [
        { name: "⚡ Strike actual",      value: `${numStrike}/3` },
        { name: "⚠️ Sanciones totales", value: `${registro.sanciones_acumuladas}/6` }
      ];

      // 🔄 Al llegar a 3 strikes → sanción automática
      if (numStrike === 3) {

        // Limpiar strikes
        registro.strikes_actuales = 0;
        for (let i = 1; i <= 3; i++) {
          await miembro.roles.remove(ROLES_STRIKE[i]).catch(() => {});
        }

        registro.sanciones_acumuladas++;
        const numSancion = registro.sanciones_acumuladas;

        const resultadoSancion = await aplicarSancion(
          miembro, numSancion, `3 strikes acumulados — ${motivo}`, staff, guild, registro
        );

        if (numSancion === 6) registro.baneado = true;

        colorContainer  = 0xe74c3c;
        tituloContainer = `⚡ Strike 3 → 🚨 Sanción ${numSancion} automática`;
        descripcionAccion =
          `Al acumular **3 strikes**, se aplicó automáticamente la **Sanción ${numSancion}**.\n` +
          `Los strikes fueron reiniciados.`;

        camposExtra = [
          { name: "⚡ Strikes",           value: "Reiniciados a 0" },
          { name: "🚨 Sanción aplicada",  value: `Sanción **${numSancion}/6**` },
          { name: "⏱️ Aislamiento",       value: resultadoSancion.timeout || "Ban permanente" },
          { name: "🎮 ERLC",              value: resultadoSancion.erlc.ok ? "✅ Ejecutado" : "❌ Error" },
          { name: "⚠️ Sanciones totales", value: `${numSancion}/6` }
        ];

        sancionAplicada = numSancion;
      }

    // ━━━━━━━━━━━━━━━━━━━━
    // ⚠️ SANCIÓN DIRECTA
    // ━━━━━━━━━━━━━━━━━━━━
    } else if (tipo === "sancion") {

      registro.sanciones_acumuladas++;
      const numSancion = registro.sanciones_acumuladas;

      const resultadoSancion = await aplicarSancion(
        miembro, numSancion, motivo, staff, guild, registro
      );

      if (numSancion === 6) registro.baneado = true;

      colorContainer  = 0xe74c3c;
      tituloContainer = `🚨 Sanción ${numSancion} aplicada`;
      descripcionAccion =
        numSancion === 6
          ? `Se aplicó la **Sanción 6** — Ban permanente.`
          : `Se aplicó la **Sanción ${numSancion}** — Aislamiento de ${TIMEOUTS[numSancion].texto}.`;

      camposExtra = [
        { name: "🚨 Sanción",            value: `${numSancion}/6` },
        { name: "⏱️ Aislamiento",        value: resultadoSancion.timeout || "Ban permanente" },
        { name: "🎮 ERLC",               value: resultadoSancion.erlc.ok ? "✅ Ejecutado" : "❌ Error" },
        { name: "⚠️ Sanciones totales",  value: `${registro.sanciones_acumuladas}/6` },
        { name: "⚡ Strikes actuales",   value: `${registro.strikes_actuales}/3` }
      ];

      sancionAplicada = numSancion;
    }

    // 💾 Guardar
    await registro.save();

    // ━━━━━━━━━━━━━━━━━━━━
    // 🧱 Respuesta
    // ━━━━━━━━━━━━━━━━━━━━
    const container = new ContainerBuilder()
      .setAccentColor(colorContainer)

      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## ${tituloContainer}\n` +
              `-# Aplicado por ${staff.tag}`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder().setURL(
              userTarget.displayAvatarURL({ extension: "png", size: 256 })
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
          `**👤 Usuario:** <@${userTarget.id}> (${userTarget.tag})\n` +
          `**📝 Motivo:** ${motivo}\n` +
          `**🛡️ Staff:** <@${staff.id}>\n\n` +
          camposExtra.map(f => `**${f.name}:** ${f.value}`).join("\n")
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

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [container]
    });

    // 📩 DM al usuario sancionado
    const dmContainer = new ContainerBuilder()
      .setAccentColor(colorContainer)

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ${tituloContainer}\n` +
          `-# Panamá RP V2`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**📝 Motivo:** ${motivo}\n` +
          camposExtra.map(f => `**${f.name}:** ${f.value}`).join("\n") +
          `\n\n> Si crees que esta sanción fue injusta, abre un ticket en el servidor.`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(false)
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
