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

const axios   = require("axios");
const Sancion = require("../models/Sancion");

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

const TIMEOUTS = {
  1: { ms: 1  * 60 * 60 * 1000, texto: "1 hora" },
  2: { ms: 3  * 60 * 60 * 1000, texto: "3 horas" },
  3: { ms: 6  * 60 * 60 * 1000, texto: "6 horas" },
  4: { ms: 12 * 60 * 60 * 1000, texto: "12 horas" },
  5: { ms: 24 * 60 * 60 * 1000, texto: "24 horas" },
  6: null
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎮 ERLC
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
// 🔨 Aplicar sanción en Discord + ERLC
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function aplicarSancion(miembro, numSancion, motivo, guild) {

  const resultado = { timeout: null, ban: false, erlc: { ok: false } };

  // Quitar roles de sanciones anteriores
  for (const [num, rolId] of Object.entries(ROLES_SANCION)) {
    if (parseInt(num) < numSancion) {
      await miembro.roles.remove(rolId).catch(() => {});
    }
  }

  // Agregar rol de sanción actual
  await miembro.roles.add(ROLES_SANCION[numSancion]).catch(() => {});

  if (numSancion === 6) {
    await guild.members.ban(miembro.id, { reason: motivo }).catch(() => {});
    resultado.ban = true;

    const erlc = await ejecutarERLC(`:ban ${miembro.user.username}`);
    resultado.erlc = { ok: erlc.ok, respuesta: JSON.stringify(erlc.data || erlc.error) };

  } else {
    const timeout = TIMEOUTS[numSancion];
    await miembro.timeout(timeout.ms, motivo).catch(() => {});
    resultado.timeout = timeout.texto;

    const erlc = await ejecutarERLC(`:kick ${miembro.user.username}`);
    resultado.erlc = { ok: erlc.ok, respuesta: JSON.stringify(erlc.data || erlc.error) };
  }

  return resultado;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧱 Cajón de confirmación
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function buildConfirmacion({ color, titulo, user, staff, campos, codigo }) {
  return new ContainerBuilder()
    .setAccentColor(color)

    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## ${titulo}\n` +
            `-# Aplicado por ${staff.tag}`
          )
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder().setURL(
            user.displayAvatarURL({ extension: "png", size: 256 })
          )
        )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**👤 Usuario:** <@${user.id}> (${user.tag})\n` +
        `**🛡️ Staff:** <@${staff.id}>\n\n` +
        campos.map(c => `**${c.name}:** ${c.value}`).join("\n")
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )

    // 🔑 Código solo y fácil de copiar
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**🔑 Código de la acción:**\n` +
        `\`\`\`\n${codigo}\n\`\`\``
      )
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
    )

    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `-# Guarda este código — es necesario para revertir la acción\n` +
        `-# ${new Date().toLocaleString("es-PA")}`
      )
    );
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
          { name: "⚡ Strike",          value: "strike" },
          { name: "🚨 Sanción directa", value: "sancion" }
        )
    )
    .addStringOption(o =>
      o.setName("motivo")
        .setDescription("Motivo")
        .setRequired(true)
    ),

  async execute(interaction) {

    // 🔒 Solo staff
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

    if (registro.baneado) {
      return interaction.editReply({ content: "❌ Este usuario ya está baneado permanentemente." });
    }

    if (registro.sanciones_acumuladas >= 6) {
      return interaction.editReply({ content: "❌ Este usuario ya tiene el máximo de sanciones (6)." });
    }

    let container;

    // ━━━━━━━━━━━━━━━━━━━━
    // ⚡ STRIKE
    // ━━━━━━━━━━━━━━━━━━━━
    if (tipo === "strike") {

      registro.strikes_actuales++;
      const numStrike = registro.strikes_actuales;

      // Quitar roles de strikes anteriores y poner el actual
      for (let i = 1; i <= 3; i++) {
        await miembro.roles.remove(ROLES_STRIKE[i]).catch(() => {});
      }
      await miembro.roles.add(ROLES_STRIKE[numStrike]).catch(() => {});

      // 🔑 Generar código
      const codigo = Sancion.generarCodigo("strike");

      // Guardar acción
      registro.acciones.push({
        codigo,
        tipo:      "strike",
        numero:    numStrike,
        motivo,
        staff_id:  staff.id,
        staff_tag: staff.tag
      });

      // ¿Llegó a 3 strikes? → sanción automática
      if (numStrike === 3) {

        // Limpiar strikes
        registro.strikes_actuales = 0;
        for (let i = 1; i <= 3; i++) {
          await miembro.roles.remove(ROLES_STRIKE[i]).catch(() => {});
        }

        registro.sanciones_acumuladas++;
        const numSancion = registro.sanciones_acumuladas;

        const resultado = await aplicarSancion(
          miembro, numSancion, `3 strikes acumulados — ${motivo}`, guild
        );

        if (numSancion === 6) registro.baneado = true;

        // 🔑 Código para la sanción automática
        const codigoSancion = Sancion.generarCodigo("sancion");

        registro.acciones.push({
          codigo:           codigoSancion,
          tipo:             "sancion",
          numero:           numSancion,
          motivo:           `3 strikes acumulados — ${motivo}`,
          staff_id:         staff.id,
          staff_tag:        staff.tag,
          duracion_timeout: resultado.timeout,
          erlc_ejecutado:   resultado.erlc.ok,
          erlc_respuesta:   resultado.erlc.respuesta ?? null
        });

        await registro.save();

        container = buildConfirmacion({
          color:  0xe74c3c,
          titulo: `⚡ Strike 3 → 🚨 Sanción ${numSancion} automática`,
          user:   userTarget,
          staff,
          codigo: `${codigo}  (strike)\n${codigoSancion}  (sanción automática)`,
          campos: [
            { name: "⚡ Strikes",          value: "Reiniciados a 0" },
            { name: "🚨 Sanción aplicada", value: `Sanción **${numSancion}/6**` },
            { name: "⏱️ Aislamiento",      value: resultado.timeout || "Ban permanente" },
            { name: "🎮 ERLC",             value: resultado.erlc.ok ? "✅ Ejecutado" : "❌ Error" },
            { name: "📝 Motivo",           value: motivo }
          ]
        });

      } else {

        await registro.save();

        container = buildConfirmacion({
          color:  0xf1c40f,
          titulo: `⚡ Strike ${numStrike} aplicado`,
          user:   userTarget,
          staff,
          codigo,
          campos: [
            { name: "⚡ Strike actual",     value: `${numStrike}/3` },
            { name: "🚨 Sanciones totales", value: `${registro.sanciones_acumuladas}/6` },
            { name: "📝 Motivo",            value: motivo }
          ]
        });
      }

    // ━━━━━━━━━━━━━━━━━━━━
    // 🚨 SANCIÓN DIRECTA
    // ━━━━━━━━━━━━━━━━━━━━
    } else {

      registro.sanciones_acumuladas++;
      const numSancion = registro.sanciones_acumuladas;

      const resultado = await aplicarSancion(miembro, numSancion, motivo, guild);

      if (numSancion === 6) registro.baneado = true;

      // 🔑 Generar código
      const codigo = Sancion.generarCodigo("sancion");

      registro.acciones.push({
        codigo,
        tipo:             "sancion",
        numero:           numSancion,
        motivo,
        staff_id:         staff.id,
        staff_tag:        staff.tag,
        duracion_timeout: resultado.timeout,
        erlc_ejecutado:   resultado.erlc.ok,
        erlc_respuesta:   resultado.erlc.respuesta ?? null
      });

      await registro.save();

      container = buildConfirmacion({
        color:  0xe74c3c,
        titulo: `🚨 Sanción ${numSancion} aplicada`,
        user:   userTarget,
        staff,
        codigo,
        campos: [
          { name: "🚨 Sanción",           value: `${numSancion}/6` },
          { name: "⏱️ Aislamiento",       value: resultado.timeout || "Ban permanente" },
          { name: "🎮 ERLC",              value: resultado.erlc.ok ? "✅ Ejecutado" : "❌ Error" },
          { name: "⚡ Strikes actuales",  value: `${registro.strikes_actuales}/3` },
          { name: "📝 Motivo",            value: motivo }
        ]
      });
    }

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [container]
    });

    // 📩 DM al usuario
    const dmContainer = new ContainerBuilder()
      .setAccentColor(0xe74c3c)

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## ⚠️ Has recibido una sanción\n` +
          `-# Panamá RP V2`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )

      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**📝 Motivo:** ${motivo}\n` +
          `**⚡ Strikes:** ${registro.strikes_actuales}/3\n` +
          `**🚨 Sanciones:** ${registro.sanciones_acumuladas}/6\n\n` +
          `> Si crees que esta sanción fue injusta, abre un ticket en el servidor.`
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
