// ============================================================
//  redesHandler.js  —  Panamá RP V2
//  Botones: ❤️ Like único | 💬 Comentar vía hilo
// ============================================================

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags
} = require("discord.js");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {

    const redCmd = client.commands.get("redes-sociales");
    if (!redCmd) return;

    const { publicacionesData, buildRedContainer, buildBotones, REDES } = redCmd;

    // ════════════════════════════════════════════════════════
    //  BOTÓN ❤️ LIKE
    // ════════════════════════════════════════════════════════
    if (interaction.isButton() && interaction.customId.startsWith("red_like_")) {
      const msgId  = interaction.customId.replace("red_like_", "");
      const userId = interaction.user.id;
      const data   = publicacionesData.get(msgId);

      if (!data) {
        return interaction.reply({ content: "❌ Esta publicación ya no está en memoria.", flags: MessageFlags.Ephemeral });
      }

      // Toggle like
      if (data.likes.has(userId)) {
        data.likes.delete(userId);
      } else {
        data.likes.add(userId);
      }

      const likeCount = data.likes.size;
      const usuarioFalso = { username: data.usuarioTag, id: data.usuarioId };

      const containerActualizado = buildRedContainer(usuarioFalso, data.red, data.contenido, data.link, likeCount);
      const componentes = [containerActualizado];

      if (data.imagenUrl) {
        componentes.push(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(data.imagenUrl)
          )
        );
      }

      componentes.push(buildBotones(msgId, likeCount));

      await interaction.update({
        components: componentes,
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });
    }

    // ════════════════════════════════════════════════════════
    //  BOTÓN 💬 COMENTAR — abre modal
    // ════════════════════════════════════════════════════════
    else if (interaction.isButton() && interaction.customId.startsWith("red_comentar_")) {
      const msgId = interaction.customId.replace("red_comentar_", "");

      const modal = new ModalBuilder()
        .setCustomId(`red_comentar_modal_${msgId}`)
        .setTitle("💬 Comentar publicación");

      const input = new TextInputBuilder()
        .setCustomId("comentario")
        .setLabel("Tu comentario")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Escribe tu comentario...")
        .setRequired(true)
        .setMaxLength(500);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    }

    // ════════════════════════════════════════════════════════
    //  MODAL — enviar comentario al hilo
    // ════════════════════════════════════════════════════════
    else if (interaction.isModalSubmit() && interaction.customId.startsWith("red_comentar_modal_")) {
      const msgId      = interaction.customId.replace("red_comentar_modal_", "");
      const comentario = interaction.fields.getTextInputValue("comentario");
      const usuario    = interaction.user;
      const data       = publicacionesData.get(msgId);

      // Buscar hilo activo asociado al mensaje
      const canal = interaction.channel;
      let hilo = null;

      if (canal?.threads) {
        const hilosActivos = await canal.threads.fetchActive().catch(() => null);
        if (hilosActivos) {
          hilo = hilosActivos.threads.find(t => {
            // El hilo se creó con startMessage, su id coincide con el del mensaje
            return t.id === msgId || (data && t.name.includes(data.usuarioTag));
          });
        }
      }

      if (hilo) {
        const redNombre = data ? REDES[data.red]?.label : "Redes";

        const containerComentario = new ContainerBuilder();
        containerComentario.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `💬 **${usuario.username}** comentó:\n${comentario}`
          )
        );
        containerComentario.addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        );
        containerComentario.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`-# Panamá RP V2 • ${redNombre}`)
        );

        await hilo.send({
          components: [containerComentario],
          flags: MessageFlags.IsComponentsV2,
          allowedMentions: { parse: [] }
        });

        await interaction.reply({
          content: "✅ Tu comentario fue publicado en el hilo.",
          flags: MessageFlags.Ephemeral
        });
      } else {
        // Si no encuentra hilo, responder de todas formas
        await interaction.reply({
          content: "✅ Comentario recibido (no se encontró el hilo de la publicación).",
          flags: MessageFlags.Ephemeral
        });
      }
    }
  });
};

