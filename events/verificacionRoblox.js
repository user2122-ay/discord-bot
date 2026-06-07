const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorSpacingSize,
  Events,
  MessageFlags
} = require("discord.js");

const axios = require("axios");

const CANAL_STAFF    = "1452365736927301764";
const ROL_VERIFICADO = "1451018445998260266";
const ROL_STAFF      = "1451217784444027163";
const ROL_NO_VERIFICADO = "1451018447482916904";

const verificaciones = new Map();

const RobloxVerificado = require("../models/RobloxVerificado");

module.exports = (client) => {

  client.on(Events.InteractionCreate, async (interaction) => {

    // =====================
    // 🔘 BOTÓN VERIFICAR
    // =====================
    if (interaction.isButton() && interaction.customId === "roblox_verificar") {

      if (interaction.member.roles.cache.has(ROL_VERIFICADO)) {
        return interaction.reply({
          content: "❌ Ya estás verificado.",
          ephemeral: true
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("modal_roblox")
        .setTitle("Verificación Roblox — Paso 1");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("usuario")
            .setLabel("Usuario de Roblox")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ej: RobloxUser123")
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("como_conociste")
            .setLabel("¿Cómo descubriste el servidor?")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ej: Un amigo me invitó, redes sociales...")
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("acepta_staff")
            .setLabel("¿Aceptas respetar al staff y sus decisiones?")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Escribe: Sí")
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("acepta_normas")
            .setLabel("¿Aceptas cumplir las normas del servidor?")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Escribe: Sí")
            .setRequired(true)
        )
      );

      return interaction.showModal(modal);
    }

    // =====================
    // 📥 MODAL SUBMIT
    // =====================
    if (interaction.isModalSubmit() && interaction.customId === "modal_roblox") {

      const usuario      = interaction.fields.getTextInputValue("usuario");
      const comoConocio  = interaction.fields.getTextInputValue("como_conociste");
      const aceptaStaff  = interaction.fields.getTextInputValue("acepta_staff");
      const aceptaNormas = interaction.fields.getTextInputValue("acepta_normas");

      const codigo = "PANAMA-" + Math.floor(1000 + Math.random() * 9000);

      verificaciones.set(interaction.user.id, {
        usuario,
        codigo,
        comoConocio,
        aceptaStaff,
        aceptaNormas
      });

      const container = new ContainerBuilder()
        .setAccentColor(0x5865F2)

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## 🔐 Código de verificación\n` +
            `-# Paso final antes de enviar al staff`
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `Coloca este código en tu **descripción de Roblox** y luego pulsa **Comprobar**:\n\n` +
            `# \`${codigo}\``
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `> 💡 Ve a **Roblox → Editar perfil → Descripción** y pega el código.\n` +
            `> Una vez guardado, pulsa el botón de abajo.`
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(false)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# © Panamá RP V2 | El código expira al cerrar sesión`
          )
        );

      const boton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("comprobar_roblox")
          .setLabel("Comprobar")
          .setEmoji("🔍")
          .setStyle(ButtonStyle.Primary)
      );

      return interaction.reply({
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        components: [container, boton]
      });
    }

    // =====================
    // 🔍 COMPROBAR
    // =====================
    if (interaction.isButton() && interaction.customId === "comprobar_roblox") {

      const data = verificaciones.get(interaction.user.id);
      if (!data) {
        return interaction.reply({
          content: "❌ No encontré tu proceso de verificación. Vuelve a iniciar.",
          ephemeral: true
        });
      }

      await interaction.deferReply({ ephemeral: true });

      try {

        const userSearch = await axios.post(
          "https://users.roblox.com/v1/usernames/users",
          { usernames: [data.usuario], excludeBannedUsers: false }
        );

        const robloxUser = userSearch.data?.data?.[0];
        if (!robloxUser) {
          return interaction.editReply({ content: "❌ Usuario Roblox no encontrado." });
        }

        const existe = await RobloxVerificado.findOne({ robloxId: robloxUser.id.toString() });
        if (existe) {
          return interaction.editReply({ content: "❌ Esta cuenta Roblox ya está vinculada a otro usuario." });
        }

        const profile = await axios.get(`https://users.roblox.com/v1/users/${robloxUser.id}`);
        const descripcion = profile.data?.description ?? "";

        if (!descripcion.includes(data.codigo)) {
          return interaction.editReply({ content: "❌ No encontré el código en tu descripción de Roblox. Asegúrate de guardarlo." });
        }

        // 🖼️ Avatar Roblox
        const avatarRes = await axios.get(
          `https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${robloxUser.id}&size=420x420&format=Png&isCircular=false`
        );
        const avatarUrl = avatarRes.data.data[0]?.imageUrl || null;

        const canal = client.channels.cache.get(CANAL_STAFF);
        if (!canal) {
          return interaction.editReply({ content: "❌ No encontré el canal de staff." });
        }

        // 🧱 Solicitud para el staff
        const solicitudContainer = new ContainerBuilder()
          .setAccentColor(0xf1c40f)

          .addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `## 📋 Solicitud de Verificación\n` +
                  `-# Nueva solicitud pendiente de revisión`
                )
              )
              .setThumbnailAccessory(
                new ThumbnailBuilder().setURL(
                  avatarUrl || interaction.user.displayAvatarURL({ extension: "png", size: 256 })
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
              `**👤 Discord:** ${interaction.user.tag} (<@${interaction.user.id}>)\n` +
              `**🎮 Roblox:** ${robloxUser.name}\n` +
              `**🆔 ID Roblox:** \`${robloxUser.id}\`\n` +
              `**🔑 Código:** \`${data.codigo}\``
            )
          )

          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(true)
          )

          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**❓ ¿Cómo conoció el servidor?**\n> ${data.comoConocio}\n\n` +
              `**🤝 ¿Acepta respetar al staff?**\n> ${data.aceptaStaff}\n\n` +
              `**📜 ¿Acepta las normas?**\n> ${data.aceptaNormas}`
            )
          )

          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(false)
          )

          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `-# Solicitud enviada el ${new Date().toLocaleString("es-PA")}`
            )
          );

        const botonesStaff = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`aprobar_${interaction.user.id}_${robloxUser.id}_${robloxUser.name}`)
            .setLabel("✅ Aprobar")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId(`rechazar_${interaction.user.id}`)
            .setLabel("❌ Rechazar")
            .setStyle(ButtonStyle.Danger)
        );

        await canal.send({
          flags: MessageFlags.IsComponentsV2,
          components: [solicitudContainer, botonesStaff]
        });

        await interaction.editReply({ content: "✅ Solicitud enviada al staff. Te notificaremos pronto." });

      } catch (err) {
        console.error("ERROR ROBLOX:", err.response?.data || err.message || err);
        await interaction.editReply({ content: "❌ Error obteniendo datos de Roblox." });
      }
    }

    // =====================
    // ✅ APROBAR
    // =====================
    if (interaction.isButton() && interaction.customId.startsWith("aprobar_")) {

      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({ content: "❌ No tienes permisos.", ephemeral: true });
      }

      const datos        = interaction.customId.split("_");
      const userId       = datos[1];
      const robloxUserId = datos[2];
      const usuarioRoblox = datos.slice(3).join("_");

      const miembro = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!miembro) {
        return interaction.reply({ content: "❌ Usuario no encontrado.", ephemeral: true });
      }

      try {
        const avatarRes = await axios.get(
          `https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${robloxUserId}&size=420x420&format=Png&isCircular=false`
        );
        const avatarUrl = avatarRes.data.data[0]?.imageUrl || null;

        await RobloxVerificado.create({
          discordId: miembro.id,
          robloxId:  robloxUserId,
          robloxUser: usuarioRoblox,
          avatarUrl
        });

        await miembro.roles.add(ROL_VERIFICADO).catch(() => {});
        await miembro.roles.remove(ROL_NO_VERIFICADO).catch(() => {});
        await miembro.setNickname(usuarioRoblox).catch(() => {});

        // ✅ Editar el mensaje original — quitar botones, mostrar aprobado
        const aprobadoContainer = new ContainerBuilder()
          .setAccentColor(0x57f287)

          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `## ✅ Solicitud Aprobada\n` +
              `-# Verificado por ${interaction.user.tag}`
            )
          )

          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(true)
          )

          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**👤 Discord:** <@${userId}>\n` +
              `**🎮 Roblox:** ${usuarioRoblox}\n` +
              `**🆔 ID Roblox:** \`${robloxUserId}\``
            )
          )

          .addSeparatorComponents(
            new SeparatorBuilder()
              .setSpacing(SeparatorSpacingSize.Small)
              .setDivider(false)
          )

          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `-# Aprobado el ${new Date().toLocaleString("es-PA")}`
            )
          );

        await interaction.update({
          flags: MessageFlags.IsComponentsV2,
          components: [aprobadoContainer]  // sin botones
        });

        await miembro.send("✅ Tu verificación fue aprobada. ¡Bienvenido a Panamá RP V2!").catch(() => {});

      } catch (err) {
        console.error("ERROR APROBAR:", err);
        await interaction.reply({ content: "❌ Error al aprobar.", ephemeral: true });
      }
    }

    // =====================
    // ❌ RECHAZAR
    // =====================
    if (interaction.isButton() && interaction.customId.startsWith("rechazar_")) {

      if (!interaction.member.roles.cache.has(ROL_STAFF)) {
        return interaction.reply({ content: "❌ No tienes permisos.", ephemeral: true });
      }

      const userId  = interaction.customId.split("_")[1];
      const miembro = await interaction.guild.members.fetch(userId).catch(() => null);

      // ✅ Editar el mensaje original — quitar botones, mostrar rechazado
      const rechazadoContainer = new ContainerBuilder()
        .setAccentColor(0xe74c3c)

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## ❌ Solicitud Rechazada\n` +
            `-# Rechazado por ${interaction.user.tag}`
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**👤 Discord:** <@${userId}>`
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(false)
        )

        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `-# Rechazado el ${new Date().toLocaleString("es-PA")}`
          )
        );

      await interaction.update({
        flags: MessageFlags.IsComponentsV2,
        components: [rechazadoContainer]  // sin botones
      });

      if (miembro) {
        miembro.send("❌ Tu verificación fue rechazada. Puedes intentarlo de nuevo.").catch(() => {});
      }
    }

  });

};
