const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Events
} = require("discord.js");

const axios = require("axios");

// Canal donde llegan solicitudes
const CANAL_STAFF = "1452365736927301764";

// Rol al aprobar
const ROL_VERIFICADO = "1451018445998260266";

// Rol staff que puede aprobar
const ROL_STAFF = "1451217784444027163";

// Rol No verificado 
const ROL_NO_VERIFICADO = "1451018447482916904"; 

// Memoria temporal
const verificaciones = new Map();

// base de datos 
const RobloxVerificado = require("../models/RobloxVerificado"); 


module.exports = (client) => {

  client.on(Events.InteractionCreate, async (interaction) => {

    // =====================
    // BOTÓN INICIAL
    // =====================

    if (
      interaction.isButton() &&
      interaction.customId === "roblox_verificar"
    ) {

      const modal = new ModalBuilder()
        .setCustomId("modal_roblox")
        .setTitle("Verificación Roblox");

      const usuario = new TextInputBuilder()
        .setCustomId("usuario")
        .setLabel("Usuario de Roblox")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(usuario)
      );

      return interaction.showModal(modal);
    }
if (
  interaction.isButton() &&
  interaction.customId === "roblox_verificar"
)
    if (interaction.member.roles.cache.has(ROL_VERIFICADO)) {
  return interaction.reply({
    content: "❌ Ya estás verificado.",
    ephemeral: true
  });
    }

    // =====================
    // MODAL
    // =====================

    if (
      interaction.isModalSubmit() &&
      interaction.customId === "modal_roblox"
    ) {

      const usuario = interaction.fields.getTextInputValue("usuario");

      const codigo =
        "PANAMA-" +
        Math.floor(1000 + Math.random() * 9000);

      verificaciones.set(interaction.user.id, {
        usuario,
        codigo
      });

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setTitle("🔐 Código generado")
        .setDescription(
          `Coloca este código en tu descripción de Roblox:\n\n\`${codigo}\``
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("comprobar_roblox")
          .setLabel("Comprobar")
          .setEmoji("🔍")
          .setStyle(ButtonStyle.Primary)
      );

      return interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
      });
    }

// =====================
// COMPROBAR
// =====================

if (
  interaction.isButton() &&
  interaction.customId === "comprobar_roblox"
) {

  const data = verificaciones.get(interaction.user.id);

  if (!data) {
    return interaction.reply({
      content: "❌ No encontré tu proceso de verificación.",
      ephemeral: true
    });
  }


        // Buscar ID Roblox
        
  try {

    const userSearch = await axios.post(
      "https://users.roblox.com/v1/usernames/users",
      {
        usernames: [data.usuario],
        excludeBannedUsers: false
      }
    );

    const robloxUser = userSearch.data?.data?.[0];

    if (!robloxUser) {
      return interaction.reply({
        content: "❌ Usuario Roblox no encontrado.",
        ephemeral: true
      });
    }

    const existe = await RobloxVerificado.findOne({
  robloxId: robloxUser.id.toString()
});

if (existe) {
  return interaction.reply({
    content: "❌ Esta cuenta Roblox ya está vinculada a otro usuario.",
    ephemeral: true
  });
}
    

    const profile = await axios.get(
      `https://users.roblox.com/v1/users/${robloxUser.id}`
    );

    console.log("ROBLOX PROFILE:", profile.data);

    const descripcion =
      profile.data?.description ?? "";

    console.log("Usuario Roblox:", robloxUser.name);
    console.log("Descripción:", descripcion);
    console.log("Código esperado:", data.codigo);

    if (!descripcion.includes(data.codigo)) {
      return interaction.reply({
        content:
          "❌ No encontré el código en tu descripción de Roblox.",
        ephemeral: true
      });
    }

    const canal =
      client.channels.cache.get(CANAL_STAFF);

    if (!canal) {
      return interaction.reply({
        content:
          "❌ No encontré el canal de staff.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor("Yellow")
      .setTitle("📋 Solicitud de Verificación")
      .addFields(
        {
          name: "Discord",
          value: interaction.user.tag,
          inline: true
        },
        {
          name: "Roblox",
          value: robloxUser.name,
          inline: true
        },
        {
          name: "ID Roblox",
          value: `${robloxUser.id}`,
          inline: true
        },
        {
          name: "Código",
          value: data.codigo
        }
      )
      .setThumbnail(
        interaction.user.displayAvatarURL()
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(
  `aprobar_${interaction.user.id}_${robloxUser.id}_${robloxUser.name}`
)
        .setLabel("Aprobar")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(
          `rechazar_${interaction.user.id}`
        )
        .setLabel("Rechazar")
        .setStyle(ButtonStyle.Danger)
    );

    await canal.send({
      embeds: [embed],
      components: [row]
    });

    return interaction.reply({
      content:
        "✅ Solicitud enviada al staff.",
      ephemeral: true
    });

  } catch (err) {

    console.log("========== ERROR ROBLOX ==========");
    console.log(err.response?.data || err.message || err);
    console.log("==================================");

    return interaction.reply({
      content:
        "❌ Error obteniendo datos de Roblox.",
      ephemeral: true
    });
  }
  }

    // =====================
    // APROBAR
    // =====================

    if (
      interaction.isButton() &&
      interaction.customId.startsWith("aprobar_")
    ) {

      if (
        !interaction.member.roles.cache.has(
          ROL_STAFF
        )
      ) {
        return interaction.reply({
          content:
            "❌ No tienes permisos.",
          ephemeral: true
        });
      }

      const datos =
        interaction.customId.split("_");

      const userId = datos[1];
const robloxUserId = datos[2];
const usuarioRoblox = datos.slice(3).join("_");

      const miembro =
        await interaction.guild.members
          .fetch(userId)
          .catch(() => null);

      if (!miembro) {
        return interaction.reply({
          content:
            "❌ Usuario no encontrado.",
          ephemeral: true
        });
      }

      await miembro.roles
        .add(ROL_VERIFICADO)
        .catch(() => {});

      const avatarResponse = await axios.get(
  `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxUserId}&size=420x420&format=Png&isCircular=false`
);

const avatarUrl =
  avatarResponse.data.data[0]?.imageUrl || null;

await RobloxVerificado.create({
  discordId: miembro.id,
  robloxId: robloxUserId,
  robloxUser: usuarioRoblox,
  avatarUrl
});

      await miembro.roles.remove(ROL_NO_VERIFICADO).catch(() => {});

      await miembro
        .setNickname(usuarioRoblox)
        .catch(() => {});

      await interaction.update({
        content:
          `✅ Verificado por ${interaction.user.tag}`,
        embeds: [],
        components: []
      });

      await miembro.send(
        "✅ Tu verificación fue aprobada."
      ).catch(() => {});
    }

    // =====================
    // RECHAZAR
    // =====================

    if (
      interaction.isButton() &&
      interaction.customId.startsWith("rechazar_")
    ) {

      if (
        !interaction.member.roles.cache.has(
          ROL_STAFF
        )
      ) {
        return interaction.reply({
          content:
            "❌ No tienes permisos.",
          ephemeral: true
        });
      }

      const userId =
        interaction.customId.split("_")[1];

      const miembro =
        await interaction.guild.members
          .fetch(userId)
          .catch(() => null);

      await interaction.update({
        content:
          `❌ Solicitud rechazada por ${interaction.user.tag}`,
        embeds: [],
        components: []
      });

      if (miembro) {
        miembro.send(
          "❌ Tu verificación fue rechazada."
        ).catch(() => {});
      }
    }

  });

};
