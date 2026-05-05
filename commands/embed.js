const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  permisos: "🌍 Todos",

  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Crear un embed personalizado")

    .addStringOption(o =>
      o.setName("descripcion")
        .setDescription("Texto del embed")
        .setRequired(true)
    )

    .addStringOption(o =>
      o.setName("titulo")
        .setDescription("Título (opcional)")
        .setRequired(false)
    )

    .addStringOption(o =>
      o.setName("color")
        .setDescription("Color HEX (#ffffff)")
        .setRequired(false)
    )

    .addStringOption(o =>
      o.setName("imagen")
        .setDescription("URL imagen grande")
        .setRequired(false)
    )

    .addStringOption(o =>
      o.setName("thumbnail")
        .setDescription("URL imagen pequeña")
        .setRequired(false)
    )

    .addStringOption(o =>
      o.setName("boton_texto")
        .setDescription("Texto del botón")
        .setRequired(false)
    )

    .addStringOption(o =>
      o.setName("boton_url")
        .setDescription("URL del botón")
        .setRequired(false)
    )

    .addStringOption(o =>
      o.setName("boton_emoji")
        .setDescription("Emoji del botón")
        .setRequired(false)
    ),

  async execute(interaction) {

    // 🔒 Validación de admin (pero SIN ocultar comando)
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({
        content: "❌ No tienes permisos para usar este comando",
        ephemeral: true
      });
    }

    const descripcion = interaction.options.getString("descripcion");
    const titulo = interaction.options.getString("titulo");
    const color = interaction.options.getString("color") || "#2b2d31";
    const imagen = interaction.options.getString("imagen");
    const thumbnail = interaction.options.getString("thumbnail");
    const botonTexto = interaction.options.getString("boton_texto");
    const botonURL = interaction.options.getString("boton_url");
    const botonEmoji = interaction.options.getString("boton_emoji");

    const embed = new EmbedBuilder()
      .setDescription(descripcion)
      .setColor(color)
      .setTimestamp();

    if (titulo) embed.setTitle(titulo);
    if (imagen) embed.setImage(imagen);
    if (thumbnail) embed.setThumbnail(thumbnail);

    let components = [];

    if (botonTexto && botonURL) {
      const boton = new ButtonBuilder()
        .setLabel(botonTexto)
        .setStyle(ButtonStyle.Link)
        .setURL(botonURL);

      if (botonEmoji) {
        boton.setEmoji(botonEmoji);
      }

      components.push(
        new ActionRowBuilder().addComponents(boton)
      );
    }

    // ✔ Respuesta privada
    await interaction.reply({
      content: "✅ Embed enviado correctamente",
      ephemeral: true
    });

    // ✔ Enviar embed al canal
    await interaction.channel.send({
      embeds: [embed],
      components
    });
  }
};
