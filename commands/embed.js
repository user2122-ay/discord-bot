const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  permisos: "👑 Administradores",

  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Crear un embed personalizado")

    .setDMPermission(false) // ❌ No funciona en MD
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // 🔒 Solo admins lo ven

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
        .setDescription("URL de imagen grande")
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
        .setDescription("Emoji del botón (opcional)")
        .setRequired(false)
    ),

  async execute(interaction) {

    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({
        content: "❌ No tienes permisos",
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

    await interaction.reply({
      content: "✅ Embed enviado",
      ephemeral: true
    });

    await interaction.channel.send({
      embeds: [embed],
      components
    });
  }
};
