const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  ButtonBuilder,
  ButtonStyle,
  SeparatorSpacingSize,
  MessageFlags
} = require("discord.js");

const Ciudadano = require("../models/Ciudadano");
const generarCedula = require("../utils/generarCedula");

const PROVINCIAS = {
  "1": "Bocas del Toro",
  "2": "Coclé",
  "3": "Colón",
  "4": "Chiriquí",
  "5": "Darién",
  "6": "Herrera",
  "7": "Los Santos",
  "8": "Panamá",
  "9": "Veraguas",
  "13": "Panamá Oeste"
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cedula")
    .setDescription("Ver cédula de un usuario")
    .addUserOption(o =>
      o.setName("usuario")
        .setDescription("Usuario a consultar")
        .setRequired(true)
    ),

  permisos: "🌍 Todos",

  async execute(interaction) {

    await interaction.deferReply();

    const user = interaction.options.getUser("usuario");

    try {

      const d = await Ciudadano.findOne({ discord_id: user.id });

      if (!d) {
        return interaction.editReply({
          content: "❌ Ese usuario no tiene cédula registrada.",
        });
      }

      const provinciaNombre = PROVINCIAS[d.provincia_codigo] || "Desconocida";

      const fechaEmision     = new Date(d.fecha_emision).toLocaleDateString("es-PA");
      const fechaExpiracion  = new Date(d.fecha_expiracion).toLocaleDateString("es-PA");

      // 🖼️ Regenerar imagen de la cédula
      const archivo = await generarCedula({
        nombre:          d.nombre_ic,
        apellido:        d.apellido_ic,
        nacimiento:      d.nacimiento_ic,
        sangre:          d.tipo_sangre,
        sexo:            d.sexo_ic,
        provincia:       provinciaNombre,
        cedula:          d.numero_cedula,
        avatarUrl:       d.avatarRoblox,
        fechaEmision,
        fechaExpiracion
      });

      // 🧱 Construir Components V2
      const container = new ContainerBuilder()

        // — Encabezado
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "## 🪪 Cédula de Identidad\n-# República de Panamá RP V2"
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
        )

        // — Sección: info básica + thumbnail avatar Discord
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `**👤 Nombre:** ${d.nombre_ic} ${d.apellido_ic}\n` +
                `**🆔 Cédula:** ${d.numero_cedula}\n` +
                `**🎂 Edad:** ${d.edad_ic} años\n` +
                `**📅 Nacimiento:** ${d.nacimiento_ic}\n` +
                `**🌎 Provincia:** ${provinciaNombre}\n` +
                `**🩸 Sangre:** ${d.tipo_sangre}\n` +
                `**⚧ Sexo:** ${d.sexo_ic === "M" ? "Masculino" : "Femenino"}`
              )
            )
            .setThumbnailAccessory(
              new ThumbnailBuilder().setURL(
                user.displayAvatarURL({ extension: "png", size: 256 })
              )
            )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
        )

        // — Fechas
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `📋 **Expedida:** ${fechaEmision}  ·  ⏳ **Expira:** ${fechaExpiracion}`
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
        )

        // — Imagen de la cédula
        .addMediaGalleryComponents(
          new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder()
              .setURL("attachment://cedula.png")
              .setDescription("Cédula de Identidad Personal")
          )
        )

        .addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(false)
        )

        // — Footer con botón decorativo
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "-# 🏛️ Tribunal Electoral · Gobierno de Panamá RP V2"
          )
        );

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
        files: [archivo]
      });

    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "❌ Error obteniendo la cédula."
      });
    }
  }
};
